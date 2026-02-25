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
 * 渲染單一技能項目 HTML
 * @param {Object} skill - 技能資料
 * @param {string} filter - 搜尋關鍵字
 * @returns {string} HTML 字串
 */
const renderSkillItem = (skill, filter) => {
    const tag = skill.link ? 'a' : 'div';
    const cls = skill.link ? 'skill-item available' : 'skill-item coming-soon';
    const href = skill.link ? ` href="${skill.link}"` : '';
    return `<${tag}${href} class="${cls}">
        <span class="skill-name">${highlightText(skill.name, filter)}</span>
        <span class="skill-badge badge-${getLevelClass(skill.level)}">${skill.level}</span>
    </${tag}>`;
};

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

        const subgroups = category.subgroups || [];
        const filteredSubgroups = subgroups.map(sg => {
            const sgSkills = filter
                ? sg.skills.filter(skill =>
                    skill.name.toLowerCase().includes(filterLower) ||
                    sg.name.toLowerCase().includes(filterLower) ||
                    category.name.toLowerCase().includes(filterLower)
                  )
                : sg.skills;
            return { ...sg, skills: sgSkills };
        }).filter(sg => sg.skills.length > 0);

        const totalCount = filteredSkills.length + filteredSubgroups.reduce((sum, sg) => sum + sg.skills.length, 0);

        if (totalCount === 0 && filter) return;

        const isOpen = filter ? true : false;

        const skillItemsHtml = filteredSkills.map(skill => renderSkillItem(skill, filter)).join('');

        const subgroupsHtml = filteredSubgroups.map(sg => `
            <div class="nav-subgroup ${isOpen ? 'open' : ''}">
                <div class="subgroup-header" onclick="toggleSubgroup(this.parentElement)">
                    <span class="subgroup-icon">📂</span>
                    <span class="subgroup-title">${highlightText(sg.name, filter)}</span>
                    <span class="subgroup-count">${sg.skills.length}</span>
                    <span class="subgroup-arrow">▶</span>
                </div>
                <div class="subgroup-items">
                    ${sg.skills.map(skill => renderSkillItem(skill, filter)).join('')}
                </div>
            </div>
        `).join('');

        html += `
            <div class="nav-category ${isOpen ? 'open' : ''}" data-category="${category.id}">
                <div class="category-header" onclick="toggleCategory(this.parentElement)">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-title">${highlightText(category.name, filter)}</span>
                    <span class="category-count">${totalCount}</span>
                    <span class="category-arrow">▶</span>
                </div>
                <div class="category-items">
                    ${skillItemsHtml}
                    ${subgroupsHtml}
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
 * 切換子群組展開/收合狀態
 * @param {HTMLElement} element - 子群組元素
 */
const toggleSubgroup = (element) => {
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
