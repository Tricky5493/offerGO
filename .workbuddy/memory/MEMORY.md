# OfferGO 项目长期记忆

## 项目基本信息
- 项目名称：OfferGO — 移动端简历ATS智能优化工具
- 用户角色：**一个人的公司/一个人的项目（Solo Founder）**
- 核心渠道：小红书引流，用户在线使用
- 当前版本：V1.6/V1.7（H5前端 + Node.js 后端）
- 当前状态：商业化进行中

---

## 最新进展（2026-05-07）

### ✅ 已完成

#### 产品开发
- V1.4/V1.6/V1.7 前端页面已就绪
- 后端 API 服务已搭建（Express + TypeScript）
  - `/api/upload` - 简历上传与解析
  - `/api/analyze` - ATS 评分分析（6大厂独立评分）
  - `/api/optimize` - 简历优化
  - `/api/payment` - 支付接口（预留）
- Cloudflare Worker 代理层（DeepSeek API）

#### 营销内容
- 小红书账号定位策略完成
- 30天冷启动内容计划完成
- 20条精选标题库
- 5篇完整笔记文案
- 评论区回复模板（10个场景）
- 转化漏斗设计

#### 运营准备
- 账号名称推荐：「OfferGO · 大厂ATS诊断室」
- 内容人设定位：专业但不说教、焦虑但不贩卖
- KOC合作方案（0-1000元预算）

#### 产品发布会（新增！）
- 2026年6月15-17日，北京国际会展中心
- 主题：「给老黄瓜，再刷一次绿漆」
- 海报设计：「绿漆新生 / Green Lacquer Rebirth」风格
- 调色板：深墨绿 #1B3A2D + 荧光嫩绿 #A8E063 + 暖米白 #F5F0E8

---

## 核心决策记录

| 日期 | 决策 | 说明 |
|------|------|------|
| 2026-05-05 | 商业化产品战略规划 | PRD + 路线图 |
| 2026-05-05 | Sprint 1 技术架构评估 | Node.js + Supabase + CF Workers |
| 2026-05-05 | 确认 Solo Founder 模式 | 简化技术方案，前置营销规划 |
| 2026-05-06 | V1.4 代码改造完成 | DEMO_MODE 兜底、6大厂评分 |
| 2026-05-06 | 后端 API 服务搭建 | Express + TypeScript 模块化 |
| 2026-05-07 | 小红书营销策略完成 | 30天内容计划 + 完整文案 |
| 2026-05-07 | 产品发布会策划 | 海报设计 + 活动主题 |

---

## 定价方案（已确定）

| SKU | 价格 | 说明 |
|-----|:----:|------|
| 免费诊断 | ¥0 | 限 1 次，完整 ATS 评分 + 问题列表 |
| 单次优化 | ¥9.9 | 单厂优化 + PDF 下载 |
| 3 次特惠包 | ¥19.9 | 可分次使用（¥6.63/次） |
| 年度会员 | ¥49.9 | 6 大厂全年无限次 + 模板库 |
| 1v1 顾问 | ¥49 | 资深 HR 审阅 + 48h 反馈 |

---

## 产品范围

### ✅ V1.4 包含
- AI 简历解析（PDF/Word/图片/文本粘贴）
- 6 大厂独立 ATS 评分
- AI 简历优化（DeepSeek + Claude）
- 微信登录（待接入）
- 微信支付（待接入）
- 用户账户系统（待完善）

### ❌ V1.4 不做
- AI 写简历（从零生成）
- 求职社区/论坛
- PC 端/多端同步
- 英文简历优化
- 批量投递自动化
- 企业端/HR端

---

## 技术架构

### 当前架构
```
用户浏览器 (H5)
    ↓
Cloudflare Pages (前端静态)
    ↓
Cloudflare Worker (API 代理 / DeepSeek)
    ↓
Node.js Backend (Express + TypeScript)
    ↓
用户数据 (Supabase)
```

### 技术栈
- 前端：原生 HTML5 + CSS + JavaScript
- 后端：Node.js + Express + TypeScript
- 数据库：Supabase（PostgreSQL）
- AI：DeepSeek V3（简历解析+评分）、Claude 3.5 Sonnet（付费用户优化）
- 部署：Vercel / Cloudflare Pages（前端）、Cloudflare Workers（AI代理）
- 认证：微信 OAuth（待接入）
- 支付：微信 JSAPI（待接入）

---

## 项目文件清单

```
/workspace/
├── offergo/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── analyze.ts      # ATS 评分
│   │   │   │   ├── optimize.ts     # 简历优化
│   │   │   │   ├── payment.ts      # 支付
│   │   │   │   └── upload.ts       # 简历上传
│   │   │   └── index.ts           # Express 入口
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/
│       └── types.ts                # 共享类型定义
│
├── deliverables/
│   ├── product-strategy/
│   │   ├── OfferGO_商业化迭代路线图_V1.md
│   │   ├── offergo-commercial-product-strategy-2026-05-05.md
│   │   └── UE问题清单_2026-05-06.md
│   ├── tech-architecture/
│   │   └── Sprint1_技术架构评估_V1.md
│   ├── OfferGO_2026_Poster.png      # 发布会海报
│   └── OfferGO_Poster_DesignPhilosophy.md
│
├── docs/
│   └── 小红书30天冷启动内容计划.md
│
├── .workbuddy/memory/
│   ├── MEMORY.md                    # 本文件
│   ├── 2026-05-05.md
│   ├── 2026-05-06.md
│   └── 2026-05-07.md
│
├── OfferGO_V1.6.html
├── OfferGO_V1.7.html
├── OfferGo_社交媒体发展策略汇总.md
├── OfferGo_社交媒体发展内容汇总.md
├── PROJECT_SUMMARY.md
├── CLAUDE.md
└── worker.js                        # Cloudflare Worker
```

---

## 待办事项

### 紧急（P0）
- [ ] 部署 Cloudflare Worker
- [ ] 前端 API_BASE 改为正式 Worker 地址
- [ ] 接入微信登录（需服务号资质）
- [ ] 接入微信支付（需企业认证）

### 重要（P1）
- [ ] 小红书账号注册 + 养号
- [ ] 发布首批笔记内容
- [ ] 内测用户招募（100人）
- [ ] 数据埋点 SDK 接入

### 常规（P2）
- [ ] 发布会筹备（6月15-17日）
- [ ] KOC 合作洽谈
- [ ] 产品发布会物料准备

---

## 常见错误检查清单

每次代码修改后必查：
1. □ 定价是否与 PRD 一致？不要沿用旧定价
2. □ 结果页优化前后是否都有内容？不是空页面
3. □ 优化内容是否带 diff 高亮标签？
4. □ 所有 HTML 元素 ID 是否存在（cpStatus1-6, problemTitle 等）
5. □ 中文编码是否完整无乱码？
6. □ DEMO_MODE 和真实 API 模式是否都有正常 fallback？
7. □ 定价卡片点击是否有选中交互？

---

## 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-05-07 | 新增产品发布会策划、海报设计 |
| 2026-05-07 | 小红书营销策略全部完成 |
| 2026-05-06 | 后端 API 服务搭建完成 |
| 2026-05-06 | V1.4 前端改造完成 |
| 2026-05-05 | 商业化战略规划完成 |
