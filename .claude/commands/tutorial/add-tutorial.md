---
description: 將新的教學頁面加入導航（檔案需先放入 tutorials/）
argument-hint: <分類編號> <技能名稱> <檔案路徑> <難度>
allowed-tools: Read, Glob, Edit
---

## Inputs

- Args: $ARGUMENTS
- 格式：`<分類編號> "<技能名稱>" "<檔案路徑>" "<難度>"`
- 範例：`01 "OSI 深入解析" "tutorials/01-internet/osi-deep-dive-tutorial.html" "中級"`

## Context

- 技能資料：!`head -n 30 src/data/skills.md 2>/dev/null || echo "找不到 skills.md"`
- 分類列表：!`grep -E "^#\s+" src/data/skills.md 2>/dev/null | head -n 21 || echo "無法取得分類"`

## Rules (Safety)

1. **重述理解**：先確認解析到的參數是否正確
2. **檔案確認**：確認 tutorials 檔案存在後才進行修改
3. **禁止修改 tutorials/**：只修改 `src/data/skills.md`，不修改教學頁面內容
4. **格式驗證**：確保難度為「初級」「中級」「進階」其一
5. **Human-in-the-loop**：修改前先顯示預覽，等待確認

## Specification

### 分類編號對照表

| 編號 | ID | 名稱 |
|------|-----|------|
| 01 | 01-Internet | Internet 基礎 |
| 02 | 02-Frontend-Basics | Frontend 基礎 |
| 03 | 03-OS-Knowledge | 作業系統知識 |
| 04 | 04-Languages | 程式語言 |
| 05 | 05-Version-Control | 版本控制 |
| 06 | 06-Relational-Databases | 關聯式資料庫 |
| 07 | 07-API-Styles | API 設計風格 |
| 08 | 08-Authentication | 身份驗證 |
| 09 | 09-Caching | 快取策略 |
| 10 | 10-Web-Security | 網頁安全 |
| 11 | 11-Testing | 測試 |
| 12 | 12-DevOps-CI-CD | DevOps & CI/CD |
| 13 | 13-Architectural-Patterns | 架構模式 |
| 14 | 14-Message-Brokers-Search | 訊息佇列 & 搜尋 |
| 15 | 15-Scaling-Databases | 資料庫擴展 |
| 16 | 16-System-Design | 系統設計 |
| 17 | 17-Scaling-Strategies | 擴展策略 |
| 18 | 18-Full-Stack | 全端整合 |
| 19 | 19-Design-Principles | 設計原則 |
| 20 | 20-Web-Servers | Web 伺服器 |
| 21 | 21-Real-Time-Data | 即時資料 |

### skills.md 格式

```markdown
# {icon} {name} {#id}
- {skill} | {level}
- {skill} | {level} | {link}
```

## Procedure

1. **解析參數**：從 $ARGUMENTS 解析出分類編號、技能名稱、檔案路徑、難度
2. **驗證檔案**：使用 Glob 確認 tutorials 檔案存在
3. **驗證分類**：確認分類編號對應的 ID 存在於 skills.md
4. **讀取資料**：讀取 `src/data/skills.md` 找到對應分類區塊
5. **生成項目**：生成新的技能項目行：`- {技能名稱} | {難度} | {檔案路徑}`
6. **預覽修改**：顯示即將新增的內容，等待 GO 確認
7. **執行修改**：使用 Edit 工具在對應分類的最後一個技能後新增項目

## Output Format

### 解析結果
```
📋 解析結果：
- 分類編號：{編號}
- 分類名稱：{名稱}
- 技能名稱：{技能}
- 檔案路徑：{路徑}
- 難度等級：{難度}
```

### 預覽修改
```
📝 即將新增到 [{分類}]：
- {技能名稱} | {難度} | {檔案路徑}

⏳ 輸入 GO 確認修改
```

### 完成
```
✅ 新增成功！
- 分類：[{編號}] {分類名稱}
- 技能：{技能名稱}
- 連結：{檔案路徑}
```

## Error Handling

**參數格式錯誤**：

⚠️ 參數格式錯誤
正確格式：/add-tutorial <分類編號> "<技能名稱>" "<檔案路徑>" "<難度>"
範例：/add-tutorial 08 "JWT Deep Dive" "tutorials/08-authentication/jwt-tutorial.html" "中級"

**檔案不存在**：

⚠️ 找不到教學檔案：{檔案路徑}
請先將檔案放入 tutorials/ 目錄

**分類不存在**：

⚠️ 找不到分類編號：{編號}
請確認編號在 01-21 範圍內

**難度格式錯誤**：

⚠️ 難度必須為「初級」「中級」「進階」其一
你輸入的是：{難度}
