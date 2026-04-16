// Node.js 后端服务器
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const writeFile = promisify(fs.writeFile);
// ZhipuAI将通过动态import导入

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 配置multer用于文件上传
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB限制
    }
});

// 获取单个面试记录详情
app.get('/api/jilu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM jilu WHERE id = ?',
            [id]
        );
        connection.release();
        
        if (rows.length === 0) {
            return res.status(404).json({ error: '面试记录不存在' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('获取面试记录详情失败:', error);
        res.status(500).json({ error: '获取面试记录详情失败' });
    }
});

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'mianshi'
};

// 创建数据库连接池
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 初始化数据库表
async function initDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // 创建用户表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                avatar VARCHAR(255) DEFAULT 'images/default-avatar.svg',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                status ENUM('active', 'inactive') DEFAULT 'active'
            )
        `);
        
        // 检查是否已有管理员账户
        const [adminRows] = await connection.execute(
            'SELECT * FROM users WHERE role = "admin" LIMIT 1'
        );
        
        if (adminRows.length === 0) {
            // 创建默认管理员账户
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.execute(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                ['admin', hashedPassword, 'admin']
            );
            console.log('默认管理员账户已创建: admin / admin123');
        }
        
        // 检查是否已有测试用户
        const [userRows] = await connection.execute(
            'SELECT * FROM users WHERE username = "testuser" LIMIT 1'
        );
        
        if (userRows.length === 0) {
            // 创建测试用户账户
            const hashedPassword = await bcrypt.hash('123456', 10);
            await connection.execute(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                ['testuser', hashedPassword, 'user']
            );
            console.log('测试用户账户已创建: testuser / 123456');
        }
        
        // 创建职业表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS careers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                icon VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // 创建题目分类表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS question_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                career_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50) NOT NULL,
                icon VARCHAR(100),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
                UNIQUE KEY unique_career_code (career_id, code)
            )
        `);
        
        // 创建题目表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS practice_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                details TEXT,
                difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
                duration_min INT DEFAULT 5,
                duration_max INT DEFAULT 8,
                order_index INT DEFAULT 0,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES question_categories(id) ON DELETE CASCADE
            )
        `);
        
        // 创建参考资料表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS question_resources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                url VARCHAR(500),
                type ENUM('link', 'video', 'document') DEFAULT 'link',
                icon VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (question_id) REFERENCES practice_questions(id) ON DELETE CASCADE
            )
        `);
        
        // 创建新的timu表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS timu (
                id INT AUTO_INCREMENT PRIMARY KEY,
                career VARCHAR(100) NOT NULL COMMENT '职业',
                career_description TEXT COMMENT '职业描述',
                category VARCHAR(100) NOT NULL COMMENT '题目分类',
                title VARCHAR(255) NOT NULL COMMENT '题目',
                content TEXT NOT NULL COMMENT '题目内容',
                details TEXT COMMENT '题目细节',
                difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium' COMMENT '题目难度',
                analysis TEXT COMMENT '题目解析',
                resource_name VARCHAR(255) COMMENT '题目资源名',
                resource_url VARCHAR(500) COMMENT '题目资源链接',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // 创建面试记录表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS jilu (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL COMMENT '用户名',
                mode VARCHAR(50) NOT NULL COMMENT '面试模式',
                question_title VARCHAR(255) NOT NULL COMMENT '题目名',
                video_name VARCHAR(255) COMMENT '面试视频名称',
                video_url VARCHAR(500) COMMENT '视频URL',
                ai_evaluation TEXT COMMENT 'AI评测结果',
                score INT COMMENT '评分',
                feedback TEXT COMMENT '反馈建议',
                interview_duration INT COMMENT '面试时长(秒)',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_mode (mode),
                INDEX idx_created_at (created_at)
            )
        `);
        
        // 插入初始数据 - 大数据工程师职业
        const [careerRows] = await connection.execute(
            'SELECT * FROM careers WHERE name = "大数据工程师" LIMIT 1'
        );
        
        let careerId;
        if (careerRows.length === 0) {
            const [result] = await connection.execute(
                'INSERT INTO careers (name, description, icon) VALUES (?, ?, ?)',
                ['大数据工程师', '专注于大数据处理、分析和架构设计的技术岗位', 'fas fa-database']
            );
            careerId = result.insertId;
        } else {
            careerId = careerRows[0].id;
        }
        
        // 插入题目分类
        const categories = [
            { name: 'Hadoop生态系统', code: 'hadoop', icon: 'fas fa-server' },
            { name: 'Spark计算框架', code: 'spark', icon: 'fas fa-bolt' },
            { name: 'SQL与数据库', code: 'sql', icon: 'fas fa-database' },
            { name: '实时数据处理', code: 'streaming', icon: 'fas fa-stream' },
            { name: '架构设计', code: 'architecture', icon: 'fas fa-sitemap' }
        ];
        
        for (const category of categories) {
            const [existingCategory] = await connection.execute(
                'SELECT * FROM question_categories WHERE career_id = ? AND code = ? LIMIT 1',
                [careerId, category.code]
            );
            
            if (existingCategory.length === 0) {
                await connection.execute(
                    'INSERT INTO question_categories (career_id, name, code, icon) VALUES (?, ?, ?, ?)',
                    [careerId, category.name, category.code, category.icon]
                );
            }
        }
        
        // 插入示例题目
        const [hadoopCategory] = await connection.execute(
            'SELECT * FROM question_categories WHERE career_id = ? AND code = "hadoop" LIMIT 1',
            [careerId]
        );
        
        if (hadoopCategory.length > 0) {
            const categoryId = hadoopCategory[0].id;
            const [existingQuestion] = await connection.execute(
                'SELECT * FROM practice_questions WHERE category_id = ? AND title LIKE "%HDFS%" LIMIT 1',
                [categoryId]
            );
            
            if (existingQuestion.length === 0) {
                const [questionResult] = await connection.execute(
                    'INSERT INTO practice_questions (category_id, title, content, details, difficulty, duration_min, duration_max) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        categoryId,
                        'HDFS的工作原理和架构设计',
                        '请详细说明HDFS的工作原理和架构设计',
                        '<p>请从以下几个方面进行回答：</p><ul><li>HDFS的核心组件及其作用</li><li>数据存储和读取的流程</li><li>副本机制和容错处理</li><li>与传统文件系统的区别</li></ul>',
                        'medium',
                        5,
                        8
                    ]
                );
                
                // 插入参考资料
                const questionId = questionResult.insertId;
                await connection.execute(
                    'INSERT INTO question_resources (question_id, title, url, type, icon) VALUES (?, ?, ?, ?, ?)',
                    [questionId, 'HDFS官方文档', '#', 'link', 'fas fa-link']
                );
                await connection.execute(
                    'INSERT INTO question_resources (question_id, title, url, type, icon) VALUES (?, ?, ?, ?, ?)',
                    [questionId, '架构图解析', '#', 'video', 'fas fa-video']
                );
            }
        }
        
        // 插入其他职业数据
        await initOtherCareers(connection);
        
        // 初始化timu表数据
        await initTimuData(connection);
        
        connection.release();
        console.log('数据库初始化完成');
    } catch (error) {
        console.error('数据库初始化失败:', error);
    }
}

// 初始化其他职业数据
async function initOtherCareers(connection) {
    const careersData = [
        {
            name: '人工智能工程师',
            description: '专注于机器学习、深度学习和AI算法开发的技术岗位',
            icon: 'fas fa-brain',
            categories: [
                { name: '机器学习基础', code: 'ml-basics', icon: 'fas fa-robot' },
                { name: '深度学习', code: 'deep-learning', icon: 'fas fa-network-wired' },
                { name: '自然语言处理', code: 'nlp', icon: 'fas fa-language' },
                { name: '计算机视觉', code: 'cv', icon: 'fas fa-eye' },
                { name: 'AI框架应用', code: 'ai-frameworks', icon: 'fas fa-cogs' }
            ],
            questions: [
                {
                    categoryCode: 'ml-basics',
                    title: '监督学习与无监督学习的区别',
                    content: '请详细解释监督学习与无监督学习的区别，并举例说明各自的应用场景',
                    details: '<p>请从以下几个方面进行回答：</p><ul><li>监督学习和无监督学习的定义</li><li>数据特点和标签要求</li><li>常见算法举例</li><li>实际应用场景</li></ul>',
                    difficulty: 'easy',
                    duration_min: 3,
                    duration_max: 5
                },
                {
                    categoryCode: 'deep-learning',
                    title: '卷积神经网络的工作原理',
                    content: '请解释卷积神经网络(CNN)的工作原理和核心组件',
                    details: '<p>请详细说明：</p><ul><li>卷积层的作用和计算过程</li><li>池化层的功能</li><li>激活函数的选择</li><li>反向传播算法</li></ul>',
                    difficulty: 'medium',
                    duration_min: 5,
                    duration_max: 8
                }
            ]
        },
        {
            name: '物联网工程师',
            description: '专注于物联网系统设计、嵌入式开发和智能设备连接的技术岗位',
            icon: 'fas fa-wifi',
            categories: [
                { name: '嵌入式系统', code: 'embedded', icon: 'fas fa-microchip' },
                { name: '通信协议', code: 'protocols', icon: 'fas fa-broadcast-tower' },
                { name: '传感器技术', code: 'sensors', icon: 'fas fa-thermometer-half' },
                { name: '云平台集成', code: 'cloud-integration', icon: 'fas fa-cloud' },
                { name: '安全与隐私', code: 'security', icon: 'fas fa-shield-alt' }
            ],
            questions: [
                {
                    categoryCode: 'embedded',
                    title: 'Arduino与树莓派的区别和应用场景',
                    content: '请比较Arduino和树莓派的特点，并说明它们各自适合的应用场景',
                    details: '<p>请从以下方面进行对比：</p><ul><li>硬件架构和性能</li><li>编程语言和开发环境</li><li>功耗和成本</li><li>典型应用场景</li></ul>',
                    difficulty: 'easy',
                    duration_min: 4,
                    duration_max: 6
                },
                {
                    categoryCode: 'protocols',
                    title: 'MQTT协议在物联网中的应用',
                    content: '请详细介绍MQTT协议的特点和在物联网系统中的应用',
                    details: '<p>请说明：</p><ul><li>MQTT协议的工作原理</li><li>QoS等级的含义</li><li>与HTTP协议的区别</li><li>在物联网中的优势</li></ul>',
                    difficulty: 'medium',
                    duration_min: 5,
                    duration_max: 7
                }
            ]
        },
        {
            name: '产品经理',
            description: '负责产品规划、需求分析和项目管理的综合性岗位',
            icon: 'fas fa-chart-line',
            categories: [
                { name: '产品规划', code: 'product-planning', icon: 'fas fa-map' },
                { name: '需求分析', code: 'requirement-analysis', icon: 'fas fa-search' },
                { name: '用户体验', code: 'user-experience', icon: 'fas fa-user-friends' },
                { name: '数据分析', code: 'data-analysis', icon: 'fas fa-chart-bar' },
                { name: '项目管理', code: 'project-management', icon: 'fas fa-tasks' }
            ],
            questions: [
                {
                    categoryCode: 'product-planning',
                    title: '如何制定产品路线图',
                    content: '请描述制定产品路线图的完整流程和关键要素',
                    details: '<p>请详细说明：</p><ul><li>市场调研和竞品分析</li><li>用户需求收集和优先级排序</li><li>技术可行性评估</li><li>时间节点和里程碑设定</li></ul>',
                    difficulty: 'medium',
                    duration_min: 6,
                    duration_max: 10
                },
                {
                    categoryCode: 'user-experience',
                    title: '用户体验设计的核心原则',
                    content: '请阐述用户体验设计的核心原则和实践方法',
                    details: '<p>请从以下角度分析：</p><ul><li>用户研究方法</li><li>信息架构设计</li><li>交互设计原则</li><li>可用性测试</li></ul>',
                    difficulty: 'easy',
                    duration_min: 4,
                    duration_max: 7
                }
            ]
        }
    ];
    
    for (const careerData of careersData) {
        // 插入职业
        const [existingCareer] = await connection.execute(
            'SELECT * FROM careers WHERE name = ? LIMIT 1',
            [careerData.name]
        );
        
        let careerId;
        if (existingCareer.length === 0) {
            const [result] = await connection.execute(
                'INSERT INTO careers (name, description, icon) VALUES (?, ?, ?)',
                [careerData.name, careerData.description, careerData.icon]
            );
            careerId = result.insertId;
        } else {
            careerId = existingCareer[0].id;
        }
        
        // 插入分类
        const categoryMap = new Map();
        for (const category of careerData.categories) {
            const [existingCategory] = await connection.execute(
                'SELECT * FROM question_categories WHERE career_id = ? AND code = ? LIMIT 1',
                [careerId, category.code]
            );
            
            let categoryId;
            if (existingCategory.length === 0) {
                const [result] = await connection.execute(
                    'INSERT INTO question_categories (career_id, name, code, icon) VALUES (?, ?, ?, ?)',
                    [careerId, category.name, category.code, category.icon]
                );
                categoryId = result.insertId;
            } else {
                categoryId = existingCategory[0].id;
            }
            categoryMap.set(category.code, categoryId);
        }
        
        // 插入题目
        for (const question of careerData.questions) {
            const categoryId = categoryMap.get(question.categoryCode);
            if (categoryId) {
                const [existingQuestion] = await connection.execute(
                    'SELECT * FROM practice_questions WHERE category_id = ? AND title = ? LIMIT 1',
                    [categoryId, question.title]
                );
                
                if (existingQuestion.length === 0) {
                    const [questionResult] = await connection.execute(
                        'INSERT INTO practice_questions (category_id, title, content, details, difficulty, duration_min, duration_max) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [
                            categoryId,
                            question.title,
                            question.content,
                            question.details,
                            question.difficulty,
                            question.duration_min,
                            question.duration_max
                        ]
                    );
                    
                    // 为每个题目添加一些通用的参考资料
                    const questionId = questionResult.insertId;
                    await connection.execute(
                        'INSERT INTO question_resources (question_id, title, url, type, icon) VALUES (?, ?, ?, ?, ?)',
                        [questionId, '相关技术文档', '#', 'link', 'fas fa-link']
                    );
                    await connection.execute(
                        'INSERT INTO question_resources (question_id, title, url, type, icon) VALUES (?, ?, ?, ?, ?)',
                        [questionId, '学习视频', '#', 'video', 'fas fa-video']
                    );
                }
            }
        }
    }
}

// 初始化timu表数据
async function initTimuData(connection) {
    // 检查是否已有数据
    const [existingData] = await connection.execute('SELECT COUNT(*) as count FROM timu');
    if (existingData[0].count > 0) {
        return; // 已有数据，跳过初始化
    }
    
    const timuData = [
        // 人工智能工程师
        {
            career: '人工智能工程师',
            career_description: '专注于机器学习、深度学习和AI算法开发的技术岗位',
            categories: [
                {
                    name: '机器学习基础',
                    questions: [
                        {
                            title: '监督学习与无监督学习的区别',
                            content: '请详细说明监督学习与无监督学习的区别和应用场景',
                            details: '<p>请从以下几个方面进行回答：</p><ul><li>定义和基本概念</li><li>数据特点和标签要求</li><li>常见算法和应用场景</li><li>优缺点对比</li></ul>',
                            difficulty: 'medium',
                            analysis: '监督学习使用标记数据进行训练，而无监督学习从未标记数据中发现模式。监督学习适用于分类和回归任务，无监督学习适用于聚类和降维任务。',
                            resource_name: '机器学习基础教程',
                            resource_url: 'https://scikit-learn.org/stable/supervised_learning.html'
                        },
                        {
                            title: '过拟合和欠拟合的解决方案',
                            content: '如何识别和解决机器学习模型中的过拟合和欠拟合问题',
                            details: '<p>请详细说明：</p><ul><li>过拟合和欠拟合的表现特征</li><li>产生原因分析</li><li>常用的解决方法</li><li>正则化技术的应用</li></ul>',
                            difficulty: 'medium',
                            analysis: '过拟合可通过正则化、交叉验证、增加数据等方法解决；欠拟合可通过增加模型复杂度、特征工程等方法改善。',
                            resource_name: '模型优化指南',
                            resource_url: 'https://developers.google.com/machine-learning/crash-course/regularization-for-simplicity'
                        },
                        {
                            title: '特征工程的重要性和方法',
                            content: '特征工程在机器学习项目中的作用和常用技术',
                            details: '<p>请从以下角度分析：</p><ul><li>特征选择的方法</li><li>特征变换技术</li><li>处理缺失值和异常值</li><li>特征工程对模型性能的影响</li></ul>',
                            difficulty: 'easy',
                            analysis: '特征工程是机器学习成功的关键，包括特征选择、变换、创建等步骤，直接影响模型的性能和泛化能力。',
                            resource_name: '特征工程实战',
                            resource_url: 'https://www.kaggle.com/learn/feature-engineering'
                        }
                    ]
                },
                {
                    name: '深度学习',
                    questions: [
                        {
                            title: '神经网络的反向传播算法',
                            content: '详细解释神经网络中反向传播算法的工作原理',
                            details: '<p>请详细说明：</p><ul><li>前向传播过程</li><li>损失函数的计算</li><li>梯度计算和反向传播</li><li>权重更新机制</li></ul>',
                            difficulty: 'hard',
                            analysis: '反向传播通过链式法则计算梯度，从输出层向输入层逐层传播误差，更新网络权重以最小化损失函数。',
                            resource_name: '深度学习理论',
                            resource_url: 'https://www.deeplearningbook.org/'
                        },
                        {
                            title: 'CNN卷积神经网络架构',
                            content: '卷积神经网络的基本组件和工作原理',
                            details: '<p>请详细介绍：</p><ul><li>卷积层的作用和参数</li><li>池化层的功能</li><li>全连接层的设计</li><li>常见的CNN架构</li></ul>',
                            difficulty: 'medium',
                            analysis: 'CNN通过卷积层提取特征，池化层降维，全连接层分类，特别适用于图像识别任务。',
                            resource_name: 'CNN详解',
                            resource_url: 'https://cs231n.github.io/convolutional-networks/'
                        },
                        {
                            title: 'RNN和LSTM的应用场景',
                            content: '循环神经网络和长短期记忆网络的特点和应用',
                            details: '<p>请分析：</p><ul><li>RNN的基本结构和问题</li><li>LSTM的改进机制</li><li>序列数据处理的优势</li><li>实际应用案例</li></ul>',
                            difficulty: 'medium',
                            analysis: 'RNN适合处理序列数据但存在梯度消失问题，LSTM通过门控机制解决长期依赖问题，广泛应用于NLP任务。',
                            resource_name: 'RNN和LSTM教程',
                            resource_url: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/'
                        }
                    ]
                },
                {
                    name: '自然语言处理',
                    questions: [
                        {
                            title: 'Transformer架构原理',
                            content: 'Transformer模型的核心机制和创新点',
                            details: '<p>请详细说明：</p><ul><li>自注意力机制的工作原理</li><li>多头注意力的设计</li><li>位置编码的作用</li><li>相比RNN的优势</li></ul>',
                            difficulty: 'hard',
                            analysis: 'Transformer通过自注意力机制并行处理序列，解决了RNN的串行计算问题，成为现代NLP的基础架构。',
                            resource_name: 'Attention Is All You Need',
                            resource_url: 'https://arxiv.org/abs/1706.03762'
                        },
                        {
                            title: '词向量和词嵌入技术',
                            content: '词向量表示方法和训练技术',
                            details: '<p>请介绍：</p><ul><li>One-hot编码的局限性</li><li>Word2Vec的原理</li><li>GloVe和FastText的特点</li><li>预训练词向量的应用</li></ul>',
                            difficulty: 'medium',
                            analysis: '词向量将词语映射到连续向量空间，捕获语义关系，Word2Vec、GloVe等方法各有特点和适用场景。',
                            resource_name: '词向量技术综述',
                            resource_url: 'https://www.tensorflow.org/tutorials/text/word2vec'
                        },
                        {
                            title: '命名实体识别NER任务',
                            content: '命名实体识别的方法和评估指标',
                            details: '<p>请详细说明：</p><ul><li>NER任务的定义和挑战</li><li>基于规则和统计的方法</li><li>深度学习方法的应用</li><li>评估指标和数据集</li></ul>',
                            difficulty: 'easy',
                            analysis: 'NER识别文本中的人名、地名、机构名等实体，可使用CRF、BiLSTM-CRF、BERT等方法，评估指标包括精确率、召回率、F1值。',
                            resource_name: 'NER技术指南',
                            resource_url: 'https://spacy.io/usage/linguistic-features#named-entities'
                        }
                    ]
                }
            ]
        },
        // 大数据工程师
        {
            career: '大数据工程师',
            career_description: '专注于大数据处理、分析和架构设计的技术岗位',
            categories: [
                {
                    name: 'Hadoop生态系统',
                    questions: [
                        {
                            title: 'HDFS的工作原理和架构设计',
                            content: '请详细说明HDFS的工作原理和架构设计',
                            details: '<p>请从以下几个方面进行回答：</p><ul><li>HDFS的核心组件及其作用</li><li>数据存储和读取的流程</li><li>副本机制和容错处理</li><li>与传统文件系统的区别</li></ul>',
                            difficulty: 'medium',
                            analysis: 'HDFS采用主从架构，NameNode管理元数据，DataNode存储数据块，通过副本机制保证数据可靠性和容错性。',
                            resource_name: 'HDFS官方文档',
                            resource_url: 'https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html'
                        },
                        {
                            title: 'MapReduce编程模型',
                            content: 'MapReduce的工作原理和编程实践',
                            details: '<p>请详细说明：</p><ul><li>Map和Reduce阶段的功能</li><li>Shuffle过程的机制</li><li>作业调度和资源管理</li><li>性能优化策略</li></ul>',
                            difficulty: 'medium',
                            analysis: 'MapReduce将大数据处理分解为Map和Reduce两个阶段，通过并行计算和数据本地化提高处理效率。',
                            resource_name: 'MapReduce教程',
                            resource_url: 'https://hadoop.apache.org/docs/current/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html'
                        },
                        {
                            title: 'YARN资源管理器',
                            content: 'YARN的架构设计和资源调度机制',
                            details: '<p>请介绍：</p><ul><li>ResourceManager和NodeManager的作用</li><li>ApplicationMaster的功能</li><li>容器化资源分配</li><li>多租户资源隔离</li></ul>',
                            difficulty: 'hard',
                            analysis: 'YARN将资源管理和作业调度分离，支持多种计算框架，提供更好的资源利用率和系统扩展性。',
                            resource_name: 'YARN架构指南',
                            resource_url: 'https://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html'
                        }
                    ]
                },
                {
                    name: 'Spark计算框架',
                    questions: [
                        {
                            title: 'Spark RDD的特性和操作',
                            content: 'Spark RDD的核心概念和常用操作',
                            details: '<p>请详细说明：</p><ul><li>RDD的不可变性和分区</li><li>Transformation和Action操作</li><li>惰性计算的优势</li><li>缓存和持久化策略</li></ul>',
                            difficulty: 'medium',
                            analysis: 'RDD是Spark的核心抽象，具有不可变、分布式、容错等特性，支持丰富的转换和行动操作。',
                            resource_name: 'Spark RDD编程指南',
                            resource_url: 'https://spark.apache.org/docs/latest/rdd-programming-guide.html'
                        },
                        {
                            title: 'Spark SQL和DataFrame',
                            content: 'Spark SQL的查询优化和DataFrame API',
                            details: '<p>请介绍：</p><ul><li>Catalyst优化器的工作原理</li><li>DataFrame和Dataset的区别</li><li>SQL查询的执行计划</li><li>与Hive的集成</li></ul>',
                            difficulty: 'medium',
                            analysis: 'Spark SQL提供结构化数据处理能力，Catalyst优化器自动优化查询计划，DataFrame提供类型安全的API。',
                            resource_name: 'Spark SQL指南',
                            resource_url: 'https://spark.apache.org/docs/latest/sql-programming-guide.html'
                        },
                        {
                            title: 'Spark Streaming实时处理',
                            content: 'Spark Streaming的微批处理模型',
                            details: '<p>请分析：</p><ul><li>DStream的概念和操作</li><li>窗口操作和状态管理</li><li>容错机制和检查点</li><li>与Kafka的集成</li></ul>',
                            difficulty: 'hard',
                            analysis: 'Spark Streaming采用微批处理模式，将流数据分割成小批次处理，提供容错和状态管理能力。',
                            resource_name: 'Spark Streaming教程',
                            resource_url: 'https://spark.apache.org/docs/latest/streaming-programming-guide.html'
                        }
                    ]
                },
                {
                    name: 'NoSQL数据库',
                    questions: [
                        {
                            title: 'HBase的列式存储原理',
                            content: 'HBase的数据模型和存储机制',
                            details: '<p>请详细说明：</p><ul><li>行键、列族、列限定符的设计</li><li>Region和RegionServer的作用</li><li>LSM树的存储结构</li><li>读写性能优化</li></ul>',
                            difficulty: 'hard',
                            analysis: 'HBase基于列族存储，使用LSM树结构，适合大规模稀疏数据的随机读写访问。',
                            resource_name: 'HBase权威指南',
                            resource_url: 'https://hbase.apache.org/book.html'
                        },
                        {
                            title: 'MongoDB文档数据库',
                            content: 'MongoDB的文档模型和查询语言',
                            details: '<p>请介绍：</p><ul><li>BSON文档格式</li><li>集合和数据库的组织</li><li>索引策略和查询优化</li><li>副本集和分片机制</li></ul>',
                            difficulty: 'medium',
                            analysis: 'MongoDB使用灵活的文档模型，支持丰富的查询语言，通过副本集和分片提供高可用和扩展性。',
                            resource_name: 'MongoDB官方文档',
                            resource_url: 'https://docs.mongodb.com/manual/'
                        },
                        {
                            title: 'Redis缓存和数据结构',
                            content: 'Redis的内存数据结构和应用场景',
                            details: '<p>请分析：</p><ul><li>五种基本数据类型</li><li>持久化机制RDB和AOF</li><li>主从复制和哨兵模式</li><li>集群模式和分片策略</li></ul>',
                            difficulty: 'easy',
                            analysis: 'Redis提供丰富的内存数据结构，支持多种持久化和高可用方案，广泛用于缓存和会话存储。',
                            resource_name: 'Redis设计与实现',
                            resource_url: 'https://redis.io/documentation'
                        }
                    ]
                }
            ]
        },
        // 物联网工程师
        {
            career: '物联网工程师',
            career_description: '专注于物联网系统设计、嵌入式开发和设备连接的技术岗位',
            categories: [
                {
                    name: '嵌入式系统开发',
                    questions: [
                        {
                            title: 'ARM处理器架构和指令集',
                            content: 'ARM处理器的特点和编程模型',
                            details: '<p>请详细说明：</p><ul><li>ARM架构的特点和优势</li><li>指令集和寻址模式</li><li>中断处理机制</li><li>功耗管理策略</li></ul>',
                            difficulty: 'hard',
                            analysis: 'ARM采用RISC架构，具有低功耗、高性能的特点，广泛应用于移动设备和嵌入式系统。',
                            resource_name: 'ARM架构参考手册',
                            resource_url: 'https://developer.arm.com/documentation'
                        },
                        {
                            title: '实时操作系统RTOS',
                            content: '实时操作系统的特性和应用',
                            details: '<p>请介绍：</p><ul><li>实时性要求和调度算法</li><li>任务管理和同步机制</li><li>内存管理和中断处理</li><li>FreeRTOS的使用</li></ul>',
                            difficulty: 'medium',
                            analysis: 'RTOS提供确定性的任务调度和响应时间，适合对时间要求严格的嵌入式应用。',
                            resource_name: 'FreeRTOS官方文档',
                            resource_url: 'https://www.freertos.org/Documentation/RTOS_book.html'
                        },
                        {
                            title: '传感器接口和数据采集',
                            content: '传感器的接口协议和数据处理',
                            details: '<p>请分析：</p><ul><li>模拟和数字传感器的区别</li><li>I2C、SPI、UART通信协议</li><li>ADC转换和信号调理</li><li>数据滤波和校准</li></ul>',
                            difficulty: 'medium',
                            analysis: '传感器接口需要选择合适的通信协议，进行信号调理和数据处理，确保数据的准确性和可靠性。',
                            resource_name: '传感器技术手册',
                            resource_url: 'https://www.ti.com/sensors/overview.html'
                        }
                    ]
                },
                {
                    name: '无线通信技术',
                    questions: [
                        {
                            title: 'WiFi和蓝牙协议栈',
                            content: 'WiFi和蓝牙的协议架构和应用',
                            details: '<p>请详细说明：</p><ul><li>802.11协议族的特点</li><li>蓝牙协议栈的层次结构</li><li>配对和连接过程</li><li>功耗优化策略</li></ul>',
                            difficulty: 'medium',
                            analysis: 'WiFi适合高带宽数据传输，蓝牙适合短距离低功耗通信，各有不同的协议栈和应用场景。',
                            resource_name: '无线通信协议指南',
                            resource_url: 'https://www.bluetooth.com/specifications/'
                        },
                        {
                            title: 'LoRa和NB-IoT技术',
                            content: '低功耗广域网技术的特点和应用',
                            details: '<p>请介绍：</p><ul><li>LoRa调制技术和网络架构</li><li>NB-IoT的技术特点</li><li>覆盖范围和功耗对比</li><li>应用场景选择</li></ul>',
                            difficulty: 'hard',
                            analysis: 'LoRa和NB-IoT都是LPWAN技术，LoRa适合私有网络部署，NB-IoT依托运营商网络，各有优势。',
                            resource_name: 'LPWAN技术白皮书',
                            resource_url: 'https://lora-alliance.org/resource_hub/'
                        },
                        {
                            title: 'Zigbee网状网络',
                            content: 'Zigbee协议和网状网络拓扑',
                            details: '<p>请分析：</p><ul><li>IEEE 802.15.4物理层</li><li>网状网络的自组织能力</li><li>路由算法和网络修复</li><li>安全机制和密钥管理</li></ul>',
                            difficulty: 'medium',
                            analysis: 'Zigbee基于IEEE 802.15.4标准，支持网状网络拓扑，具有自组织和自修复能力，适合智能家居应用。',
                            resource_name: 'Zigbee联盟规范',
                            resource_url: 'https://zigbeealliance.org/solution/zigbee/'
                        }
                    ]
                },
                {
                    name: '物联网平台架构',
                    questions: [
                        {
                            title: 'MQTT消息协议',
                            content: 'MQTT协议的特点和应用场景',
                            details: '<p>请详细说明：</p><ul><li>发布订阅模式的优势</li><li>QoS服务质量等级</li><li>保持连接和遗嘱消息</li><li>安全认证机制</li></ul>',
                            difficulty: 'easy',
                            analysis: 'MQTT是轻量级的消息协议，采用发布订阅模式，适合物联网设备的数据传输和控制。',
                            resource_name: 'MQTT协议规范',
                            resource_url: 'https://mqtt.org/mqtt-specification/'
                        },
                        {
                            title: '边缘计算架构设计',
                            content: '边缘计算在物联网中的应用',
                            details: '<p>请介绍：</p><ul><li>边缘计算的概念和优势</li><li>边缘节点的部署策略</li><li>数据预处理和本地决策</li><li>与云端的协同工作</li></ul>',
                            difficulty: 'hard',
                            analysis: '边缘计算将计算能力下沉到网络边缘，减少延迟，降低带宽需求，提高系统响应速度。',
                            resource_name: '边缘计算白皮书',
                            resource_url: 'https://www.edgecomputing.org/'
                        },
                        {
                            title: '设备管理和OTA升级',
                            content: '物联网设备的远程管理和升级',
                            details: '<p>请分析：</p><ul><li>设备注册和身份认证</li><li>远程配置和监控</li><li>固件OTA升级流程</li><li>升级失败的回滚机制</li></ul>',
                            difficulty: 'medium',
                            analysis: '设备管理包括生命周期管理、远程配置、监控告警等，OTA升级需要考虑安全性和可靠性。',
                            resource_name: '物联网设备管理指南',
                            resource_url: 'https://aws.amazon.com/iot-device-management/'
                        }
                    ]
                }
            ]
        },
        // 产品经理
        {
            career: '产品经理',
            career_description: '负责产品规划、设计和管理的综合性岗位',
            categories: [
                {
                    name: '产品规划设计',
                    questions: [
                        {
                            title: '用户需求分析方法',
                            content: '如何进行有效的用户需求调研和分析',
                            details: '<p>请详细说明：</p><ul><li>用户调研的方法和工具</li><li>需求收集和整理技巧</li><li>用户画像的构建</li><li>需求优先级排序</li></ul>',
                            difficulty: 'medium',
                            analysis: '用户需求分析需要运用多种调研方法，建立用户画像，通过数据分析和用户反馈来验证和优化需求。',
                            resource_name: '用户体验要素',
                            resource_url: 'https://www.uxmatters.com/mt/archives/2007/07/the-elements-of-user-experience.php'
                        },
                        {
                            title: '产品原型设计',
                            content: '产品原型的设计原则和工具使用',
                            details: '<p>请介绍：</p><ul><li>低保真和高保真原型的区别</li><li>原型设计的流程和方法</li><li>交互设计的基本原则</li><li>原型测试和迭代</li></ul>',
                            difficulty: 'easy',
                            analysis: '原型设计是产品开发的重要环节，需要平衡设计效率和表达效果，通过测试验证设计方案。',
                            resource_name: 'Axure RP用户指南',
                            resource_url: 'https://www.axure.com/support'
                        },
                        {
                            title: 'MVP最小可行产品',
                            content: 'MVP的概念和实施策略',
                            details: '<p>请分析：</p><ul><li>MVP的定义和价值</li><li>核心功能的识别方法</li><li>快速验证和迭代</li><li>用户反馈的收集和分析</li></ul>',
                            difficulty: 'medium',
                            analysis: 'MVP通过最小功能集快速验证产品假设，降低开发风险，根据用户反馈持续迭代优化。',
                            resource_name: '精益创业',
                            resource_url: 'http://theleanstartup.com/principles'
                        }
                    ]
                },
                {
                    name: '数据分析运营',
                    questions: [
                        {
                            title: '产品数据指标体系',
                            content: '如何建立完整的产品数据指标体系',
                            details: '<p>请详细说明：</p><ul><li>北极星指标的选择</li><li>漏斗分析和用户行为追踪</li><li>留存率和活跃度分析</li><li>A/B测试的设计和分析</li></ul>',
                            difficulty: 'hard',
                            analysis: '数据指标体系需要围绕业务目标构建，包括核心指标、过程指标和结果指标，通过数据驱动产品决策。',
                            resource_name: '增长黑客',
                            resource_url: 'https://www.growthhackers.com/'
                        },
                        {
                            title: '用户生命周期管理',
                            content: '用户从获取到流失的全生命周期管理',
                            details: '<p>请介绍：</p><ul><li>用户获取渠道和成本</li><li>新用户引导和激活</li><li>用户留存和价值提升</li><li>流失用户的挽回策略</li></ul>',
                            difficulty: 'medium',
                            analysis: '用户生命周期管理需要针对不同阶段制定相应策略，提高用户价值和产品粘性。',
                            resource_name: '用户增长方法论',
                            resource_url: 'https://amplitude.com/blog/user-lifecycle'
                        },
                        {
                            title: '竞品分析框架',
                            content: '系统性的竞品分析方法和工具',
                            details: '<p>请分析：</p><ul><li>竞品识别和分类</li><li>功能对比和差异分析</li><li>商业模式和定价策略</li><li>市场定位和用户群体</li></ul>',
                            difficulty: 'easy',
                            analysis: '竞品分析帮助了解市场格局和竞争态势，发现产品机会和差异化定位。',
                            resource_name: '竞品分析方法',
                            resource_url: 'https://www.productplan.com/glossary/competitive-analysis/'
                        }
                    ]
                },
                {
                    name: '项目管理协作',
                    questions: [
                        {
                            title: '敏捷开发和Scrum',
                            content: '敏捷开发方法在产品管理中的应用',
                            details: '<p>请详细说明：</p><ul><li>Scrum框架的角色和流程</li><li>Sprint规划和执行</li><li>用户故事的编写方法</li><li>回顾会议和持续改进</li></ul>',
                            difficulty: 'medium',
                            analysis: '敏捷开发强调快速迭代和用户反馈，Scrum提供了具体的实施框架和最佳实践。',
                            resource_name: 'Scrum指南',
                            resource_url: 'https://scrumguides.org/scrum-guide.html'
                        },
                        {
                            title: '跨部门沟通协作',
                            content: '产品经理的沟通技巧和协作方法',
                            details: '<p>请介绍：</p><ul><li>与技术团队的协作</li><li>与设计师的配合</li><li>与运营团队的协调</li><li>向上管理和汇报</li></ul>',
                            difficulty: 'easy',
                            analysis: '产品经理需要具备良好的沟通能力，协调各方资源，推动产品目标的实现。',
                            resource_name: '产品经理手册',
                            resource_url: 'https://www.productmanagerhq.com/'
                        },
                        {
                            title: '产品路线图规划',
                            content: '制定和管理产品发展路线图',
                            details: '<p>请分析：</p><ul><li>战略目标的分解</li><li>功能优先级排序</li><li>时间节点和里程碑</li><li>资源分配和风险管理</li></ul>',
                            difficulty: 'hard',
                            analysis: '产品路线图需要平衡短期目标和长期愿景，考虑市场变化和资源约束，保持灵活性。',
                            resource_name: '产品路线图最佳实践',
                            resource_url: 'https://www.productplan.com/roadmap/'
                        }
                    ]
                }
            ]
        }
    ];
    
    // 插入数据
    for (const careerData of timuData) {
        for (const category of careerData.categories) {
            for (const question of category.questions) {
                await connection.execute(
                    `INSERT INTO timu (
                        career, career_description, category, title, content, 
                        details, difficulty, analysis, resource_name, resource_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        careerData.career,
                        careerData.career_description,
                        category.name,
                        question.title,
                        question.content,
                        question.details,
                        question.difficulty,
                        question.analysis,
                        question.resource_name,
                        question.resource_url
                    ]
                );
            }
        }
    }
    
    console.log('timu表数据初始化完成');
}

// 智谱AI视频分析函数
async function analyzeVideoWithZhipu(videoUrl) {
    const API_KEY = "6b560216f9bd44a392f073f91bdbd3c8.yYvWPqBPSVcC74AI";
    
    try {
        console.log('开始分析视频...', videoUrl);
        
        // 动态导入ZhipuAI
        const { ZhipuAI } = await import('zhipuai');
        
        const client = new ZhipuAI({
            apiKey: API_KEY
        });
        
        const response = await client.chat.completions.create({
            model: "glm-4.1v-thinking-flash",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "video_url",
                            video_url: {
                                url: videoUrl
                            }
                        },
                        {
                            type: "text",
                            text: "请仔细分析这个视频内容，给出多维度面试评价（语音分析评估语言流畅度等指标，视频分析检测微表情等表现，文本分析评估专业知识匹配度等，综合生成表达能力、逻辑思维、专业知识、应变能力、职业素养5项核心能力评分，返回格式：总体得分：X分，表达能力X分、逻辑思维X分、专业知识X分、应变能力X分、职业素养X分，综合评价：xxx,改进建议：xxx"
                        }
                    ]
                }
            ]
        });
        
        const aiResult = response.choices[0].message.content;
        console.log('AI分析结果:', aiResult);
        
        // 解析AI返回结果，提取总体得分
        const scoreMatch = aiResult.match(/总体得分：(\d+)分/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
        
        return {
            success: true,
            score: score,
            ai_evaluation: aiResult
        };
        
    } catch (error) {
        console.error('AI分析失败:', error);
        return {
            success: false,
            score: null,
            ai_evaluation: `AI分析失败: ${error.message}`
        };
    }
}

// 登录接口
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 参数验证
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }
        
        // 查询用户
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ? AND status = "active"',
            [username]
        );
        
        if (rows.length === 0) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }
        
        const user = rows[0];
        
        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }
        
        // 更新最后登录时间
        await connection.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );
        
        connection.release();
        
        // 返回用户信息（不包含密码）
        const userInfo = {
            id: user.id,
            username: user.username,
            role: user.role,
            avatar: user.avatar,
            lastLogin: user.last_login
        };
        
        res.json({
            success: true,
            message: '登录成功',
            user: userInfo
        });
        
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 注册接口
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 参数验证
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }
        
        // 用户名长度验证
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: '用户名长度不能少于3位'
            });
        }
        
        // 密码长度验证
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: '密码长度不能少于6位'
            });
        }
        
        const connection = await pool.getConnection();
        
        // 检查用户名是否已存在
        const [existingUsers] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (existingUsers.length > 0) {
            connection.release();
            return res.status(409).json({
                success: false,
                message: '该用户名已被注册'
            });
        }
        
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 插入新用户
        const [result] = await connection.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, 'user']
        );
        
        connection.release();
        
        res.json({
            success: true,
            message: '注册成功',
            userId: result.insertId
        });
        
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取用户信息接口
app.get('/api/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT id, username, role, avatar, created_at, last_login FROM users WHERE id = ? AND status = "active"',
            [userId]
        );
        
        connection.release();
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        res.json({
            success: true,
            user: rows[0]
        });
        
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 更新用户信息接口
app.put('/api/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { avatar } = req.body;
        
        const connection = await pool.getConnection();
        
        // 构建更新语句
        const updates = [];
        const values = [];
        
        if (avatar) {
            updates.push('avatar = ?');
            values.push(avatar);
        }
        
        if (updates.length === 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: '没有要更新的字段'
            });
        }
        
        values.push(userId);
        
        await connection.execute(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        connection.release();
        
        res.json({
            success: true,
            message: '用户信息更新成功'
        });
        
    } catch (error) {
        console.error('更新用户信息错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// ==================== 自由练习模式 API ====================

// 获取所有职业列表
app.get('/api/careers', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM careers ORDER BY created_at ASC'
        );
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('获取职业列表失败:', error);
        res.status(500).json({ success: false, message: '获取职业列表失败' });
    }
});

// 获取指定职业的题目分类
app.get('/api/careers/:careerId/categories', async (req, res) => {
    try {
        const { careerId } = req.params;
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM question_categories WHERE career_id = ? ORDER BY created_at ASC',
            [careerId]
        );
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('获取题目分类失败:', error);
        res.status(500).json({ success: false, message: '获取题目分类失败' });
    }
});

// 获取指定分类的题目列表
app.get('/api/categories/:categoryId/questions', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT pq.*, qc.name as category_name, qc.code as category_code 
             FROM practice_questions pq 
             JOIN question_categories qc ON pq.category_id = qc.id 
             WHERE pq.category_id = ? AND pq.status = 'active' 
             ORDER BY pq.order_index ASC, pq.created_at ASC`,
            [categoryId]
        );
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('获取题目列表失败:', error);
        res.status(500).json({ success: false, message: '获取题目列表失败' });
    }
});

// 获取题目详情和参考资料
// 根据职业获取题目分类和题目列表（用于自由练习模式）
app.get('/api/questions/categories', async (req, res) => {
    try {
        const { career } = req.query;
        
        if (!career) {
            return res.status(400).json({ success: false, message: '缺少职业参数' });
        }
        
        const connection = await pool.getConnection();
        
        // 获取该职业的所有题目
        const [questions] = await connection.execute(
            'SELECT * FROM timu WHERE career = ? ORDER BY category, id',
            [career]
        );
        
        // 获取所有分类
        const [categoryRows] = await connection.execute(
            'SELECT DISTINCT category FROM timu WHERE career = ? ORDER BY category',
            [career]
        );
        
        connection.release();
        
        const categories = categoryRows.map(row => row.category);
        
        res.json({
            success: true,
            categories: categories,
            questions: questions
        });
    } catch (error) {
        console.error('获取题目分类失败:', error);
        res.status(500).json({ success: false, message: '获取题目分类失败' });
    }
});

app.get('/api/questions/:questionId', async (req, res) => {
    try {
        const { questionId } = req.params;
        const connection = await pool.getConnection();
        
        // 获取题目详情
        const [questionRows] = await connection.execute(
            `SELECT pq.*, qc.name as category_name, qc.code as category_code, c.name as career_name
             FROM practice_questions pq 
             JOIN question_categories qc ON pq.category_id = qc.id 
             JOIN careers c ON qc.career_id = c.id 
             WHERE pq.id = ?`,
            [questionId]
        );
        
        if (questionRows.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: '题目不存在' });
        }
        
        // 获取参考资料
        const [resourceRows] = await connection.execute(
            'SELECT * FROM question_resources WHERE question_id = ? ORDER BY created_at ASC',
            [questionId]
        );
        
        connection.release();
        
        const question = questionRows[0];
        question.resources = resourceRows;
        
        res.json({ success: true, data: question });
    } catch (error) {
        console.error('获取题目详情失败:', error);
        res.status(500).json({ success: false, message: '获取题目详情失败' });
    }
});

// ==================== 管理员 API ====================

// 添加新职业（管理员权限）
app.post('/api/admin/careers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: '职业名称不能为空' });
        }
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO careers (name, description, icon) VALUES (?, ?, ?)',
            [name, description || '', icon || 'fas fa-briefcase']
        );
        connection.release();
        
        res.json({ success: true, message: '职业添加成功', id: result.insertId });
    } catch (error) {
        console.error('添加职业失败:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: '职业名称已存在' });
        } else {
            res.status(500).json({ success: false, message: '添加职业失败' });
        }
    }
});

// 添加题目分类（管理员权限）
app.post('/api/admin/categories', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { career_id, name, code, icon, description } = req.body;
        
        if (!career_id || !name || !code) {
            return res.status(400).json({ success: false, message: '职业ID、分类名称和代码不能为空' });
        }
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO question_categories (career_id, name, code, icon, description) VALUES (?, ?, ?, ?, ?)',
            [career_id, name, code, icon || 'fas fa-folder', description || '']
        );
        connection.release();
        
        res.json({ success: true, message: '分类添加成功', id: result.insertId });
    } catch (error) {
        console.error('添加分类失败:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: '该职业下已存在相同代码的分类' });
        } else {
            res.status(500).json({ success: false, message: '添加分类失败' });
        }
    }
});

// 添加题目（管理员权限）
app.post('/api/admin/questions', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { category_id, title, content, details, difficulty, duration_min, duration_max, order_index } = req.body;
        
        if (!category_id || !title || !content) {
            return res.status(400).json({ success: false, message: '分类ID、题目标题和内容不能为空' });
        }
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO practice_questions (category_id, title, content, details, difficulty, duration_min, duration_max, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [category_id, title, content, details || '', difficulty || 'medium', duration_min || 5, duration_max || 8, order_index || 0]
        );
        connection.release();
        
        res.json({ success: true, message: '题目添加成功', id: result.insertId });
    } catch (error) {
        console.error('添加题目失败:', error);
        res.status(500).json({ success: false, message: '添加题目失败' });
    }
});

// 添加参考资料（管理员权限）
app.post('/api/admin/resources', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { question_id, title, url, type, icon } = req.body;
        
        if (!question_id || !title) {
            return res.status(400).json({ success: false, message: '题目ID和资料标题不能为空' });
        }
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO question_resources (question_id, title, url, type, icon) VALUES (?, ?, ?, ?, ?)',
            [question_id, title, url || '#', type || 'link', icon || 'fas fa-link']
        );
        connection.release();
        
        res.json({ success: true, message: '参考资料添加成功', id: result.insertId });
    } catch (error) {
        console.error('添加参考资料失败:', error);
        res.status(500).json({ success: false, message: '添加参考资料失败' });
    }
});

// 更新题目（管理员权限）
app.put('/api/admin/questions/:questionId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { questionId } = req.params;
        const { title, content, details, difficulty, duration_min, duration_max, order_index, status } = req.body;
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'UPDATE practice_questions SET title = ?, content = ?, details = ?, difficulty = ?, duration_min = ?, duration_max = ?, order_index = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, details, difficulty, duration_min, duration_max, order_index, status, questionId]
        );
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '题目不存在' });
        }
        
        res.json({ success: true, message: '题目更新成功' });
    } catch (error) {
        console.error('更新题目失败:', error);
        res.status(500).json({ success: false, message: '更新题目失败' });
    }
});

// 删除题目（管理员权限）
app.delete('/api/admin/questions/:questionId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { questionId } = req.params;
        
        const connection = await pool.getConnection();
        // 先删除相关的参考资料
        await connection.execute('DELETE FROM question_resources WHERE question_id = ?', [questionId]);
        // 再删除题目
        const [result] = await connection.execute('DELETE FROM practice_questions WHERE id = ?', [questionId]);
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '题目不存在' });
        }
        
        res.json({ success: true, message: '题目删除成功' });
    } catch (error) {
        console.error('删除题目失败:', error);
        res.status(500).json({ success: false, message: '删除题目失败' });
    }
});

// 删除职业（管理员权限）
app.delete('/api/admin/careers/:careerId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { careerId } = req.params;
        
        const connection = await pool.getConnection();
        // 先删除相关的参考资料
        await connection.execute(`
            DELETE qr FROM question_resources qr 
            JOIN practice_questions pq ON qr.question_id = pq.id 
            JOIN question_categories qc ON pq.category_id = qc.id 
            WHERE qc.career_id = ?
        `, [careerId]);
        
        // 删除相关的题目
        await connection.execute(`
            DELETE pq FROM practice_questions pq 
            JOIN question_categories qc ON pq.category_id = qc.id 
            WHERE qc.career_id = ?
        `, [careerId]);
        
        // 删除相关的分类
        await connection.execute('DELETE FROM question_categories WHERE career_id = ?', [careerId]);
        
        // 删除职业
        const [result] = await connection.execute('DELETE FROM careers WHERE id = ?', [careerId]);
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '职业不存在' });
        }
        
        res.json({ success: true, message: '职业删除成功' });
    } catch (error) {
        console.error('删除职业失败:', error);
        res.status(500).json({ success: false, message: '删除职业失败' });
    }
});

// 删除分类（管理员权限）
app.delete('/api/admin/categories/:categoryId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const connection = await pool.getConnection();
        // 先删除相关的参考资料
        await connection.execute(`
            DELETE qr FROM question_resources qr 
            JOIN practice_questions pq ON qr.question_id = pq.id 
            WHERE pq.category_id = ?
        `, [categoryId]);
        
        // 删除相关的题目
        await connection.execute('DELETE FROM practice_questions WHERE category_id = ?', [categoryId]);
        
        // 删除分类
        const [result] = await connection.execute('DELETE FROM question_categories WHERE id = ?', [categoryId]);
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '分类不存在' });
        }
        
        res.json({ success: true, message: '分类删除成功' });
    } catch (error) {
        console.error('删除分类失败:', error);
        res.status(500).json({ success: false, message: '删除分类失败' });
    }
});

// 删除题目（管理员权限）
app.delete('/api/admin/questions/:questionId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { questionId } = req.params;
        
        const connection = await pool.getConnection();
        // 先删除相关的参考资料
        await connection.execute('DELETE FROM question_resources WHERE question_id = ?', [questionId]);
        
        // 删除题目
        const [result] = await connection.execute('DELETE FROM practice_questions WHERE id = ?', [questionId]);
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '题目不存在' });
        }
        
        res.json({ success: true, message: '题目删除成功' });
    } catch (error) {
        console.error('删除题目失败:', error);
        res.status(500).json({ success: false, message: '删除题目失败' });
    }
});

// 删除参考资料（管理员权限）
app.delete('/api/admin/resources/:resourceId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { resourceId } = req.params;
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM question_resources WHERE id = ?', [resourceId]);
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '资料不存在' });
        }
        
        res.json({ success: true, message: '资料删除成功' });
    } catch (error) {
        console.error('删除资料失败:', error);
        res.status(500).json({ success: false, message: '删除资料失败' });
    }
});

// ==================== TIMU 题目管理 API ====================

// 获取所有题目数据
app.get('/api/timu', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM timu ORDER BY id ASC');
        connection.release();
        
        res.json(rows);
    } catch (error) {
        console.error('获取题目数据失败:', error);
        res.status(500).json({ success: false, message: '获取题目数据失败' });
    }
});

// 添加新题目
app.post('/api/timu', async (req, res) => {
    try {
        const {
            career,
            career_description,
            category,
            title,
            content,
            details,
            difficulty,
            analysis,
            resource_name,
            resource_url
        } = req.body;
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            `INSERT INTO timu (
                career, career_description, category, title, content, 
                details, difficulty, analysis, resource_name, resource_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                career,
                career_description || null,
                category,
                title,
                content,
                details || null,
                difficulty,
                analysis || null,
                resource_name || null,
                resource_url || null
            ]
        );
        connection.release();
        
        res.json({ success: true, message: '题目添加成功', id: result.insertId });
    } catch (error) {
        console.error('添加题目失败:', error);
        res.status(500).json({ success: false, message: '添加题目失败' });
    }
});

// 更新题目
app.put('/api/timu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            career,
            career_description,
            category,
            title,
            content,
            details,
            difficulty,
            analysis,
            resource_name,
            resource_url
        } = req.body;
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            `UPDATE timu SET 
                career = ?, career_description = ?, category = ?, title = ?, 
                content = ?, details = ?, difficulty = ?, analysis = ?, 
                resource_name = ?, resource_url = ?
            WHERE id = ?`,
            [
                career,
                career_description || null,
                category,
                title,
                content,
                details || null,
                difficulty,
                analysis || null,
                resource_name || null,
                resource_url || null,
                id
            ]
        );
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '题目不存在' });
        }
        
        res.json({ success: true, message: '题目更新成功' });
    } catch (error) {
        console.error('更新题目失败:', error);
        res.status(500).json({ success: false, message: '更新题目失败' });
    }
});

// 删除题目
app.delete('/api/timu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM timu WHERE id = ?', [id]);
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '题目不存在' });
        }
        
        res.json({ success: true, message: '题目删除成功' });
    } catch (error) {
        console.error('删除题目失败:', error);
        res.status(500).json({ success: false, message: '删除题目失败' });
    }
});

// 根据职业获取题目
app.get('/api/timu/career/:career', async (req, res) => {
    try {
        const { career } = req.params;
        
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM timu WHERE career = ? ORDER BY category, id',
            [career]
        );
        connection.release();
        
        res.json(rows);
    } catch (error) {
        console.error('获取职业题目失败:', error);
        res.status(500).json({ success: false, message: '获取职业题目失败' });
    }
});

// 根据分类获取题目
app.get('/api/timu/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM timu WHERE category = ? ORDER BY id',
            [category]
        );
        connection.release();
        
        res.json(rows);
    } catch (error) {
        console.error('获取分类题目失败:', error);
        res.status(500).json({ success: false, message: '获取分类题目失败' });
    }
});

// 根据职业获取题目分类和题目列表（用于自由练习模式）
app.get('/api/questions/categories', async (req, res) => {
    try {
        const { career } = req.query;
        
        if (!career) {
            return res.status(400).json({ success: false, message: '缺少职业参数' });
        }
        
        const connection = await pool.getConnection();
        
        // 获取该职业的所有题目
        const [questions] = await connection.execute(
            'SELECT * FROM timu WHERE career = ? ORDER BY category, id',
            [career]
        );
        
        // 获取所有分类
        const [categoryRows] = await connection.execute(
            'SELECT DISTINCT category FROM timu WHERE career = ? ORDER BY category',
            [career]
        );
        
        connection.release();
        
        const categories = categoryRows.map(row => row.category);
        
        res.json({
            success: true,
            categories: categories,
            questions: questions
        });
    } catch (error) {
        console.error('获取题目分类失败:', error);
        res.status(500).json({ success: false, message: '获取题目分类失败' });
    }
});

// ==================== 面试记录(jilu)相关API ====================

// 获取所有面试记录
app.get('/api/jilu', async (req, res) => {
    try {
        const { username, mode, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM jilu';
        let countQuery = 'SELECT COUNT(*) as total FROM jilu';
        const params = [];
        const conditions = [];
        
        if (username) {
            conditions.push('username LIKE ?');
            params.push(`%${username}%`);
        }
        
        if (mode) {
            conditions.push('mode = ?');
            params.push(mode);
        }
        
        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(query, params);
        const [countResult] = await connection.execute(countQuery, params.slice(0, -2));
        connection.release();
        
        res.json({
            success: true,
            data: rows,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('获取面试记录失败:', error);
        res.status(500).json({ success: false, message: '获取面试记录失败' });
    }
});

// 根据用户名获取面试记录
app.get('/api/jilu/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { mode, limit = 20 } = req.query;
        
        let query = 'SELECT * FROM jilu WHERE username = ?';
        const params = [username];
        
        if (mode) {
            query += ' AND mode = ?';
            params.push(mode);
        }
        
        query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;
        
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(query, params);
        connection.release();
        
        // 直接返回数据数组
        res.json(rows);
    } catch (error) {
        console.error('获取用户面试记录失败:', error);
        res.status(500).json([]);
    }
});

// 创建面试记录
app.post('/api/jilu', async (req, res) => {
    try {
        const {
            username,
            mode,
            question_title,
            video_name,
            video_url,
            ai_evaluation,
            score,
            feedback,
            interview_duration
        } = req.body;
        
        if (!username || !mode || !question_title) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名、模式和题目名为必填项' 
            });
        }
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            `INSERT INTO jilu (username, mode, question_title, video_name, video_url, 
             ai_evaluation, score, feedback, interview_duration) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, mode, question_title, video_name, video_url, 
             ai_evaluation, score, feedback, interview_duration]
        );
        connection.release();
        
        res.json({ 
            success: true, 
            message: '面试记录创建成功',
            id: result.insertId 
        });
    } catch (error) {
        console.error('创建面试记录失败:', error);
        res.status(500).json({ success: false, message: '创建面试记录失败' });
    }
});

// 更新面试记录
app.put('/api/jilu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            username,
            mode,
            question_title,
            video_name,
            video_url,
            ai_evaluation,
            score,
            feedback,
            interview_duration
        } = req.body;
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            `UPDATE jilu SET username = ?, mode = ?, question_title = ?, 
             video_name = ?, video_url = ?, ai_evaluation = ?, score = ?, 
             feedback = ?, interview_duration = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [username, mode, question_title, video_name, video_url, 
             ai_evaluation, score, feedback, interview_duration, id]
        );
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '记录不存在' });
        }
        
        res.json({ success: true, message: '面试记录更新成功' });
    } catch (error) {
        console.error('更新面试记录失败:', error);
        res.status(500).json({ success: false, message: '更新面试记录失败' });
    }
});

// 删除面试记录
app.delete('/api/jilu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM jilu WHERE id = ?', [id]);
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '记录不存在' });
        }
        
        res.json({ success: true, message: '面试记录删除成功' });
    } catch (error) {
        console.error('删除面试记录失败:', error);
        res.status(500).json({ success: false, message: '删除面试记录失败' });
    }
});

// 获取面试统计数据
app.get('/api/jilu/stats/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        const connection = await pool.getConnection();
        
        // 获取总面试次数
        const [totalCount] = await connection.execute(
            'SELECT COUNT(*) as total FROM jilu WHERE username = ?',
            [username]
        );
        
        // 获取各模式面试次数
        const [modeStats] = await connection.execute(
            'SELECT mode, COUNT(*) as count FROM jilu WHERE username = ? GROUP BY mode',
            [username]
        );
        
        // 获取平均分数
        const [avgScore] = await connection.execute(
            'SELECT AVG(score) as avg_score FROM jilu WHERE username = ? AND score IS NOT NULL',
            [username]
        );
        
        // 获取最近7天的面试记录
        const [recentRecords] = await connection.execute(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM jilu WHERE username = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
             GROUP BY DATE(created_at) ORDER BY date`,
            [username]
        );
        
        connection.release();
        
        res.json({
            success: true,
            stats: {
                total: totalCount[0].total,
                modeStats: modeStats,
                avgScore: avgScore[0].avg_score || 0,
                recentActivity: recentRecords
            }
        });
    } catch (error) {
        console.error('获取面试统计失败:', error);
        res.status(500).json({ success: false, message: '获取面试统计失败' });
    }
});

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: '需要管理员权限' });
    }
    next();
}

// Token验证中间件（需要实现）
function authenticateToken(req, res, next) {
    // 这里需要实现JWT token验证逻辑
    // 暂时跳过验证，实际项目中需要完善
    req.user = { role: 'admin' }; // 临时设置
    next();
}

// 视频上传API
app.post('/api/upload-video', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }
        
        const { username, timestamp } = req.body;
        if (!username || !timestamp) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }
        
        // 确保shipin目录存在
        const shipinDir = path.join(__dirname, 'shipin');
        try {
            await access(shipinDir);
        } catch (error) {
            // 目录不存在，创建它
            await mkdir(shipinDir, { recursive: true });
        }
        
        // 生成文件名
        const filename = `${username}_${timestamp}.mp4`;
        const filepath = path.join(shipinDir, filename);
        
        // 保存文件
        await writeFile(filepath, req.file.buffer);
        
        console.log(`视频文件已保存: ${filepath}`);
        
        res.json({
            success: true,
            message: '视频上传成功',
            filename: filename,
            filepath: filepath
        });
        
    } catch (error) {
        console.error('视频上传失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误: ' + error.message
        });
    }
});

// AI视频分析接口
app.post('/api/analyze-video', async (req, res) => {
    try {
        const { video_url, record_id } = req.body;
        
        if (!video_url || !record_id) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }
        
        console.log('开始AI分析视频:', video_url);
        
        // 调用AI分析函数
        const analysisResult = await analyzeVideoWithZhipu(video_url);
        
        // 更新数据库记录
        const connection = await pool.getConnection();
        
        await connection.execute(
            'UPDATE jilu SET score = ?, ai_evaluation = ? WHERE id = ?',
            [analysisResult.score, analysisResult.ai_evaluation, record_id]
        );
        
        connection.release();
        
        res.json({
            success: true,
            message: 'AI分析完成',
            score: analysisResult.score,
            ai_evaluation: analysisResult.ai_evaluation
        });
        
    } catch (error) {
        console.error('AI分析失败:', error);
        res.status(500).json({
            success: false,
            message: 'AI分析失败: ' + error.message
        });
    }
});

// 启动服务器
app.listen(PORT, async () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    await initDatabase();
});

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...');
    await pool.end();
    process.exit(0);
});