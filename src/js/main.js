/**
 * YU-SHIH-PENG 筆記區 - Main JavaScript
 * 首頁導航與互動功能
 */

// ==================== Skill Tree Data ====================
// 資料從 src/data/skills.md 動態載入
let skillTree = [];

// ==================== Utility Functions ====================

/**
 * 根據難度等級取得對應的 CSS class
 * @param {string} level - 難度等級
 * @returns {string} CSS class 名稱
 */
const getLevelClass = (level) => {
    switch(level) {
        case '初級': return 'beginner';
        case '中級': return 'intermediate';
        case '進階': return 'advanced';
        default: return 'beginner';
    }
};

/**
 * 將搜尋關鍵字在文字中高亮顯示
 * @param {string} text - 原始文字
 * @param {string} filter - 搜尋關鍵字
 * @returns {string} 包含高亮標記的 HTML
 */
const highlightText = (text, filter) => {
    if (!filter) return text;
    const regex = new RegExp(`(${escapeRegex(filter)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
};

/**
 * 跳脫正則表達式特殊字元
 * @param {string} string - 原始字串
 * @returns {string} 跳脫後的字串
 */
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// ==================== Navigation Functions ====================

/**
 * 渲染導航樹狀結構
 * @param {string} filter - 搜尋過濾條件
 */
const renderNavTree = (filter = '') => {
    const navTree = document.getElementById('navTree');
    const filterLower = filter.toLowerCase();

    let html = '';

    skillTree.forEach(category => {
        const filteredSkills = filter
            ? category.skills.filter(skill =>
                skill.name.toLowerCase().includes(filterLower) ||
                category.name.toLowerCase().includes(filterLower)
              )
            : category.skills;

        if (filteredSkills.length === 0 && filter) return;

        const isOpen = filter ? true : false;

        html += `
            <div class="nav-category ${isOpen ? 'open' : ''}" data-category="${category.id}">
                <div class="category-header" onclick="toggleCategory(this.parentElement)">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-title">${highlightText(category.name, filter)}</span>
                    <span class="category-count">${filteredSkills.length}</span>
                    <span class="category-arrow">▶</span>
                </div>
                <div class="category-items">
                    ${filteredSkills.map(skill => `
                        ${skill.link
                            ? `<a href="${skill.link}" class="skill-item available">`
                            : `<div class="skill-item coming-soon">`
                        }
                            <span class="skill-name">${highlightText(skill.name, filter)}</span>
                            <span class="skill-badge badge-${getLevelClass(skill.level)}">${skill.level}</span>
                        ${skill.link ? '</a>' : '</div>'}
                    `).join('')}
                </div>
            </div>
        `;
    });

    navTree.innerHTML = html;
};

/**
 * 切換分類展開/收合狀態
 * @param {HTMLElement} element - 分類元素
 */
const toggleCategory = (element) => {
    element.classList.toggle('open');
};

/**
 * 處理搜尋輸入
 * @param {string} value - 搜尋關鍵字
 */
const handleSearch = (value) => {
    renderNavTree(value);
};

/**
 * 切換側邊欄顯示狀態（手機版）
 */
const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
};

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        skillTree = await loadSkillsFromMarkdown('src/data/skills.md');
        renderNavTree();
    } catch (error) {
        console.error('Failed to load skills:', error);
        document.getElementById('navTree').innerHTML = `
            <div class="load-error">
                載入失敗，請重新整理頁面或使用 HTTP Server 開啟
            </div>
        `;
    }
});
