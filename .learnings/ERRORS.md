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
