// 全局退出登录功能
// 可在所有页面使用的通用退出模块

// 全局退出函数
function globalLogout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除所有登录相关的存储数据
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        sessionStorage.removeItem('userInfo');
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('loginTime');
        
        // 显示退出提示
        showGlobalMessage('已退出登录', 'success');
        
        // 延迟跳转到首页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// 全局消息显示函数
function showGlobalMessage(message, type = 'info') {
    // 检查是否存在message-toast元素
    let toast = document.getElementById('message-toast');
    
    if (toast) {
        // 使用现有的toast元素
        const icon = toast.querySelector('.toast-icon');
        const messageSpan = toast.querySelector('.toast-message');
        
        if (icon && messageSpan) {
            // 设置图标
            icon.className = `toast-icon fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle'
            }`;
            
            // 设置消息文本
            messageSpan.textContent = message;
            
            // 设置toast类型
            toast.className = `message-toast ${type}`;
            
            // 显示toast
            toast.style.display = 'flex';
            
            // 3秒后隐藏
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        } else {
            // 如果toast结构不完整，使用alert
            alert(message);
        }
    } else {
        // 如果没有toast元素，使用alert作为后备
        alert(message);
    }
}

// 初始化全局退出功能
function initGlobalLogout() {
    // 使用事件委托处理所有退出按钮（包括动态添加的）
    document.addEventListener('click', function(e) {
        const target = e.target.closest('[data-action="logout"], .logout-btn, #logout-btn');
        if (target) {
            e.preventDefault();
            globalLogout();
        }
    });
    
    // 监听键盘快捷键 Ctrl+Shift+L 退出登录
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            globalLogout();
        }
    });
}

// 检查登录状态的通用函数
function checkGlobalLoginStatus() {
    const userToken = localStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo');
    return userToken && userInfo;
}

// 获取当前用户信息的通用函数
function getGlobalCurrentUser() {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initGlobalLogout();
});

// 导出函数供其他脚本使用
window.globalLogoutFunctions = {
    globalLogout,
    showGlobalMessage,
    checkGlobalLoginStatus,
    getGlobalCurrentUser,
    initGlobalLogout
};