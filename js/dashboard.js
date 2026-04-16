// 个人中心页面JavaScript

// 全局变量
let currentSection = 'overview';
let charts = {};
let userData = {
    name: '张同学',
    school: '清华大学 · 计算机科学与技术',
    level: 5,
    levelTitle: '面试达人',
    totalInterviews: 23,
    totalHours: 18.5,
    averageScore: 85,
    achievementRate: 92
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!checkLoginStatus()) {
        alert('尚未登录，请先登录');
        window.location.href = 'login.html';
        return;
    }
    
    initDashboard();
    initNavigation();
    initCharts();
    loadUserData();
    initFilters();
    initSettings();
});

// 初始化仪表板
function initDashboard() {
    // 显示默认页面
    showSection('overview');
    
    // 加载统计数据
    updateStatCards();
    
    // 加载最近活动
    loadRecentActivity();
    
    // 加载面试记录
    loadInterviewHistory();
}

// 初始化导航
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.dataset.section;
            if (section) {
                showSection(section);
                
                // 更新导航状态
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // 退出登录功能已移至全局退出模块 (global-logout.js)
}

// 显示指定区块
function showSection(sectionName) {
    // 隐藏所有区块
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示目标区块
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // 根据区块类型加载相应数据
        switch(sectionName) {
            case 'overview':
                loadOverviewData();
                break;
            case 'history':
                loadInterviewHistory();
                break;
            case 'growth':
                loadGrowthData();
                break;
            case 'recommendations':
                loadRecommendations();
                break;
            case 'achievements':
                loadAchievements();
                break;
            case 'certificates':
                loadCertificates();
                break;
            case 'settings':
                loadSettings();
                break;
        }
    }
}

// 更新统计卡片
function updateStatCards() {
    const stats = [
        { id: 'total-interviews', value: userData.totalInterviews },
        { id: 'total-hours', value: userData.totalHours },
        { id: 'average-score', value: userData.averageScore },
        { id: 'achievement-rate', value: userData.achievementRate + '%' }
    ];
    
    stats.forEach(stat => {
        const element = document.querySelector(`[data-stat="${stat.id}"]`);
        if (element) {
            animateNumber(element, stat.value);
        }
    });
}

// 数字动画
function animateNumber(element, targetValue) {
    const isPercentage = typeof targetValue === 'string' && targetValue.includes('%');
    const numericValue = parseFloat(targetValue);
    const duration = 1000;
    const startTime = Date.now();
    const startValue = 0;
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeProgress = easeOutCubic(progress);
        const currentValue = startValue + (numericValue - startValue) * easeProgress;
        
        if (isPercentage) {
            element.textContent = Math.round(currentValue) + '%';
        } else if (targetValue.toString().includes('.')) {
            element.textContent = currentValue.toFixed(1);
        } else {
            element.textContent = Math.round(currentValue);
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// 缓动函数
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// 加载用户数据
function loadUserData() {
    // 更新用户信息
    const userNameElement = document.getElementById('user-name');
    const userSchoolElement = document.getElementById('user-school');
    
    if (userNameElement) userNameElement.textContent = userData.name;
    if (userSchoolElement) userSchoolElement.textContent = userData.school;
    
    // 更新等级信息
    const levelBadge = document.querySelector('.level-badge');
    const levelTitle = document.querySelector('.level-title');
    
    if (levelBadge) levelBadge.textContent = `LV.${userData.level}`;
    if (levelTitle) levelTitle.textContent = userData.levelTitle;
}

// 加载总览数据
function loadOverviewData() {
    // 绘制能力雷达图
    const radarCanvas = document.getElementById('overview-radar');
    if (radarCanvas && window.createRadarChart) {
        const abilityData = [88, 82, 90, 78, 87]; // 表达、逻辑、知识、应变、素养
        const abilityLabels = ['表达能力', '逻辑思维', '专业知识', '应变能力', '职业素养'];
        
        charts.overviewRadar = window.createAnimatedRadarChart('overview-radar', abilityData, abilityLabels, {
            radius: 120,
            maxValue: 100
        });
    }
    
    // 绘制趋势图
    const trendCanvas = document.getElementById('trend-chart');
    if (trendCanvas) {
        drawTrendChart(trendCanvas);
    }
}

// 绘制趋势图
function drawTrendChart(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    // 模拟数据
    const data = [
        { date: '1/10', score: 75 },
        { date: '1/12', score: 78 },
        { date: '1/14', score: 82 },
        { date: '1/15', score: 88 },
        { date: '1/17', score: 85 },
        { date: '1/19', score: 90 },
        { date: '1/21', score: 87 }
    ];
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 计算绘图区域
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // 绘制网格
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // 水平网格线
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Y轴标签
        ctx.fillStyle = '#999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText((100 - i * 20).toString(), padding - 10, y + 4);
    }
    
    // 垂直网格线
    for (let i = 0; i < data.length; i++) {
        const x = padding + (chartWidth / (data.length - 1)) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
        
        // X轴标签
        ctx.fillStyle = '#999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(data[i].date, x, height - padding + 20);
    }
    
    // 绘制数据线
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (point.score / 100) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // 绘制数据点
    ctx.fillStyle = '#667eea';
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (point.score / 100) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // 数值标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(point.score.toString(), x, y - 10);
        ctx.fillStyle = '#667eea';
    });
}

// 加载最近活动
function loadRecentActivity() {
    const activities = [
        {
            type: 'interview',
            icon: 'fas fa-play',
            title: '完成人工智能工程师模拟面试',
            meta: '2024-01-15 14:30 · 得分: 88分',
            score: 88
        },
        {
            type: 'achievement',
            icon: 'fas fa-trophy',
            title: '获得成就: 面试新手',
            meta: '2024-01-14 16:20',
            score: null
        },
        {
            type: 'study',
            icon: 'fas fa-book',
            title: '完成推荐学习: 算法面试题精讲',
            meta: '2024-01-13 20:15',
            score: null
        }
    ];
    
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-meta">${activity.meta}</div>
                </div>
                ${activity.score ? `<div class="activity-score">${activity.score}</div>` : ''}
            </div>
        `).join('');
    }
}

// 解析AI评价中的分数
function parseAIEvaluation(aiEvaluation) {
    const defaultScores = [
        { name: '表达能力', value: 0 },
        { name: '逻辑思维', value: 0 },
        { name: '专业知识', value: 0 },
        { name: '应变能力', value: 0 },
        { name: '职业素养', value: 0 }
    ];
    
    if (!aiEvaluation) {
        return defaultScores;
    }
    
    try {
        // 将AI评价转换为字符串
        const text = aiEvaluation.toString();
        
        // 首先尝试解析JSON格式
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            try {
                const evaluation = JSON.parse(text);
                if (evaluation.scores) {
                    return [
                        { name: '表达能力', value: evaluation.scores.expression || 0 },
                        { name: '逻辑思维', value: evaluation.scores.logic || 0 },
                        { name: '专业知识', value: evaluation.scores.knowledge || 0 },
                        { name: '应变能力', value: evaluation.scores.adaptability || 0 },
                        { name: '职业素养', value: evaluation.scores.professionalism || 0 }
                    ];
                }
            } catch (jsonError) {
                console.log('JSON解析失败，尝试文本解析');
            }
        }
        
        // 处理文本格式，提取分数
        const scores = [];
        const patterns = [
            { name: '表达能力', pattern: /表达能力[：:]?(\d+)分/ },
            { name: '逻辑思维', pattern: /逻辑思维[：:]?(\d+)分/ },
            { name: '专业知识', pattern: /专业知识[：:]?(\d+)分/ },
            { name: '应变能力', pattern: /应变能力[：:]?(\d+)分/ },
            { name: '职业素养', pattern: /职业素养[：:]?(\d+)分/ }
        ];
        
        patterns.forEach(item => {
            const match = text.match(item.pattern);
            scores.push({
                name: item.name,
                value: match ? parseInt(match[1]) : 0
            });
        });
        
        return scores;
    } catch (error) {
        console.error('解析AI评价失败:', error);
        return defaultScores;
    }
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未知时间';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// 加载面试记录
async function loadInterviewHistory() {
    try {
        // 从后端API获取当前用户的面试记录
        const userInfo = localStorage.getItem('userInfo');
        let username = null;
        
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                username = user.username;
            } catch (e) {
                console.error('解析用户信息失败:', e);
            }
        }
        
        console.log('当前用户名:', username);
        console.log('用户信息:', userInfo);
        
        if (!username) {
            console.error('用户未登录');
            return;
        }
        
        console.log('正在请求API:', `/api/jilu/user/${username}`);
        const response = await fetch(`/api/jilu/user/${username}`);
        console.log('API响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error('获取面试记录失败');
        }
        
        const historyData = await response.json();
        console.log('获取到的面试记录数据:', historyData);
        
        const historyList = document.querySelector('.history-list');
        if (historyList) {
            if (historyData.length === 0) {
                historyList.innerHTML = '<div class="no-data">暂无面试记录</div>';
                return;
            }
            
            historyList.innerHTML = historyData.map(item => {
                // 解析AI评价中的分数
                const scores = parseAIEvaluation(item.ai_evaluation);
                
                return `
                    <div class="history-item">
                        <div class="history-header">
                            <div class="history-info">
                                <h4>${item.mode || '练习模式'} - ${item.question_title || '面试题目'}</h4>
                                <div class="history-meta">
                                    <span><i class="fas fa-calendar"></i> ${formatDate(item.created_at)}</span>
                                </div>
                            </div>
                            <div class="history-score">
                                <div class="score-badge ${getScoreClass(item.score || 0)}">${item.score || 0}</div>
                            </div>
                        </div>
                        <div class="history-details">
                            <div class="score-breakdown-mini">
                                ${scores.map(score => `
                                    <div class="score-item-mini">
                                        <span>${score.name}</span>
                                        <div class="score-bar-mini">
                                            <div class="score-fill-mini" style="width: ${score.value}%"></div>
                                        </div>
                                        <span>${score.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="history-actions">
                                <button class="btn btn-sm btn-outline" onclick="viewInterviewDetail(${item.id})">查看详情</button>
                                <button class="btn btn-sm btn-secondary" onclick="retakeInterview('${item.career || ''}')">重新练习</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('加载面试记录失败:', error);
        const historyList = document.querySelector('.history-list');
        if (historyList) {
            historyList.innerHTML = '<div class="error-message">加载面试记录失败，请稍后重试</div>';
        }
    }
}

// 获取分数等级样式
function getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    return 'score-poor';
}

// 获取分数项目名称
function getScoreName(key) {
    const names = {
        expression: '表达能力',
        logic: '逻辑思维',
        knowledge: '专业知识',
        adaptability: '应变能力',
        professionalism: '职业素养'
    };
    return names[key] || key;
}

// 加载成长数据
function loadGrowthData() {
    // 初始化时间范围按钮
    const timeBtns = document.querySelectorAll('.time-btn');
    timeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            timeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const range = this.dataset.range;
            updateGrowthChart(range);
        });
    });
    
    // 初始化能力选择器
    const abilitySelect = document.getElementById('ability-select');
    if (abilitySelect) {
        abilitySelect.addEventListener('change', function() {
            const ability = this.value;
            updateGrowthChart(document.querySelector('.time-btn.active').dataset.range, ability);
        });
    }
    
    // 绘制默认图表
    updateGrowthChart('7d');
    
    // 加载里程碑
    loadMilestones();
}

// 更新成长图表
function updateGrowthChart(range, ability = 'overall') {
    const canvas = document.getElementById('growth-chart');
    if (!canvas) return;
    
    // 模拟不同时间范围的数据
    const data = generateGrowthData(range, ability);
    drawGrowthChart(canvas, data);
}

// 生成成长数据
function generateGrowthData(range, ability) {
    const baseData = {
        '7d': [
            { date: '1/15', value: 75 },
            { date: '1/16', value: 78 },
            { date: '1/17', value: 82 },
            { date: '1/18', value: 85 },
            { date: '1/19', value: 88 },
            { date: '1/20', value: 87 },
            { date: '1/21', value: 90 }
        ],
        '30d': [
            { date: '12/22', value: 65 },
            { date: '12/29', value: 70 },
            { date: '1/5', value: 75 },
            { date: '1/12', value: 80 },
            { date: '1/19', value: 85 },
            { date: '1/21', value: 90 }
        ]
    };
    
    return baseData[range] || baseData['7d'];
}

// 绘制成长图表
function drawGrowthChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 计算绘图区域
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // 绘制坐标轴
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X轴
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // 绘制网格和标签
    ctx.fillStyle = '#999';
    ctx.font = '12px Arial';
    
    // Y轴标签
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        const value = 100 - i * 20;
        
        ctx.textAlign = 'right';
        ctx.fillText(value.toString(), padding - 10, y + 4);
        
        // 网格线
        if (i > 0) {
            ctx.strokeStyle = '#f8f9fa';
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
    }
    
    // X轴标签
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        ctx.textAlign = 'center';
        ctx.fillText(point.date, x, height - padding + 20);
    });
    
    // 绘制数据线
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (point.value / 100) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // 绘制数据点
    ctx.fillStyle = '#667eea';
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (point.value / 100) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // 数值标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(point.value.toString(), x, y - 15);
        ctx.fillStyle = '#667eea';
    });
}

// 加载里程碑
function loadMilestones() {
    const milestones = [
        {
            icon: 'fas fa-play',
            title: '首次面试',
            description: '完成第一次模拟面试',
            date: '2023-12-01',
            completed: true
        },
        {
            icon: 'fas fa-star',
            title: '连续练习',
            description: '连续7天进行面试练习',
            date: '2023-12-15',
            completed: true
        },
        {
            icon: 'fas fa-trophy',
            title: '高分突破',
            description: '单次面试得分超过90分',
            date: '2024-01-12',
            completed: true
        },
        {
            icon: 'fas fa-graduation-cap',
            title: '面试达人',
            description: '完成20次面试练习',
            date: '进行中',
            completed: false
        }
    ];
    
    const timeline = document.querySelector('.milestone-timeline');
    if (timeline) {
        timeline.innerHTML = milestones.map(milestone => `
            <div class="milestone-item ${milestone.completed ? 'completed' : ''}">
                <div class="milestone-icon">
                    <i class="${milestone.icon}"></i>
                </div>
                <div class="milestone-content">
                    <h4>${milestone.title}</h4>
                    <p>${milestone.description}</p>
                    <div class="milestone-date">${milestone.date}</div>
                </div>
            </div>
        `).join('');
    }
}

// 加载推荐内容
function loadRecommendations() {
    const recommendations = [
        {
            title: '算法面试题精讲',
            type: '视频课程',
            duration: '3小时',
            difficulty: '中级',
            description: '深入讲解常见算法面试题，包括数据结构、动态规划等核心知识点。',
            tags: ['算法', '数据结构', '编程'],
            progress: 60
        },
        {
            title: '系统设计面试指南',
            type: '文档资料',
            duration: '2小时',
            difficulty: '高级',
            description: '系统设计面试的完整指南，涵盖分布式系统、数据库设计等内容。',
            tags: ['系统设计', '架构', '分布式'],
            progress: 0
        },
        {
            title: '行为面试技巧',
            type: '实战练习',
            duration: '1小时',
            difficulty: '初级',
            description: '提升面试表达能力和逻辑思维，掌握STAR法则等面试技巧。',
            tags: ['表达能力', '逻辑思维', 'STAR法则'],
            progress: 100
        }
    ];
    
    const grid = document.querySelector('.recommendations-grid');
    if (grid) {
        grid.innerHTML = recommendations.map(item => `
            <div class="recommendation-card">
                <div class="recommendation-header">
                    <h4>${item.title}</h4>
                    <div class="recommendation-meta">
                        <span><i class="fas fa-play-circle"></i> ${item.type}</span>
                        <span><i class="fas fa-clock"></i> ${item.duration}</span>
                        <span><i class="fas fa-signal"></i> ${item.difficulty}</span>
                    </div>
                </div>
                <div class="recommendation-content">
                    <p>${item.description}</p>
                    <div class="recommendation-tags">
                        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    ${item.progress > 0 ? `
                        <div class="recommendation-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${item.progress}%"></div>
                            </div>
                            <div class="progress-text">进度: ${item.progress}%</div>
                        </div>
                    ` : ''}
                    <div class="recommendation-actions">
                        <button class="btn btn-sm btn-primary" onclick="startLearning('${item.title}')">
                            ${item.progress > 0 ? '继续学习' : '开始学习'}
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="viewDetails('${item.title}')">查看详情</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // 加载弱项分析
    loadWeaknessAnalysis();
}

// 加载弱项分析
function loadWeaknessAnalysis() {
    const weaknesses = [
        {
            title: '逻辑思维',
            score: 82,
            description: '回答结构化程度有待提升',
            improvement: '+8分提升空间'
        },
        {
            title: '应变能力',
            score: 78,
            description: '面对突发问题时反应较慢',
            improvement: '+12分提升空间'
        }
    ];
    
    const grid = document.querySelector('.weakness-grid');
    if (grid) {
        grid.innerHTML = weaknesses.map(item => `
            <div class="weakness-item">
                <div class="weakness-header">
                    <h4 class="weakness-title">${item.title}</h4>
                    <div class="weakness-score">${item.score}分</div>
                </div>
                <p>${item.description}</p>
                <div class="improvement-potential">${item.improvement}</div>
            </div>
        `).join('');
    }
}

// 加载成就
function loadAchievements() {
    const achievements = [
        {
            id: 1,
            icon: 'fas fa-play',
            title: '面试新手',
            description: '完成第一次模拟面试',
            unlocked: true,
            progress: 100
        },
        {
            id: 2,
            icon: 'fas fa-fire',
            title: '连续挑战者',
            description: '连续7天进行面试练习',
            unlocked: true,
            progress: 100
        },
        {
            id: 3,
            icon: 'fas fa-star',
            title: '高分达人',
            description: '单次面试得分超过90分',
            unlocked: true,
            progress: 100
        },
        {
            id: 4,
            icon: 'fas fa-trophy',
            title: '面试专家',
            description: '完成50次面试练习',
            unlocked: false,
            progress: 46
        },
        {
            id: 5,
            icon: 'fas fa-crown',
            title: '完美表现',
            description: '获得满分评价',
            unlocked: false,
            progress: 0
        },
        {
            id: 6,
            icon: 'fas fa-graduation-cap',
            title: '全能选手',
            description: '在所有岗位都获得80分以上',
            unlocked: false,
            progress: 75
        }
    ];
    
    const grid = document.querySelector('.achievements-grid');
    if (grid) {
        grid.innerHTML = achievements.map(item => `
            <div class="achievement-card ${item.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">
                    <i class="${item.icon}"></i>
                </div>
                <h4 class="achievement-title">${item.title}</h4>
                <p class="achievement-description">${item.description}</p>
                ${!item.unlocked ? `
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${item.progress}%"></div>
                        </div>
                        <div class="progress-text">${item.progress}/100</div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
}

// 加载证书
function loadCertificates() {
    const certificates = [
        {
            id: 1,
            icon: 'fas fa-robot',
            title: '人工智能面试认证',
            level: '中级',
            issueDate: '2024-01-15',
            validUntil: '2025-01-15',
            description: '通过人工智能工程师岗位的专业面试评测，具备相关技术能力。',
            score: 88
        },
        {
            id: 2,
            icon: 'fas fa-database',
            title: '大数据工程师认证',
            level: '高级',
            issueDate: '2024-01-12',
            validUntil: '2025-01-12',
            description: '在大数据工程师面试中表现优异，掌握核心技术栈。',
            score: 92
        }
    ];
    
    const grid = document.querySelector('.certificates-grid');
    if (grid) {
        grid.innerHTML = certificates.map(item => `
            <div class="certificate-card">
                <div class="certificate-header">
                    <div class="certificate-icon">
                        <i class="${item.icon}"></i>
                    </div>
                    <h4 class="certificate-title">${item.title}</h4>
                    <p class="certificate-level">${item.level}</p>
                </div>
                <div class="certificate-content">
                    <div class="certificate-meta">
                        <span>颁发日期: ${item.issueDate}</span>
                        <span>有效期至: ${item.validUntil}</span>
                    </div>
                    <p class="certificate-description">${item.description}</p>
                    <div class="certificate-actions">
                        <button class="btn btn-sm btn-primary" onclick="downloadCertificate(${item.id})">下载证书</button>
                        <button class="btn btn-sm btn-outline" onclick="shareCertificate(${item.id})">分享</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// 初始化筛选器
function initFilters() {
    const positionFilter = document.getElementById('position-filter');
    const modeFilter = document.getElementById('mode-filter');
    
    if (positionFilter) {
        positionFilter.addEventListener('change', function() {
            filterInterviewHistory();
        });
    }
    
    if (modeFilter) {
        modeFilter.addEventListener('change', function() {
            filterInterviewHistory();
        });
    }
}

// 筛选面试记录
function filterInterviewHistory() {
    const positionFilter = document.getElementById('position-filter');
    const modeFilter = document.getElementById('mode-filter');
    
    const position = positionFilter ? positionFilter.value : 'all';
    const mode = modeFilter ? modeFilter.value : 'all';
    
    // 这里可以根据筛选条件重新加载数据
    console.log('筛选条件:', { position, mode });
    loadInterviewHistory();
}

// 初始化设置
function initSettings() {
    // 初始化开关按钮
    const switches = document.querySelectorAll('.switch input');
    switches.forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            const setting = this.dataset.setting;
            const value = this.checked;
            updateSetting(setting, value);
        });
    });
    
    // 初始化表单
    const forms = document.querySelectorAll('.settings-section form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings(this);
        });
    });
}

// 加载设置
function loadSettings() {
    // 模拟加载用户设置
    const settings = {
        notifications: true,
        emailReminders: false,
        autoSave: true,
        darkMode: false
    };
    
    // 更新开关状态
    Object.entries(settings).forEach(([key, value]) => {
        const switchEl = document.querySelector(`[data-setting="${key}"]`);
        if (switchEl) {
            switchEl.checked = value;
        }
    });
}

// 更新设置
function updateSetting(setting, value) {
    console.log(`更新设置: ${setting} = ${value}`);
    // 这里可以发送API请求保存设置
}

// 保存设置
function saveSettings(form) {
    const formData = new FormData(form);
    const settings = {};
    
    for (let [key, value] of formData.entries()) {
        settings[key] = value;
    }
    
    console.log('保存设置:', settings);
    // 这里可以发送API请求保存设置
    
    // 显示成功消息
    showMessage('设置已保存', 'success');
}

// 初始化图表
function initCharts() {
    // 这个函数在charts.js中实现
    if (typeof window.initDashboardCharts === 'function') {
        window.initDashboardCharts();
    }
}

// 工具函数
async function viewInterviewDetail(id) {
    try {
        // 获取面试详情数据
        const response = await fetch(`/api/jilu/${id}`);
        if (!response.ok) {
            throw new Error('获取面试详情失败');
        }
        
        const interviewData = await response.json();
        
        // 填充模态框数据
        populateInterviewDetailModal(interviewData);
        
        // 显示模态框
        showInterviewDetailModal();
    } catch (error) {
        console.error('获取面试详情失败:', error);
        showMessage('获取面试详情失败，请稍后重试', 'error');
    }
}

function retakeInterview(position) {
    console.log('重新练习:', position);
    window.location.href = 'interview.html';
}

function startLearning(title) {
    console.log('开始学习:', title);
    // 跳转到学习页面
}

function viewDetails(title) {
    console.log('查看详情:', title);
    // 显示详情模态框
}

// 模态框相关函数
function showInterviewDetailModal() {
    const modal = document.getElementById('interviewDetailModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideInterviewDetailModal() {
    const modal = document.getElementById('interviewDetailModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

function populateInterviewDetailModal(data) {
    // 填充基本信息
    const detailMode = document.getElementById('detailMode');
    if (detailMode) detailMode.textContent = data.mode || '未知模式';
    
    const detailQuestionTitle = document.getElementById('detailQuestionTitle');
    if (detailQuestionTitle) detailQuestionTitle.textContent = data.question_title || '未知题目';
    
    const detailTime = document.getElementById('detailTime');
    if (detailTime) detailTime.textContent = formatDate(data.created_at);
    
    const detailScore = document.getElementById('detailScore');
    if (detailScore) detailScore.textContent = data.score || '0';
    
    // 解析AI评价
    const scores = parseAIEvaluation(data.ai_evaluation || '');
    
    // 填充详细分数
    const scoreBreakdown = document.getElementById('scoreBreakdownDetail');
    if (scoreBreakdown) {
        scoreBreakdown.innerHTML = scores.map(score => `
            <div class="score-item-detail">
                <div class="score-label">
                    <span>${score.name}</span>
                </div>
                <div class="score-bar-detail">
                    <div class="score-fill-detail" style="width: ${score.value}%"></div>
                </div>
                <div class="score-value">${score.value}</div>
            </div>
        `).join('');
    }
    
    // 填充AI评价文本
    const aiEvaluationText = document.getElementById('aiEvaluationText');
    if (aiEvaluationText) {
        aiEvaluationText.textContent = data.ai_evaluation || '暂无AI评价';
    }
    
    // 处理视频（如果有的话）
    const videoContainer = document.getElementById('videoContainer');
    if (videoContainer) {
        if (data.video_path) {
            videoContainer.innerHTML = `
                <video controls style="width: 100%; height: 300px;">
                    <source src="${data.video_path}" type="video/mp4">
                    您的浏览器不支持视频播放。
                </video>
            `;
        } else {
            videoContainer.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">暂无面试视频</p>';
        }
    }
}

function downloadCertificate(id) {
    console.log('下载证书:', id);
    // 生成并下载证书PDF
}

function shareCertificate(id) {
    console.log('分享证书:', id);
}

// 下载面试报告为PDF
function downloadReport() {
    // 获取当前模态框中的面试数据
    const currentInterview = getCurrentInterviewData();
    
    if (!currentInterview) {
        showMessage('请先打开面试详情', 'error');
        return;
    }
    
    // 构建数据对象
    const interviewData = {
        mode: currentInterview.mode || '未知模式',
        questionTitle: currentInterview.questionTitle || '未知题目',
        time: currentInterview.time || new Date().toLocaleString(),
        score: currentInterview.score || '0',
        scores: currentInterview.scores || {
            expression: 0,
            logic: 0,
            knowledge: 0,
            adaptability: 0,
            professionalism: 0
        },
        evaluation: currentInterview.evaluation || '暂无评价内容',
        suggestions: currentInterview.suggestions || '暂无改进建议'
    };
    
    // 将数据编码为URL参数
    const dataParam = encodeURIComponent(JSON.stringify(interviewData));
    const detailPageUrl = `interview-detail.html?data=${dataParam}`;
    
    // 在新窗口中打开详情页面
    window.open(detailPageUrl, '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
}

// 获取当前面试数据的辅助函数
function getCurrentInterviewData() {
    // 从模态框中提取当前显示的面试数据
    const modal = document.getElementById('interviewDetailModal');
    if (!modal || !modal.classList.contains('show')) {
        return null;
    }
    
    // 提取基本信息
    const modeElement = modal.querySelector('#detailMode');
    const titleElement = modal.querySelector('#detailQuestionTitle');
    const timeElement = modal.querySelector('#detailTime');
    const scoreElement = modal.querySelector('#detailScore');
    
    // 提取评分数据
    const scores = {};
    const scoreElements = {
        expression: modal.querySelector('#expression-score'),
        logic: modal.querySelector('#logic-score'),
        knowledge: modal.querySelector('#knowledge-score'),
        adaptability: modal.querySelector('#adaptability-score'),
        professionalism: modal.querySelector('#professionalism-score')
    };
    
    Object.keys(scoreElements).forEach(key => {
        const element = scoreElements[key];
        scores[key] = element ? parseInt(element.textContent) || 0 : 0;
    });
    
    // 提取评价和建议内容
    const evaluationElement = modal.querySelector('#evaluationContent');
    const suggestionsElement = modal.querySelector('#suggestionsContent');
    
    return {
        mode: modeElement ? modeElement.textContent : '未知模式',
        questionTitle: titleElement ? titleElement.textContent : '未知题目',
        time: timeElement ? timeElement.textContent : new Date().toLocaleString(),
        score: scoreElement ? scoreElement.textContent : '0',
        scores: scores,
        evaluation: evaluationElement ? evaluationElement.innerHTML : '暂无评价内容',
        suggestions: suggestionsElement ? suggestionsElement.innerHTML : '暂无改进建议'
    };
}

// 动态加载PDF生成库
function loadPDFLibraries() {
    return new Promise((resolve, reject) => {
        let loadedCount = 0;
        const totalLibs = 2;
        
        function checkComplete() {
            loadedCount++;
            if (loadedCount === totalLibs) {
                resolve();
            }
        }
        
        // 加载html2canvas
        if (typeof html2canvas === 'undefined') {
            const html2canvasScript = document.createElement('script');
            html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            html2canvasScript.onload = checkComplete;
            html2canvasScript.onerror = reject;
            document.head.appendChild(html2canvasScript);
        } else {
            checkComplete();
        }
        
        // 加载jsPDF
        if (typeof jsPDF === 'undefined') {
            const jsPDFScript = document.createElement('script');
            jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            jsPDFScript.onload = checkComplete;
            jsPDFScript.onerror = reject;
            document.head.appendChild(jsPDFScript);
        } else {
            checkComplete();
        }
    });
}

// 生成PDF
function generatePDF(element) {
    showMessage('正在生成PDF报告...', 'info');
    
    // 临时隐藏关闭按钮和下载按钮
    const closeBtn = element.querySelector('.close');
    const footer = element.querySelector('.modal-footer');
    const originalCloseDisplay = closeBtn ? closeBtn.style.display : '';
    const originalFooterDisplay = footer ? footer.style.display : '';
    
    if (closeBtn) closeBtn.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // 保存原始样式 - 包括modal-content和modal-body
    const modalContent = element.querySelector('.modal-content');
    const modalBody = element.querySelector('.modal-body');
    const originalStyles = {
        content: {},
        body: {}
    };
    
    // 处理modal-content的样式限制
    if (modalContent) {
        originalStyles.content.maxHeight = modalContent.style.maxHeight;
        originalStyles.content.overflowY = modalContent.style.overflowY;
        originalStyles.content.height = modalContent.style.height;
        
        // 移除modal-content的高度和滚动限制
        modalContent.style.maxHeight = 'none';
        modalContent.style.overflowY = 'visible';
        modalContent.style.height = 'auto';
    }
    
    // 处理modal-body的样式限制
    if (modalBody) {
        originalStyles.body.height = modalBody.style.height;
        originalStyles.body.maxHeight = modalBody.style.maxHeight;
        originalStyles.body.overflow = modalBody.style.overflow;
        
        // 临时移除高度限制和滚动条，确保所有内容都显示
        modalBody.style.height = 'auto';
        modalBody.style.maxHeight = 'none';
        modalBody.style.overflow = 'visible';
    }
    
    // 等待样式应用后再截图，增加延迟确保DOM完全更新
    setTimeout(() => {
        // 强制重新计算布局
        element.offsetHeight;
        
        // 先滚动到最顶部
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
        // 确保整个页面也滚动到顶部
        window.scrollTo(0, 0);
        
        // 等待滚动完成后再开始截图
        setTimeout(() => {
            // 获取元素的完整高度
            const totalHeight = element.scrollHeight;
            const totalWidth = element.scrollWidth;
            const viewportHeight = 2000; // 每次截取的高度
        
        // 计算需要截取的段数
        const segments = Math.ceil(totalHeight / viewportHeight);
        const canvasPromises = [];
        
        // 分段截取
        for (let i = 0; i < segments; i++) {
            const y = i * viewportHeight;
            const height = Math.min(viewportHeight, totalHeight - y);
            
            const promise = html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: totalWidth,
                height: height,
                scrollX: 0,
                scrollY: y,
                logging: false,
                removeContainer: true,
                x: 0,
                y: y
            });
            
            canvasPromises.push(promise);
        }
        
        // 等待所有分段截取完成
        Promise.all(canvasPromises).then(canvases => {
            // 创建一个大的canvas来拼接所有分段
            const finalCanvas = document.createElement('canvas');
            const ctx = finalCanvas.getContext('2d');
            
            finalCanvas.width = totalWidth * 2; // scale为2
            finalCanvas.height = totalHeight * 2;
            
            // 拼接所有分段
            let currentY = 0;
            canvases.forEach((canvas, index) => {
                ctx.drawImage(canvas, 0, currentY);
                currentY += canvas.height;
            });
             
             // 使用拼接后的canvas生成PDF
             const canvas = finalCanvas;
             // 恢复按钮显示
             if (closeBtn) closeBtn.style.display = originalCloseDisplay;
             if (footer) footer.style.display = originalFooterDisplay;
            
            // 恢复modal-content样式
            if (modalContent) {
                modalContent.style.maxHeight = originalStyles.content.maxHeight;
                modalContent.style.overflowY = originalStyles.content.overflowY;
                modalContent.style.height = originalStyles.content.height;
            }
            
            // 恢复modal-body样式
            if (modalBody) {
                modalBody.style.height = originalStyles.body.height;
                modalBody.style.maxHeight = originalStyles.body.maxHeight;
                modalBody.style.overflow = originalStyles.body.overflow;
            }
            
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210; // A4宽度
            const pageHeight = 295; // A4高度
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            // 添加第一页
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // 如果内容超过一页，添加更多页面
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // 生成文件名
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const filename = `面试报告_${dateStr}_${timeStr}.pdf`;
            
            // 下载PDF
            pdf.save(filename);
            showMessage('PDF报告下载成功！', 'success');
            
        }).catch(error => {
            // 恢复按钮显示
            if (closeBtn) closeBtn.style.display = originalCloseDisplay;
            if (footer) footer.style.display = originalFooterDisplay;
            
            // 恢复modal-content样式
            if (modalContent) {
                modalContent.style.maxHeight = originalStyles.content.maxHeight;
                modalContent.style.overflowY = originalStyles.content.overflowY;
                modalContent.style.height = originalStyles.content.height;
            }
            
            // 恢复modal-body样式
            if (modalBody) {
                modalBody.style.height = originalStyles.body.height;
                modalBody.style.maxHeight = originalStyles.body.maxHeight;
                modalBody.style.overflow = originalStyles.body.overflow;
            }
        }).catch(error => {
            console.error('生成PDF时出错:', error);
            showMessage('生成PDF失败，请重试', 'error');
            
            // 恢复按钮显示
            if (closeBtn) closeBtn.style.display = originalCloseDisplay;
            if (footer) footer.style.display = originalFooterDisplay;
            
            // 恢复modal-content样式
            if (modalContent) {
                modalContent.style.maxHeight = originalStyles.content.maxHeight;
                modalContent.style.overflowY = originalStyles.content.overflowY;
                modalContent.style.height = originalStyles.content.height;
            }
            
            // 恢复modal-body样式
            if (modalBody) {
                modalBody.style.height = originalStyles.body.height;
                modalBody.style.maxHeight = originalStyles.body.maxHeight;
                modalBody.style.overflow = originalStyles.body.overflow;
            }
        });
        }, 200); // 等待滚动完成的延迟
    }, 100); // 给样式应用一些时间
}

// 检查登录状态
function checkLoginStatus() {
    const userToken = localStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo');
    return userToken && userInfo;
}

// 退出登录功能已移至全局退出模块 (global-logout.js)
// 如需调用退出功能，请使用: window.globalLogoutFunctions.globalLogout()

function showMessage(message, type = 'info') {
    // 显示消息提示
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// 模态框事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 关闭按钮事件
    const closeBtn = document.querySelector('#interviewDetailModal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideInterviewDetailModal);
    }
    
    // 点击模态框外部关闭
    const modal = document.getElementById('interviewDetailModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideInterviewDetailModal();
            }
        });
    }
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideInterviewDetailModal();
        }
    });
});

// 监听存储变化，同步登录状态
window.addEventListener('storage', function(e) {
    if (e.key === 'userToken' || e.key === 'userInfo') {
        if (!checkLoginStatus()) {
            alert('登录状态已失效，请重新登录');
            window.location.href = 'login.html';
        }
    }
});

// 导出函数供其他脚本使用
window.dashboardFunctions = {
    showSection,
    updateStatCards,
    loadUserData,
    viewInterviewDetail,
    retakeInterview,
    startLearning,
    viewDetails,
    downloadCertificate,
    shareCertificate,
    showInterviewDetailModal,
    hideInterviewDetailModal,
    populateInterviewDetailModal,
    downloadReport,
    // logout 功能已移至全局模块
};