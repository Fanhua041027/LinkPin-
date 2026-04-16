// 登录认证相关功能

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

// 初始化认证页面
function initializeAuth() {
    setupEventListeners();
    checkAutoLogin();
}

// 设置事件监听器
function setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const togglePassword = document.getElementById('toggle-password');
    const demoLogin = document.getElementById('demo-login');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    if (demoLogin) {
        demoLogin.addEventListener('click', handleDemoLogin);
    }
}

// 处理登录表单提交
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 表单验证
    if (!validateLoginForm(username, password)) {
        return;
    }
    
    try {
        // 发送登录请求到后端API
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // 登录成功
            showMessage('登录成功！', 'success');
            
            // 保存用户信息
            saveUserInfo(result.user, false);
            
            // 延迟跳转
            setTimeout(() => {
                redirectAfterLogin(result.user.role);
            }, 1000);
        } else {
            // 登录失败
            showMessage(result.message || '登录失败，请检查用户名和密码', 'error');
        }
    } catch (error) {
        console.error('登录请求失败:', error);
        showMessage('网络连接失败，请稍后重试', 'error');
    }
}

// 处理注册表单提交
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // 表单验证
    if (!validateRegisterForm(username, password, confirmPassword)) {
        return;
    }
    
    try {
        // 发送注册请求到后端API
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // 注册成功
            showMessage('注册成功！请登录', 'success');
            
            // 延迟跳转到登录页面
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            // 注册失败
            showMessage(result.message || '注册失败，请重试', 'error');
        }
    } catch (error) {
        console.error('注册请求失败:', error);
        showMessage('网络连接失败，请稍后重试', 'error');
    }
}

// 表单验证
function validateLoginForm(username, password) {
    if (!username) {
        showMessage('请输入用户名', 'error');
        return false;
    }
    
    if (!password) {
        showMessage('请输入密码', 'error');
        return false;
    }
    
    return true;
}

// 注册表单验证
function validateRegisterForm(username, password, confirmPassword) {
    if (!username) {
        showMessage('请输入用户名', 'error');
        return false;
    }
    
    if (username.length < 3) {
        showMessage('用户名长度不能少于3位', 'error');
        return false;
    }
    
    if (!password) {
        showMessage('请输入密码', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showMessage('密码长度不能少于6位', 'error');
        return false;
    }
    
    if (!confirmPassword) {
        showMessage('请确认密码', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return false;
    }
    
    return true;
}

// 切换密码可见性
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('#toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// 处理游客体验
async function handleDemoLogin() {
    showLoading(true);
    
    try {
        // 使用演示账号登录API
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser',
                password: '123456'
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage('正在进入体验模式...', 'success');
            saveUserInfo(result.user, false);
            
            setTimeout(() => {
                redirectAfterLogin(result.user.role);
            }, 1500);
        } else {
            // 如果API失败，使用本地演示数据
            const demoUser = {
                id: 'demo',
                username: '游客用户',
                role: 'user',
                avatar: 'images/default-avatar.svg'
            };
            
            showMessage('正在进入体验模式...', 'success');
            saveUserInfo(demoUser, false);
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    } catch (error) {
        console.error('演示登录失败:', error);
        // 网络错误时使用本地演示数据
        const demoUser = {
            id: 'demo',
            username: '游客用户',
            role: 'user',
            avatar: 'images/default-avatar.svg'
        };
        
        showMessage('正在进入体验模式...', 'success');
        saveUserInfo(demoUser, false);
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } finally {
        showLoading(false);
    }
}

// 保存用户信息
function saveUserInfo(user, rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem('userInfo', JSON.stringify(user));
    storage.setItem('userToken', 'logged_in_' + Date.now()); // 生成简单的token
    storage.setItem('isLoggedIn', 'true');
    storage.setItem('loginTime', new Date().toISOString());
    
    // 同时保存到localStorage以确保dashboard页面能检测到
    localStorage.setItem('userInfo', JSON.stringify(user));
    localStorage.setItem('userToken', 'logged_in_' + Date.now());
}

// 根据用户角色跳转
function redirectAfterLogin(role) {
    if (role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}

// 检查自动登录
function checkAutoLogin() {
    // 只在登录和注册页面检查自动登录
    const currentPage = window.location.pathname;
    if (!currentPage.includes('login.html') && !currentPage.includes('register.html')) {
        return;
    }
    
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    
    if (userInfo && isLoggedIn === 'true') {
        const user = JSON.parse(userInfo);
        showMessage('检测到已登录状态，正在跳转...', 'info');
        
        setTimeout(() => {
            redirectAfterLogin(user.role);
        }, 1000);
    }
}

// 显示加载状态
function showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// 显示消息提示
function showMessage(message, type = 'info') {
    const toast = document.getElementById('message-toast');
    
    // 如果页面没有toast元素，使用alert作为备选方案
    if (!toast) {
        alert(message);
        return;
    }
    
    const icon = toast.querySelector('.toast-icon');
    const messageSpan = toast.querySelector('.toast-message');
    
    // 设置图标
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    if (icon) {
        icon.className = `toast-icon ${icons[type] || icons.info}`;
    }
    if (messageSpan) {
        messageSpan.textContent = message;
    }
    
    // 设置样式类
    toast.className = `message-toast ${type}`;
    toast.style.display = 'flex';
    
    // 自动隐藏
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// 退出登录
function logout() {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('loginTime');
    
    showMessage('已退出登录', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// 获取当前用户信息
function getCurrentUser() {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
}

// 检查用户是否已登录
function isUserLoggedIn() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    return isLoggedIn === 'true';
}

// 检查用户权限
function checkUserPermission(requiredRole) {
    const user = getCurrentUser();
    if (!user || !isUserLoggedIn()) {
        return false;
    }
    
    if (requiredRole === 'admin' && user.role !== 'admin') {
        return false;
    }
    
    return true;
}