// AI工程师面试页面JavaScript功能

// AI面试页面特有的全局变量
let questionTimer = null;
let answerTimer = null;
let currentQuestionIndex = 0;
let interviewStartTime = null;
let questionStartTime = null;
let answerStartTime = null;
let userStream = null;

// 面试题目数据
const interviewQuestions = [
    {
        id: 1,
        category: "算法基础",
        text: "请解释一下时间复杂度和空间复杂度的概念，并举例说明O(n)、O(log n)、O(n²)的区别。",
        hints: ["可以从算法执行时间和内存占用两个维度来分析", "举例时可以使用常见的排序算法进行说明"]
    },
    {
        id: 2,
        category: "机器学习",
        text: "什么是过拟合和欠拟合？如何检测和解决这些问题？",
        hints: ["从模型复杂度和数据量的角度分析", "可以提及正则化、交叉验证等技术"]
    },
    {
        id: 3,
        category: "深度学习",
        text: "请解释反向传播算法的原理，以及梯度消失问题是如何产生的？",
        hints: ["从链式法则和梯度计算的角度解释", "可以讨论激活函数的选择对梯度的影响"]
    },
    {
        id: 4,
        category: "编程实践",
        text: "如何设计一个高并发的推荐系统？请从架构、缓存、数据库等方面进行分析。",
        hints: ["考虑微服务架构和分布式系统设计", "讨论Redis缓存和数据库分片策略"]
    },
    {
        id: 5,
        category: "系统设计",
        text: "设计一个能够处理百万级用户的实时聊天系统，需要考虑哪些技术要点？",
        hints: ["WebSocket连接管理和负载均衡", "消息队列和数据持久化策略"]
    },
    {
        id: 6,
        category: "数据结构",
        text: "请实现一个LRU缓存，并分析其时间复杂度。",
        hints: ["可以使用哈希表和双向链表的组合", "考虑get和put操作的效率"]
    },
    {
        id: 7,
        category: "算法优化",
        text: "给定一个大型数据集，如何高效地找出其中的重复元素？",
        hints: ["考虑内存限制和时间复杂度的平衡", "可以讨论布隆过滤器等概率数据结构"]
    },
    {
        id: 8,
        category: "AI应用",
        text: "在自然语言处理中，Transformer架构相比RNN有什么优势？",
        hints: ["从并行计算和长距离依赖两个角度分析", "可以提及注意力机制的作用"]
    },
    {
        id: 9,
        category: "项目经验",
        text: "描述一个你参与过的AI项目，遇到了什么技术挑战，是如何解决的？",
        hints: ["从问题定义、方案设计、实施过程三个阶段描述", "重点说明技术难点和创新点"]
    },
    {
        id: 10,
        category: "技术前沿",
        text: "谈谈你对大语言模型（如GPT、BERT）的理解，以及它们在实际应用中的局限性。",
        hints: ["从模型架构、训练方式、应用场景等角度分析", "讨论幻觉问题、计算成本等挑战"]
    }
];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeInterview();
    setupEventListeners();
    startInterview();
});

// 初始化面试
function initializeInterview() {
    // 从localStorage获取面试信息
    const selectedPosition = localStorage.getItem('selectedPosition') || 'AI工程师';
    const selectedMode = localStorage.getItem('selectedMode') || '限时面试';
    
    // 更新页面信息
    document.querySelector('.position-name').textContent = selectedPosition;
    document.querySelector('.mode-name').textContent = selectedMode;
    
    // 初始化题目进度
    updateQuestionProgress();
    
    // 显示第一题
    displayQuestion(0);
}

// 设置事件监听器
function setupEventListeners() {
    // 视频控制按钮
    document.getElementById('toggle-camera')?.addEventListener('click', toggleCamera);
    document.getElementById('toggle-mic')?.addEventListener('click', toggleMicrophone);
    document.getElementById('start-recording')?.addEventListener('click', startRecording);
    document.getElementById('stop-recording')?.addEventListener('click', stopRecording);
    
    // 答题控制按钮
    document.getElementById('start-answer')?.addEventListener('click', startAnswer);
    document.getElementById('finish-answer')?.addEventListener('click', finishAnswer);
    document.getElementById('skip-question')?.addEventListener('click', skipQuestion);
    
    // 题目导航按钮
    document.getElementById('prev-question')?.addEventListener('click', previousQuestion);
    document.getElementById('next-question')?.addEventListener('click', nextQuestion);
    
    // 结束面试按钮
    document.getElementById('end-interview')?.addEventListener('click', showEndModal);
    document.getElementById('confirm-end')?.addEventListener('click', endInterview);
    document.getElementById('cancel-end')?.addEventListener('click', hideEndModal);
    
    // 模态框关闭
    document.querySelector('.close-btn')?.addEventListener('click', hideEndModal);
}

// 开始面试
function startInterview() {
    interviewStartTime = new Date();
    startInterviewTimer();
    initializeCamera();
    updateStatus('面试进行中', 'success');
}

// 启动面试计时器
function startInterviewTimer() {
    const totalTime = 60 * 60; // 60分钟
    let remainingTime = totalTime;
    
    interviewTimer = setInterval(() => {
        remainingTime--;
        
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('interview-timer').textContent = timeString;
        
        if (remainingTime <= 0) {
            clearInterval(interviewTimer);
            endInterview();
        }
        
        // 时间警告
        if (remainingTime <= 300) { // 最后5分钟
            document.getElementById('interview-timer').style.color = '#ff6b6b';
        }
    }, 1000);
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
        
        updateStatus('摄像头已连接', 'success');
    } catch (error) {
        console.error('摄像头初始化失败:', error);
        updateStatus('摄像头连接失败', 'error');
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
            document.querySelector('.recording-indicator').style.display = 'flex';
            
            updateStatus('正在录制', 'recording');
        } catch (error) {
            console.error('录制启动失败:', error);
            updateStatus('录制启动失败', 'error');
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
        document.querySelector('.recording-indicator').style.display = 'none';
        
        updateStatus('录制已停止', 'success');
    }
}

// 显示题目
function displayQuestion(index) {
    if (index >= 0 && index < interviewQuestions.length) {
        const question = interviewQuestions[index];
        
        document.querySelector('.question-category span').textContent = question.category;
        document.getElementById('question-text').textContent = question.text;
        
        // 显示提示
        const hintsContainer = document.querySelector('.question-hints');
        hintsContainer.innerHTML = '';
        question.hints.forEach(hint => {
            const hintElement = document.createElement('div');
            hintElement.className = 'hint-item';
            hintElement.innerHTML = `<i class="fas fa-lightbulb"></i><span>${hint}</span>`;
            hintsContainer.appendChild(hintElement);
        });
        
        currentQuestionIndex = index;
        updateQuestionProgress();
        startQuestionTimer();
        
        // 更新导航按钮状态
        document.getElementById('prev-question').disabled = index === 0;
        document.getElementById('next-question').disabled = index === interviewQuestions.length - 1;
    }
}

// 更新题目进度
function updateQuestionProgress() {
    document.querySelector('.current-question').textContent = `第 ${currentQuestionIndex + 1} 题`;
    document.querySelector('.total-questions').textContent = `共 ${interviewQuestions.length} 题`;
    
    const progress = ((currentQuestionIndex + 1) / interviewQuestions.length) * 100;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
}

// 启动题目计时器
function startQuestionTimer() {
    clearInterval(questionTimer);
    questionStartTime = new Date();
    let questionTime = 0;
    
    questionTimer = setInterval(() => {
        questionTime++;
        const minutes = Math.floor(questionTime / 60);
        const seconds = questionTime % 60;
        
        document.getElementById('question-timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// 开始答题
function startAnswer() {
    answerStartTime = new Date();
    startAnswerTimer();
    
    document.getElementById('start-answer').style.display = 'none';
    document.getElementById('finish-answer').style.display = 'inline-block';
    
    // 自动开始录制
    if (!isRecording) {
        startRecording();
    }
}

// 启动答题计时器
function startAnswerTimer() {
    clearInterval(answerTimer);
    let answerTime = 0;
    
    answerTimer = setInterval(() => {
        answerTime++;
        const minutes = Math.floor(answerTime / 60);
        const seconds = answerTime % 60;
        
        document.getElementById('answer-timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// 完成答题
function finishAnswer() {
    clearInterval(answerTimer);
    
    document.getElementById('start-answer').style.display = 'inline-block';
    document.getElementById('finish-answer').style.display = 'none';
    document.getElementById('answer-timer').textContent = '00:00';
    
    // 停止录制
    if (isRecording) {
        stopRecording();
    }
    
    // 自动跳转到下一题
    setTimeout(() => {
        if (currentQuestionIndex < interviewQuestions.length - 1) {
            nextQuestion();
        }
    }, 1000);
}

// 跳过题目
function skipQuestion() {
    if (confirm('确定要跳过这道题吗？')) {
        finishAnswer();
    }
}

// 上一题
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        displayQuestion(currentQuestionIndex - 1);
    }
}

// 下一题
function nextQuestion() {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
        displayQuestion(currentQuestionIndex + 1);
    }
}

// 显示结束模态框
function showEndModal() {
    document.getElementById('end-modal').classList.add('show');
}

// 隐藏结束模态框
function hideEndModal() {
    document.getElementById('end-modal').classList.remove('show');
}

// 结束面试
function endInterview() {
    // 清理计时器
    clearInterval(interviewTimer);
    clearInterval(questionTimer);
    clearInterval(answerTimer);
    
    // 停止录制
    if (isRecording) {
        stopRecording();
    }
    
    // 关闭摄像头
    if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
    }
    
    // 保存面试结果
    const interviewResult = {
        position: localStorage.getItem('selectedPosition'),
        mode: localStorage.getItem('selectedMode'),
        startTime: interviewStartTime,
        endTime: new Date(),
        questionsCompleted: currentQuestionIndex + 1,
        totalQuestions: interviewQuestions.length
    };
    
    localStorage.setItem('interviewResult', JSON.stringify(interviewResult));
    
    // 返回主页
    window.location.href = 'interview.html';
}

// 更新状态
function updateStatus(message, type) {
    const statusElements = document.querySelectorAll('.status-item');
    
    // 更新第一个状态项
    if (statusElements.length > 0) {
        const statusElement = statusElements[0];
        statusElement.querySelector('span').textContent = message;
        
        // 更新图标
        const icon = statusElement.querySelector('i');
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                statusElement.style.color = '#28a745';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                statusElement.style.color = '#dc3545';
                break;
            case 'recording':
                icon.className = 'fas fa-circle';
                statusElement.style.color = '#ff6b6b';
                break;
            default:
                icon.className = 'fas fa-info-circle';
                statusElement.style.color = '#17a2b8';
        }
    }
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
    }
    
    clearInterval(interviewTimer);
    clearInterval(questionTimer);
    clearInterval(answerTimer);
});