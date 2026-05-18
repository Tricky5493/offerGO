# Errors

Command failures and integration errors.

---

## [ERR-20260507-001] SearchReplace_tool

**Logged**: 2026-05-07T14:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
SearchReplace 匹配失败，报错 "search content not found in original content"

### Error
```
Invalid data for edit_plan: search content not found in original content
```

### Context
修复 screen-landing/screen-user CSS 时，SearchReplace 匹配失败。原因是在之前的某个 SearchReplace 操作中，文件的某些行已经被修改或删除，但搜索内容没有同步更新。

### Suggested Fix
- SearchReplace 前先 Read 相关行，确认上下文准确
- 每次修改后立即验证，不要累积多个未验证的修改

### Metadata
- Reproducible: no (when following version-guard)
- Related Files: OfferGO_V1.5.3.html

---

## [ERR-20260517-002] undefined_variable_silent_fallback

**Logged**: 2026-05-17T16:30:00+08:00
**Priority**: critical
**Status**: resolved
**Area**: frontend

### Summary
`DEEPSEEK_PROXY_URL` 和 `DEEPSEEK_MODEL` 未定义，导致 `callDeepSeekOptimize()` 中 `fetch(undefined)` 静默失败，全程走本地引擎

### Error
```
// 浏览器控制台可能显示:
// TypeError: Failed to fetch (fetch(undefined))
// 或静默被 catch 捕获，显示 "Fallback to local engine: Failed to fetch"
```

### Context
- `OfferGO_V2.2.html` 第 1394 行：`fetch(DEEPSEEK_PROXY_URL, ...)` 但变量未定义
- 第 1398 行：`model: DEEPSEEK_MODEL` 同样未定义
- 只有 `DEEPSEEK_TIMEOUT` 在第 1358 行正确定义
- 用户报告"根本没有调用 DeepSeek API，直接走了本地规则"
- 修复：在第 1356-1357 行补充 `var DEEPSEEK_PROXY_URL = '/api/optimize'` 和 `var DEEPSEEK_MODEL = 'deepseek-chat'`
- 上一个会话摘要声称这些变量已定义，但实际文件状态不符

### Root Cause
会话压缩（compaction）后恢复上下文时，未验证关键代码变更是否真的在文件中持久化。信任了摘要而非实际文件内容。

### Suggested Fix
1. 恢复压缩会话后，先 grep 验证所有关键变量/函数存在
2. `callDeepSeekOptimize()` 入口加防御性 undefined 检查
3. 不信任摘要中的代码状态声明，始终 Read 验证

### Metadata
- Reproducible: yes (if variables not defined)
- Related Files: frontend/OfferGO_V2.2.html
- See Also: LRN-20260517-003

---

## [ERR-20260518-001] cache_version_conflict

**Logged**: 2026-05-18T20:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
AI prompt 升级后（换词→重构），旧缓存 key 未变更，导致旧 prompt 的结果被秒返，用户看到的是旧版优化结果。

### Error
优化流程瞬间完成，返回旧 prompt 生成的表面措辞替换结果（负责→主导），而非新版 prompt 的深度重构结果。

### Context
- V2.3.0 升级了 `buildCompanySpecificSystemPrompt` 的 AI 指令，从"弱动词替换"改为"量化成果前置/删除冗余/重组顺序"
- 但 `callDeepSeekOptimizePerCompany` 的缓存 key `offergo_opt_` + hash(...) 未变
- 相同简历+公司+岗位 → 命中旧缓存 → 返回旧 prompt 的结果

### Suggested Fix
- 缓存 key 加版本号：`offergo_opt_` → `offergo_opt_v2_`
- 后续 AI prompt 或优化逻辑有重大变更时，同步升级缓存版本号

### Resolution
- **Resolved**: 2026-05-18T20:15:00+08:00
- **Notes**: 缓存 key 前缀改为 `offergo_opt_v2_`

### Metadata
- Reproducible: yes (任何 prompt 变更后不更新缓存 key 都会复现)
- Related Files: frontend/OfferGO_V2.3.0.html (callDeepSeekOptimizePerCompany)
- See Also: LRN-20260517-004

---

## [ERR-20260518-002] animation_error_blocked_result

**Logged**: 2026-05-18T20:30:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
子步骤完成动画（cosmetic）中 `$('optTitle').textContent` 或 `querySelector` 抛异常后，被外层 catch 捕获，导致 `renderResultScreen` 和 `show('screen-result')` 未执行，用户看到"优化失败"页面而非结果页。

### Error
```
优化成功 → 子步骤动画循环中某行抛异常 → 跳到 catch(e) → 显示"优化失败"
用户看到：API 调用成功，但在完成瞬间弹出错误页
```

### Context
- `startOptimization` 的 try 块中，子步骤动画（4 步 for 循环）和结果渲染在同一 try 块
- 动画中 DOM 操作可能因元素不存在而抛异常
- 异常直接跳到 catch → 显示错误页 → 结果页永远不会渲染

### Suggested Fix
- 将子步骤动画包在独立 try-catch 中，失败只打 console.warn
- 关键路径（saveState + renderResultScreen + show）不应被 cosmetic 动画阻断
- 对所有 DOM 访问加空值检查（`if (titleEl) titleEl.textContent = ...`）

### Resolution
- **Resolved**: 2026-05-18T20:45:00+08:00
- **Notes**: 动画包在 try-catch 中，所有 DOM 访问加空值守卫

### Metadata
- Reproducible: yes (DOM 元素缺失或 querySelector 返回 null 时)
- Related Files: frontend/OfferGO_V2.3.0.html (startOptimization)
- See Also: LRN-20260518-001

---
