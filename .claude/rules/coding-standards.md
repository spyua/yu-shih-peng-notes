# 編碼規範

## HTML 規範

### 文件結構

```html
<!-- ✅ 正確的文件開頭（首頁） -->
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{標題} | YU-SHIH-PENG 筆記區</title>
    <link rel="stylesheet" href="src/css/main.css">
</head>
<body>
    <!-- 內容 -->
    <script src="src/js/main.js"></script>
</body>
</html>
```

### HTML 限制

| 項目 | 限制 |
|------|------|
| 外部 CSS 檔案 | ✅ 允許（放置於 `/src/css/`） |
| 外部 JS 檔案 | ✅ 允許（放置於 `/src/js/`） |
| 允許的 CDN | ✅ Google Fonts |
| ID 命名 | camelCase |
| Class 命名 | kebab-case |

### 正反範例

```html
<!-- ❌ 錯誤：隨意的檔案路徑 -->
<link rel="stylesheet" href="assets/style.css">

<!-- ✅ 正確：放置於 /src/css/ 目錄 -->
<link rel="stylesheet" href="src/css/main.css">
```

```html
<!-- ❌ 錯誤：錯誤的 class 命名 -->
<div class="mainContainer">

<!-- ✅ 正確：kebab-case -->
<div class="main-container">
```

---

## CSS 規範

### CSS Variables（必須使用）

```css
/* ✅ 必須在 :root 定義變數 */
:root {
    --primary-color: #00d4ff;
    --secondary-color: #7c3aed;
    --bg-dark: #0f172a;
    --bg-card: #1e293b;
    --bg-hover: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-muted: #64748b;
    --border-color: #334155;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
}
```

### CSS 限制

| 項目 | 限制 |
|------|------|
| 顏色定義 | 必須使用 CSS Variables |
| 響應式斷點 | `768px`（唯一斷點） |
| 單一選擇器深度 | ≤ 3 層 |
| !important | ❌ 禁止使用 |

### 響應式設計

```css
/* ✅ 正確的響應式寫法 */
@media (max-width: 768px) {
    .sidebar {
        transform: translateX(-100%);
    }
    .main-content {
        margin-left: 0;
    }
}
```

### 正反範例

```css
/* ❌ 錯誤：直接寫色碼 */
.card {
    background: #1e293b;
}

/* ✅ 正確：使用變數 */
.card {
    background: var(--bg-card);
}
```

```css
/* ❌ 錯誤：選擇器過深 */
.container .wrapper .card .header .title { }

/* ✅ 正確：最多 3 層 */
.card .header { }
.card-title { }
```

---

## JavaScript 規範

### 語法要求

| 項目 | 要求 |
|------|------|
| 語法版本 | ES6+ |
| 變數宣告 | `const` > `let`（❌ 禁止 `var`） |
| 字串 | 模板字串 \`${}\` |
| 函式 | 箭頭函式優先 |
| DOM 查詢 | `getElementById` / `querySelector` |

### 程式碼限制

| 項目 | 限制 |
|------|------|
| 函式長度 | ≤ 30 行 |
| 函式參數 | ≤ 4 個 |
| 巢狀深度 | ≤ 3 層 |
| 全域變數 | ❌ 禁止（使用 IIFE 或模組模式） |

### 事件綁定

```javascript
// ❌ 錯誤：inline 事件
<button onclick="handleClick()">

// ✅ 正確：addEventListener（簡單互動可接受 onclick）
document.getElementById('btn').addEventListener('click', handleClick);
```

### DOM 操作時機

```javascript
// ✅ 正確：確保 DOM 載入完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化程式碼
    initNavigation();
    initQuiz();
});
```

### 正反範例

```javascript
// ❌ 錯誤：使用 var
var count = 0;

// ✅ 正確：使用 const/let
const maxCount = 10;
let currentCount = 0;
```

```javascript
// ❌ 錯誤：字串拼接
const html = '<div class="' + className + '">' + content + '</div>';

// ✅ 正確：模板字串
const html = `<div class="${className}">${content}</div>`;
```

```javascript
// ❌ 錯誤：巢狀過深
function process() {
    if (a) {
        if (b) {
            if (c) {
                if (d) {
                    // 太深了！
                }
            }
        }
    }
}

// ✅ 正確：提早返回
function process() {
    if (!a) return;
    if (!b) return;
    if (!c) return;
    if (!d) return;
    // 執行邏輯
}
```

---

## 註解規範

### HTML 註解

```html
<!-- ==================== Section Name ==================== -->
<section>...</section>

<!-- Component: Navigation -->
<nav>...</nav>
```

### CSS 註解

```css
/* ==================== Layout ==================== */
.container { }

/* Component: Card */
.card { }
```

### JavaScript 註解

```javascript
// 單行註解用於簡短說明

/**
 * 多行註解用於函式說明
 * @param {string} id - 元素 ID
 * @returns {HTMLElement} 找到的元素
 */
function findElement(id) { }
```

---

## Code Review 檢查清單

### HTML
- [ ] lang="zh-TW"？
- [ ] 有 viewport meta？
- [ ] title 有意義？
- [ ] CSS/JS 檔案放置於正確目錄？

### CSS
- [ ] 使用 CSS Variables？
- [ ] 無 !important？
- [ ] 有 768px 響應式？
- [ ] 選擇器 ≤ 3 層？

### JavaScript
- [ ] 無 var？
- [ ] 使用模板字串？
- [ ] 函式 ≤ 30 行？
- [ ] 巢狀 ≤ 3 層？
- [ ] DOMContentLoaded 初始化？
