# OfferGO 项目打包说明

> 一人公司 · 移动端简历ATS优化工具 · 小红书引流变现

---

## 快速了解

OfferGO 是移动端 H5 简历 ATS（Applicant Tracking System）优化工具。用户上传简历 → AI 评分 → 一键优化 → 付费下载。

**核心差异点**：行业唯一 6 大厂独立 ATS 评分引擎（字节/阿里/腾讯/美团/京东/百度），各厂权重差异化。

---

## 项目当前状态

| 项目 | 值 |
|------|----|
| 版本 | V1.4（DEMO_MODE = true，兜底数据模式） |
| 技术栈 | 纯前端 H5 + Cloudflare Worker（待部署） |
| AI 模型 | DeepSeek V3（已配置 API Key） |
| 支付 | 未接入（占位 alert） |
| 用户系统 | 无 |

## 文件清单

```
/OfferGO/
├── OfferGO_V1.4.html          ← 主产品页面（修改这个文件）
├── worker.js                  ← Cloudflare Worker（DeepSeek 代理）
├── CLAUDE.md                  ← 项目上下文（必读！）
├── OfferGO_V1.4_PRD.md        ← 产品需求文档
│
├── deliverables/
│   ├── product-strategy/
│   │   ├── offergo-commercial-product-strategy-2026-05-05.md   ← 总战略报告
│   │   ├── OfferGO_商业化迭代路线图_V1.md                       ← 路线图
│   │   └── UE问题清单_2026-05-06.md                             ← UE 问题清单（18项）
│   └── xiaohongshu-content-strategy.md                         ← 小红书内容策略
│
├── docs/
│   └── 小红书30天冷启动内容计划.md                              ← 30 天运营计划
│
├── .learnings/                 ← 学习记录（修正/错误）
│   ├── LEARNINGS.md
│   ├── ERRORS.md
│   └── FEATURE_REQUESTS.md
│
└── .workbuddy/memory/          ← 项目长期记忆
    ├── MEMORY.md
    ├── 2026-05-05.md
    └── 2026-05-06.md
```

## 关键业务决策（不可遗忘）

### 定价方案
| SKU | 价格 | 说明 |
|-----|:----:|------|
| 免费诊断 | ¥0 | 限 1 次，完整 ATS 评分 + 问题列表 |
| 单次优化 | ¥9.9 | 单厂优化 + PDF 下载 |
| 3 次特惠包 | ¥19.9 | 可分次使用（¥6.63/次） |
| 年度会员 | ¥49.9 | 6 大厂全年无限次 + 模板库 |
| 1v1 顾问 | ¥49 | 资深 HR 审阅 + 48h 反馈 |

### 产品范围（V1.4 不做）
- ❌ AI 写简历
- ❌ 求职社区/论坛
- ❌ PC 端/多端同步
- ❌ 英文简历优化
- ❌ 批量投递自动化

### 技术选型
- 后端：Cloudflare Worker（Node.js）
- 数据库：Supabase（后续）
- 认证：微信 OAuth（后续）
- 支付：微信 JSAPI（后续）
- 部署：Vercel / Cloudflare Pages（前端）

### AI 模型策略
- 主力：DeepSeek V3（简历解析 + ATS 评分）
- 付费用户专属：Claude 3.5 Sonnet（简历润色优化）

---

## 代码结构关键点

### OfferGO_V1.4.html

```
5 个页面（screen）:
  screen-land       → 首页（上传区 + 统计数据 + 示例入口）
  screen-loading    → 诊断加载页（6 家进度动画）
  screen-score      → 评分报告页（总分 + 6厂评分 + 问题列表 + 优化选择）
  screen-optimize   → 优化加载页（5 步动画）
  screen-result     → 结果页（分数对比 + 简历前后对比 + 定价卡片）

关键函数:
  startAnalysis()        → AI 诊断流程
  renderScoreScreen()    → 渲染评分页
  startOptimization()    → AI 优化流程
  renderResultScreen()   → 渲染结果页
  generateDemoDiagnosis() → 兜底评分数据生成器
  generateDemoOptimization() → 兜底优化数据生成器
  generateOptimizedDemo()  → 生成带 diff 高亮的优化版简历

DEMO_MODE = true 时跳过 API 调用，使用生成数据
DEMO_MODE = false 时调用 Cloudflare Worker 的 /api/analyze 和 /api/optimize
```

### 重要逻辑
- 优化结果的"优化后版本"是 **HTML 格式**（含 `<span class="hi-key">` 和 `<span class="hi-add">` 高亮标签），不做 escapeHtml 转义
- 优化前版本是纯文本，做 escapeHtml 转义
- 定价卡片点击有 `.featured` 类切换交互

---

## 已知 UE 问题（待修复，共 18 项）

### P0 — 必须修复
1. **UE-8**: 目标公司多选交互不清晰（默认选中、无提示、视觉差）
2. **UE-15**: 页面无返回/后退机制

### P1 — 建议修复
3. **UE-12**: 结果页默认显示"优化前"而非"优化后"
4. **UE-13**: 付费卡片在底部可能被忽略
5. **UE-3**: 上传后不能替换文件
6. **UE-6**: 加载页不能中断/返回

### P2 — 优化项
7. 统计数据静态/加载动画慢/进度不清晰/PDF预览缺失/评分卡片不可点击/优化文案误导/付费弹窗简陋/错误恢复/触控优化/边界状态

---

## 部署说明

### 第一步：部署 Worker
```bash
npm install -g wrangler
wrangler login
wrangler deploy worker.js --name offergo-api
```

### 第二步：更新前端
在 OfferGO_V1.4.html 中找到 `var API_BASE`，改为 Worker 地址

### 第三步：切换为真实 API
将 `var DEMO_MODE = true` 改为 `var DEMO_MODE = false`

---

## 联系方式
- 项目文件夹：`/Users/tricky/Desktop/OfferGO/`
- 产品负责人：Solo Founder（一人公司）
- 所有技术决策以 `CLAUDE.md` 和 `MEMORY.md` 为准
