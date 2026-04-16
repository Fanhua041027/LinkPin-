// 管理员界面JavaScript文件

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化管理员功能
    initAdminDashboard();
    initUserManagement();
    initInterviewManagement();
    initQuestionBank();
    initDataAnalytics();
    initSystemSettings();
    initSystemLogs();
    initAdminNavigation();
});

// 管理员仪表板初始化
function initAdminDashboard() {
    loadDashboardMetrics();
    initAdminCharts();
    loadRealtimeData();
    loadRecentActivities();
}

// 加载仪表板指标
function loadDashboardMetrics() {
    // 模拟API调用
    const metrics = {
        totalUsers: 1248,
        activeUsers: 892,
        totalInterviews: 3567,
        todayInterviews: 45,
        avgScore: 82.5,
        systemHealth: 98.2
    };
    
    // 更新指标显示
    updateMetricCard('total-users', metrics.totalUsers, '+12%');
    updateMetricCard('active-users', metrics.activeUsers, '+8%');
    updateMetricCard('total-interviews', metrics.totalInterviews, '+15%');
    updateMetricCard('today-interviews', metrics.todayInterviews, '+3');
    updateMetricCard('avg-score', metrics.avgScore, '+2.1');
    updateMetricCard('system-health', metrics.systemHealth + '%', '+0.5%');
}

function updateMetricCard(id, value, change) {
    const valueElement = document.getElementById(id + '-value');
    const changeElement = document.getElementById(id + '-change');
    
    if (valueElement) {
        valueElement.textContent = value;
        animateNumber(valueElement, value);
    }
    
    if (changeElement) {
        changeElement.textContent = change;
        changeElement.className = change.startsWith('+') ? 'metric-change positive' : 'metric-change negative';
    }
}

// 初始化管理员图表
function initAdminCharts() {
    // 用户增长图表
    const userGrowthCanvas = document.getElementById('user-growth-chart');
    if (userGrowthCanvas) {
        createUserGrowthChart(userGrowthCanvas);
    }
    
    // 岗位分布图表
    const positionDistCanvas = document.getElementById('position-distribution-chart');
    if (positionDistCanvas) {
        createPositionDistributionChart(positionDistCanvas);
    }
    
    // 面试完成率图表
    const completionRateCanvas = document.getElementById('completion-rate-chart');
    if (completionRateCanvas) {
        createCompletionRateChart(completionRateCanvas);
    }
}

function createUserGrowthChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    // 模拟数据
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [{
            label: '新增用户',
            data: [120, 150, 180, 220, 280, 320],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
        }, {
            label: '活跃用户',
            data: [800, 850, 920, 980, 1050, 1120],
            borderColor: '#f093fb',
            backgroundColor: 'rgba(240, 147, 251, 0.1)',
            tension: 0.4
        }]
    };
    
    drawMultiLineChart(ctx, data);
}

function createPositionDistributionChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    // 模拟数据
    const data = {
        labels: ['AI工程师', '大数据工程师', '物联网工程师', '产品经理', '其他'],
        datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
                '#667eea',
                '#f093fb',
                '#f6d55c',
                '#3caea3',
                '#ed4a7b'
            ]
        }]
    };
    
    drawPieChart(ctx, data);
}

function createCompletionRateChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    // 模拟数据
    const data = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
            label: '完成率',
            data: [85, 88, 92, 87, 90, 78, 82],
            backgroundColor: '#667eea',
            borderColor: '#667eea',
            borderWidth: 1
        }]
    };
    
    drawBarChart(ctx, data);
}

// 图表绘制函数
function drawMultiLineChart(ctx, data) {
    const padding = 40;
    const chartWidth = ctx.canvas.width - padding * 2;
    const chartHeight = ctx.canvas.height - padding * 2;
    
    // 清空画布
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 绘制坐标轴
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    // X轴
    ctx.beginPath();
    ctx.moveTo(padding, ctx.canvas.height - padding);
    ctx.lineTo(ctx.canvas.width - padding, ctx.canvas.height - padding);
    ctx.stroke();
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, ctx.canvas.height - padding);
    ctx.stroke();
    
    // 绘制数据线
    const stepX = chartWidth / (data.labels.length - 1);
    
    data.datasets.forEach((dataset, datasetIndex) => {
        const maxValue = Math.max(...dataset.data);
        const minValue = Math.min(...dataset.data);
        const valueRange = maxValue - minValue || 1;
        
        ctx.strokeStyle = dataset.borderColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i < dataset.data.length; i++) {
            const x = padding + i * stepX;
            const y = ctx.canvas.height - padding - ((dataset.data[i] - minValue) / valueRange) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // 绘制数据点
            ctx.fillStyle = dataset.borderColor;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.stroke();
    });
    
    // 绘制标签
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < data.labels.length; i++) {
        const x = padding + i * stepX;
        ctx.fillText(data.labels[i], x, ctx.canvas.height - padding + 20);
    }
}

function drawPieChart(ctx, data) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    let currentAngle = -Math.PI / 2;
    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    
    data.datasets[0].data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        // 绘制扇形
        ctx.fillStyle = data.datasets[0].backgroundColor[index];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        // 绘制标签
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(data.labels[index], labelX, labelY);
        ctx.fillText(`${value}%`, labelX, labelY + 15);
        
        currentAngle += sliceAngle;
    });
}

function drawBarChart(ctx, data) {
    const padding = 40;
    const chartWidth = ctx.canvas.width - padding * 2;
    const chartHeight = ctx.canvas.height - padding * 2;
    
    // 清空画布
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 绘制坐标轴
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    // X轴
    ctx.beginPath();
    ctx.moveTo(padding, ctx.canvas.height - padding);
    ctx.lineTo(ctx.canvas.width - padding, ctx.canvas.height - padding);
    ctx.stroke();
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, ctx.canvas.height - padding);
    ctx.stroke();
    
    // 绘制柱状图
    const barWidth = chartWidth / data.labels.length * 0.6;
    const barSpacing = chartWidth / data.labels.length;
    const maxValue = Math.max(...data.datasets[0].data);
    
    data.datasets[0].data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
        const y = ctx.canvas.height - padding - barHeight;
        
        ctx.fillStyle = data.datasets[0].backgroundColor;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 绘制数值
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value + '%', x + barWidth / 2, y - 5);
        
        // 绘制标签
        ctx.fillText(data.labels[index], x + barWidth / 2, ctx.canvas.height - padding + 20);
    });
}

// 加载实时数据
function loadRealtimeData() {
    // 模拟实时面试状态
    const ongoingInterviews = [
        { user: '张三', position: 'AI工程师', progress: 65, startTime: '14:30' },
        { user: '李四', position: '大数据工程师', progress: 30, startTime: '15:15' },
        { user: '王五', position: '产品经理', progress: 85, startTime: '13:45' }
    ];
    
    const realtimeList = document.getElementById('realtime-interviews');
    if (realtimeList) {
        realtimeList.innerHTML = ongoingInterviews.map(interview => `
            <div class="realtime-item">
                <div class="interview-user">
                    <strong>${interview.user}</strong>
                    <span>${interview.position}</span>
                </div>
                <div class="interview-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${interview.progress}%"></div>
                    </div>
                    <span>${interview.progress}%</span>
                </div>
                <div class="interview-time">${interview.startTime}</div>
                <div class="interview-actions">
                    <button class="btn btn-sm btn-outline" onclick="monitorInterview('${interview.user}')">
                        监控
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// 加载最近活动
function loadRecentActivities() {
    const activities = [
        { type: 'user', text: '新用户注册：张三', time: '5分钟前' },
        { type: 'interview', text: '面试完成：李四 - AI工程师', time: '10分钟前' },
        { type: 'system', text: '系统更新完成', time: '1小时前' },
        { type: 'question', text: '新增题目：深度学习基础', time: '2小时前' }
    ];
    
    const activityList = document.getElementById('recent-activities');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${getAdminActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <span class="activity-text">${activity.text}</span>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
}

function getAdminActivityIcon(type) {
    const icons = {
        user: 'user-plus',
        interview: 'video',
        system: 'cog',
        question: 'question-circle'
    };
    return icons[type] || 'circle';
}

// 用户管理
function initUserManagement() {
    loadUserList();
    initUserFilters();
    initUserActions();
}

function loadUserList() {
    // 模拟用户数据
    const users = [
        {
            id: 1,
            name: '张三',
            email: 'zhangsan@example.com',
            school: '清华大学',
            major: '计算机科学',
            registerDate: '2024-01-15',
            lastLogin: '2024-01-20',
            interviewCount: 5,
            avgScore: 85.6,
            status: 'active'
        },
        {
            id: 2,
            name: '李四',
            email: 'lisi@example.com',
            school: '北京大学',
            major: '数据科学',
            registerDate: '2024-01-12',
            lastLogin: '2024-01-19',
            interviewCount: 3,
            avgScore: 78.2,
            status: 'active'
        }
    ];
    
    const userTableBody = document.getElementById('user-table-body');
    if (userTableBody) {
        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <input type="checkbox" class="user-checkbox" value="${user.id}">
                </td>
                <td>
                    <div class="user-info">
                        <strong>${user.name}</strong>
                        <span>${user.email}</span>
                    </div>
                </td>
                <td>${user.school}</td>
                <td>${user.major}</td>
                <td>${user.registerDate}</td>
                <td>${user.lastLogin}</td>
                <td>${user.interviewCount}</td>
                <td>${user.avgScore}</td>
                <td>
                    <span class="badge ${user.status}">${user.status === 'active' ? '活跃' : '非活跃'}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="viewUserDetail(${user.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function initUserFilters() {
    const searchInput = document.getElementById('user-search');
    const schoolFilter = document.getElementById('school-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterUsers, 300));
    }
    
    if (schoolFilter) {
        schoolFilter.addEventListener('change', filterUsers);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterUsers);
    }
}

function filterUsers() {
    // 实现用户筛选逻辑
    console.log('筛选用户');
    loadUserList(); // 重新加载用户列表
}

function initUserActions() {
    // 批量操作
    const selectAllCheckbox = document.getElementById('select-all-users');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.user-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // 批量删除
    const batchDeleteBtn = document.getElementById('batch-delete-users');
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', batchDeleteUsers);
    }
    
    // 导出用户
    const exportUsersBtn = document.getElementById('export-users');
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', exportUsers);
    }
}

// 用户操作函数
function editUser(userId) {
    console.log('编辑用户:', userId);
    // 打开编辑用户模态框
    showUserEditModal(userId);
}

function viewUserDetail(userId) {
    console.log('查看用户详情:', userId);
    // 打开用户详情模态框
    showUserDetailModal(userId);
}

function deleteUser(userId) {
    if (confirm('确定要删除这个用户吗？')) {
        console.log('删除用户:', userId);
        // 执行删除操作
        showNotification('用户删除成功', 'success');
        loadUserList();
    }
}

function batchDeleteUsers() {
    const selectedUsers = document.querySelectorAll('.user-checkbox:checked');
    if (selectedUsers.length === 0) {
        showNotification('请选择要删除的用户', 'warning');
        return;
    }
    
    if (confirm(`确定要删除选中的 ${selectedUsers.length} 个用户吗？`)) {
        console.log('批量删除用户');
        showNotification('用户批量删除成功', 'success');
        loadUserList();
    }
}

function exportUsers() {
    console.log('导出用户数据');
    showNotification('用户数据导出中...', 'info');
    
    // 模拟导出过程
    setTimeout(() => {
        showNotification('用户数据导出完成', 'success');
    }, 2000);
}

// 面试管理
function initInterviewManagement() {
    loadInterviewList();
    initInterviewFilters();
    initInterviewActions();
}

function loadInterviewList() {
    // 模拟面试数据
    const interviews = [
        {
            id: 1,
            user: '张三',
            position: 'AI工程师',
            date: '2024-01-20',
            duration: '25:30',
            score: 85.6,
            status: 'completed'
        },
        {
            id: 2,
            user: '李四',
            position: '大数据工程师',
            date: '2024-01-20',
            duration: '18:45',
            score: 78.2,
            status: 'completed'
        },
        {
            id: 3,
            user: '王五',
            position: '产品经理',
            date: '2024-01-20',
            duration: '进行中',
            score: '-',
            status: 'ongoing'
        }
    ];
    
    const interviewTableBody = document.getElementById('interview-table-body');
    if (interviewTableBody) {
        interviewTableBody.innerHTML = interviews.map(interview => `
            <tr>
                <td>
                    <input type="checkbox" class="interview-checkbox" value="${interview.id}">
                </td>
                <td>${interview.user}</td>
                <td>${interview.position}</td>
                <td>${interview.date}</td>
                <td>${interview.duration}</td>
                <td>${interview.score}</td>
                <td>
                    <span class="badge ${interview.status}">
                        ${getInterviewStatusText(interview.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="viewInterviewDetail(${interview.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${interview.status === 'ongoing' ? 
                            `<button class="btn btn-sm btn-primary" onclick="monitorInterview(${interview.id})">
                                <i class="fas fa-video"></i>
                            </button>` : 
                            `<button class="btn btn-sm btn-outline" onclick="downloadInterview(${interview.id})">
                                <i class="fas fa-download"></i>
                            </button>`
                        }
                        <button class="btn btn-sm btn-danger" onclick="deleteInterview(${interview.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function getInterviewStatusText(status) {
    const statusMap = {
        completed: '已完成',
        ongoing: '进行中',
        cancelled: '已取消',
        failed: '失败'
    };
    return statusMap[status] || status;
}

function initInterviewFilters() {
    const dateFilter = document.getElementById('interview-date-filter');
    const positionFilter = document.getElementById('interview-position-filter');
    const statusFilter = document.getElementById('interview-status-filter');
    
    [dateFilter, positionFilter, statusFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterInterviews);
        }
    });
}

function filterInterviews() {
    console.log('筛选面试记录');
    loadInterviewList();
}

function initInterviewActions() {
    // 批量导出
    const batchExportBtn = document.getElementById('batch-export-interviews');
    if (batchExportBtn) {
        batchExportBtn.addEventListener('click', batchExportInterviews);
    }
}

// 面试操作函数
function monitorInterview(interviewId) {
    console.log('监控面试:', interviewId);
    showNotification('正在连接面试监控...', 'info');
}

function downloadInterview(interviewId) {
    console.log('下载面试记录:', interviewId);
    showNotification('面试记录下载中...', 'info');
}

function deleteInterview(interviewId) {
    if (confirm('确定要删除这条面试记录吗？')) {
        console.log('删除面试记录:', interviewId);
        showNotification('面试记录删除成功', 'success');
        loadInterviewList();
    }
}

function batchExportInterviews() {
    const selectedInterviews = document.querySelectorAll('.interview-checkbox:checked');
    if (selectedInterviews.length === 0) {
        showNotification('请选择要导出的面试记录', 'warning');
        return;
    }
    
    console.log('批量导出面试记录');
    showNotification('面试记录导出中...', 'info');
}

// 题库管理
function initQuestionBank() {
    loadQuestionList();
    initQuestionFilters();
    initQuestionActions();
}

function loadQuestionList() {
    // 模拟题目数据
    const questions = [
        {
            id: 1,
            title: '请介绍一下深度学习的基本概念',
            category: '技术问答',
            position: 'AI工程师',
            difficulty: '中等',
            type: 'text',
            createDate: '2024-01-15',
            useCount: 156,
            avgScore: 82.5
        },
        {
            id: 2,
            title: '描述一个你参与的大数据项目',
            category: '项目经历',
            position: '大数据工程师',
            difficulty: '困难',
            type: 'scenario',
            createDate: '2024-01-12',
            useCount: 89,
            avgScore: 75.3
        }
    ];
    
    const questionTableBody = document.getElementById('question-table-body');
    if (questionTableBody) {
        questionTableBody.innerHTML = questions.map(question => `
            <tr>
                <td>
                    <input type="checkbox" class="question-checkbox" value="${question.id}">
                </td>
                <td>
                    <div class="question-title">${question.title}</div>
                    <div class="question-meta">
                        <span class="badge ${question.category.toLowerCase()}">${question.category}</span>
                        <span class="badge ${question.difficulty.toLowerCase()}">${question.difficulty}</span>
                    </div>
                </td>
                <td>${question.position}</td>
                <td>${question.type}</td>
                <td>${question.createDate}</td>
                <td>${question.useCount}</td>
                <td>${question.avgScore}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="editQuestion(${question.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="previewQuestion(${question.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="duplicateQuestion(${question.id})">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${question.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function initQuestionFilters() {
    const categoryFilter = document.getElementById('question-category-filter');
    const positionFilter = document.getElementById('question-position-filter');
    const difficultyFilter = document.getElementById('question-difficulty-filter');
    
    [categoryFilter, positionFilter, difficultyFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterQuestions);
        }
    });
}

function filterQuestions() {
    console.log('筛选题目');
    loadQuestionList();
}

function initQuestionActions() {
    // 添加新题目
    const addQuestionBtn = document.getElementById('add-question');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', showAddQuestionModal);
    }
    
    // 批量导入
    const importQuestionsBtn = document.getElementById('import-questions');
    if (importQuestionsBtn) {
        importQuestionsBtn.addEventListener('click', showImportQuestionsModal);
    }
    
    // 批量导出
    const exportQuestionsBtn = document.getElementById('export-questions');
    if (exportQuestionsBtn) {
        exportQuestionsBtn.addEventListener('click', exportQuestions);
    }
}

// 题目操作函数
function editQuestion(questionId) {
    console.log('编辑题目:', questionId);
    showQuestionEditModal(questionId);
}

function previewQuestion(questionId) {
    console.log('预览题目:', questionId);
    showQuestionPreviewModal(questionId);
}

function duplicateQuestion(questionId) {
    console.log('复制题目:', questionId);
    showNotification('题目复制成功', 'success');
    loadQuestionList();
}

function deleteQuestion(questionId) {
    if (confirm('确定要删除这道题目吗？')) {
        console.log('删除题目:', questionId);
        showNotification('题目删除成功', 'success');
        loadQuestionList();
    }
}

function showAddQuestionModal() {
    console.log('显示添加题目模态框');
    // 实现添加题目模态框
}

function showImportQuestionsModal() {
    console.log('显示导入题目模态框');
    // 实现导入题目模态框
}

function exportQuestions() {
    console.log('导出题目');
    showNotification('题目导出中...', 'info');
}

// 数据分析
function initDataAnalytics() {
    loadAnalyticsData();
    initAnalyticsCharts();
}

function loadAnalyticsData() {
    // 加载分析数据
    const analyticsData = {
        completionRate: 87.5,
        avgInterviewTime: 22.3,
        userSatisfaction: 4.6,
        popularPosition: 'AI工程师'
    };
    
    // 更新分析指标
    updateAnalyticsMetric('completion-rate', analyticsData.completionRate + '%');
    updateAnalyticsMetric('avg-interview-time', analyticsData.avgInterviewTime + '分钟');
    updateAnalyticsMetric('user-satisfaction', analyticsData.userSatisfaction + '/5.0');
    updateAnalyticsMetric('popular-position', analyticsData.popularPosition);
}

function updateAnalyticsMetric(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function initAnalyticsCharts() {
    // 初始化分析图表
    const trendCanvas = document.getElementById('completion-trend-chart');
    if (trendCanvas) {
        createCompletionTrendChart(trendCanvas);
    }
    
    const abilityCanvas = document.getElementById('ability-distribution-chart');
    if (abilityCanvas) {
        createAbilityDistributionChart(abilityCanvas);
    }
}

function createCompletionTrendChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [{
            label: '完成率',
            data: [82, 85, 88, 87, 90, 87],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
        }]
    };
    
    drawMultiLineChart(ctx, data);
}

function createAbilityDistributionChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    const data = {
        labels: ['表达能力', '逻辑思维', '专业知识', '应变能力', '职业素养'],
        datasets: [{
            data: [85, 78, 92, 76, 88],
            backgroundColor: [
                '#667eea',
                '#f093fb',
                '#f6d55c',
                '#3caea3',
                '#ed4a7b'
            ]
        }]
    };
    
    const chart = new RadarChart(canvas, {
        radius: 120,
        levels: 5,
        maxValue: 100,
        gridColor: '#e1e5f2',
        dataColor: '#667eea',
        dataFillColor: 'rgba(102, 126, 234, 0.2)'
    });
    
    const labels = ['技术能力', '沟通能力', '逻辑思维', '学习能力', '团队协作', '创新能力'];
    chart.draw(data.datasets[0].data, labels);
}

// 系统设置
function initSystemSettings() {
    loadSystemSettings();
    initSettingsForm();
}

function loadSystemSettings() {
    // 加载系统设置
    const settings = {
        siteName: '智能面试评测系统',
        siteDescription: '面向高校学生的多模态智能模拟面试评测平台',
        maxInterviewTime: 30,
        enableVideoRecording: true,
        enableAudioRecording: true,
        aiModelVersion: 'v2.1.0',
        securityLevel: 'high'
    };
    
    // 填充设置表单
    Object.entries(settings).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });
}

function initSettingsForm() {
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSystemSettings();
        });
    }
}

function saveSystemSettings() {
    console.log('保存系统设置');
    showNotification('系统设置保存成功', 'success');
}

// 系统日志
function initSystemLogs() {
    loadSystemLogs();
    initLogFilters();
}

function loadSystemLogs() {
    // 模拟日志数据
    const logs = [
        {
            id: 1,
            timestamp: '2024-01-20 15:30:25',
            level: 'INFO',
            module: '用户管理',
            message: '用户张三登录成功',
            ip: '192.168.1.100'
        },
        {
            id: 2,
            timestamp: '2024-01-20 15:28:15',
            level: 'WARNING',
            module: '面试系统',
            message: '面试录制质量较低',
            ip: '192.168.1.101'
        },
        {
            id: 3,
            timestamp: '2024-01-20 15:25:10',
            level: 'ERROR',
            module: 'AI分析',
            message: 'AI模型响应超时',
            ip: '192.168.1.102'
        }
    ];
    
    const logTableBody = document.getElementById('log-table-body');
    if (logTableBody) {
        logTableBody.innerHTML = logs.map(log => `
            <tr>
                <td>${log.timestamp}</td>
                <td>
                    <span class="badge ${log.level.toLowerCase()}">${log.level}</span>
                </td>
                <td>${log.module}</td>
                <td>${log.message}</td>
                <td>${log.ip}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewLogDetail(${log.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function initLogFilters() {
    const levelFilter = document.getElementById('log-level-filter');
    const moduleFilter = document.getElementById('log-module-filter');
    const dateFilter = document.getElementById('log-date-filter');
    
    [levelFilter, moduleFilter, dateFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterLogs);
        }
    });
}

function filterLogs() {
    console.log('筛选日志');
    loadSystemLogs();
}

function viewLogDetail(logId) {
    console.log('查看日志详情:', logId);
}

// 管理员导航
function initAdminNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // 如果是题库管理，跳转到admin-practice.html
            if (targetSection === 'questions') {
                window.location.href = 'admin-practice.html';
                return;
            }
            
            // 移除所有活跃状态
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 添加当前活跃状态
            this.classList.add('active');
            
            // 显示对应内容
            showAdminSection(targetSection);
        });
    });
}

function showAdminSection(sectionId) {
    // 隐藏所有section
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示目标section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// 工具函数
function animateNumber(element, finalValue) {
    if (typeof finalValue !== 'number') return;
    
    let currentValue = 0;
    const increment = finalValue / 50;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentValue);
    }, 30);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // 自动关闭
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // 手动关闭
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// 模态框函数
function showUserEditModal(userId) {
    console.log('显示用户编辑模态框:', userId);
    // 实现用户编辑模态框
}

function showUserDetailModal(userId) {
    console.log('显示用户详情模态框:', userId);
    // 实现用户详情模态框
}

function showQuestionEditModal(questionId) {
    console.log('显示题目编辑模态框:', questionId);
    // 实现题目编辑模态框
}

function showQuestionPreviewModal(questionId) {
    console.log('显示题目预览模态框:', questionId);
    // 实现题目预览模态框
}

// 监听存储变化，同步登录状态
window.addEventListener('storage', function(e) {
    if (e.key === 'userToken' || e.key === 'userInfo') {
        // 检查登录状态
        const userToken = localStorage.getItem('userToken');
        const userInfo = localStorage.getItem('userInfo');
        if (!userToken || !userInfo) {
            alert('登录状态已失效，请重新登录');
            window.location.href = 'login.html';
        }
    }
});

// 导出函数供其他脚本使用
window.adminFunctions = {
    editUser,
    viewUserDetail,
    deleteUser,
    monitorInterview,
    downloadInterview,
    deleteInterview,
    editQuestion,
    previewQuestion,
    duplicateQuestion,
    deleteQuestion,
    viewLogDetail
};

// 全局错误处理
window.addEventListener('error', function(event) {
    console.error('管理员界面错误:', event.error);
    showNotification('系统出现错误，请刷新页面重试', 'error');
});