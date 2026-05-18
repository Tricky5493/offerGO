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
9. □ 隐藏/删除元素后，是否检查了关联的 margin/padding 偏移？（改 A 看 B）
10. □ replace_all 之前是否确认了每次匹配都正确？改完是否逐条 grep 验证？
11. □ 改了评分/阈值逻辑后，是否检查了所有消费该值的函数（render + build + 文案）阈值一致？
12. □ 改动超过 50 行前，是否先问了用户「要不要 cp 新版本号再改」？
13. □ 排查功能缺失时，是否前后端一起查了？（Worker 可能已有完整实现，只是前端开关没开）
14. □ 恢复压缩会话后，是否 grep 验证了关键变量（DEEPSEEK_PROXY_URL, DEEPSEEK_MODEL, DEEPSEEK_TIMEOUT）实际存在于文件中？不信任摘要中的代码状态声明。
15. □ data-co / ID 映射是否一致？HTML 中的短码（bd/tc/mt）需要映射为完整 ID（bytedance/tencent/meituan），否则公司名会显示为原始短码。
16. □ AI prompt 是否把 AI 引导成了"表面操作者"？不要写"替换弱动词"这类指令，要写"量化成果前置""删除冗余""重组顺序"等结构性要求。
17. □ 非关键路径（动画/特效/过渡）是否包在独立 try-catch 中？它们抛异常不能阻断关键业务路径（结果渲染、数据存储）。
