/**
 * YU-SHIH-PENG 筆記區 - Roadmap Renderer
 * 視覺化技能地圖渲染與互動邏輯
 */

// 全域狀態
let roadmapData = null;
let nodeElements = new Map();

// DOM 元素快取
const elements = {
    grid: null,
    svg: null,
    detailPanel: null,
    detailContent: null,
    overlay: null,
    listFallback: null
};

/**
 * 初始化 Roadmap
 */
const initRoadmap = async () => {
    try {
        // 快取 DOM 元素
        elements.grid = document.getElementById('roadmapGrid');
        elements.svg = document.getElementById('connectionsLayer');
        elements.detailPanel = document.getElementById('nodeDetailPanel');
        elements.detailContent = document.getElementById('detailContent');
        elements.overlay = document.getElementById('panelOverlay');
        elements.listFallback = document.getElementById('roadmapListFallback');

        // 載入資料
        roadmapData = await loadRoadmapLayout();

        // 渲染
        renderSections();
        renderNodes();
        renderFallbackList();

        // 延遲繪製連線（等待 DOM 完成）
        requestAnimationFrame(() => {
            setTimeout(drawConnections, 100);
        });

        // 監聽視窗大小變化
        window.addEventListener('resize', debounce(handleResize, 200));

    } catch (error) {
        console.error('Failed to initialize roadmap:', error);
        showError('無法載入技能地圖資料');
    }
};

/**
 * 渲染區塊標題
 */
const renderSections = () => {
    if (!roadmapData.sections) return;

    roadmapData.sections.forEach(section => {
        const el = document.createElement('div');
        el.className = `roadmap-section ${section.isMain ? 'main-section' : ''}`;
        el.id = section.id;
        el.style.gridRow = section.row;
        el.style.gridColumn = section.colSpan > 1
            ? `${section.col} / span ${section.colSpan}`
            : section.col;
        el.textContent = section.title;

        // 儲存元素參照（供連線使用）
        nodeElements.set(section.id, el);
        elements.grid.appendChild(el);
    });
};

/**
 * 渲染節點
 */
const renderNodes = () => {
    if (!roadmapData.nodes) return;

    roadmapData.nodes.forEach(node => {
        const el = document.createElement('div');
        const hasLink = !!node.link;

        el.className = `roadmap-node node-${node.type} ${hasLink ? 'has-link' : ''}`;
        el.id = node.id;
        el.style.gridRow = node.row;
        el.style.gridColumn = node.col;

        el.innerHTML = `
            <span class="node-name">${node.name}</span>
            <span class="skill-badge badge-${getRoadmapLevelClass(node.level)}">${node.level}</span>
        `;

        // 點擊事件
        el.addEventListener('click', () => handleNodeClick(node));

        // 儲存元素參照
        nodeElements.set(node.id, el);
        elements.grid.appendChild(el);
    });
};

/**
 * 繪製 SVG 連線
 */
const drawConnections = () => {
    if (!roadmapData.edges || !elements.svg) return;

    const svg = elements.svg;
    const containerRect = elements.grid.getBoundingClientRect();

    // 清空現有連線
    svg.innerHTML = '';

    // 設定 SVG 尺寸
    svg.setAttribute('width', elements.grid.scrollWidth);
    svg.setAttribute('height', elements.grid.scrollHeight);

    roadmapData.edges.forEach(edge => {
        const fromEl = nodeElements.get(edge.from);
        const toEl = nodeElements.get(edge.to);

        if (!fromEl || !toEl) return;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        // 計算相對於容器的座標
        const scrollLeft = elements.grid.parentElement.scrollLeft || 0;
        const scrollTop = elements.grid.parentElement.scrollTop || 0;

        const x1 = fromRect.left - containerRect.left + fromRect.width / 2 + scrollLeft;
        const y1 = fromRect.bottom - containerRect.top + scrollTop;
        const x2 = toRect.left - containerRect.left + toRect.width / 2 + scrollLeft;
        const y2 = toRect.top - containerRect.top + scrollTop;

        // 建立路徑
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // 貝茲曲線（垂直連線）
        const midY = (y1 + y2) / 2;
        const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

        path.setAttribute('d', d);
        path.setAttribute('class', `connection ${edge.style}`);

        svg.appendChild(path);
    });
};

/**
 * 節點點擊處理
 * @param {Object} node - 節點資料
 */
const handleNodeClick = (node) => {
    if (node.link) {
        window.location.href = node.link;
    } else {
        showNodeDetail(node);
    }
};

/**
 * 顯示節點詳情面板
 * @param {Object} node - 節點資料
 */
const showNodeDetail = (node) => {
    const typeLabels = {
        recommended: '推薦學習',
        alternative: '替代選項',
        flexible: '順序不拘'
    };

    elements.detailContent.innerHTML = `
        <div class="detail-header">
            <h3>${node.name}</h3>
            <span class="skill-badge badge-${getRoadmapLevelClass(node.level)}">${node.level}</span>
        </div>
        <p class="detail-category">
            <span class="legend-color ${node.type}"></span>
            ${typeLabels[node.type] || ''}
        </p>
        ${node.skillRef
            ? `<p class="detail-status">📁 分類：${node.skillRef.split('/')[0]}</p>`
            : ''
        }
        <p class="detail-status">📚 教學內容準備中...</p>
        <a href="index.html" class="detail-link">查看完整技能清單</a>
    `;

    elements.detailPanel.classList.add('show');
    elements.overlay.classList.add('show');
};

/**
 * 關閉詳情面板
 */
const closeDetailPanel = () => {
    elements.detailPanel.classList.remove('show');
    elements.overlay.classList.remove('show');
};

/**
 * 渲染手機版 Fallback 列表
 */
const renderFallbackList = () => {
    if (!roadmapData.sections || !roadmapData.nodes) return;

    let html = '';

    // 按區塊分組
    const sectionMap = new Map();
    roadmapData.sections.forEach(s => sectionMap.set(s.id, { ...s, nodes: [] }));

    // 將節點按順序分配到最近的區塊
    let currentSectionIdx = 0;
    const sortedNodes = [...roadmapData.nodes].sort((a, b) => a.row - b.row || a.col - b.col);

    sortedNodes.forEach(node => {
        // 找到最接近的區塊
        let closestSection = roadmapData.sections[0];
        for (const section of roadmapData.sections) {
            if (section.row <= node.row) {
                closestSection = section;
            }
        }

        const sectionData = sectionMap.get(closestSection.id);
        if (sectionData) {
            sectionData.nodes.push(node);
        }
    });

    // 渲染
    sectionMap.forEach((section, id) => {
        if (section.nodes.length === 0) return;

        html += `
            <div class="fallback-section">
                <div class="fallback-section-title">${section.title}</div>
                <div class="fallback-items">
                    ${section.nodes.map(node => `
                        <${node.link ? 'a href="' + node.link + '"' : 'div'}
                            class="fallback-item ${node.link ? 'has-link' : ''}"
                            ${!node.link ? `onclick="showNodeDetail(${JSON.stringify(node).replace(/"/g, '&quot;')})"` : ''}>
                            <div class="fallback-item-left">
                                <span class="fallback-type-indicator ${node.type}"></span>
                                <span class="fallback-item-name">${node.name}</span>
                            </div>
                            <span class="skill-badge badge-${getRoadmapLevelClass(node.level)}">${node.level}</span>
                        </${node.link ? 'a' : 'div'}>
                    `).join('')}
                </div>
            </div>
        `;
    });

    elements.listFallback.innerHTML = html;
};

/**
 * 視窗大小變化處理
 */
const handleResize = () => {
    drawConnections();
};

/**
 * 防抖函式
 * @param {Function} fn - 要執行的函式
 * @param {number} delay - 延遲時間
 */
const debounce = (fn, delay) => {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
};

/**
 * 顯示錯誤訊息
 * @param {string} message - 錯誤訊息
 */
const showError = (message) => {
    const grid = elements.grid || document.getElementById('roadmapGrid');
    if (grid) {
        grid.innerHTML = `<div class="load-error">${message}</div>`;
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', initRoadmap);
