// 题目管理系统 JavaScript
let timuData = [];
let filteredData = [];
let currentEditId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadTimuData();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 筛选器事件
    document.getElementById('filterCareer').addEventListener('change', applyFilters);
    document.getElementById('filterCategory').addEventListener('change', applyFilters);
    document.getElementById('filterDifficulty').addEventListener('change', applyFilters);
    document.getElementById('filterTitle').addEventListener('input', applyFilters);
    
    // 表单提交事件
    document.getElementById('timuForm').addEventListener('submit', handleFormSubmit);
    
    // 模态框点击外部关闭
    document.getElementById('timuModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// 加载题目数据
async function loadTimuData() {
    try {
        showStatus('正在加载数据...', 'info');
        const response = await fetch('/api/timu');
        
        if (!response.ok) {
            throw new Error('获取数据失败');
        }
        
        timuData = await response.json();
        filteredData = [...timuData];
        
        updateCategoryFilter();
        renderTable();
        showStatus('数据加载成功', 'success');
        
    } catch (error) {
        console.error('加载数据失败:', error);
        showStatus('加载数据失败: ' + error.message, 'error');
    }
}

// 更新分类筛选器选项
function updateCategoryFilter() {
    const categoryFilter = document.getElementById('filterCategory');
    const categories = [...new Set(timuData.map(item => item.category))];
    
    // 清空现有选项（保留"全部分类"）
    categoryFilter.innerHTML = '<option value="">全部分类</option>';
    
    // 添加分类选项
    categories.forEach(category => {
        if (category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });
}

// 应用筛选器
function applyFilters() {
    const careerFilter = document.getElementById('filterCareer').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    const difficultyFilter = document.getElementById('filterDifficulty').value;
    const titleFilter = document.getElementById('filterTitle').value.toLowerCase();
    
    filteredData = timuData.filter(item => {
        return (
            (!careerFilter || item.career === careerFilter) &&
            (!categoryFilter || item.category === categoryFilter) &&
            (!difficultyFilter || item.difficulty === difficultyFilter) &&
            (!titleFilter || item.title.toLowerCase().includes(titleFilter))
        );
    });
    
    renderTable();
}

// 清除筛选器
function clearFilters() {
    document.getElementById('filterCareer').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterDifficulty').value = '';
    document.getElementById('filterTitle').value = '';
    
    filteredData = [...timuData];
    renderTable();
}

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('timuTableBody');
    tbody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #666;">暂无数据</td></tr>';
        return;
    }
    
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.career}</td>
            <td>${item.category}</td>
            <td>${item.title}</td>
            <td class="content-preview" title="${escapeHtml(item.content)}">${truncateText(item.content, 50)}</td>
            <td><span class="difficulty-badge difficulty-${item.difficulty}">${getDifficultyText(item.difficulty)}</span></td>
            <td>${item.resource_name || '-'}</td>
            <td>${item.resource_url ? `<a href="${item.resource_url}" target="_blank" class="resource-link">${item.resource_url}</a>` : '-'}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editTimu(${item.id})">
                    <i class="fas fa-edit"></i> 修改
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteTimu(${item.id})" style="margin-left: 5px;">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 获取难度文本
function getDifficultyText(difficulty) {
    const difficultyMap = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
    };
    return difficultyMap[difficulty] || difficulty;
}

// 截断文本
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 打开添加模态框
function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = '添加题目';
    document.getElementById('timuForm').reset();
    document.getElementById('timuId').value = '';
    document.getElementById('timuModal').style.display = 'block';
}

// 编辑题目
function editTimu(id) {
    const item = timuData.find(t => t.id === id);
    if (!item) {
        showStatus('找不到要编辑的题目', 'error');
        return;
    }
    
    currentEditId = id;
    document.getElementById('modalTitle').textContent = '编辑题目';
    
    // 填充表单数据
    document.getElementById('timuId').value = item.id;
    document.getElementById('career').value = item.career;
    document.getElementById('careerDescription').value = item.career_description || '';
    document.getElementById('category').value = item.category;
    document.getElementById('title').value = item.title;
    document.getElementById('content').value = item.content;
    document.getElementById('details').value = item.details || '';
    document.getElementById('difficulty').value = item.difficulty;
    document.getElementById('analysis').value = item.analysis || '';
    document.getElementById('resourceName').value = item.resource_name || '';
    document.getElementById('resourceUrl').value = item.resource_url || '';
    
    document.getElementById('timuModal').style.display = 'block';
}

// 删除题目
async function deleteTimu(id) {
    if (!confirm('确定要删除这个题目吗？此操作不可恢复。')) {
        return;
    }
    
    try {
        showStatus('正在删除...', 'info');
        
        const response = await fetch(`/api/timu/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('删除失败');
        }
        
        showStatus('删除成功', 'success');
        loadTimuData(); // 重新加载数据
        
    } catch (error) {
        console.error('删除失败:', error);
        showStatus('删除失败: ' + error.message, 'error');
    }
}

// 关闭模态框
function closeModal() {
    document.getElementById('timuModal').style.display = 'none';
    currentEditId = null;
}

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // 验证必填字段
    if (!data.career || !data.category || !data.title || !data.content) {
        showStatus('请填写所有必填字段', 'error');
        return;
    }
    
    try {
        showStatus('正在保存...', 'info');
        
        const url = currentEditId ? `/api/timu/${currentEditId}` : '/api/timu';
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('保存失败');
        }
        
        showStatus(currentEditId ? '更新成功' : '添加成功', 'success');
        closeModal();
        loadTimuData(); // 重新加载数据
        
    } catch (error) {
        console.error('保存失败:', error);
        showStatus('保存失败: ' + error.message, 'error');
    }
}

// 导出数据
function exportData() {
    try {
        const csvContent = convertToCSV(filteredData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `题目数据_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        showStatus('数据导出成功', 'success');
        
    } catch (error) {
        console.error('导出失败:', error);
        showStatus('导出失败: ' + error.message, 'error');
    }
}

// 转换为CSV格式
function convertToCSV(data) {
    const headers = ['ID', '职业', '职业描述', '分类', '标题', '内容', '详细要求', '难度', '解析', '资源名称', '资源链接'];
    const csvRows = [];
    
    // 添加标题行
    csvRows.push(headers.join(','));
    
    // 添加数据行
    data.forEach(item => {
        const row = [
            item.id,
            `"${item.career}"`,
            `"${item.career_description || ''}"`,
            `"${item.category}"`,
            `"${item.title}"`,
            `"${item.content.replace(/"/g, '""')}"`,
            `"${(item.details || '').replace(/"/g, '""')}"`,
            getDifficultyText(item.difficulty),
            `"${(item.analysis || '').replace(/"/g, '""')}"`,
            `"${item.resource_name || ''}"`,
            `"${item.resource_url || ''}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// 显示状态消息
function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
    statusDiv.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// 键盘事件处理
document.addEventListener('keydown', function(e) {
    // ESC键关闭模态框
    if (e.key === 'Escape') {
        closeModal();
    }
});