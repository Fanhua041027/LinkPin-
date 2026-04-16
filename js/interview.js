// 面试页面专用JavaScript

// 全局变量
let selectedPosition = null;
let selectedMode = null;
let currentQuestion = 1;
let totalQuestions = 10;
let interviewTimer = null;
let recordingTimer = null;
let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];
let cameraStream = null;
let microphoneStream = null;
let audioContext = null;
let recognition = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initInterviewSetup();
    initDeviceCheck();
    initInterviewSession();
    initResultPage();
    updateLoginStatus();
    
    // 绑定设备检测按钮
    const startCameraBtn = document.getElementById('start-camera-btn');
    const stopCameraBtn = document.getElementById('stop-camera-btn');
    const startMicBtn = document.getElementById('start-mic-btn');
    const stopMicBtn = document.getElementById('stop-mic-btn');
    
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', startCameraDetection);
    }
    if (stopCameraBtn) {
        stopCameraBtn.addEventListener('click', stopCameraDetection);
    }
    if (startMicBtn) {
        startMicBtn.addEventListener('click', startMicrophoneDetection);
    }
    if (stopMicBtn) {
        stopMicBtn.addEventListener('click', stopMicrophoneDetection);
    }
});

// 初始化面试设置
function initInterviewSetup() {
    // 岗位选择
    const positionCards = document.querySelectorAll('.position-card');
    positionCards.forEach(card => {
        card.addEventListener('click', function() {
            positionCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedPosition = this.dataset.position;
            checkStartButton();
        });
    });

    // 模式选择
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        card.addEventListener('click', function() {
            modeCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedMode = this.dataset.mode;
            checkStartButton();
        });
    });

    // 开始面试按钮
    const startBtn = document.getElementById('start-interview');
    if (startBtn) {
        startBtn.addEventListener('click', startInterview);
    }
}

// 检查是否可以开始面试
function checkStartButton() {
    const startBtn = document.getElementById('start-interview');
    
    if (startBtn && selectedPosition && selectedMode) {
        startBtn.disabled = false;
    }
}

// 设备检测功能
function initDeviceCheck() {
    const startCameraBtn = document.getElementById('start-camera');
    const stopCameraBtn = document.getElementById('stop-camera');
    const startMicBtn = document.getElementById('start-microphone');
    const stopMicBtn = document.getElementById('stop-microphone');
    const cameraPreview = document.getElementById('camera-preview');
    const cameraStatus = document.getElementById('camera-status');
    const micStatus = document.getElementById('mic-status');
    const speechPrompt = document.getElementById('speech-prompt');
    const speechResult = document.getElementById('speech-result');
    const speechText = document.getElementById('speech-text');
    
    // 摄像头检测
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', async function() {
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraPreview.srcObject = cameraStream;
                updateDeviceStatus(cameraStatus, 'success', '摄像头正常运行');
                
                startCameraBtn.style.display = 'none';
                stopCameraBtn.style.display = 'inline-block';
            } catch (error) {
                console.error('摄像头访问失败:', error);
                updateDeviceStatus(cameraStatus, 'error', '摄像头访问失败');
            }
        });
    }
    
    if (stopCameraBtn) {
        stopCameraBtn.addEventListener('click', function() {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraPreview.srcObject = null;
                cameraStream = null;
                updateDeviceStatus(cameraStatus, 'default', '摄像头未检测');
                
                stopCameraBtn.style.display = 'none';
                startCameraBtn.style.display = 'inline-block';
            }
        });
    }
    
    // 麦克风检测
    if (startMicBtn) {
        startMicBtn.addEventListener('click', async function() {
            try {
                microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                updateDeviceStatus(micStatus, 'success', '麦克风正常运行');
                
                // 显示语音提示
                speechPrompt.style.display = 'block';
                speechResult.style.display = 'block';
                
                // 创建音频分析器
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const microphone = audioContext.createMediaStreamSource(microphoneStream);
                microphone.connect(analyser);
                
                // 启动音频可视化
                startAudioVisualization(analyser);
                
                // 启动语音识别
                startSpeechRecognition(speechText);
                
                startMicBtn.style.display = 'none';
                stopMicBtn.style.display = 'inline-block';
            } catch (error) {
                console.error('麦克风访问失败:', error);
                updateDeviceStatus(micStatus, 'error', '麦克风访问失败');
            }
        });
    }
    
    if (stopMicBtn) {
        stopMicBtn.addEventListener('click', function() {
            if (microphoneStream) {
                microphoneStream.getTracks().forEach(track => track.stop());
                microphoneStream = null;
                updateDeviceStatus(micStatus, 'default', '麦克风未检测');
                
                // 隐藏语音相关元素
                speechPrompt.style.display = 'none';
                speechResult.style.display = 'none';
                
                // 停止音频上下文
                if (audioContext) {
                    audioContext.close();
                    audioContext = null;
                }
                
                // 停止语音识别
                if (recognition) {
                    recognition.stop();
                    recognition = null;
                }
                
                // 停止音频可视化
                const audioVisualizer = document.querySelector('.audio-visualizer');
                if (audioVisualizer) {
                    audioVisualizer.classList.remove('recording');
                }
                
                stopMicBtn.style.display = 'none';
                startMicBtn.style.display = 'inline-block';
            }
        });
    }
}

// 更新设备状态
function updateDeviceStatus(statusElement, type, message) {
    statusElement.classList.remove('success', 'error', 'default');
    statusElement.classList.add(type);
    
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-times-circle"></i>';
            break;
        default:
            icon = '<i class="fas fa-question-circle"></i>';
    }
    
    statusElement.innerHTML = icon + '<span>' + message + '</span>';
    checkStartButton();
}

// 摄像头开始检测
async function startCameraDetection() {
    const cameraPreview = document.getElementById('camera-preview');
    const cameraStatus = document.getElementById('camera-status');
    const startBtn = document.getElementById('start-camera-btn');
    const stopBtn = document.getElementById('stop-camera-btn');
    
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraPreview.srcObject = cameraStream;
        updateDeviceStatus(cameraStatus, 'success', '摄像头正常');
        
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
    } catch (error) {
        console.error('摄像头访问失败:', error);
        updateDeviceStatus(cameraStatus, 'error', '摄像头访问失败');
    }
}

// 摄像头停止检测
function stopCameraDetection() {
    const cameraPreview = document.getElementById('camera-preview');
    const cameraStatus = document.getElementById('camera-status');
    const startBtn = document.getElementById('start-camera-btn');
    const stopBtn = document.getElementById('stop-camera-btn');
    
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    cameraPreview.srcObject = null;
    updateDeviceStatus(cameraStatus, 'default', '摄像头未检测');
    
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
}

// 麦克风开始检测
async function startMicrophoneDetection() {
    const micStatus = document.getElementById('mic-status');
    const startBtn = document.getElementById('start-mic-btn');
    const stopBtn = document.getElementById('stop-mic-btn');
    const speechPrompt = document.querySelector('.speech-prompt');
    const speechResult = document.querySelector('.speech-result');
    const speechText = document.getElementById('speech-text');
    
    try {
        microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        updateDeviceStatus(micStatus, 'success', '麦克风正常');
        
        // 创建音频分析器
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(microphoneStream);
        microphone.connect(analyser);
        
        // 启动音频可视化
        startAudioVisualization(analyser);
        
        // 显示语音提示和结果区域
        speechPrompt.style.display = 'block';
        speechResult.style.display = 'block';
        
        // 启动语音识别
        startSpeechRecognition(speechText);
        
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
    } catch (error) {
        console.error('麦克风访问失败:', error);
        updateDeviceStatus(micStatus, 'error', '麦克风访问失败');
    }
}

// 麦克风停止检测
function stopMicrophoneDetection() {
    const micStatus = document.getElementById('mic-status');
    const startBtn = document.getElementById('start-mic-btn');
    const stopBtn = document.getElementById('stop-mic-btn');
    const speechPrompt = document.querySelector('.speech-prompt');
    const speechResult = document.querySelector('.speech-result');
    const speechText = document.getElementById('speech-text');
    
    // 停止麦克风流
    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
        microphoneStream = null;
    }
    
    // 停止音频上下文
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    
    // 停止语音识别
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    
    // 隐藏语音提示和结果区域
    speechPrompt.style.display = 'none';
    speechResult.style.display = 'none';
    speechText.textContent = '';
    
    updateDeviceStatus(micStatus, 'default', '麦克风未检测');
    
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
}

// 启动音频可视化
function startAudioVisualization(analyser) {
    const audioVisualizer = document.querySelector('.audio-visualizer');
    if (!audioVisualizer) return;
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function updateVisualization() {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        
        // 更新可视化效果
        const bars = audioVisualizer.querySelectorAll('.audio-bar');
        bars.forEach((bar, index) => {
            const height = Math.max(20, (average / 255) * 60 + Math.random() * 20);
            bar.style.height = height + 'px';
        });
        
        if (microphoneStream) {
            requestAnimationFrame(updateVisualization);
        }
    }
    
    updateVisualization();
}

// 启动语音识别
function startSpeechRecognition(speechTextElement) {
    // 检查浏览器是否支持语音识别
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        speechTextElement.textContent = '浏览器不支持语音识别功能';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    
    let finalTranscript = '';
    
    recognition.onstart = function() {
        speechTextElement.textContent = '正在监听...';
        const audioVisualizer = document.querySelector('.audio-visualizer');
        if (audioVisualizer) {
            audioVisualizer.classList.add('recording');
        }
    };
    
    recognition.onresult = function(event) {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        speechTextElement.innerHTML = finalTranscript + '<span style="color: #999;">' + interimTranscript + '</span>';
    };
    
    recognition.onerror = function(event) {
        console.error('语音识别错误:', event.error);
        speechTextElement.textContent = '语音识别出错: ' + event.error;
    };
    
    recognition.onend = function() {
        const audioVisualizer = document.querySelector('.audio-visualizer');
        if (audioVisualizer) {
            audioVisualizer.classList.remove('recording');
        }
    };
    
    recognition.start();
}

// 开始面试
function startInterview() {
    // 根据选择的岗位和模式跳转到对应页面
    const pageUrl = getInterviewPageUrl(selectedPosition, selectedMode);
    
    // 保存选择信息到localStorage
    localStorage.setItem('selectedPosition', selectedPosition);
    localStorage.setItem('selectedMode', selectedMode);
    
    // 跳转到对应页面
    window.location.href = pageUrl;
}

// 获取面试页面URL
function getInterviewPageUrl(position, mode) {
    // 自由练习模式统一跳转到free-interview.html并传递职业参数
    if (mode === 'free') {
        return `free-interview.html?career=${position}`;
    }
    
    // 其他模式根据岗位和模式组合生成页面名称，并添加career参数
    const pageMap = {
        'ai-timed': 'timed-interview.html', 
        'ai-focused': 'focused-interview.html',
        'bigdata-timed': 'timed-interview.html',
        'bigdata-focused': 'focused-interview.html',
        'iot-timed': 'timed-interview.html',
        'iot-focused': 'focused-interview.html',
        'pm-timed': 'timed-interview.html',
        'pm-focused': 'focused-interview.html'
    };
    
    const key = `${position}-${mode}`;
    const pageName = pageMap[key] || 'interview-session.html';
    return `${pageName}?career=${position}`; // 所有页面都添加career参数
}

// 更新面试信息
function updateInterviewInfo() {
    const positionNames = {
        'ai': '人工智能工程师',
        'bigdata': '大数据工程师',
        'iot': '物联网工程师',
        'pm': '产品经理'
    };
    
    const modeNames = {
        'free': '自由练习',
        'timed': '限时模拟',
        'focused': '专项训练'
    };
    
    document.querySelector('.position-name').textContent = positionNames[selectedPosition] || '未知岗位';
    document.querySelector('.mode-name').textContent = modeNames[selectedMode] || '未知模式';
}

// 启动用户视频
async function startUserVideo() {
    const userVideo = document.getElementById('user-video');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        userVideo.srcObject = stream;
    } catch (error) {
        console.error('无法启动用户视频:', error);
    }
}

// 开始面试计时
function startInterviewTimer() {
    let timeLeft = selectedMode === 'timed' ? 45 * 60 : 0; // 45分钟或无限制
    const timerElement = document.getElementById('timer');
    
    if (selectedMode === 'timed') {
        interviewTimer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                endInterview();
            }
        }, 1000);
    } else {
        // 正计时
        let elapsed = 0;
        interviewTimer = setInterval(() => {
            elapsed++;
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
}

// 开始录制
async function startRecording() {
    const userVideo = document.getElementById('user-video');
    
    try {
        const stream = userVideo.srcObject;
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // 开始录制计时
        startRecordingTimer();
    } catch (error) {
        console.error('录制启动失败:', error);
    }
}

// 录制计时
function startRecordingTimer() {
    let elapsed = 0;
    const recordingTimeElement = document.getElementById('recording-time');
    
    recordingTimer = setInterval(() => {
        elapsed++;
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        recordingTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// 显示问题
function showQuestion(questionNumber) {
    const questions = {
        1: {
            type: '技术问答',
            text: '请介绍一下您对机器学习中监督学习和无监督学习的理解，并举例说明它们的应用场景。',
            hints: ['可以从定义、特点、算法、应用等角度回答']
        },
        2: {
            type: '项目经历',
            text: '请详细介绍一个您参与过的技术项目，包括您的角色、遇到的挑战以及解决方案。',
            hints: ['重点描述技术难点和解决思路', '体现个人贡献和团队协作']
        },
        3: {
            type: '场景模拟',
            text: '假设您需要为一个电商平台设计推荐系统，请描述您的设计思路和技术选型。',
            hints: ['考虑用户画像、商品特征、算法选择', '关注系统性能和可扩展性']
        }
    };
    
    const question = questions[questionNumber] || questions[1];
    
    document.getElementById('question-type').textContent = question.type;
    document.getElementById('question-text').textContent = question.text;
    
    const hintsContainer = document.getElementById('question-hints');
    hintsContainer.innerHTML = '';
    question.hints.forEach(hint => {
        const hintElement = document.createElement('div');
        hintElement.className = 'hint-item';
        hintElement.innerHTML = `<i class="fas fa-lightbulb"></i><span>${hint}</span>`;
        hintsContainer.appendChild(hintElement);
    });
    
    // 更新进度
    document.getElementById('current-question').textContent = questionNumber;
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = `${(questionNumber / totalQuestions) * 100}%`;
}

// 初始化面试会话控制
function initInterviewSession() {
    // 视频控制
    const toggleVideoBtn = document.getElementById('toggle-video');
    const toggleAudioBtn = document.getElementById('toggle-audio');
    
    if (toggleVideoBtn) {
        toggleVideoBtn.addEventListener('click', toggleVideo);
    }
    
    if (toggleAudioBtn) {
        toggleAudioBtn.addEventListener('click', toggleAudio);
    }
    
    // 回答控制
    const pauseAnswerBtn = document.getElementById('pause-answer');
    const finishAnswerBtn = document.getElementById('finish-answer');
    const skipQuestionBtn = document.getElementById('skip-question');
    const endInterviewBtn = document.getElementById('end-interview');
    
    if (pauseAnswerBtn) {
        pauseAnswerBtn.addEventListener('click', pauseAnswer);
    }
    
    if (finishAnswerBtn) {
        finishAnswerBtn.addEventListener('click', finishAnswer);
    }
    
    if (skipQuestionBtn) {
        skipQuestionBtn.addEventListener('click', skipQuestion);
    }
    
    if (endInterviewBtn) {
        endInterviewBtn.addEventListener('click', endInterview);
    }
}

// 切换视频
function toggleVideo() {
    const userVideo = document.getElementById('user-video');
    const toggleBtn = document.getElementById('toggle-video');
    
    if (userVideo.srcObject) {
        const videoTracks = userVideo.srcObject.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !track.enabled;
            if (track.enabled) {
                toggleBtn.innerHTML = '<i class="fas fa-video"></i>';
                toggleBtn.classList.remove('disabled');
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
                toggleBtn.classList.add('disabled');
            }
        });
    }
}

// 切换音频
function toggleAudio() {
    const userVideo = document.getElementById('user-video');
    const toggleBtn = document.getElementById('toggle-audio');
    
    if (userVideo.srcObject) {
        const audioTracks = userVideo.srcObject.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
            if (track.enabled) {
                toggleBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                toggleBtn.classList.remove('disabled');
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                toggleBtn.classList.add('disabled');
            }
        });
    }
}

// 暂停回答
function pauseAnswer() {
    const pauseBtn = document.getElementById('pause-answer');
    
    if (isRecording) {
        mediaRecorder.pause();
        clearInterval(recordingTimer);
        pauseBtn.innerHTML = '<i class="fas fa-play"></i>继续';
        isRecording = false;
    } else {
        mediaRecorder.resume();
        startRecordingTimer();
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>暂停';
        isRecording = true;
    }
}

// 完成回答
function finishAnswer() {
    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        showQuestion(currentQuestion);
        
        // 重置录制计时
        clearInterval(recordingTimer);
        startRecordingTimer();
    } else {
        endInterview();
    }
}

// 跳过问题
function skipQuestion() {
    finishAnswer();
}

// 结束面试
function endInterview() {
    // 停止计时器
    if (interviewTimer) {
        clearInterval(interviewTimer);
    }
    
    if (recordingTimer) {
        clearInterval(recordingTimer);
    }
    
    // 停止录制
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    
    // 停止视频流
    const userVideo = document.getElementById('user-video');
    if (userVideo.srcObject) {
        userVideo.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // 显示结果页面
    document.getElementById('interview-session').classList.remove('active');
    document.getElementById('interview-result').classList.add('active');
    
    // 生成评测结果
    generateResults();
}

// 生成评测结果
function generateResults() {
    // 模拟评分数据
    const scores = {
        expression: 88,
        logic: 82,
        knowledge: 90,
        adaptability: 78,
        professionalism: 87
    };
    
    const overall = Math.round((scores.expression + scores.logic + scores.knowledge + scores.adaptability + scores.professionalism) / 5);
    
    // 更新总分
    document.getElementById('overall-score').textContent = overall;
    
    // 更新分项得分
    const scoreItems = document.querySelectorAll('.score-item');
    const scoreValues = Object.values(scores);
    
    scoreItems.forEach((item, index) => {
        const scoreFill = item.querySelector('.score-fill');
        const scoreNumber = item.querySelector('.score-number');
        
        if (scoreFill && scoreNumber && scoreValues[index]) {
            setTimeout(() => {
                scoreFill.style.width = `${scoreValues[index]}%`;
                scoreNumber.textContent = scoreValues[index];
            }, index * 200);
        }
    });
    
    // 绘制雷达图
    setTimeout(() => {
        drawRadarChart(scores);
    }, 1000);
}

// 初始化结果页面
function initResultPage() {
    // 标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // 切换按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 切换面板
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab + '-analysis') {
                    panel.classList.add('active');
                }
            });
        });
    });
}

// 绘制雷达图（简化版本）
function drawRadarChart(scores) {
    const canvas = document.getElementById('radar-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#e1e5f2';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 5) * i, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // 绘制轴线
    const labels = ['表达能力', '逻辑思维', '专业知识', '应变能力', '职业素养'];
    const angles = [];
    
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        angles.push(angle);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
        );
        ctx.stroke();
        
        // 绘制标签
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        const labelX = centerX + Math.cos(angle) * (radius + 20);
        const labelY = centerY + Math.sin(angle) * (radius + 20);
        ctx.fillText(labels[i], labelX, labelY);
    }
    
    // 绘制数据区域
    const scoreValues = Object.values(scores);
    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const value = scoreValues[i] / 100;
        const x = centerX + Math.cos(angles[i]) * radius * value;
        const y = centerY + Math.sin(angles[i]) * radius * value;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 绘制数据点
    ctx.fillStyle = '#667eea';
    for (let i = 0; i < 5; i++) {
        const value = scoreValues[i] / 100;
        const x = centerX + Math.cos(angles[i]) * radius * value;
        const y = centerY + Math.sin(angles[i]) * radius * value;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// 导出功能
function exportResults() {
    // 模拟导出PDF报告
    alert('评测报告导出功能开发中...');
}

// 重新面试
function restartInterview() {
    // 重置状态
    currentQuestion = 1;
    selectedPosition = null;
    selectedMode = null;
    
    // 清除选择状态
    document.querySelectorAll('.position-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 返回设置页面
    document.getElementById('interview-result').classList.remove('active');
    document.getElementById('interview-setup').classList.add('active');
    
    // 重置开始按钮
    document.getElementById('start-interview').disabled = true;
}

// 返回首页
function goHome() {
    window.location.href = 'index.html';
}

// 查看详细报告
function viewDetailedReport() {
    window.location.href = 'dashboard.html';
}

// 更新登录状态
function updateLoginStatus() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;
    
    // 检查登录状态
    const userToken = localStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo');
    const isLoggedIn = userToken && userInfo;
    
    if (isLoggedIn) {
        // 已登录状态 - 显示退出按钮
        logoutBtn.textContent = '退出';
        logoutBtn.href = '#';
        logoutBtn.setAttribute('data-action', 'logout');
        logoutBtn.style.display = 'block';
    } else {
        // 未登录状态 - 跳转到登录页面
        window.location.href = 'login.html';
    }
}

// 监听存储变化，同步登录状态
window.addEventListener('storage', function(e) {
    if (e.key === 'userToken' || e.key === 'userInfo') {
        updateLoginStatus();
    }
});