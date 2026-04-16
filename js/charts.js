// 图表库 - 为dashboard页面提供图表功能

// 全局图表配置
const chartConfig = {
    colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#48bb78',
        warning: '#ed8936',
        error: '#f56565',
        info: '#4299e1',
        gray: '#a0aec0'
    },
    fonts: {
        family: 'Arial, sans-serif',
        size: {
            small: 12,
            medium: 14,
            large: 16
        }
    },
    animation: {
        duration: 1000,
        easing: 'easeOutCubic'
    }
};

// 图表工具类
class ChartUtils {
    // 缓动函数
    static easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // 颜色工具
    static hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // 生成渐变色
    static createGradient(ctx, x1, y1, x2, y2, colorStops) {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });
        return gradient;
    }
    
    // 格式化数值
    static formatNumber(num, decimals = 0) {
        return num.toFixed(decimals);
    }
    
    // 计算文本宽度
    static measureText(ctx, text, font) {
        ctx.save();
        ctx.font = font;
        const width = ctx.measureText(text).width;
        ctx.restore();
        return width;
    }
}

// 基础图表类
class BaseChart {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id '${canvasId}' not found`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.options = { ...this.getDefaultOptions(), ...options };
        this.data = [];
        this.animationId = null;
        this.isAnimating = false;
        
        this.setupCanvas();
    }
    
    getDefaultOptions() {
        return {
            padding: 40,
            backgroundColor: '#ffffff',
            gridColor: '#f0f0f0',
            textColor: '#666666',
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            animation: true,
            animationDuration: 1000
        };
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.width = rect.width;
        this.height = rect.height;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    setData(data) {
        this.data = data;
        return this;
    }
    
    render() {
        this.clear();
        this.draw();
        return this;
    }
    
    animate() {
        if (!this.options.animation) {
            this.render();
            return;
        }
        
        this.isAnimating = true;
        const startTime = Date.now();
        const duration = this.options.animationDuration;
        
        const animateFrame = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = ChartUtils.easeOutCubic(progress);
            
            this.clear();
            this.drawAnimated(easedProgress);
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animateFrame);
            } else {
                this.isAnimating = false;
            }
        };
        
        animateFrame();
    }
    
    draw() {
        // 子类实现
    }
    
    drawAnimated(progress) {
        // 子类实现
        this.draw();
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// 折线图类
class LineChart extends BaseChart {
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            lineColor: chartConfig.colors.primary,
            lineWidth: 3,
            pointColor: chartConfig.colors.primary,
            pointRadius: 4,
            fillArea: false,
            fillColor: ChartUtils.hexToRgba(chartConfig.colors.primary, 0.1),
            showGrid: true,
            showLabels: true,
            labelRotation: 0
        };
    }
    
    draw() {
        if (!this.data || this.data.length === 0) return;
        
        const { padding } = this.options;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;
        
        // 绘制网格
        if (this.options.showGrid) {
            this.drawGrid(padding, chartWidth, chartHeight);
        }
        
        // 绘制数据
        this.drawLine(padding, chartWidth, chartHeight);
        
        // 绘制标签
        if (this.options.showLabels) {
            this.drawLabels(padding, chartWidth, chartHeight);
        }
    }
    
    drawAnimated(progress) {
        if (!this.data || this.data.length === 0) return;
        
        const { padding } = this.options;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;
        
        // 绘制网格
        if (this.options.showGrid) {
            this.drawGrid(padding, chartWidth, chartHeight);
        }
        
        // 绘制动画数据
        this.drawLineAnimated(padding, chartWidth, chartHeight, progress);
        
        // 绘制标签
        if (this.options.showLabels) {
            this.drawLabels(padding, chartWidth, chartHeight);
        }
    }
    
    drawGrid(padding, chartWidth, chartHeight) {
        const { ctx } = this;
        const { gridColor } = this.options;
        
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        
        // 水平网格线
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(this.width - padding, y);
            ctx.stroke();
        }
        
        // 垂直网格线
        const stepX = chartWidth / (this.data.length - 1);
        for (let i = 0; i < this.data.length; i++) {
            const x = padding + stepX * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, this.height - padding);
            ctx.stroke();
        }
    }
    
    drawLine(padding, chartWidth, chartHeight) {
        const { ctx } = this;
        const { lineColor, lineWidth, pointColor, pointRadius, fillArea, fillColor } = this.options;
        
        const maxValue = Math.max(...this.data.map(d => d.value));
        const minValue = Math.min(...this.data.map(d => d.value));
        const valueRange = maxValue - minValue || 1;
        
        const stepX = chartWidth / (this.data.length - 1);
        
        // 计算点坐标
        const points = this.data.map((point, index) => {
            const x = padding + stepX * index;
            const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
            return { x, y, value: point.value };
        });
        
        // 填充区域
        if (fillArea) {
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.moveTo(points[0].x, this.height - padding);
            points.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.lineTo(points[points.length - 1].x, this.height - padding);
            ctx.closePath();
            ctx.fill();
        }
        
        // 绘制线条
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        
        // 绘制数据点
        ctx.fillStyle = pointColor;
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // 数值标签
            ctx.fillStyle = this.options.textColor;
            ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.fillText(point.value.toString(), point.x, point.y - 10);
            ctx.fillStyle = pointColor;
        });
    }
    
    drawLineAnimated(padding, chartWidth, chartHeight, progress) {
        const { ctx } = this;
        const { lineColor, lineWidth, pointColor, pointRadius } = this.options;
        
        const maxValue = Math.max(...this.data.map(d => d.value));
        const minValue = Math.min(...this.data.map(d => d.value));
        const valueRange = maxValue - minValue || 1;
        
        const stepX = chartWidth / (this.data.length - 1);
        const animatedLength = this.data.length * progress;
        
        // 计算点坐标
        const points = this.data.map((point, index) => {
            const x = padding + stepX * index;
            const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
            return { x, y, value: point.value };
        });
        
        // 绘制动画线条
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        
        for (let i = 0; i < animatedLength && i < points.length; i++) {
            const point = points[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        
        // 如果动画还在进行中，绘制部分线段
        if (animatedLength < points.length && animatedLength > 0) {
            const currentIndex = Math.floor(animatedLength);
            const nextIndex = currentIndex + 1;
            
            if (nextIndex < points.length) {
                const currentPoint = points[currentIndex];
                const nextPoint = points[nextIndex];
                const segmentProgress = animatedLength - currentIndex;
                
                const x = currentPoint.x + (nextPoint.x - currentPoint.x) * segmentProgress;
                const y = currentPoint.y + (nextPoint.y - currentPoint.y) * segmentProgress;
                
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // 绘制动画数据点
        ctx.fillStyle = pointColor;
        for (let i = 0; i < animatedLength && i < points.length; i++) {
            const point = points[i];
            const pointProgress = Math.min((animatedLength - i), 1);
            
            if (pointProgress > 0) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, pointRadius * pointProgress, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
    
    drawLabels(padding, chartWidth, chartHeight) {
        const { ctx } = this;
        const { textColor, fontSize, fontFamily } = this.options;
        
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        
        const stepX = chartWidth / (this.data.length - 1);
        
        // X轴标签
        this.data.forEach((point, index) => {
            const x = padding + stepX * index;
            const y = this.height - padding + 20;
            ctx.fillText(point.label || point.date || index.toString(), x, y);
        });
        
        // Y轴标签
        const maxValue = Math.max(...this.data.map(d => d.value));
        const minValue = Math.min(...this.data.map(d => d.value));
        const valueRange = maxValue - minValue || 1;
        
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = minValue + (valueRange / 5) * (5 - i);
            const y = padding + (chartHeight / 5) * i;
            ctx.fillText(ChartUtils.formatNumber(value), padding - 10, y + 4);
        }
    }
}

// 柱状图类
class BarChart extends BaseChart {
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            barColor: chartConfig.colors.primary,
            barWidth: 0.8,
            showValues: true,
            valuePosition: 'top'
        };
    }
    
    draw() {
        if (!this.data || this.data.length === 0) return;
        
        const { padding } = this.options;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;
        
        this.drawBars(padding, chartWidth, chartHeight);
        this.drawLabels(padding, chartWidth, chartHeight);
    }
    
    drawAnimated(progress) {
        if (!this.data || this.data.length === 0) return;
        
        const { padding } = this.options;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;
        
        this.drawBarsAnimated(padding, chartWidth, chartHeight, progress);
        this.drawLabels(padding, chartWidth, chartHeight);
    }
    
    drawBars(padding, chartWidth, chartHeight) {
        const { ctx } = this;
        const { barColor, barWidth, showValues } = this.options;
        
        const maxValue = Math.max(...this.data.map(d => d.value));
        const barSpacing = chartWidth / this.data.length;
        const actualBarWidth = barSpacing * barWidth;
        
        ctx.fillStyle = barColor;
        
        this.data.forEach((item, index) => {
            const x = padding + barSpacing * index + (barSpacing - actualBarWidth) / 2;
            const barHeight = (item.value / maxValue) * chartHeight;
            const y = this.height - padding - barHeight;
            
            ctx.fillRect(x, y, actualBarWidth, barHeight);
            
            // 显示数值
            if (showValues) {
                ctx.fillStyle = this.options.textColor;
                ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
                ctx.textAlign = 'center';
                ctx.fillText(item.value.toString(), x + actualBarWidth / 2, y - 5);
                ctx.fillStyle = barColor;
            }
        });
    }
    
    drawBarsAnimated(padding, chartWidth, chartHeight, progress) {
        const { ctx } = this;
        const { barColor, barWidth, showValues } = this.options;
        
        const maxValue = Math.max(...this.data.map(d => d.value));
        const barSpacing = chartWidth / this.data.length;
        const actualBarWidth = barSpacing * barWidth;
        
        ctx.fillStyle = barColor;
        
        this.data.forEach((item, index) => {
            const x = padding + barSpacing * index + (barSpacing - actualBarWidth) / 2;
            const fullBarHeight = (item.value / maxValue) * chartHeight;
            const barHeight = fullBarHeight * progress;
            const y = this.height - padding - barHeight;
            
            ctx.fillRect(x, y, actualBarWidth, barHeight);
            
            // 显示数值（动画）
            if (showValues && progress > 0.8) {
                const valueOpacity = (progress - 0.8) / 0.2;
                ctx.fillStyle = ChartUtils.hexToRgba(this.options.textColor, valueOpacity);
                ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
                ctx.textAlign = 'center';
                ctx.fillText(item.value.toString(), x + actualBarWidth / 2, y - 5);
                ctx.fillStyle = barColor;
            }
        });
    }
    
    drawLabels(padding, chartWidth, chartHeight) {
        const { ctx } = this;
        const { textColor, fontSize, fontFamily } = this.options;
        
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        
        const barSpacing = chartWidth / this.data.length;
        
        this.data.forEach((item, index) => {
            const x = padding + barSpacing * index + barSpacing / 2;
            const y = this.height - padding + 20;
            ctx.fillText(item.label || item.name || index.toString(), x, y);
        });
    }
}

// 饼图类
class PieChart extends BaseChart {
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            colors: [
                chartConfig.colors.primary,
                chartConfig.colors.secondary,
                chartConfig.colors.success,
                chartConfig.colors.warning,
                chartConfig.colors.error,
                chartConfig.colors.info
            ],
            showLabels: true,
            showValues: true,
            labelDistance: 20
        };
    }
    
    draw() {
        if (!this.data || this.data.length === 0) return;
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 2 - this.options.padding;
        
        this.drawPie(centerX, centerY, radius);
        
        if (this.options.showLabels) {
            this.drawLabels(centerX, centerY, radius);
        }
    }
    
    drawAnimated(progress) {
        if (!this.data || this.data.length === 0) return;
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 2 - this.options.padding;
        
        this.drawPieAnimated(centerX, centerY, radius, progress);
        
        if (this.options.showLabels && progress > 0.8) {
            this.drawLabels(centerX, centerY, radius);
        }
    }
    
    drawPie(centerX, centerY, radius) {
        const { ctx } = this;
        const { colors } = this.options;
        
        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -Math.PI / 2; // 从顶部开始
        
        this.data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const color = colors[index % colors.length];
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            // 边框
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            currentAngle += sliceAngle;
        });
    }
    
    drawPieAnimated(centerX, centerY, radius, progress) {
        const { ctx } = this;
        const { colors } = this.options;
        
        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -Math.PI / 2;
        const maxAngle = 2 * Math.PI * progress;
        let drawnAngle = 0;
        
        this.data.forEach((item, index) => {
            if (drawnAngle >= maxAngle) return;
            
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const actualSliceAngle = Math.min(sliceAngle, maxAngle - drawnAngle);
            const color = colors[index % colors.length];
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + actualSliceAngle);
            ctx.closePath();
            ctx.fill();
            
            // 边框
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            currentAngle += sliceAngle;
            drawnAngle += sliceAngle;
        });
    }
    
    drawLabels(centerX, centerY, radius) {
        const { ctx } = this;
        const { textColor, fontSize, fontFamily, labelDistance } = this.options;
        
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px ${fontFamily}`;
        
        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -Math.PI / 2;
        
        this.data.forEach(item => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const labelAngle = currentAngle + sliceAngle / 2;
            
            const labelX = centerX + Math.cos(labelAngle) * (radius + labelDistance);
            const labelY = centerY + Math.sin(labelAngle) * (radius + labelDistance);
            
            ctx.textAlign = labelX > centerX ? 'left' : 'right';
            ctx.fillText(item.label || item.name, labelX, labelY);
            
            if (this.options.showValues) {
                const percentage = ((item.value / total) * 100).toFixed(1);
                ctx.fillText(`${percentage}%`, labelX, labelY + 15);
            }
            
            currentAngle += sliceAngle;
        });
    }
}

// 仪表板图表初始化函数
function initDashboardCharts() {
    // 初始化各种图表
    initOverviewCharts();
    initGrowthCharts();
    initStatisticsCharts();
}

// 初始化总览图表
function initOverviewCharts() {
    // 能力雷达图在dashboard.js中处理
    
    // 趋势图
    const trendCanvas = document.getElementById('trend-chart');
    if (trendCanvas) {
        const trendData = [
            { label: '1/10', value: 75 },
            { label: '1/12', value: 78 },
            { label: '1/14', value: 82 },
            { label: '1/15', value: 88 },
            { label: '1/17', value: 85 },
            { label: '1/19', value: 90 },
            { label: '1/21', value: 87 }
        ];
        
        const trendChart = new LineChart('trend-chart', {
            lineColor: chartConfig.colors.primary,
            fillArea: true,
            fillColor: ChartUtils.hexToRgba(chartConfig.colors.primary, 0.1)
        });
        
        trendChart.setData(trendData).animate();
    }
}

// 初始化成长图表
function initGrowthCharts() {
    // 成长图表在dashboard.js中动态生成
}

// 初始化统计图表
function initStatisticsCharts() {
    // 面试类型分布饼图
    const typeDistCanvas = document.getElementById('type-distribution');
    if (typeDistCanvas) {
        const typeData = [
            { label: '技术面试', value: 45 },
            { label: '行为面试', value: 30 },
            { label: '案例分析', value: 15 },
            { label: '其他', value: 10 }
        ];
        
        const typeChart = new PieChart('type-distribution');
        typeChart.setData(typeData).animate();
    }
    
    // 能力分布柱状图
    const abilityDistCanvas = document.getElementById('ability-distribution');
    if (abilityDistCanvas) {
        const abilityData = [
            { label: '表达', value: 88 },
            { label: '逻辑', value: 82 },
            { label: '知识', value: 90 },
            { label: '应变', value: 78 },
            { label: '素养', value: 87 }
        ];
        
        const abilityChart = new BarChart('ability-distribution', {
            barColor: chartConfig.colors.secondary
        });
        
        abilityChart.setData(abilityData).animate();
    }
}

// 创建图表的便捷函数
function createLineChart(canvasId, data, options = {}) {
    const chart = new LineChart(canvasId, options);
    return chart.setData(data);
}

function createBarChart(canvasId, data, options = {}) {
    const chart = new BarChart(canvasId, options);
    return chart.setData(data);
}

function createPieChart(canvasId, data, options = {}) {
    const chart = new PieChart(canvasId, options);
    return chart.setData(data);
}

// 导出到全局
window.ChartUtils = ChartUtils;
window.BaseChart = BaseChart;
window.LineChart = LineChart;
window.BarChart = BarChart;
window.PieChart = PieChart;
window.initDashboardCharts = initDashboardCharts;
window.createLineChart = createLineChart;
window.createBarChart = createBarChart;
window.createPieChart = createPieChart;

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保DOM完全加载
    setTimeout(initDashboardCharts, 100);
});