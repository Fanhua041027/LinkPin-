// 主要JavaScript文件

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initNavigation();
    initModals();
    initForms();
    initInterviewSystem();
    initDashboard();
    initAnimations();
});

// 导航功能
function initNavigation() {
    // 移动端菜单切换
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // 点击菜单项后关闭移动端菜单
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // 平滑滚动
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// 模态框功能
function initModals() {
    // 打开模态框
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // 关闭模态框
    const modalCloses = document.querySelectorAll('.modal-close, .modal');
    modalCloses.forEach(close => {
        close.addEventListener('click', function(e) {
            if (e.target === this || this.classList.contains('modal-close')) {
                const modal = this.closest('.modal') || this;
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.show');
            if (activeModal) {
                activeModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
    });
}

// 表单功能
function initForms() {
    // 表单验证
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
        
        // 实时验证
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });
    
    // 密码强度检测
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            checkPasswordStrength(this);
        });
    });
}

// 表单验证函数
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    // 清除之前的错误
    clearFieldError(field);
    
    // 必填验证
    if (required && !value) {
        showFieldError(field, '此字段为必填项');
        return false;
    }
    
    // 类型验证
    if (value) {
        switch (type) {
            case 'email':
                if (!isValidEmail(value)) {
                    showFieldError(field, '请输入有效的邮箱地址');
                    return false;
                }
                break;
            case 'tel':
                if (!isValidPhone(value)) {
                    showFieldError(field, '请输入有效的手机号码');
                    return false;
                }
                break;
            case 'password':
                if (value.length < 6) {
                    showFieldError(field, '密码长度至少6位');
                    return false;
                }
                break;
        }
    }
    
    // 确认密码验证
    if (field.name === 'confirmPassword') {
        const passwordField = field.form.querySelector('input[name="password"]');
        if (passwordField && value !== passwordField.value) {
            showFieldError(field, '两次输入的密码不一致');
            return false;
        }
    }
    
    showFieldSuccess(field);
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    
    let errorElement = field.parentNode.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function showFieldSuccess(field) {
    field.classList.add('success');
    field.classList.remove('error');
    
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function clearFieldError(field) {
    field.classList.remove('error', 'success');
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// 验证辅助函数
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
}

// 密码强度检测
function checkPasswordStrength(input) {
    const password = input.value;
    const strengthIndicator = input.parentNode.querySelector('.password-strength');
    
    if (!strengthIndicator) return;
    
    let strength = 0;
    let strengthText = '';
    let strengthClass = '';
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    switch (strength) {
        case 0:
        case 1:
            strengthText = '弱';
            strengthClass = 'weak';
            break;
        case 2:
        case 3:
            strengthText = '中等';
            strengthClass = 'medium';
            break;
        case 4:
        case 5:
            strengthText = '强';
            strengthClass = 'strong';
            break;
    }
    
    strengthIndicator.textContent = `密码强度: ${strengthText}`;
    strengthIndicator.className = `password-strength ${strengthClass}`;
}

// 面试系统功能
function initInterviewSystem() {
    // 设备检测
    initDeviceCheck();
    
    // 面试控制
    initInterviewControls();
    
    // 录制功能
    initRecording();
    
    // 计时器
    initTimer();
}

// 设备检测
function initDeviceCheck() {
    const checkCameraBtn = document.getElementById('check-camera');
    const checkMicBtn = document.getElementById('check-mic');
    
    if (checkCameraBtn) {
        checkCameraBtn.addEventListener('click', checkCamera);
    }
    
    if (checkMicBtn) {
        checkMicBtn.addEventListener('click', checkMicrophone);
    }
}

async function checkCamera() {
    const videoElement = document.getElementById('camera-preview');
    const statusElement = document.getElementById('camera-status');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.play();
        
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i> 摄像头正常';
        statusElement.className = 'device-status success';
        
        // 5秒后停止预览
        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }, 5000);
        
    } catch (error) {
        statusElement.innerHTML = '<i class="fas fa-times-circle"></i> 摄像头访问失败';
        statusElement.className = 'device-status error';
        console.error('Camera access error:', error);
    }
}

async function checkMicrophone() {
    const statusElement = document.getElementById('mic-status');
    const levelElement = document.getElementById('mic-level');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i> 麦克风正常';
        statusElement.className = 'device-status success';
        
        // 音量检测
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        function updateLevel() {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const level = Math.min(100, (average / 128) * 100);
            
            if (levelElement) {
                levelElement.style.width = level + '%';
            }
        }
        
        const levelInterval = setInterval(updateLevel, 100);
        
        // 5秒后停止检测
        setTimeout(() => {
            clearInterval(levelInterval);
            stream.getTracks().forEach(track => track.stop());
            audioContext.close();
        }, 5000);
        
    } catch (error) {
        statusElement.innerHTML = '<i class="fas fa-times-circle"></i> 麦克风访问失败';
        statusElement.className = 'device-status error';
        console.error('Microphone access error:', error);
    }
}

// 面试控制
function initInterviewControls() {
    const startBtn = document.getElementById('start-interview');
    const pauseBtn = document.getElementById('pause-interview');
    const endBtn = document.getElementById('end-interview');
    
    if (startBtn) {
        startBtn.addEventListener('click', startInterview);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseInterview);
    }
    
    if (endBtn) {
        endBtn.addEventListener('click', endInterview);
    }
}

function startInterview() {
    // 开始面试逻辑
    console.log('面试开始');
    
    // 更新UI状态
    const startBtn = document.getElementById('start-interview');
    const pauseBtn = document.getElementById('pause-interview');
    const endBtn = document.getElementById('end-interview');
    
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    if (endBtn) endBtn.disabled = false;
    
    // 开始录制
    startRecording();
    
    // 开始计时
    startTimer();
    
    // 显示第一个问题
    showNextQuestion();
}

function pauseInterview() {
    // 暂停面试逻辑
    console.log('面试暂停');
    
    // 暂停录制
    pauseRecording();
    
    // 暂停计时
    pauseTimer();
}

function endInterview() {
    // 结束面试逻辑
    console.log('面试结束');
    
    // 停止录制
    stopRecording();
    
    // 停止计时
    stopTimer();
    
    // 跳转到结果页面
    showInterviewResult();
}

// 录制功能
let mediaRecorder = null;
let recordedChunks = [];

function initRecording() {
    // 录制相关初始化
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            // 处理录制完成的视频
            handleRecordedVideo(blob);
        };
        
        mediaRecorder.start();
        console.log('录制开始');
        
    } catch (error) {
        console.error('录制启动失败:', error);
    }
}

function pauseRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        console.log('录制暂停');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        console.log('录制停止');
    }
}

function handleRecordedVideo(blob) {
    // 处理录制的视频
    const url = URL.createObjectURL(blob);
    console.log('录制完成，视频URL:', url);
    
    // 可以在这里上传到服务器或进行其他处理
}

// 计时器功能
let timerInterval = null;
let startTime = null;
let pausedTime = 0;

function initTimer() {
    // 计时器初始化
}

function startTimer() {
    startTime = Date.now() - pausedTime;
    timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        pausedTime = Date.now() - startTime;
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        startTime = null;
        pausedTime = 0;
    }
}

function updateTimer() {
    if (startTime) {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timerElement = document.getElementById('interview-timer');
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}

// 问题显示
function showNextQuestion() {
    // 模拟问题数据
    const questions = [
        {
            id: 1,
            text: '请简单介绍一下您自己',
            type: 'introduction',
            timeLimit: 120
        },
        {
            id: 2,
            text: '请描述一下您最近参与的一个项目',
            type: 'project',
            timeLimit: 300
        },
        {
            id: 3,
            text: '您对人工智能的发展趋势有什么看法？',
            type: 'technical',
            timeLimit: 240
        }
    ];
    
    // 这里应该根据当前进度显示相应问题
    const currentQuestion = questions[0]; // 示例
    
    const questionElement = document.getElementById('current-question');
    if (questionElement) {
        questionElement.textContent = currentQuestion.text;
    }
}

// 仪表板功能
function initDashboard() {
    // 初始化图表
    initCharts();
    
    // 初始化数据加载
    loadDashboardData();
    
    // 初始化筛选器
    initFilters();
}

// 图表初始化
function initCharts() {
    // 能力雷达图
    const radarCanvas = document.getElementById('ability-radar');
    if (radarCanvas) {
        createRadarChart(radarCanvas);
    }
    
    // 成长曲线图
    const growthCanvas = document.getElementById('growth-chart');
    if (growthCanvas) {
        createGrowthChart(growthCanvas);
    }
}

function createRadarChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    // 模拟数据
    const data = {
        labels: ['表达能力', '逻辑思维', '专业知识', '应变能力', '职业素养'],
        datasets: [{
            label: '当前能力',
            data: [85, 78, 92, 76, 88],
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2
        }]
    };
    
    // 这里应该使用Chart.js或其他图表库
    // 简化版本，仅作示例
    drawRadarChart(ctx, data);
}

function drawRadarChart(ctx, data) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    // 绘制网格
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 5) * i, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // 绘制轴线
    const angleStep = (2 * Math.PI) / data.labels.length;
    
    for (let i = 0; i < data.labels.length; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // 绘制标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(data.labels[i], x + Math.cos(angle) * 20, y + Math.sin(angle) * 20);
    }
    
    // 绘制数据
    ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
    ctx.strokeStyle = 'rgba(102, 126, 234, 1)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    
    for (let i = 0; i < data.datasets[0].data.length; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = data.datasets[0].data[i] / 100;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function createGrowthChart(canvas) {
    // 成长曲线图实现
    const ctx = canvas.getContext('2d');
    
    // 模拟数据
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [{
            label: '综合得分',
            data: [65, 72, 78, 82, 85, 88],
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
        }]
    };
    
    drawLineChart(ctx, data);
}

function drawLineChart(ctx, data) {
    const padding = 40;
    const chartWidth = ctx.canvas.width - padding * 2;
    const chartHeight = ctx.canvas.height - padding * 2;
    
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
    const maxValue = Math.max(...data.datasets[0].data);
    const minValue = Math.min(...data.datasets[0].data);
    const valueRange = maxValue - minValue;
    
    ctx.strokeStyle = data.datasets[0].borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < data.datasets[0].data.length; i++) {
        const x = padding + i * stepX;
        const y = ctx.canvas.height - padding - ((data.datasets[0].data[i] - minValue) / valueRange) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // 绘制数据点
        ctx.fillStyle = data.datasets[0].borderColor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    ctx.stroke();
    
    // 绘制标签
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < data.labels.length; i++) {
        const x = padding + i * stepX;
        ctx.fillText(data.labels[i], x, ctx.canvas.height - padding + 20);
    }
}

// 数据加载
function loadDashboardData() {
    // 模拟API调用
    setTimeout(() => {
        updateDashboardStats();
        updateRecentActivity();
        updateInterviewHistory();
    }, 1000);
}

function updateDashboardStats() {
    // 更新统计数据
    const stats = {
        totalInterviews: 23,
        averageScore: 85.6,
        improvementRate: 12.5,
        ranking: 156
    };
    
    // 更新DOM元素
    const elements = {
        'total-interviews': stats.totalInterviews,
        'average-score': stats.averageScore,
        'improvement-rate': `+${stats.improvementRate}%`,
        'current-ranking': stats.ranking
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function updateRecentActivity() {
    // 更新最近活动
    const activities = [
        { type: 'interview', text: '完成AI工程师面试', time: '2小时前' },
        { type: 'achievement', text: '获得"表达达人"徽章', time: '1天前' },
        { type: 'study', text: '学习了深度学习课程', time: '2天前' }
    ];
    
    const activityList = document.getElementById('recent-activity-list');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <span class="activity-text">${activity.text}</span>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
}

function getActivityIcon(type) {
    const icons = {
        interview: 'video',
        achievement: 'trophy',
        study: 'book'
    };
    return icons[type] || 'circle';
}

function updateInterviewHistory() {
    // 更新面试历史
    const interviews = [
        {
            id: 1,
            position: 'AI工程师',
            date: '2024-01-15',
            score: 88.5,
            status: 'completed'
        },
        {
            id: 2,
            position: '大数据工程师',
            date: '2024-01-12',
            score: 82.3,
            status: 'completed'
        }
    ];
    
    const historyList = document.getElementById('interview-history-list');
    if (historyList) {
        historyList.innerHTML = interviews.map(interview => `
            <div class="interview-item">
                <div class="interview-info">
                    <h4>${interview.position}</h4>
                    <span class="interview-date">${interview.date}</span>
                </div>
                <div class="interview-score">${interview.score}</div>
                <div class="interview-actions">
                    <button class="btn btn-sm btn-outline" onclick="viewInterviewDetail(${interview.id})">
                        查看详情
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// 筛选器
function initFilters() {
    const filters = document.querySelectorAll('.filter-select');
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });
}

function applyFilters() {
    // 应用筛选逻辑
    console.log('应用筛选器');
}

// 动画效果
function initAnimations() {
    // 滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    const animateElements = document.querySelectorAll('.feature-card, .stat-item, .metric-card');
    animateElements.forEach(element => {
        observer.observe(element);
    });
    
    // 数字动画
    animateNumbers();
}

function animateNumbers() {
    const numberElements = document.querySelectorAll('.stat-number, .metric-value');
    
    numberElements.forEach(element => {
        const finalValue = parseInt(element.textContent);
        if (isNaN(finalValue)) return;
        
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
    });
}

// 工具函数
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

function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading"></div>';
    }
}

function hideLoading(element, content) {
    if (element) {
        element.innerHTML = content;
    }
}

// 面试详情查看
function viewInterviewDetail(interviewId) {
    console.log('查看面试详情:', interviewId);
    // 这里可以打开模态框或跳转到详情页面
}

// 导出功能
function exportData(type) {
    console.log('导出数据:', type);
    showNotification('数据导出功能开发中...', 'info');
}

// 页面切换
function switchPage(pageId) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新导航状态
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[href="#${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// 全局错误处理
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
    showNotification('系统出现错误，请刷新页面重试', 'error');
});

// 网络状态检测
window.addEventListener('online', function() {
    showNotification('网络连接已恢复', 'success');
});

window.addEventListener('offline', function() {
    showNotification('网络连接已断开', 'warning');
});