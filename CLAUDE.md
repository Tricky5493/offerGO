# OfferGO 项目指南

## 项目概况
- 移动端简历ATS优化工具，纯前端H5，通过小红书引流
- Solo Founder（一人公司），所有方案必须一人可落地

## 关键业务决策（不可遗忘）
- **定价**：¥0免费诊断(限1次) + ¥9.9单次 + ¥19.9/3次特惠包 + ¥49.9/年会员 + ¥49/1v1
- **产品范围**：V1.4不做AI写简历/社区/PC端/英文简历
- **AI模型**：DeepSeek V3主力，Claude 3.5 Sonnet做付费优化
- **技术栈**：V1.3 H5原生JS + Cloudflare Worker + Supabase（后续）

## 常见错误（修改后必查清单）
1. □ 定价是否与PRD一致？不要用旧¥99定价
2. □ 结果页优化前后是否有简历内容？
3. □ 优化内容是否带diff高亮（hi-key蓝色/hi-add绿色）？
4. □ 所有HTML ID是否存在（cpStatus1-6, problemTitle等）
5. □ 中文处理用Python，不用Edit工具（防乱码）
6. □ DEMO_MODE和真实API模式都要有fallback
7. □ 定价卡片点击是否有选中交互？
8. □ 加载页进度条6家是否都展示？
