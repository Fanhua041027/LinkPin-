// 首页主要功能脚本
// 处理导航栏动态登录/退出按钮切换

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    updateLoginButton();
});

// 初始化导航栏
function initNavigation() {
    // 汉堡菜单切换
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // 平滑滚动到锚点
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// 更新登录/退出按钮
function updateLoginButton() {
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;
    
    // 检查登录状态
    const userToken = localStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo');
    const isLoggedIn = userToken && userInfo;
    
    if (isLoggedIn) {
        // 已登录状态 - 显示退出按钮
        loginBtn.textContent = '退出';
        loginBtn.href = '#';
        loginBtn.setAttribute('data-action', 'logout');
        loginBtn.classList.remove('login-btn');
        loginBtn.classList.add('logout-btn');
        
        // 退出功能将由全局退出模块自动处理
    } else {
        // 未登录状态 - 显示登录按钮
        loginBtn.textContent = '登录';
        loginBtn.href = 'login.html';
        loginBtn.removeAttribute('data-action');
        loginBtn.classList.remove('logout-btn');
        loginBtn.classList.add('login-btn');
    }
}

// 退出登录功能已移至全局退出模块 (global-logout.js)
// 全局模块会自动处理带有 data-action="logout" 属性的按钮

// 监听存储变化，同步按钮状态
window.addEventListener('storage', function(e) {
    if (e.key === 'userToken' || e.key === 'userInfo') {
        updateLoginButton();
    }
});

// 导出函数供其他脚本使用
window.mainFunctions = {
    updateLoginButton
};