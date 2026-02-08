/**
 * YU-SHIH-PENG 筆記區 - Skill Parser
 * 解析 Markdown 格式的技能目錄資料
 */

/**
 * 解析 Markdown 格式的技能資料
 * @param {string} markdown - Markdown 格式的技能資料
 * @returns {Array} skillTree 資料結構
 *
 * 支援格式：
 * # {icon} {name} {#id}
 * - {skill} | {level}
 * - {skill} | {level} | {link}
 */
const parseSkillsMarkdown = (markdown) => {
    const categories = [];
    const lines = markdown.split('\n');
    let currentCategory = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();

        // 跳過空行
        if (!trimmedLine) return;

        // 解析分類標題: # 🌐 Internet 基礎 {#01-Internet}
        const categoryMatch = trimmedLine.match(/^#\s+(\S+)\s+(.+?)\s+\{#(.+?)\}$/);
        if (categoryMatch) {
            currentCategory = {
                id: categoryMatch[3],
                icon: categoryMatch[1],
                name: categoryMatch[2],
                skills: []
            };
            categories.push(currentCategory);
            return;
        }

        // 解析技能項目: - Skill Name | 初級 | optional-link
        const skillMatch = trimmedLine.match(/^-\s+(.+?)\s*\|\s*(.+?)(?:\s*\|\s*(.+))?$/);
        if (skillMatch && currentCategory) {
            const link = skillMatch[3]?.trim();
            currentCategory.skills.push({
                name: skillMatch[1].trim(),
                level: skillMatch[2].trim(),
                link: link || null
            });
        }
    });

    return categories;
};

/**
 * 從指定路徑載入並解析技能資料
 * @param {string} path - Markdown 檔案路徑
 * @returns {Promise<Array>} skillTree 資料結構
 */
const loadSkillsFromMarkdown = async (path = 'src/data/skills.md') => {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load skills: ${response.status}`);
    }
    const markdown = await response.text();
    return parseSkillsMarkdown(markdown);
};

/**
 * 載入 Roadmap 布局資料
 * @param {string} path - JSON 檔案路徑
 * @returns {Promise<Object>} roadmap 配置
 */
const loadRoadmapLayout = async (path = 'src/data/roadmap-layout.json') => {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load roadmap: ${response.status}`);
    }
    return response.json();
};

/**
 * 取得難度對應的 CSS class（供 roadmap.js 使用）
 * 注意：main.js 有自己的 getLevelClass，此函式僅供 roadmap 頁面使用
 * @param {string} level - 難度等級
 * @returns {string} CSS class 名稱
 */
const getRoadmapLevelClass = (level) => {
    const levelMap = {
        '初級': 'beginner',
        '中級': 'intermediate',
        '進階': 'advanced'
    };
    return levelMap[level] || 'beginner';
};
