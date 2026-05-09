# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20260509-001] insight

**Logged**: 2026-05-09T14:00:00+08:00
**Priority**: critical
**Status**: resolved
**Area**: frontend

### Summary
screen-success 显示为 block 但 width=0 height=0，根本原因是 DOM 嵌套错误而非 CSS 问题

### Details
V2.0-beta 付费成功页点击"立即购买"后显示空白。调试过程：

1. **错误诊断方向**（浪费大量时间）：
   - 怀疑 CSS `fade-up` 动画导致 `opacity:0`
   - 怀疑 `show()` 函数的 `style.display` 和 `classList` 冲突
   - 怀疑 CSS 选择器优先级问题
   - 添加了各种调试代码、强制样式、测试按钮

2. **关键转折点**：
   - 添加调试面板显示 `display=block, visibility=visible, opacity=1` 但 `width=0 height=0`
   - 这说明元素本身显示了，但**没有内容撑开**
   - 开始检查父元素

3. **根本原因**：
   - `screen-result` 缺少一个 `</div>` 闭合标签
   - `screen-success` 被嵌套在 `screen-result` 内部
   - 当 `goPage('success')` 隐藏 `screen-result` 时，`screen-success` 作为子元素也被隐藏
   - **父元素不可见，子元素再怎么设置 display 也没用**

4. **验证方法**：
   - 写 Node.js 脚本分析 div 嵌套深度
   - 发现 `screen-result` 在 depth=2 打开，`screen-success` 在 depth=3
   - 确认 `screen-success` 被错误嵌套

### Root Cause Analysis
- **诊断方向错误**：过度关注 CSS 和 JS 逻辑，忽略了 DOM 结构
- **调试信息不完整**：一开始只看 `display`，没看 `width/height`
- **HTML 编辑历史**：可能是某次编辑时误删或漏写 `</div>`

### Key Insight
当元素 `display=block` 但 `width=0 height=0` 时：
1. **立即检查父元素的 display 状态**
2. **用脚本分析 DOM 嵌套**，不要肉眼看
3. **CSS 问题通常是显式的**，DOM 嵌套问题更隐蔽

### Resolution
- **Resolved**: 2026-05-09T14:30:00+08:00
- **Commit**: 57b22ef
- **Notes**: 在 `screen-success` 之前添加 `</div>` 关闭 `screen-result`，将 `screen-success` 移到 `.wrap` 外面

### Prevention
```bash
# 检查 div 平衡
node -e "
const html = require('fs').readFileSync('file.html', 'utf8');
let depth = 0, i = 0;
while (i < html.length) {
  if (html.substring(i,i+4) === '<div' && !html.substring(i,html.indexOf('>',i)+1).endsWith('/>')) depth++;
  if (html.substring(i,i+6) === '</div>') depth--;
  i++;
}
console.log('Final depth:', depth, depth === 0 ? 'BALANCED' : 'UNBALANCED');
"
```

### Metadata
- Source: debugging
- Related Files: OfferGO_V2.0-beta.html
- Tags: dom_nesting, hidden_element, parent_visibility, debugging_technique
- Pattern-Key: dom_structure_before_css
- Recurrence-Count: 1
- First-Seen: 2026-05-09
- Last-Seen: 2026-05-09
- See Also: LRN-20260508-001

---

## [LRN-20260509-002] best_practice

**Logged**: 2026-05-09T14:10:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
VM 浏览器环境有局限，复杂页面切换可能失败，需要用脚本分析或让用户本地验证

### Details
在调试 V2.0-beta 成功页问题时：
1. VM 浏览器多次崩溃、超时、无法渲染
2. 创建的最小化测试页面能正常工作，但完整页面无法切换
3. 最终用 Node.js 脚本分析 DOM 结构找到问题

### Key Takeaways
1. **VM 浏览器不是万能的** - 复杂页面、动态切换可能有渲染问题
2. **脚本分析比浏览器更可靠** - DOM 结构、CSS 语法、函数定义等
3. **让用户本地验证** - VM 无法验证时，不要说"完成了"

### Recommended Debugging Workflow
```
1. 代码自查（脚本）→ 2. VM 浏览器测试 → 3. 用户本地验证 → 4. 确认完成
```

### Metadata
- Source: debugging
- Tags: vm_browser_limitation, script_analysis, local_verification
- Pattern-Key: debugging_without_browser

---

## [LRN-20260506-001] correction

**Logged**: 2026-05-06T11:15:00+08:00
**Priority**: critical
**Status**: promoted
**Area**: frontend

### Summary
优化结果页不展示简历内容，产品定价未按PRD更新

### Details
用户反馈两个核心问题：
1. 优化后版本（最后一页前后对比）没有展示简历内容，`generateOptimizedDemo` 函数虽然写了但效果不够，而且兜底模式下 `optimized_text` 字段为空导致不展示
2. 结果页底部定价卡片还是 V1.3 的旧定价（¥9.9/次、¥19.9/模板、¥99/1v1），没有更新为产品团队确定的方案（¥0免费、¥9.9/次、¥19.9/3次、¥49.9/年、¥49/1v1）

### Root Cause
过度专注于技术修复（编码/ID/动画），忽略了已经确定的业务逻辑（定价）和用户体验（优化结果展示）

### Resolution
- **Resolved**: 2026-05-06T11:20:00+08:00
- **Notes**: 定价卡片已更新为PRD方案(¥9.9单次/¥19.9 3次/¥49.9年/¥49 1v1)；优化结果页现在展示真实简历前后对比
- **Promoted**: 检查清单已写入 MEMORY.md + CLAUDE.md

### Metadata
- Source: user_feedback
- Related Files: OfferGO_V1.4.html
- Tags: pricing, optimization, result_display
- Pattern-Key: prd_validation_checklist

---

## [LRN-20260506-002] correction

**Logged**: 2026-05-06T11:30:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
优化结果页缺少diff高亮标签，定价卡片无点击选中交互

### Details
1. 优化后简历内容没有用 `<span class="hi-key">` 和 `<span class="hi-add">` 包裹优化项，对比体验差
2. 定价卡片点击后没有视觉反馈，用户不知道点中了哪个

### Root Cause
简化重写时只关注了功能性（内容展示），忽略了交互细节（高亮标签、点击反馈）

### Resolution
- **Resolved**: 2026-05-06T11:35:00+08:00
- **Notes**: generateOptimizedDemo 输出带span标签的HTML；renderResultScreen 对优化内容不做escapeHtml；定价卡片加点击事件切换featured类

### Metadata
- Source: user_feedback
- Related Files: OfferGO_V1.4.html
- Tags: diff_highlight, paywall_interaction, result_display
- Pattern-Key: interaction_details_checklist

---

## [LRN-20260507-001] correction

**Logged**: 2026-05-07T10:00:00+08:00
**Priority**: critical
**Status**: promoted
**Area**: frontend

### Summary
V1.5 版本迭代中反复覆盖文件，导致 screen-optimize、优化动画 CSS/JS 等老功能丢失

### Details
从 V1.4 到 V1.5 的迭代过程中，发生了以下问题：
1. **screen-optimize 页面丢失** - HTML 被删除
2. **.loading-card CSS 丢失** - 优化加载页卡片无样式
3. **.company-progress CSS 丢失** - 优化步骤进度条无样式
4. **goPage('optimize') 路由丢失** - 点击优化按钮跳转到 loading 而非 optimize
5. **优化步骤动画 JS 丢失** - setTimeout 简化了步骤动画

### Root Cause
- 反复 `cp` 覆盖同一文件，累积修改出错
- 没有从稳定基线（V1.4）重新开始，而是从已损坏的 V1.5 继续修改
- 增量 SearchReplace 只改看得见的部分，没检查关联代码
- 改完没有验证所有 6 个 screen

### Resolution
- **Resolved**: 2026-05-07
- **Notes**: 基于 V1.4 创建干净的 V1.5.3，从头迁移 V1.5.2 的新功能
- **Promoted**: 制定了 version-guard skill + 防范机制文档

### Metadata
- Source: user_feedback
- Related Files: OfferGO_V1.5.2.html, OfferGO_V1.5.3.html
- Tags: file_versioning, incremental_modification, css_missing, js_missing
- Pattern-Key: version_iteration_backup_base
- Recurrence-Count: 5+
- First-Seen: 2026-05-06
- Last-Seen: 2026-05-07

---

## [LRN-20260507-002] best_practice

**Logged**: 2026-05-07T11:00:00+08:00
**Priority**: critical
**Status**: resolved
**Area**: frontend

### Summary
制定了完整的版本迭代防范机制（version-guard），从此所有迭代必须遵循

### Details
创建了防范机制文档和 skill，包含：
1. **基线原则**: 永不直接覆盖，稳定版本 + 新版本分离
2. **功能快照**: 改前记录所有 screen、css、js、id
3. **差异分析**: 标记新增/修改/删除，列出关联代码
4. **增量验证**: 改完立即检查关联代码
5. **回归验证**: 逐项检查功能完整性
6. **自动化检查脚本**: screen数量、CSS存在性、JS函数、重复ID

### Resolution
- **Resolved**: 2026-05-07
- **Notes**: 文档保存在 `docs/版本迭代防范机制.md`，skill 保存在 `.skills/version-guard/SKILL.md`

### Metadata
- Source: conversation
- Related Files: docs/版本迭代防范机制.md, .skills/version-guard/SKILL.md
- Tags: version_control, best_practice, prevention
- Pattern-Key: version_guard_workflow

---

## [LRN-20260507-003] correction

**Logged**: 2026-05-07T14:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
screen-landing 和 screen-user 没有 CSS 显示规则，导致同时显示

### Details
所有 screen 都使用 `.screen` 类，但只有部分 screen 有 `#screen-id{display:none}` 的 CSS 规则。screen-landing 和 screen-user 缺失这些规则，导致两个页面同时 `display:block` 显示。

### Root Cause
添加 screen-user 时，只复制了 HTML 和部分 CSS，没有检查该 screen 是否需要独立的显示规则

### Resolution
- **Resolved**: 2026-05-07
- **Notes**: 添加了 `#screen-landing` 和 `#screen-user` 的 `display:none` / `.on{display:block}` 规则

### Metadata
- Source: user_feedback
- Related Files: OfferGO_V1.5.3.html
- Tags: css_missing, screen_display, multiple_screens
- Pattern-Key: component_dependencies_check

---

## [LRN-20260507-004] best_practice

**Logged**: 2026-05-07T16:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
V1.6 UE优化版完成了5项改进，建立了完整的版本控制流程

### Details
按照 version-guard 流程，V1.6 完成了以下改进：
1. **大厂多选优化**: 添加提示文案 + 最多选3家 + 超限弹窗提醒
2. **示例按钮降级**: 文案改为"没有简历？先用示例体验"，视觉缩小
3. **页面后退按钮**: loading/score/optimize/result 4个页面添加返回按钮
4. **结果页默认优化后**: tab 默认选中"✨ 优化后版本"
5. **重新上传功能**: 预览卡片添加"重新上传"按钮

### Resolution
- **Resolved**: 2026-05-07
- **Notes**: V1.6.html 创建完成，回归验证全部通过

### Metadata
- Source: user_request
- Related Files: OfferGO_V1.6.html
- Tags: ue_optimization, version_control, feature_improvement
- Pattern-Key: version_iteration_with_guard

---

## [LRN-20260507-005] correction

**Logged**: 2026-05-07T20:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: backend

### Summary
Cloudflare Worker 部署失败：全局作用域不允许使用 setTimeout

### Details
Worker 代码中有全局作用域的 `setTimeout(() => {...}, 10 * 60 * 1000)` 用于清理过期缓存，但 Cloudflare Workers 不允许在全局作用域使用异步 I/O、定时器或随机数生成。

错误信息：
```
Uncaught Error: Disallowed operation called within global scope.
Asynchronous I/O (ex: fetch() or connect()), setting a timeout,
and generating random values are not allowed within global scope.
```

### Root Cause
不了解 Cloudflare Workers 的运行时限制，习惯性地在全局作用域使用 `setTimeout`

### Resolution
- **Resolved**: 2026-05-07
- **Notes**: 将 `setTimeout` 改为函数 `cleanExpiredCache()`，在请求处理时调用

### Metadata
- Source: error_log
- Related Files: worker.js
- Tags: cloudflare_workers, deployment, setTimeout, global_scope
- Pattern-Key: cloudflare_workers_runtime_limit

---

## [LRN-20260507-006] best_practice

**Logged**: 2026-05-07T21:00:00+08:00
**Priority**: critical
**Status**: resolved
**Area**: fullstack

### Summary
V1.7 完成真实 API 对接 + Cloudflare Worker 部署

### Details
完成了从 Demo 模式到真实环境的转变：
1. **Worker 后端**: 添加 `/api/upload` 接口，支持简历文件解析
2. **前端 API 层**: `callAPI()` + `mockAPI()` 双模式，可无缝切换
3. **文件上传**: 支持 TXT 直接读取，PDF/Word 转 base64 上传
4. **诊断流程**: 调用 `/api/analyze` 获取 AI 评分
5. **优化流程**: 调用 `/api/optimize` 获取前后对比预览
6. **结果展示**: 显示真实简历预览（部分）+ "付费后可见完整版"引导
7. **部署上线**: Worker 部署到 `https://offergo-api.babel5493.workers.dev`

### Resolution
- **Resolved**: 2026-05-07
- **Notes**: V1.7.html 已配置真实 API，Worker 已部署
- **Deployed**: https://offergo-api.babel5493.workers.dev

### Metadata
- Source: user_request
- Related Files: OfferGO_V1.7.html, worker.js, wrangler.toml
- Tags: api_integration, deployment, cloudflare_workers, fullstack
- Pattern-Key: frontend_backend_integration

---

## [LRN-20260507-007] correction

**Logged**: 2026-05-07T22:00:00+08:00
**Priority**: critical
**Status**: resolved
**Area**: frontend

### Summary
V1.7 程序直接挂了：函数重复定义 + 真实 API 未调试

### Details
用户测试 V1.7 时程序直接卡死，原因：
1. **`callAPI` 重复定义** - 第 1010 行和第 1094 行各定义了一次，第二个覆盖了第一个
2. **`USE_MOCK = false`** - 直接启用真实 API，但 API 可能因网络/CORS/配置问题失败
3. **错误处理不完善** - API 失败时用户卡在 loading 页面，没有友好的错误提示

### Root Cause
- 代码合并时没有检查重复定义
- 急于切换到真实环境，没有保留 Mock 作为 fallback
- 没有先验证产品闭环再启用真实 API

### Resolution
- **Resolved**: 2026-05-07
- **Notes**:
  1. 删除重复的 `callAPI` 定义
  2. 切回 `USE_MOCK = true` 确保产品能跑通
  3. 下次启用真实 API 前，先验证 Mock 模式完全正常

### Prevention
- 每次修改后用 `grep -c "function xxx"` 检查重复定义
- 新功能先用 Mock 验证，再逐步切换到真实环境
- 添加全局错误边界，防止 API 失败导致页面卡死

### Metadata
- Source: user_feedback
- Related Files: OfferGO_V1.7.html
- Tags: duplicate_function, api_failure, error_handling
- Pattern-Key: code_merge_validation
- Recurrence-Count: 1

---

## [LRN-20260508-001] correction

**Logged**: 2026-05-08T12:50:00+08:00
**Priority**: critical
**Status**: resolved
**Area**: frontend

### Summary
V1.81 付费成功页空白，修复后仍未解决，暴露验证流程严重缺失

### Details
V1.81 付费成功页（screen-success）点击"立即购买"后显示空白：
1. **发现并修复了两个 bug**：
   - CSS 语法错误：`@keyframes fadeIn{...opacity:1);}}` 多了一个 `)`
   - 重复 `</script>` 标签：第 1980 行 `</script></script>`

2. **修复后问题仍然存在**：
   - VM 浏览器无法验证修复效果
   - 最小化测试证明 `show()` 函数本身正常
   - 问题可能在其他地方

3. **更严重的问题**：
   - 每次做完都说"完成了"，但用户测试就出 bug
   - 反复回来改，浪费双方时间
   - 验证流程形同虚设

### Root Cause
- **验证不彻底**：只测主流程，不测边界情况（如付费成功页）
- **改完就交**：没有完整跑完所有 screen 的切换
- **环境依赖**：VM 浏览器有局限，但没要求用户本地验证
- **侥幸心理**：以为"代码看起来没问题"就是没问题

### Resolution
- **Resolved**: 2026-05-09T14:30:00+08:00
- **Commit**: 57b22ef
- **Notes**: 根本原因是 DOM 嵌套错误（screen-success 被嵌套在 screen-result 内部），详见 LRN-20260509-001

### Metadata
- Source: user_feedback
- Related Files: OfferGO_V1.81.html, OfferGO_V2.0-beta.html
- Tags: success_page_blank, incomplete_validation, recurring_bug
- Pattern-Key: thorough_validation_checklist
- Recurrence-Count: 10+
- First-Seen: 2026-05-06
- Last-Seen: 2026-05-09
- See Also: LRN-20260506-001, LRN-20260507-001, LRN-20260507-007, LRN-20260509-001

---

## [LRN-20260508-002] best_practice

**Logged**: 2026-05-08T12:55:00+08:00
**Priority**: critical
**Status**: pending
**Area**: frontend

### Summary
建立严格的验证流程，杜绝"改完就交、用户测出bug再改"的恶性循环

### Details
每次迭代都必须遵循以下验证流程：

### 1. 代码自查（改完后立即执行）
```bash
# 检查 CSS 语法错误
grep -n ";;" file.html          # 双分号
grep -n ");" file.html          # 多余括号
grep -n "{.*}" file.html | grep -v "}}"  # 未闭合

# 检查重复标签
grep -c "</script>" file.html   # 应该等于 <script> 数量
grep -c "</style>" file.html    # 应该等于 <style> 数量

# 检查重复函数定义
grep -n "function xxx" file.html | wc -l  # 应该等于 1
```

### 2. Screen 完整性验证
逐个访问所有 screen，确认：
- [ ] screen-landing：首页正常显示
- [ ] screen-loading：加载动画正常
- [ ] screen-score：诊断报告正常
- [ ] screen-optimize：优化进度正常
- [ ] screen-result：结果对比正常
- [ ] screen-success：**付费成功页正常**（重点！）
- [ ] screen-user：用户中心正常

### 3. 边界情况优先
- 付费成功页（用户付完钱看到什么？）
- 错误页（API 失败时用户看到什么？）
- 空状态（没上传简历时显示什么？）
- 网络异常（请求超时怎么处理？）

### 4. 用户验证确认
VM 环境无法验证时：
- 明确告知用户"需要本地验证"
- 提供验证步骤
- 等用户确认后再说"完成"

### Prevention
- 不说"完成了"，说"请验证"
- 不假设"应该没问题"，用测试证明
- 不跳过边界情况，优先测试

### Metadata
- Source: user_feedback
- Related Files: OfferGO_V1.81.html
- Tags: validation_workflow, quality_assurance, prevention
- Pattern-Key: strict_validation_workflow
- Recurrence-Count: 10+
- First-Seen: 2026-05-06
- Last-Seen: 2026-05-08

---
