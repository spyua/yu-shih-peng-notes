---
description: 列出目前所有已連結的教學頁面
argument-hint: (無需參數)
allowed-tools: Read
---

## Inputs

- 此命令無需參數

## Context

- 技能資料：!`cat src/data/skills.md 2>/dev/null || echo "找不到 skills.md"`

## Rules (Safety)

1. **唯讀操作**：此命令只讀取資料，不做任何修改
2. **完整列出**：列出所有有 link 的教學項目

## Specification

### skills.md 格式

有連結的項目格式：
```markdown
- {skill} | {level} | {time} | {link}
```

### 分類 ID 前綴對照

| 前綴 | 分類 |
|------|------|
| 01 | Internet 基礎 |
| 02 | Frontend 基礎 |
| ... | ... |
| 21 | 即時資料 |

## Procedure

1. **讀取資料**：讀取 `src/data/skills.md`
2. **解析分類**：識別所有分類標題（`# {icon} {name} {#id}`）
3. **過濾項目**：找出所有包含第四個欄位（link）的技能項目
4. **格式輸出**：按分類分組顯示

## Output Format

```
📚 已連結的教學頁面

[01-Internet] Internet 基礎
  • OSI 模型 → tutorials/01-internet/osi-model-tutorial.html

[17-Scaling-Strategies] 擴展策略
  • Rate Limiter / Throttling → tutorials/17-scaling-strategies/rate-limiter-tutorial.html

---
📊 統計：共 {N} 個互動教學
```

### 無教學時

```
📚 已連結的教學頁面

（目前尚無已連結的教學頁面）

💡 使用 /add-tutorial 新增教學連結
```

## Error Handling

**找不到 skills.md**：

⚠️ 找不到技能資料檔案
請確認 src/data/skills.md 存在

**解析失敗**：

⚠️ 無法解析技能資料
請確認 skills.md 格式正確
