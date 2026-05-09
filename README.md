# OfferGO

让大厂无法拒绝你 —— AI 简历优化 & ATS 智能匹配

## 项目简介

OfferGO 是一款面向求职者的 AI 简历优化工具，精准解析字节、阿里、腾讯等大厂 ATS 评分规则，帮助简历脱颖而出。

## 核心功能

- **AI 深度诊断**：30 秒获得 ATS 评分，识别简历短板
- **大厂精准匹配**：针对 6+ 大厂 ATS 规则定制优化
- **一键优化**：AI 自动补充关键词、量化指标
- **前后对比**：清晰展示优化改动，支持 PDF/Word 下载

## 技术栈

- **前端**：原生 HTML + CSS + JavaScript
- **后端**：Cloudflare Workers + TypeScript
- **部署**：GitHub Pages / Cloudflare Pages

## 快速启动

```bash
# 本地预览
python3 -m http.server 8080

# 打开浏览器访问
open http://localhost:8080/OfferGO_V1.81.html
```

## 版本历史

- **V1.81**：UI/UX 升级，修复付费成功页问题
- **V1.8**：结果页闭环，添加付费引导
- **V1.7**：真实 API 对接 + Worker 部署
- **V1.6**：UE 优化（多选、后退按钮等）
- **V1.5**：新增用户中心、底部导航
- **V1.4**：优化结果展示、定价更新

## 项目结构

```
├── OfferGO_V1.81.html    # 最新版本
├── worker.js             # Cloudflare Worker 后端
├── offergo/              # 后端源码
│   ├── backend/src/      # API 路由
│   └── shared/types.ts   # 类型定义
├── docs/                 # 文档
├── deliverables/         # 交付物
└── .learnings/           # 学习记录
```

## 开发团队

Powered by AI + Human Collaboration

---

© 2026 OfferGO · 大厂 ATS 诊断 · AI 简历优化专家
