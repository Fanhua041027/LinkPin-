// 自由练习模式管理器
class PracticeManager {
    constructor() {
        this.currentCareer = null;
        this.currentCategory = null;
        this.currentQuestion = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.init();
    }

    async init() {
        try {
            await this.loadCareers();
            this.bindEvents();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('系统初始化失败，请刷新页面重试');
        }
    }

    // 加载职业列表
    async loadCareers() {
        try {
            const response = await fetch('/api/careers');
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                // 从URL参数获取职业ID，如果没有则默认选择第一个职业
                const urlParams = new URLSearchParams(window.location.search);
                const careerParam = urlParams.get('career');
                
                if (careerParam) {
                    // 根据职业名称或ID查找对应的职业
                    this.currentCareer = result.data.find(career => 
                        career.name === careerParam || career.id.toString() === careerParam
                    ) || result.data[0];
                } else {
                    // 默认选择第一个职业
                    this.currentCareer = result.data[0];
                }
                
                this.updatePageTitle();
                await this.loadCategories(this.currentCareer.id);
            } else {
                this.showError('暂无可用的职业数据');
            }
        } catch (error) {
            console.error('加载职业列表失败:', error);
            this.showError('加载职业数据失败');
        }
    }

    // 更新页面标题和职业信息
    updatePageTitle() {
        if (this.currentCareer) {
            // 更新页面标题
            document.title = `${this.currentCareer.name}自由练习 - 智能面试系统`;
            
            // 更新职业名称显示
            const positionNameElement = document.querySelector('.position-name');
            if (positionNameElement) {
                positionNameElement.textContent = this.currentCareer.name;
            }
            
            // 根据职业设置合适的图标
            const positionIcon = document.querySelector('.position-info i');
            if (positionIcon && this.currentCareer.name.includes('数据')) {
                positionIcon.className = 'fas fa-database';
            } else if (positionIcon) {
                positionIcon.className = 'fas fa-briefcase';
            }
        }
    }

    // 加载题目分类
    async loadCategories(careerId) {
        try {
            const response = await fetch(`/api/careers/${careerId}/categories`);
            const result = await response.json();
            
            if (result.success) {
                this.renderCategories(result.data);
            } else {
                this.showError('加载题目分类失败');
            }
        } catch (error) {
            console.error('加载题目分类失败:', error);
            this.showError('加载题目分类失败');
        }
    }

    // 渲染题目分类
    renderCategories(categories) {
        const categoryContainer = document.querySelector('.category-list');
        if (!categoryContainer) return;

        categoryContainer.innerHTML = categories.map(category => `
            <div class="category-item" data-category-id="${category.id}" data-category-code="${category.code}">
                <i class="${category.icon || 'fas fa-folder'}"></i>
                <span>${category.name}</span>
                <div class="question-count">加载中...</div>
            </div>
        `).join('');

        // 加载每个分类的题目数量
        categories.forEach(category => {
            this.loadQuestionCount(category.id);
        });
    }

    // 加载题目数量
    async loadQuestionCount(categoryId) {
        try {
            const response = await fetch(`/api/categories/${categoryId}/questions`);
            const result = await response.json();
            
            const categoryItem = document.querySelector(`[data-category-id="${categoryId}"] .question-count`);
            if (categoryItem) {
                categoryItem.textContent = result.success ? `${result.data.length} 题` : '0 题';
            }
        } catch (error) {
            console.error('加载题目数量失败:', error);
        }
    }

    // 加载指定分类的题目列表
    async loadQuestions(categoryId) {
        try {
            const response = await fetch(`/api/categories/${categoryId}/questions`);
            const result = await response.json();
            
            if (result.success) {
                this.questions = result.data;
                this.currentQuestionIndex = 0;
                this.renderQuestionList(result.data);
                
                // 如果有题目，默认选择第一题
                if (result.data.length > 0) {
                    await this.loadQuestionDetail(result.data[0].id);
                }
            } else {
                this.showError('该分类下暂无题目');
                this.clearQuestionList();
            }
        } catch (error) {
            console.error('加载题目列表失败:', error);
            this.showError('加载题目列表失败');
        }
    }

    // 渲染题目列表
    renderQuestionList(questions) {
        const questionListContainer = document.querySelector('.question-list');
        if (!questionListContainer) return;

        questionListContainer.innerHTML = questions.map((question, index) => `
            <div class="question-item ${index === 0 ? 'active' : ''}" data-question-id="${question.id}">
                <div class="question-title">${question.title}</div>
                <div class="question-meta">
                    <span class="difficulty ${question.difficulty}">${this.getDifficultyText(question.difficulty)}</span>
                    <span class="duration">${question.duration_min}-${question.duration_max}分钟</span>
                </div>
            </div>
        `).join('');
    }

    // 清空题目列表
    clearQuestionList() {
        const questionListContainer = document.querySelector('.question-list');
        if (questionListContainer) {
            questionListContainer.innerHTML = '<div class="no-questions">该分类下暂无题目</div>';
        }
        
        const questionDetailContainer = document.querySelector('.question-detail');
        if (questionDetailContainer) {
            questionDetailContainer.innerHTML = '<div class="no-question-selected">请选择一个题目开始练习</div>';
        }
    }

    // 加载题目详情
    async loadQuestionDetail(questionId) {
        try {
            const response = await fetch(`/api/questions/${questionId}`);
            const result = await response.json();
            
            if (result.success) {
                this.currentQuestion = result.data;
                this.renderQuestionDetail(result.data);
            } else {
                this.showError('加载题目详情失败');
            }
        } catch (error) {
            console.error('加载题目详情失败:', error);
            this.showError('加载题目详情失败');
        }
    }

    // 渲染题目详情
    renderQuestionDetail(question) {
        const detailContainer = document.querySelector('.question-detail');
        if (!detailContainer) return;

        detailContainer.innerHTML = `
            <div class="question-header">
                <div class="question-category">${question.category_name}</div>
                <div class="question-difficulty ${question.difficulty}">${this.getDifficultyText(question.difficulty)}</div>
            </div>
            
            <div class="practice-timer">
                <div class="timer-display">
                    <span class="time-left">00:00</span>
                    <span class="time-total">/ ${question.duration_max}:00</span>
                </div>
                <button class="timer-btn" onclick="practiceManager.toggleTimer()">
                    <i class="fas fa-play"></i> 开始计时
                </button>
            </div>
            
            <div class="question-content">
                <h3 class="question-title">${question.title}</h3>
                <div class="question-description">${question.content}</div>
                ${question.details ? `<div class="question-details">${question.details}</div>` : ''}
            </div>
            
            <div class="question-resources">
                <h4>参考资料</h4>
                <div class="resource-list">
                    ${question.resources.map(resource => `
                        <a href="${resource.url}" class="resource-item" target="_blank">
                            <i class="${resource.icon || 'fas fa-link'}"></i>
                            <span>${resource.title}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;

        // 设置计时器时间
        this.timeLeft = question.duration_max * 60; // 转换为秒
        this.updateTimerDisplay();
    }

    // 绑定事件
    bindEvents() {
        // 分类选择事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-item')) {
                const categoryItem = e.target.closest('.category-item');
                const categoryId = categoryItem.dataset.categoryId;
                
                // 更新选中状态
                document.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('active');
                });
                categoryItem.classList.add('active');
                
                // 加载题目列表
                this.loadQuestions(categoryId);
            }
        });

        // 题目选择事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.question-item')) {
                const questionItem = e.target.closest('.question-item');
                const questionId = questionItem.dataset.questionId;
                
                // 更新选中状态
                document.querySelectorAll('.question-item').forEach(item => {
                    item.classList.remove('active');
                });
                questionItem.classList.add('active');
                
                // 停止当前计时器
                this.stopTimer();
                
                // 加载题目详情
                this.loadQuestionDetail(questionId);
            }
        });
    }

    // 切换计时器
    toggleTimer() {
        if (this.timer) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    // 开始计时
    startTimer() {
        if (!this.currentQuestion) return;
        
        const timerBtn = document.querySelector('.timer-btn');
        if (timerBtn) {
            timerBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停计时';
        }
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.showTimeUp();
            }
        }, 1000);
    }

    // 停止计时
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            
            const timerBtn = document.querySelector('.timer-btn');
            if (timerBtn) {
                timerBtn.innerHTML = '<i class="fas fa-play"></i> 开始计时';
            }
        }
    }

    // 更新计时器显示
    updateTimerDisplay() {
        const timeDisplay = document.querySelector('.time-left');
        if (timeDisplay) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // 时间到提醒
    showTimeUp() {
        alert('时间到！建议总结一下你的回答要点。');
    }

    // 获取难度文本
    getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        return difficultyMap[difficulty] || '中等';
    }

    // 显示错误信息
    showError(message) {
        console.error(message);
        // 可以在这里添加更友好的错误提示UI
        const errorContainer = document.querySelector('.error-message');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    }
}

// 全局实例
let practiceManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    practiceManager = new PracticeManager();
});