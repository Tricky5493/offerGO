# OfferGO 项目指南

## 项目概况
- 移动端简历ATS优化工具，纯前端H5，通过小红书引流
- Solo Founder（一人公司），所有方案必须一人可落地

## 关键业务决策（不可遗忘）
- **定价**：¥0免费诊断(限1次) + ¥9.9单次 + ¥19.9/3次特惠包 + ¥49.9/年会员 + ¥49/1v1
- **产品范围**：V1.4不做AI写简历/社区/PC端/英文简历
- **AI模型**：DeepSeek V3主力，Claude 3.5 Sonnet做付费优化
- **技术栈**：V1.3 H5原生JS + Cloudflare Worker + Supabase（后续）

## 基础设施须知
- **workers.dev 域名在国内被墙**，必须绑自定义域名（ICP备案）才能让用户访问
- **支付方案**：虎皮椒（Hupijiao）—— 个人开发者接入微信/支付宝的首选，无需公司资质
  - 注册 → 实名审核(5-10min) → 获取 API 密钥 → 对接 Worker 后端
- **国内访问架构**：H5 前端 → 已备案自定义域名 → Cloudflare Worker → 虎皮椒支付
- **API Key 走 Cloudflare Secrets**（`wrangler secret put`），不要硬编码
- **Wrangler CLI v4**命令用空格分隔（`wrangler kv namespace create`），不是冒号
- **数据持久化用 KV**：`resume:{id}` TTL 7天 / `order:{id}` TTL 30天
- **用户标识用 UUID**：`u_时间戳_随机串`存localStorage，请求自动附加userId

## 常见错误（修改后必查清单）
1. □ 定价是否与PRD一致？不要用旧¥99定价
2. □ 结果页优化前后是否有简历内容？
3. □ 优化内容是否带diff高亮（hi-key蓝色/hi-add绿色）？
4. □ 所有HTML ID是否存在（cpStatus1-6, problemTitle等）
5. □ 中文处理用Python，不用Edit工具（防乱码）
6. □ DEMO_MODE和真实API模式都要有fallback
7. □ 定价卡片点击是否有选中交互？
8. □ 加载页进度条6家是否都展示？
