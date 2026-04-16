// 大数据工程师面试页面JavaScript功能

// 大数据面试页面特有的全局变量
let userStream = null;
let currentQuestionId = null;
let practiceStartTime = null;
let practiceStats = {
    questionsAnswered: 0,
    totalTime: 0,
    averageScore: 0,
    recentAnswers: []
};

// 题库数据
const questionBank = {
    "Hadoop生态": [
        {
            id: 1,
            title: "HDFS架构原理",
            difficulty: "medium",
            type: "理论",
            content: "请详细解释HDFS的架构组成，包括NameNode、DataNode、Secondary NameNode的作用，以及数据读写流程。",
            resources: [
                { name: "HDFS官方文档", url: "#" },
                { name: "架构图解", url: "#" }
            ]
        },
        {
            id: 2,
            title: "MapReduce编程模型",
            difficulty: "hard",
            type: "编程",
            content: "设计一个MapReduce程序来统计大型日志文件中每个IP地址的访问次数，并解释Map和Reduce阶段的具体实现。",
            resources: [
                { name: "MapReduce教程", url: "#" },
                { name: "代码示例", url: "#" }
            ]
        },
        {
            id: 3,
            title: "YARN资源管理",
            difficulty: "medium",
            type: "理论",
            content: "解释YARN的资源调度机制，包括ResourceManager、NodeManager、ApplicationMaster的职责分工。",
            resources: [
                { name: "YARN架构", url: "#" },
                { name: "调度策略", url: "#" }
            ]
        }
    ],
    "Spark计算": [
        {
            id: 4,
            title: "RDD操作原理",
            difficulty: "medium",
            type: "理论",
            content: "什么是RDD？解释RDD的特性、转换操作和行动操作的区别，以及惰性计算的优势。",
            resources: [
                { name: "RDD编程指南", url: "#" },
                { name: "操作示例", url: "#" }
            ]
        },
        {
            id: 5,
            title: "Spark SQL优化",
            difficulty: "hard",
            type: "实践",
            content: "如何优化Spark SQL查询性能？请从数据倾斜、缓存策略、分区优化等角度进行分析。",
            resources: [
                { name: "性能调优", url: "#" },
                { name: "最佳实践", url: "#" }
            ]
        },
        {
            id: 6,
            title: "Streaming处理",
            difficulty: "hard",
            type: "编程",
            content: "设计一个实时数据处理系统，使用Spark Streaming处理Kafka消息流，实现窗口聚合计算。",
            resources: [
                { name: "Streaming指南", url: "#" },
                { name: "Kafka集成", url: "#" }
            ]
        }
    ],
    "数据仓库": [
        {
            id: 7,
            title: "维度建模",
            difficulty: "medium",
            type: "设计",
            content: "设计一个电商数据仓库的维度模型，包括事实表和维度表的设计，解释星型模式和雪花模式的选择。",
            resources: [
                { name: "维度建模理论", url: "#" },
                { name: "设计模式", url: "#" }
            ]
        },
        {
            id: 8,
            title: "ETL流程设计",
            difficulty: "hard",
            type: "实践",
            content: "设计一个完整的ETL流程，处理多源异构数据，包括数据清洗、转换、质量检查和增量更新策略。",
            resources: [
                { name: "ETL最佳实践", url: "#" },
                { name: "工具对比", url: "#" }
            ]
        }
    ],
    "实时计算": [
        {
            id: 9,
            title: "Flink状态管理",
            difficulty: "hard",
            type: "理论",
            content: "解释Flink的状态管理机制，包括Keyed State、Operator State，以及检查点和保存点的区别。",
            resources: [
                { name: "状态管理", url: "#" },
                { name: "容错机制", url: "#" }
            ]
        },
        {
            id: 10,
            title: "流式窗口计算",
            difficulty: "medium",
            type: "编程",
            content: "实现一个滑动窗口计算，统计最近5分钟内的用户活跃度，处理乱序数据和水印机制。",
            resources: [
                { name: "窗口函数", url: "#" },
                { name: "时间语义", url: "#" }
            ]
        }
    ],
    "数据存储": [
        {
            id: 11,
            title: "HBase架构设计",
            difficulty: "medium",
            type: "理论",
            content: "解释HBase的存储架构，包括Region、RegionServer、HMaster的作用，以及数据的读写流程。",
            resources: [
                { name: "HBase架构", url: "#" },
                { name: "性能优化", url: "#" }
            ]
        },
        {
            id: 12,
            title: "ClickHouse查询优化",
            difficulty: "hard",
            type: "实践",
            content: "如何优化ClickHouse的查询性能？从表结构设计、索引使用、查询语句优化等方面分析。",
            resources: [
                { name: "查询优化", url: "#" },
                { name: "索引策略", url: "#" }
            ]
        }
    ]
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeInterview();
    setupEventListeners();
    renderQuestionBank();
    initializeCamera();
    loadPracticeStats();
});

// 初始化面试
function initializeInterview() {
    // 从localStorage获取面试信息
    const selectedPosition = localStorage.getItem('selectedPosition') || '大数据工程师';
    const selectedMode = localStorage.getItem('selectedMode') || '自由练习';
    
    // 更新页面信息
    document.querySelector('.position-name').textContent = selectedPosition;
    document.querySelector('.mode-name').textContent = selectedMode;
}

// 设置事件监听器
function setupEventListeners() {
    // 视频控制按钮
    document.getElementById('toggle-camera')?.addEventListener('click', toggleCamera);
    document.getElementById('toggle-mic')?.addEventListener('click', toggleMicrophone);
    document.getElementById('start-recording')?.addEventListener('click', startRecording);
    document.getElementById('stop-recording')?.addEventListener('click', stopRecording);
    
    // 练习控制按钮
    document.getElementById('start-practice')?.addEventListener('click', startPractice);
    document.getElementById('finish-practice')?.addEventListener('click', finishPractice);
    document.getElementById('reset-practice')?.addEventListener('click', resetPractice);
    
    // 结束面试按钮
    document.getElementById('end-interview')?.addEventListener('click', endInterview);
}

// 渲染题库
function renderQuestionBank() {
    const bankContainer = document.querySelector('.question-bank-section');
    const bankContent = bankContainer.querySelector('.question-categories') || createCategoriesContainer();
    
    Object.keys(questionBank).forEach(category => {
        const categoryElement = createCategoryElement(category, questionBank[category]);
        bankContent.appendChild(categoryElement);
    });
}

// 创建分类容器
function createCategoriesContainer() {
    const container = document.createElement('div');
    container.className = 'question-categories';
    document.querySelector('.question-bank-section').appendChild(container);
    return container;
}

// 创建分类元素
function createCategoryElement(categoryName, questions) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'question-category';
    
    // 分类头部
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
        <i class="fas fa-folder"></i>
        <span>${categoryName}</span>
        <i class="fas fa-chevron-down" style="margin-left: auto;"></i>
    `;
    
    // 题目列表
    const questionsList = document.createElement('div');
    questionsList.className = 'category-questions';
    
    questions.forEach(question => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.innerHTML = `
            <div class="question-title">${question.title}</div>
            <div class="question-meta">
                <span class="difficulty-badge difficulty-${question.difficulty}">${getDifficultyText(question.difficulty)}</span>
                <span class="question-type">${question.type}</span>
            </div>
        `;
        
        questionItem.addEventListener('click', () => selectQuestion(question));
        questionsList.appendChild(questionItem);
    });
    
    // 分类折叠功能
    header.addEventListener('click', () => {
        header.classList.toggle('active');
        questionsList.classList.toggle('show');
        const chevron = header.querySelector('.fa-chevron-down');
        chevron.style.transform = questionsList.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
    });
    
    categoryDiv.appendChild(header);
    categoryDiv.appendChild(questionsList);
    
    return categoryDiv;
}

// 获取难度文本
function getDifficultyText(difficulty) {
    const difficultyMap = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
    };
    return difficultyMap[difficulty] || difficulty;
}

// 选择题目
function selectQuestion(question) {
    currentQuestion = question;
    
    // 更新题目显示
    document.querySelector('.question-title').textContent = question.title;
    document.querySelector('.question-text').textContent = question.content;
    
    // 更新难度标签
    const difficultyBadge = document.querySelector('.difficulty-badge');
    difficultyBadge.className = `difficulty-badge difficulty-${question.difficulty}`;
    difficultyBadge.textContent = getDifficultyText(question.difficulty);
    
    // 更新题目类型
    document.querySelector('.question-type span').textContent = question.type;
    
    // 更新资源链接
    const resourcesContainer = document.querySelector('.resource-links');
    resourcesContainer.innerHTML = '';
    question.resources.forEach(resource => {
        const link = document.createElement('a');
        link.className = 'resource-link';
        link.href = resource.url;
        link.innerHTML = `<i class="fas fa-external-link-alt"></i><span>${resource.name}</span>`;
        resourcesContainer.appendChild(link);
    });
    
    // 高亮选中的题目
    document.querySelectorAll('.question-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.question-item').classList.add('active');
}

// 初始化摄像头
async function initializeCamera() {
    try {
        userStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        const videoElement = document.getElementById('user-video');
        videoElement.srcObject = userStream;
        
        updateInterviewerStatus('准备就绪');
    } catch (error) {
        console.error('摄像头初始化失败:', error);
        updateInterviewerStatus('设备连接失败');
    }
}

// 切换摄像头
function toggleCamera() {
    const videoTrack = userStream?.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const btn = document.getElementById('toggle-camera');
        const icon = btn.querySelector('i');
        
        if (videoTrack.enabled) {
            icon.className = 'fas fa-video';
            btn.title = '关闭摄像头';
        } else {
            icon.className = 'fas fa-video-slash';
            btn.title = '开启摄像头';
        }
    }
}

// 切换麦克风
function toggleMicrophone() {
    const audioTrack = userStream?.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const btn = document.getElementById('toggle-mic');
        const icon = btn.querySelector('i');
        
        if (audioTrack.enabled) {
            icon.className = 'fas fa-microphone';
            btn.title = '关闭麦克风';
        } else {
            icon.className = 'fas fa-microphone-slash';
            btn.title = '开启麦克风';
        }
    }
}

// 开始录制
function startRecording() {
    if (userStream && !isRecording) {
        try {
            mediaRecorder = new MediaRecorder(userStream);
            recordedChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            
            mediaRecorder.start();
            isRecording = true;
            
            document.getElementById('start-recording').style.display = 'none';
            document.getElementById('stop-recording').style.display = 'inline-flex';
            
            updateInterviewerStatus('正在录制');
        } catch (error) {
            console.error('录制启动失败:', error);
        }
    }
}

// 停止录制
function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        document.getElementById('start-recording').style.display = 'inline-flex';
        document.getElementById('stop-recording').style.display = 'none';
        
        updateInterviewerStatus('录制完成');
    }
}

// 开始练习
function startPractice() {
    if (!currentQuestion) {
        alert('请先选择一道题目');
        return;
    }
    
    // 自动开始录制
    if (!isRecording) {
        startRecording();
    }
    
    document.getElementById('start-practice').style.display = 'none';
    document.getElementById('finish-practice').style.display = 'inline-block';
    
    updateInterviewerStatus('练习进行中');
}

// 完成练习
function finishPractice() {
    if (isRecording) {
        stopRecording();
    }
    
    document.getElementById('start-practice').style.display = 'inline-block';
    document.getElementById('finish-practice').style.display = 'none';
    
    // 更新练习统计
    practiceStats.questionsAnswered++;
    practiceStats.totalTime += Math.floor(Math.random() * 300) + 60; // 模拟答题时间
    
    // 模拟评分
    const score = Math.floor(Math.random() * 40) + 60; // 60-100分
    practiceStats.averageScore = Math.floor(
        (practiceStats.averageScore * (practiceStats.questionsAnswered - 1) + score) / practiceStats.questionsAnswered
    );
    
    // 添加到最近答题记录
    practiceStats.recentAnswers.unshift({
        question: currentQuestion.title,
        time: new Date().toLocaleTimeString(),
        score: score
    });
    
    // 只保留最近5条记录
    if (practiceStats.recentAnswers.length > 5) {
        practiceStats.recentAnswers = practiceStats.recentAnswers.slice(0, 5);
    }
    
    // 标记题目为已完成
    const activeQuestion = document.querySelector('.question-item.active');
    if (activeQuestion) {
        activeQuestion.classList.add('completed');
    }
    
    updatePracticeStats();
    updateInterviewerStatus('练习完成');
}

// 重置练习
function resetPractice() {
    if (confirm('确定要重置练习记录吗？')) {
        practiceStats = {
            questionsAnswered: 0,
            totalTime: 0,
            averageScore: 0,
            recentAnswers: []
        };
        
        // 移除所有完成标记
        document.querySelectorAll('.question-item.completed').forEach(item => {
            item.classList.remove('completed');
        });
        
        updatePracticeStats();
        savePracticeStats();
    }
}

// 加载练习统计
function loadPracticeStats() {
    const saved = localStorage.getItem('bigdataPracticeStats');
    if (saved) {
        practiceStats = JSON.parse(saved);
    }
    updatePracticeStats();
}

// 更新练习统计显示
function updatePracticeStats() {
    // 检查元素是否存在再更新
    const statElement1 = document.querySelector('.stat-item:nth-child(1) .stat-value');
    const statElement2 = document.querySelector('.stat-item:nth-child(2) .stat-value');
    
    if (statElement1) statElement1.textContent = practiceStats.questionsAnswered;
    if (statElement2) statElement2.textContent = practiceStats.averageScore;
    
    // 更新最近答题记录
    const recentContainer = document.querySelector('.recent-answers');
    if (!recentContainer) return;
    
    const answersContainer = recentContainer.querySelector('.answer-list') || createAnswersList();
    
    answersContainer.innerHTML = '';
    practiceStats.recentAnswers.forEach(answer => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        answerItem.innerHTML = `
            <div class="answer-question">${answer.question}</div>
            <div class="answer-time">${answer.time}</div>
            <div class="answer-score ${getScoreClass(answer.score)}">
                <i class="fas fa-star"></i>
                <span>${answer.score}分</span>
            </div>
        `;
        answersContainer.appendChild(answerItem);
    });
    
    savePracticeStats();
}

// 创建答题记录列表
function createAnswersList() {
    const container = document.createElement('div');
    container.className = 'answer-list';
    const recentContainer = document.querySelector('.recent-answers');
    if (recentContainer) {
        recentContainer.appendChild(container);
    }
    return container;
}

// 获取分数样式类
function getScoreClass(score) {
    if (score >= 85) return 'score-good';
    if (score >= 70) return 'score-average';
    return 'score-poor';
}

// 保存练习统计
function savePracticeStats() {
    localStorage.setItem('bigdataPracticeStats', JSON.stringify(practiceStats));
}

// 更新面试官状态
function updateInterviewerStatus(status) {
    document.querySelector('.interviewer-status').textContent = status;
}

// 结束面试
function endInterview() {
    if (confirm('确定要结束练习吗？')) {
        // 停止录制
        if (isRecording) {
            stopRecording();
        }
        
        // 关闭摄像头
        if (userStream) {
            userStream.getTracks().forEach(track => track.stop());
        }
        
        // 保存最终统计
        savePracticeStats();
        
        // 返回主页
        window.location.href = 'interview.html';
    }
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
    }
    
    savePracticeStats();
});