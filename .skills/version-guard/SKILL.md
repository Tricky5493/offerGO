---
name: version-guard
description: "在修改现有 HTML/前端文件之前必须使用此 skill。防止版本迭代中丢失已有功能，确保每次修改都经过完整的基线对比和回归验证。适用于所有前端项目的版本迭代、功能修改、bug 修复。"
---

# Version Guard - 版本迭代防护

在修改任何现有前端文件之前，**必须**先完成以下流程。此 skill 的目标是杜绝"改新版丢老功能"的问题。

<HARD-GATE>
禁止在未完成以下 Checklist 的情况下修改任何现有代码文件。每次修改前必须走完 Step 1-4。
</HARD-GATE>

## Checklist

你必须按顺序完成以下步骤：

### Step 1: 建立基线

1. **确认当前稳定版本**：找到最新可正常运行的版本文件
2. **创建新版本副本**：`cp stable_version.html new_version.html`
3. **验证副本可用**：确认新副本打开后所有功能正常

```
操作示例：
cp OfferGO_V1.4.html OfferGO_V1.5.html
```

### Step 2: 功能快照（关键步骤）

在修改前，对基线版本做完整的功能快照：

1. **列出所有页面/screen**：
   ```bash
   grep -n 'id="screen-' stable_version.html
   ```

2. **列出所有关键 CSS 类**：
   ```bash
   grep -n '^\.' stable_version.html | head -50
   ```

3. **列出所有 JS 函数**：
   ```bash
   grep -n 'function ' stable_version.html
   ```

4. **记录关键 ID 元素**：
   ```bash
   grep -o 'id="[^"]*"' stable_version.html | sort
   ```

5. **将快照保存**到工作目录，作为回归验证的对照基准

### Step 3: 差异分析

1. 列出本次修改的目标功能清单
2. 标记每个改动：
   - `[新增]` - 全新功能（需要 HTML+CSS+JS 完整添加）
   - `[修改]` - 改动已有功能（需要确认不破坏关联代码）
   - `[删除]` - 移除功能（需要确认没有其他代码依赖）
3. **对每个 `[修改]` 和 `[删除]`，列出所有受影响的关联代码**

### Step 4: 增量修改 + 即时验证

每完成一个功能块的修改，立即执行：

1. **HTML 改动** → 检查对应 CSS 是否存在、对应 JS 是否引用正确
2. **CSS 改动** → 检查对应 HTML 是否使用了该类名
3. **JS 改动** → 检查函数名、ID 引用是否与 HTML 一致
4. **删除操作** → 检查是否有其他代码引用被删除的元素

### Step 5: 回归验证（修改完成后必须执行）

对照 Step 2 的快照，逐项验证：

#### 5.1 页面完整性
```bash
grep -c 'id="screen-' new_version.html
```

#### 5.2 CSS 完整性
```bash
for cls in loading-card company-progress bottom-nav; do
  grep -q "\.$cls" new_version.html && echo "✓ $cls" || echo "✗ $cls MISSING"
done
```

#### 5.3 JS 完整性
```bash
for func in show goPage resetAll; do
  grep -q "function $func" new_version.html && echo "✓ $func()" || echo "✗ $func() MISSING"
done
```

#### 5.4 无重复 ID
```bash
grep -o 'id="[^"]*"' new_version.html | sort | uniq -d
# 应该无输出
```

#### 5.5 用户路径测试
必须走完以下路径：
- 路径1: 首页 → 核心操作流程 → 结果页
- 路径2: 导航切换（如有）
- 路径3: 重置/返回操作

---

## 常见陷阱速查

| 陷阱 | 防护措施 |
|------|---------|
| 从已损坏版本继续改 | 始终从稳定基线 cp 新文件 |
| 改 HTML 忘 CSS/JS | 每个功能块必须三者一起检查 |
| SearchReplace 匹配错误 | 替换前 Read 确认上下文 |
| 删除代码有残留引用 | 删除前 grep 搜索所有引用 |
| 浏览器缓存误判 | 用无痕窗口验证 |
| ID/类名拼写错误 | 复制粘贴，不手打 |

---

## 修改记录模板

每次迭代完成后，在项目 docs 目录记录：

```markdown
## V1.x → V1.y 修改记录

日期：YYYY-MM-DD
基线：V1.x

### 改动清单
| 类型 | 内容 | 关联代码 |
|------|------|---------|
| [新增] | xxx | HTML:行xxx CSS:行xxx JS:行xxx |
| [修改] | xxx | HTML:行xxx |
| [删除] | xxx | 无残留引用 |

### 验证结果
- [ ] 所有 screen 完整
- [ ] 关键 CSS 存在
- [ ] 关键 JS 函数存在
- [ ] 用户路径测试通过
- [ ] 无重复 ID
```

---

## 版本命名规范

```
project_V1.x.html       ← 稳定发布版（不可覆盖）
project_V1.x.1.html     ← 小修（bugfix）
project_V1.x+1.html     ← 大版本（新功能）
project_V1.x_draft.html ← 草稿（可随意修改）
```

**铁律：永远不要覆盖已发布的稳定版本文件。**
