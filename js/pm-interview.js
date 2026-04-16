// 产品经理面试页面JavaScript功能

// 产品经理面试页面特有的全局变量
let userStream = null;
let currentFocus = null;
let currentChallenge = null;
let trainingProgress = 0;
let feedbackTimer = null;

// 训练焦点数据
const trainingFocuses = {
    "product-design": {
        name: "产品设计",
        icon: "fas fa-palette",
        description: "用户体验与产品设计",
        challenges: [
            {
                id: 1,
                type: "设计挑战",
                difficulty: "intermediate",
                title: "移动端购物车优化",
                description: "某电商APP的购物车转化率较低，用户经常在购物车页面流失。请分析可能的原因并提出优化方案，包括界面设计、交互流程和功能改进。",
                context: "电商APP购物车页面用户体验优化项目",
                participants: ["产品经理", "UI设计师", "前端工程师", "数据分析师"],
                materials: ["用户行为数据", "竞品分析报告", "用户反馈"],
                tools: ["原型工具", "数据分析", "用户调研", "A/B测试"]
            },
            {
                id: 2,
                type: "用户研究",
                difficulty: "advanced",
                title: "新功能用户接受度评估",
                description: "公司计划推出AI智能推荐功能，需要评估用户接受度和潜在风险。请设计用户研究方案，包括调研方法、样本选择、问题设计和结果分析框架。",
                context: "AI推荐功能上线前用户研究项目",
                participants: ["产品经理", "用户研究员", "AI工程师", "运营经理"],
                materials: ["功能原型", "用户画像", "市场调研"],
                tools: ["问卷调查", "用户访谈", "可用性测试", "数据分析"]
            }
        ]
    },
    "data-analysis": {
        name: "数据分析",
        icon: "fas fa-chart-line",
        description: "数据驱动的产品决策",
        challenges: [
            {
                id: 3,
                type: "数据分析",
                difficulty: "intermediate",
                title: "用户留存率下降分析",
                description: "产品的7日留存率从65%下降到45%，需要找出原因并制定改进策略。请分析可能的影响因素，设计分析框架，并提出数据驱动的解决方案。",
                context: "用户留存率异常下降问题分析",
                participants: ["产品经理", "数据分析师", "运营经理", "技术负责人"],
                materials: ["用户行为数据", "产品更新日志", "市场环境报告"],
                tools: ["SQL查询", "数据可视化", "漏斗分析", "队列分析"]
            },
            {
                id: 4,
                type: "指标设计",
                difficulty: "advanced",
                title: "新业务线KPI体系设计",
                description: "公司即将推出在线教育业务，需要建立完整的KPI指标体系。请设计北极星指标、关键指标和支撑指标，并说明指标间的逻辑关系和监控方案。",
                context: "在线教育新业务线指标体系建设",
                participants: ["产品总监", "业务负责人", "数据团队", "财务团队"],
                materials: ["业务规划", "竞品指标", "行业报告"],
                tools: ["指标建模", "数据埋点", "报表设计", "预警系统"]
            }
        ]
    },
    "strategy-planning": {
        name: "战略规划",
        icon: "fas fa-chess",
        description: "产品战略与规划能力",
        challenges: [
            {
                id: 5,
                type: "战略规划",
                difficulty: "advanced",
                title: "产品路线图制定",
                description: "基于市场变化和用户需求，制定未来12个月的产品路线图。需要考虑技术可行性、资源分配、竞争态势和商业目标，并制定里程碑和风险应对策略。",
                context: "年度产品规划会议",
                participants: ["CEO", "CTO", "产品总监", "技术总监", "市场总监"],
                materials: ["市场分析报告", "技术架构图", "竞品动态", "用户反馈"],
                tools: ["SWOT分析", "优先级矩阵", "甘特图", "风险评估"]
            },
            {
                id: 6,
                type: "竞品分析",
                difficulty: "intermediate",
                title: "竞争对手策略分析",
                description: "主要竞争对手推出了新功能并获得良好市场反响，需要分析其产品策略、功能特点和市场定位，评估对我们的影响并制定应对策略。",
                context: "竞品新功能影响评估项目",
                participants: ["产品经理", "市场分析师", "技术架构师", "运营经理"],
                materials: ["竞品功能体验", "市场数据", "用户反馈", "技术分析"],
                tools: ["功能对比", "市场调研", "PEST分析", "战略画布"]
            }
        ]
    },
    "team-communication": {
        name: "团队协作",
        icon: "fas fa-users",
        description: "跨部门沟通与协作",
        challenges: [
            {
                id: 7,
                type: "沟通协调",
                difficulty: "intermediate",
                title: "跨部门项目协调",
                description: "一个涉及产品、技术、运营、市场四个部门的重要项目出现进度延迟和资源冲突。作为产品经理，需要协调各方利益，重新制定项目计划并确保顺利推进。",
                context: "Q4重点项目推进会议",
                participants: ["产品经理", "技术经理", "运营经理", "市场经理", "项目经理"],
                materials: ["项目计划", "资源分配表", "风险清单", "里程碑报告"],
                tools: ["项目管理", "沟通计划", "冲突解决", "决策矩阵"]
            },
            {
                id: 8,
                type: "需求管理",
                difficulty: "advanced",
                title: "需求优先级冲突处理",
                description: "销售团队、客服团队和运营团队同时提出了紧急需求，但开发资源有限。需要评估各需求的价值和紧急程度，制定合理的优先级排序和沟通策略。",
                context: "需求评审委员会会议",
                participants: ["产品总监", "销售总监", "客服经理", "运营总监", "技术总监"],
                materials: ["需求文档", "业务影响分析", "技术评估", "资源计划"],
                tools: ["价值评估", "影响分析", "优先级矩阵", "沟通策略"]
            }
        ]
    }
};

// 实时反馈数据
const feedbackTemplates = [
    {
        type: "思路清晰",
        content: "分析思路清晰，逻辑性强，能够系统性地思考问题。"
    },
    {
        type: "用户导向",
        content: "很好地体现了用户导向思维，能够从用户角度思考问题。"
    },
    {
        type: "数据驱动",
        content: "注重数据分析，能够用数据支撑观点和决策。"
    },
    {
        type: "商业敏感",
        content: "展现了良好的商业敏感度，能够平衡用户需求和商业目标。"
    },
    {
        type: "沟通表达",
        content: "表达清晰，重点突出，具有很好的沟通说服力。"
    }
];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeInterview();
    setupEventListeners();
    renderFocusOptions();
    initializeCamera();
    startFeedbackSystem();
});

// 初始化面试
function initializeInterview() {
    // 从localStorage获取面试信息
    const selectedPosition = localStorage.getItem('selectedPosition') || '产品经理';
    const selectedMode = localStorage.getItem('selectedMode') || '专项训练';
    
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
    
    // 训练控制按钮
    document.getElementById('start-challenge')?.addEventListener('click', startChallenge);
    document.getElementById('finish-challenge')?.addEventListener('click', finishChallenge);
    document.getElementById('next-challenge')?.addEventListener('click', nextChallenge);
    
    // 工具面板按钮
    document.getElementById('whiteboard-tool')?.addEventListener('click', openWhiteboard);
    document.getElementById('timer-tool')?.addEventListener('click', toggleTimer);
    document.getElementById('notes-tool')?.addEventListener('click', openNotes);
    document.getElementById('help-tool')?.addEventListener('click', showHelp);
    
    // 结束面试按钮
    document.getElementById('end-interview')?.addEventListener('click', endInterview);
}

// 渲染焦点选项
function renderFocusOptions() {
    const focusContainer = document.querySelector('.focus-options');
    
    Object.keys(trainingFocuses).forEach(focusKey => {
        const focus = trainingFocuses[focusKey];
        const focusElement = document.createElement('div');
        focusElement.className = 'focus-option';
        focusElement.dataset.focus = focusKey;
        
        focusElement.innerHTML = `
            <i class="${focus.icon}"></i>
            <h4>${focus.name}</h4>
            <p>${focus.description}</p>
        `;
        
        focusElement.addEventListener('click', () => selectFocus(focusKey));
        focusContainer.appendChild(focusElement);
    });
}

// 选择训练焦点
function selectFocus(focusKey) {
    currentFocus = focusKey;
    const focus = trainingFocuses[focusKey];
    
    // 更新UI
    document.querySelectorAll('.focus-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`[data-focus="${focusKey}"]`).classList.add('active');
    
    // 更新焦点信息
    document.querySelector('.focus-name').textContent = focus.name;
    
    // 加载第一个挑战
    if (focus.challenges.length > 0) {
        loadChallenge(focus.challenges[0]);
    }
    
    // 显示主要训练区域
    document.querySelector('.main-interview').style.display = 'flex';
}

// 加载挑战
function loadChallenge(challenge) {
    currentChallenge = challenge;
    
    // 更新挑战信息
    document.querySelector('.challenge-type span').textContent = challenge.type;
    document.querySelector('.challenge-title').textContent = challenge.title;
    document.querySelector('.challenge-description').textContent = challenge.description;
    
    // 更新难度标签
    const difficultyBadge = document.querySelector('.challenge-difficulty');
    difficultyBadge.className = `challenge-difficulty difficulty-${challenge.difficulty}`;
    difficultyBadge.textContent = getDifficultyText(challenge.difficulty);
    
    // 更新场景信息
    document.querySelector('.context-text').textContent = challenge.context;
    
    // 更新参与者列表
    const participantsList = document.querySelector('.participant-list');
    participantsList.innerHTML = '';
    challenge.participants.forEach(participant => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-user"></i>${participant}`;
        participantsList.appendChild(li);
    });
    
    // 更新材料列表
    const materialsList = document.querySelector('.material-list');
    materialsList.innerHTML = '';
    challenge.materials.forEach(material => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-file"></i><a href="#">${material}</a>`;
        materialsList.appendChild(li);
    });
    
    // 更新工具列表
    const toolsList = document.querySelector('.tool-list');
    toolsList.innerHTML = '';
    challenge.tools.forEach(tool => {
        const span = document.createElement('span');
        span.className = 'tool-item';
        span.textContent = tool;
        toolsList.appendChild(span);
    });
}

// 获取难度文本
function getDifficultyText(difficulty) {
    const difficultyMap = {
        'beginner': '初级',
        'intermediate': '中级',
        'advanced': '高级'
    };
    return difficultyMap[difficulty] || difficulty;
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
        
        updateInterviewerRole('准备就绪');
    } catch (error) {
        console.error('摄像头初始化失败:', error);
        updateInterviewerRole('设备连接失败');
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
            
            updateInterviewerRole('正在录制');
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
        
        updateInterviewerRole('录制完成');
    }
}

// 开始挑战
function startChallenge() {
    if (!currentChallenge) {
        alert('请先选择训练焦点');
        return;
    }
    
    // 自动开始录制
    if (!isRecording) {
        startRecording();
    }
    
    document.getElementById('start-challenge').style.display = 'none';
    document.getElementById('finish-challenge').style.display = 'inline-block';
    
    updateInterviewerRole('挑战进行中');
    updateTrainingProgress(25);
}

// 完成挑战
function finishChallenge() {
    if (isRecording) {
        stopRecording();
    }
    
    document.getElementById('finish-challenge').style.display = 'none';
    document.getElementById('next-challenge').style.display = 'inline-block';
    
    updateInterviewerRole('挑战完成');
    updateTrainingProgress(100);
    
    // 生成反馈
    generateFeedback();
}

// 下一个挑战
function nextChallenge() {
    const focus = trainingFocuses[currentFocus];
    const currentIndex = focus.challenges.findIndex(c => c.id === currentChallenge.id);
    
    if (currentIndex < focus.challenges.length - 1) {
        loadChallenge(focus.challenges[currentIndex + 1]);
        document.getElementById('next-challenge').style.display = 'none';
        document.getElementById('start-challenge').style.display = 'inline-block';
        updateTrainingProgress(0);
    } else {
        alert('恭喜！您已完成所有挑战。');
    }
}

// 更新训练进度
function updateTrainingProgress(progress) {
    trainingProgress = progress;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
    document.querySelector('.training-progress span').textContent = `${progress}%`;
}

// 启动反馈系统
function startFeedbackSystem() {
    feedbackTimer = setInterval(() => {
        if (isRecording) {
            generateRandomFeedback();
        }
    }, 30000); // 每30秒生成一次反馈
}

// 生成随机反馈
function generateRandomFeedback() {
    const randomFeedback = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
    addFeedbackItem(randomFeedback.type, randomFeedback.content);
}

// 生成挑战完成反馈
function generateFeedback() {
    const feedbacks = [
        { type: "整体表现", content: "很好地理解了问题的核心，分析全面且有深度。" },
        { type: "解决方案", content: "提出的解决方案具有可行性，考虑了多个维度的因素。" },
        { type: "沟通技巧", content: "表达清晰有条理，能够有效传达自己的观点。" }
    ];
    
    feedbacks.forEach((feedback, index) => {
        setTimeout(() => {
            addFeedbackItem(feedback.type, feedback.content);
        }, index * 2000);
    });
}

// 添加反馈项
function addFeedbackItem(type, content) {
    const feedbackContainer = document.querySelector('.realtime-feedback');
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';
    feedbackItem.innerHTML = `
        <div class="feedback-type">${type}</div>
        <div class="feedback-content">${content}</div>
    `;
    
    feedbackContainer.insertBefore(feedbackItem, feedbackContainer.firstChild);
    
    // 限制反馈项数量
    const items = feedbackContainer.querySelectorAll('.feedback-item');
    if (items.length > 5) {
        items[items.length - 1].remove();
    }
    
    // 更新统计
    updateTrainingStats();
}

// 更新训练统计
function updateTrainingStats() {
    const completedChallenges = Math.floor(Math.random() * 5) + 1;
    const totalTime = Math.floor(Math.random() * 120) + 30;
    
    document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = completedChallenges;
    document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = `${totalTime}min`;
}

// 工具面板功能
function openWhiteboard() {
    alert('白板工具已打开（模拟功能）');
}

function toggleTimer() {
    alert('计时器已启动（模拟功能）');
}

function openNotes() {
    alert('笔记工具已打开（模拟功能）');
}

function showHelp() {
    alert('帮助信息：\n1. 选择训练焦点开始练习\n2. 使用工具面板辅助思考\n3. 关注实时反馈提升表现');
}

// 更新面试官角色
function updateInterviewerRole(role) {
    document.querySelector('.interviewer-role').textContent = role;
}

// 结束面试
function endInterview() {
    if (confirm('确定要结束训练吗？')) {
        // 停止录制
        if (isRecording) {
            stopRecording();
        }
        
        // 关闭摄像头
        if (userStream) {
            userStream.getTracks().forEach(track => track.stop());
        }
        
        // 清理定时器
        if (feedbackTimer) {
            clearInterval(feedbackTimer);
        }
        
        // 返回主页
        window.location.href = 'interview.html';
    }
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
    }
    
    if (feedbackTimer) {
        clearInterval(feedbackTimer);
    }
});