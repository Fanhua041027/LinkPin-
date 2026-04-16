// 雷达图绘制库

class RadarChart {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            radius: options.radius || 150,
            levels: options.levels || 5,
            maxValue: options.maxValue || 100,
            labelFont: options.labelFont || '14px Arial',
            gridColor: options.gridColor || '#e1e5f2',
            axisColor: options.axisColor || '#e1e5f2',
            dataColor: options.dataColor || '#667eea',
            dataFillColor: options.dataFillColor || 'rgba(102, 126, 234, 0.3)',
            pointColor: options.pointColor || '#667eea',
            pointRadius: options.pointRadius || 4,
            lineWidth: options.lineWidth || 2,
            ...options
        };
        
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
    }
    
    // 绘制雷达图
    draw(data, labels) {
        this.clear();
        this.drawGrid();
        this.drawAxes(labels);
        this.drawData(data);
        this.drawLabels(labels);
    }
    
    // 清空画布
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // 绘制网格
    drawGrid() {
        const { ctx, centerX, centerY, options } = this;
        
        ctx.strokeStyle = options.gridColor;
        ctx.lineWidth = 1;
        
        // 绘制同心圆
        for (let i = 1; i <= options.levels; i++) {
            const radius = (options.radius / options.levels) * i;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            
            // 绘制等级标签
            ctx.fillStyle = '#999';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            const value = Math.round((options.maxValue / options.levels) * i);
            ctx.fillText(value.toString(), centerX + radius - 10, centerY - 5);
        }
    }
    
    // 绘制轴线
    drawAxes(labels) {
        const { ctx, centerX, centerY, options } = this;
        
        ctx.strokeStyle = options.axisColor;
        ctx.lineWidth = 1;
        
        const angleStep = (2 * Math.PI) / labels.length;
        
        for (let i = 0; i < labels.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * options.radius,
                centerY + Math.sin(angle) * options.radius
            );
            ctx.stroke();
        }
    }
    
    // 绘制数据
    drawData(data) {
        const { ctx, centerX, centerY, options } = this;
        
        if (!data || data.length === 0) return;
        
        const angleStep = (2 * Math.PI) / data.length;
        const points = [];
        
        // 计算所有点的坐标
        for (let i = 0; i < data.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const value = Math.min(data[i], options.maxValue) / options.maxValue;
            const x = centerX + Math.cos(angle) * options.radius * value;
            const y = centerY + Math.sin(angle) * options.radius * value;
            points.push({ x, y });
        }
        
        // 绘制填充区域
        ctx.fillStyle = options.dataFillColor;
        ctx.strokeStyle = options.dataColor;
        ctx.lineWidth = options.lineWidth;
        
        ctx.beginPath();
        if (points.length > 0) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        
        // 绘制数据点
        ctx.fillStyle = options.pointColor;
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, options.pointRadius, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // 绘制数值标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        points.forEach((point, index) => {
            const value = data[index];
            ctx.fillText(value.toString(), point.x, point.y - 10);
        });
    }
    
    // 绘制标签
    drawLabels(labels) {
        const { ctx, centerX, centerY, options } = this;
        
        ctx.fillStyle = '#333';
        ctx.font = options.labelFont;
        
        const angleStep = (2 * Math.PI) / labels.length;
        const labelRadius = options.radius + 30;
        
        for (let i = 0; i < labels.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * labelRadius;
            const y = centerY + Math.sin(angle) * labelRadius;
            
            // 根据角度调整文本对齐方式
            if (angle > -Math.PI / 2 && angle < Math.PI / 2) {
                ctx.textAlign = 'left';
            } else {
                ctx.textAlign = 'right';
            }
            
            ctx.textBaseline = 'middle';
            ctx.fillText(labels[i], x, y);
        }
    }
    
    // 动画绘制
    animatedDraw(data, labels, duration = 1000) {
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easeProgress = this.easeOutCubic(progress);
            
            // 计算当前数据
            const currentData = data.map(value => value * easeProgress);
            
            this.draw(currentData, labels);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    // 缓动函数
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // 更新数据
    updateData(data, labels, animated = true) {
        if (animated) {
            this.animatedDraw(data, labels);
        } else {
            this.draw(data, labels);
        }
    }
    
    // 导出为图片
    exportAsImage(filename = 'radar-chart.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    // 获取点击位置对应的数据索引
    getDataIndexAtPoint(x, y, data, labels) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;
        
        const angleStep = (2 * Math.PI) / data.length;
        let minDistance = Infinity;
        let closestIndex = -1;
        
        for (let i = 0; i < data.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const value = Math.min(data[i], this.options.maxValue) / this.options.maxValue;
            const pointX = this.centerX + Math.cos(angle) * this.options.radius * value;
            const pointY = this.centerY + Math.sin(angle) * this.options.radius * value;
            
            const distance = Math.sqrt(
                Math.pow(canvasX - pointX, 2) + Math.pow(canvasY - pointY, 2)
            );
            
            if (distance < minDistance && distance < 20) {
                minDistance = distance;
                closestIndex = i;
            }
        }
        
        return closestIndex;
    }
}

// 工具函数：创建雷达图
function createRadarChart(canvasId, data, labels, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with id '${canvasId}' not found`);
        return null;
    }
    
    const chart = new RadarChart(canvas, options);
    chart.draw(data, labels);
    return chart;
}

// 工具函数：创建动画雷达图
function createAnimatedRadarChart(canvasId, data, labels, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with id '${canvasId}' not found`);
        return null;
    }
    
    const chart = new RadarChart(canvas, options);
    chart.animatedDraw(data, labels);
    return chart;
}

// 预设配置
const RadarChartPresets = {
    // 面试评测雷达图配置
    interview: {
        radius: 120,
        levels: 5,
        maxValue: 100,
        gridColor: '#e1e5f2',
        dataColor: '#667eea',
        dataFillColor: 'rgba(102, 126, 234, 0.2)',
        pointColor: '#667eea',
        pointRadius: 5,
        lineWidth: 2
    },
    
    // 技能评估雷达图配置
    skills: {
        radius: 100,
        levels: 4,
        maxValue: 10,
        gridColor: '#f0f0f0',
        dataColor: '#28a745',
        dataFillColor: 'rgba(40, 167, 69, 0.2)',
        pointColor: '#28a745',
        pointRadius: 4,
        lineWidth: 2
    },
    
    // 性能指标雷达图配置
    performance: {
        radius: 140,
        levels: 5,
        maxValue: 100,
        gridColor: '#dee2e6',
        dataColor: '#fd7e14',
        dataFillColor: 'rgba(253, 126, 20, 0.2)',
        pointColor: '#fd7e14',
        pointRadius: 6,
        lineWidth: 3
    }
};

// 导出到全局
if (typeof window !== 'undefined') {
    window.RadarChart = RadarChart;
    window.createRadarChart = createRadarChart;
    window.createAnimatedRadarChart = createAnimatedRadarChart;
    window.RadarChartPresets = RadarChartPresets;
}

// 模块导出（如果支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RadarChart,
        createRadarChart,
        createAnimatedRadarChart,
        RadarChartPresets
    };
}