# OfferGO 产品优化设计方案

## 设计原则
- 保持现有简洁、专业的视觉风格
- 延续 CSS 变量体系（--primary, --card, --bg 等）
- 保持移动端优先，最大宽度 480px
- 动画效果与现有产品一致（fadeUp, scaleIn 等）

---

## 一、「其他大厂敬请期待」UI 设计

### 位置
评分页（screen-score）的「各厂匹配度」区域下方

### 设计效果

```
┌─────────────────────────────────────────┐
│  🏢 各厂匹配度                           │
├─────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐                │
│  │ 美团 72 │ │ 阿里 68 │                │
│  └─────────┘ └─────────┘                │
│  ┌─────────┐ ┌─────────┐                │
│  │ 字节 65 │ │ 腾讯 70 │                │
│  └─────────┘ └─────────┘                │
│  ┌─────────┐ ┌─────────┐                │
│  │ 京东 58 │ │ 百度 62 │                │
│  └─────────┘ └─────────┘                │
├─────────────────────────────────────────┤
│  🔒 更多大厂陆续攻坚中                   │
│  ─────────────────────────────────────  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ 小 │ │ 滴 │ │ 快 │ │ 网 │           │
│  │ 红 │ │ 滴 │ │ 手 │ │ 易 │           │
│  │ 书 │ │    │ │    │ │    │           │
│  └────┘ └────┘ └────┘ └────┘           │
│  灰50% + 虚线边框                        │
│                                         │
│  [🔔 上线提醒我]  ← 按钮                 │
└─────────────────────────────────────────┘
```

### CSS 样式

```css
/* 敬请期待区域 */
.coming-soon-section {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border2);
  padding: 16px;
  margin-top: 12px;
}

.coming-soon-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
}

.coming-soon-header::before {
  content: '🔒';
  font-size: 14px;
}

.coming-soon-divider {
  height: 1px;
  background: var(--border);
  margin: 0 -16px 12px;
}

.coming-soon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.coming-soon-item {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  border: 1.5px dashed var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0.5;
  transition: all 0.25s;
}

.coming-soon-item:hover {
  opacity: 0.8;
  border-color: var(--primary);
}

.coming-soon-logo {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: var(--bg);
  color: var(--text3);
}

.coming-soon-name {
  font-size: 10px;
  color: var(--text3);
}

.coming-soon-btn {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.coming-soon-btn:active {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
  transform: scale(0.98);
}
```

### HTML 结构

```html
<!-- 添加到 screen-score 的 co-grid 后面 -->
<div class="coming-soon-section fade-up">
  <div class="coming-soon-header">更多大厂陆续攻坚中</div>
  <div class="coming-soon-divider"></div>
  <div class="coming-soon-grid">
    <div class="coming-soon-item" data-company="xiaohongshu">
      <div class="coming-soon-logo" style="background:#FF2442;color:#fff;">小</div>
      <span class="coming-soon-name">小红书</span>
    </div>
    <div class="coming-soon-item" data-company="didi">
      <div class="coming-soon-logo" style="background:#FF7F00;color:#fff;">滴</div>
      <span class="coming-soon-name">滴滴</span>
    </div>
    <div class="coming-soon-item" data-company="kuaishou">
      <div class="coming-soon-logo" style="background:#FF6600;color:#fff;">快</div>
      <span class="coming-soon-name">快手</span>
    </div>
    <div class="coming-soon-item" data-company="netease">
      <div class="coming-soon-logo" style="background:#C40000;color:#fff;">网</div>
      <span class="coming-soon-name">网易</span>
    </div>
  </div>
  <button class="coming-soon-btn" onclick="notifyWhenAvailable()">
    <span>🔔</span> 上线提醒我
  </button>
</div>
```

### 交互逻辑

```javascript
// 点击「上线提醒我」
function notifyWhenAvailable() {
  // 方案1: 直接引导关注公众号
  alert('关注「OfferGO」公众号，新厂上线第一时间通知你');
  
  // 方案2: 收集用户选择（后续实现）
  // 记录用户最期待哪家，优先攻坚
}

// 点击具体大厂（数据收集）
document.querySelectorAll('.coming-soon-item').forEach(item => {
  item.addEventListener('click', () => {
    const company = item.dataset.company;
    // 上报数据：用户关注哪家
    console.log('User interested in:', company);
    // 显示提示
    const name = item.querySelector('.coming-soon-name').textContent;
    alert(`我们正在深入研究${name}的ATS筛选逻辑，预计6月上线`);
  });
});
```

---

## 二、关闭「1V1顾问」后的 3 SKU 定价页

### 位置
结果页（screen-result）的 paywall-card 区域

### 设计效果

```
┌─────────────────────────────────────────┐
│  ⭐ 解锁完整优化报告                     │
│  包含 6 大厂详细评分 + 专属关键词包       │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 单厂 AI 优化          ¥9.9/次   │    │
│  │ 单次优化 + PDF下载              │    │
│  │                    [立即购买]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔥 热门选择                     │    │
│  │ 3 次特惠包           ¥19.9/3次  │    │
│  │ ¥6.63/次 · 可分次使用           │    │
│  │                    [立即购买]   │    │ ← 主按钮样式
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 💎 最超值                       │    │
│  │ 年度会员             ¥49.9/年   │    │
│  │ 全年无限次 + 模板库             │    │
│  │                    [开通会员]   │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### CSS 样式

```css
/* 3 SKU 定价卡片 - 垂直布局 */
.pay-tiers-v2 {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pay-tier-v2 {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 16px;
  border: 1.5px solid var(--border);
  transition: all 0.2s;
  position: relative;
}

.pay-tier-v2:active {
  transform: scale(0.99);
}

/* 热门选择 - 中间项突出 */
.pay-tier-v2.featured {
  background: var(--primary-light);
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(31, 76, 204, 0.15);
}

/* 最超值 - 年度会员 */
.pay-tier-v2.premium {
  background: linear-gradient(135deg, #fafbfc 0%, #f0f4ff 100%);
  border-color: var(--primary);
  border-style: dashed;
}

.pay-tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.pay-tier-badge.hot {
  color: var(--accent);
  background: var(--accent-light);
}

.pay-tier-badge.premium {
  color: var(--primary);
  background: rgba(31, 76, 204, 0.1);
}

.pay-tier-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pay-tier-name-v2 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text1);
}

.pay-tier-price-v2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  text-align: right;
}

.pay-tier-price-v2 small {
  font-size: 12px;
  font-weight: 400;
  color: var(--text3);
}

.pay-tier-desc-v2 {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 12px;
  line-height: 1.5;
}

.pay-tier-btn {
  width: 100%;
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 11px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.pay-tier-btn:active {
  transform: scale(0.98);
}

/* 热门选择按钮 */
.pay-tier-v2.featured .pay-tier-btn {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(31, 76, 204, 0.3);
}

.pay-tier-v2.featured .pay-tier-btn:active {
  background: var(--primary-dark);
}

/* 最超值按钮 */
.pay-tier-v2.premium .pay-tier-btn {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(31, 76, 204, 0.05);
}
```

### HTML 结构

```html
<!-- 替换原有的 pay-tiers -->
<div class="pay-tiers-v2">
  <!-- 单次优化 -->
  <div class="pay-tier-v2">
    <div class="pay-tier-main">
      <span class="pay-tier-name-v2">单厂 AI 优化</span>
      <span class="pay-tier-price-v2">¥9.9<small>/次</small></span>
    </div>
    <div class="pay-tier-desc-v2">单次优化 + PDF下载 + 关键词报告</div>
    <button class="pay-tier-btn" onclick="handlePayment('single')">立即购买</button>
  </div>

  <!-- 3次包 - 热门选择 -->
  <div class="pay-tier-v2 featured">
    <div class="pay-tier-badge hot">🔥 热门选择</div>
    <div class="pay-tier-main">
      <span class="pay-tier-name-v2">3 次特惠包</span>
      <span class="pay-tier-price-v2">¥19.9<small>/3次</small></span>
    </div>
    <div class="pay-tier-desc-v2">¥6.63/次 · 可分次使用 · 适合多厂投递</div>
    <button class="pay-tier-btn" onclick="handlePayment('bundle')">立即购买</button>
  </div>

  <!-- 年度会员 - 最超值 -->
  <div class="pay-tier-v2 premium">
    <div class="pay-tier-badge premium">💎 最超值</div>
    <div class="pay-tier-main">
      <span class="pay-tier-name-v2">年度会员</span>
      <span class="pay-tier-price-v2">¥49.9<small>/年</small></span>
    </div>
    <div class="pay-tier-desc-v2">6 大厂全年无限次 + 模板库 + 新功能优先</div>
    <button class="pay-tier-btn" onclick="handlePayment('yearly')">开通会员</button>
  </div>
</div>
```

---

## 三、「用户中心」MVP 页面设计

### 入口位置
- 首页右上角头像图标（替代现有的 Beta badge）
- 或底部固定导航栏（推荐，更符合移动端习惯）

### 页面结构

```
┌─────────────────────────────────────────┐
│  👤 用户中心                    [设置⚙️] │
├─────────────────────────────────────────┤
│                                         │
│  ┌───┐                                  │
│  │ 👤│  微信用户_abc                   │
│  └───┘  免费用户 · 剩余 1 次诊断        │
│                                         │
│  [升级年度会员 ¥49.9/年]  ← 如果是免费用户│
│                                         │
├─────────────────────────────────────────┤
│  📊 我的数据                             │
│  ─────────────────────────────────────  │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │   3    │ │   0    │ │   6    │      │
│  │ 累计诊断│ │ 累计优化│ │ 已解锁 │      │
│  └────────┘ └────────┘ └────────┘      │
├─────────────────────────────────────────┤
│  📄 我的简历                             │
│  ─────────────────────────────────────  │
│  ┌─────────────────────────────────┐    │
│  │ 📄 后端工程师_2026-05-06.pdf    │    │
│  │ 上传于今天 · 已诊断             │    │
│  │                            [→]  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 📄 产品经理_2026-05-01.pdf      │    │
│  │ 上传于5天前 · 已优化            │    │
│  │                            [→]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [+ 上传新简历]                         │
├─────────────────────────────────────────┤
│  💰 我的订单                             │
│  ─────────────────────────────────────  │
│  ┌─────────────────────────────────┐    │
│  │ 3次特惠包              ¥19.9    │    │
│  │ 购买于 2026-05-06 · 剩余 2 次   │    │
│  │                            [→]  │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  ⚙️ 更多                                 │
│  ─────────────────────────────────────  │
│  ┌─────────────────────────────────┐    │
│  │ 📖 使用帮助                [→]  │    │
│  ├─────────────────────────────────┤    │
│  │ 🔒 隐私协议                [→]  │    │
│  ├─────────────────────────────────┤    │
│  │ 💬 意见反馈                [→]  │    │
│  ├─────────────────────────────────┤    │
│  │ 🚪 退出登录                [→]  │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### CSS 样式

```css
/* 用户中心页面 */
#screen-user {
  display: none;
}
#screen-user.on {
  display: block;
}

/* 用户信息卡片 */
.user-header-card {
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border2);
  padding: 20px;
  margin-bottom: 12px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text1);
  margin-bottom: 4px;
}

.user-status {
  font-size: 12px;
  color: var(--text3);
}

.user-status .tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.user-status .tag.free {
  color: var(--text2);
  background: var(--bg);
}

.user-status .tag.vip {
  color: var(--primary);
  background: var(--primary-light);
}

.user-upgrade-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary2) 100%);
  border: none;
  border-radius: var(--radius);
  padding: 13px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(31, 76, 204, 0.25);
}

.user-upgrade-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 数据统计 */
.user-stats-card {
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border2);
  padding: 18px 16px;
  margin-bottom: 12px;
}

.user-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.user-stat-item {
  text-align: center;
  padding: 12px 8px;
  background: var(--bg);
  border-radius: var(--radius-sm);
}

.user-stat-num {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.user-stat-label {
  font-size: 11px;
  color: var(--text3);
}

/* 列表卡片 */
.user-list-card {
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border2);
  margin-bottom: 12px;
  overflow: hidden;
}

.user-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border2);
}

.user-list-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-list-action {
  font-size: 12px;
  color: var(--primary);
  background: none;
  border: none;
  cursor: pointer;
}

.user-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.2s;
}

.user-list-item:last-child {
  border-bottom: none;
}

.user-list-item:active {
  background: var(--bg);
}

.user-list-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.user-list-content {
  flex: 1;
  min-width: 0;
}

.user-list-main {
  font-size: 13px;
  font-weight: 600;
  color: var(--text1);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-list-sub {
  font-size: 11px;
  color: var(--text3);
}

.user-list-arrow {
  font-size: 14px;
  color: var(--text3);
}

/* 菜单列表 */
.user-menu-list {
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border2);
  overflow: hidden;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.2s;
}

.user-menu-item:last-child {
  border-bottom: none;
}

.user-menu-item:active {
  background: var(--bg);
}

.user-menu-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
}

.user-menu-text {
  flex: 1;
  font-size: 14px;
  color: var(--text1);
}

.user-menu-arrow {
  font-size: 14px;
  color: var(--text3);
}

/* 底部导航栏 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  background: var(--card);
  border-top: 1px solid var(--border);
  padding: 8px 0 calc(8px + var(--safe-bot));
  display: flex;
  justify-content: space-around;
  z-index: 100;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 16px;
  cursor: pointer;
  color: var(--text3);
  transition: color 0.2s;
}

.bottom-nav-item.active {
  color: var(--primary);
}

.bottom-nav-icon {
  font-size: 20px;
}

.bottom-nav-label {
  font-size: 10px;
  font-weight: 500;
}
```

### HTML 结构

```html
<!-- 用户中心页面 -->
<div id="screen-user">
  <div class="header">
    <div class="header-inner">
      <div class="section-title" style="font-size:17px;">用户中心</div>
      <button class="preview-toggle" onclick="showSettings()">设置</button>
    </div>
  </div>

  <!-- 用户信息 -->
  <div class="user-header-card fade-up">
    <div class="user-profile">
      <div class="user-avatar" id="userAvatar">👤</div>
      <div class="user-info">
        <div class="user-name" id="userName">微信用户</div>
        <div class="user-status">
          <span class="tag free" id="userTag">免费用户 · 剩余 1 次诊断</span>
        </div>
      </div>
    </div>
    <button class="user-upgrade-btn" id="upgradeBtn" onclick="showPayment()">
      升级年度会员 ¥49.9/年
    </button>
  </div>

  <!-- 数据统计 -->
  <div class="user-stats-card fade-up">
    <div class="section-title" style="font-size:14px;display:flex;align-items:center;gap:6px;">
      <span>📊</span> 我的数据
    </div>
    <div class="user-stats-grid">
      <div class="user-stat-item">
        <div class="user-stat-num" id="statDiagnosis">0</div>
        <div class="user-stat-label">累计诊断</div>
      </div>
      <div class="user-stat-item">
        <div class="user-stat-num" id="statOptimize">0</div>
        <div class="user-stat-label">累计优化</div>
      </div>
      <div class="user-stat-item">
        <div class="user-stat-num" id="statCompanies">6</div>
        <div class="user-stat-label">已解锁大厂</div>
      </div>
    </div>
  </div>

  <!-- 我的简历 -->
  <div class="user-list-card fade-up">
    <div class="user-list-header">
      <div class="user-list-title"><span>📄</span> 我的简历</div>
      <button class="user-list-action" onclick="uploadNewResume()">+ 上传新简历</button>
    </div>
    <div id="resumeList">
      <!-- 动态渲染简历列表 -->
      <div class="user-list-item" onclick="viewResume('id1')">
        <div class="user-list-icon">📄</div>
        <div class="user-list-content">
          <div class="user-list-main">后端工程师_2026-05-06.pdf</div>
          <div class="user-list-sub">上传于今天 · 已诊断</div>
        </div>
        <span class="user-list-arrow">›</span>
      </div>
    </div>
  </div>

  <!-- 我的订单 -->
  <div class="user-list-card fade-up">
    <div class="user-list-header">
      <div class="user-list-title"><span>💰</span> 我的订单</div>
    </div>
    <div id="orderList">
      <!-- 动态渲染订单列表 -->
      <div class="user-list-item" onclick="viewOrder('id1')">
        <div class="user-list-icon" style="background:var(--success-light);">💎</div>
        <div class="user-list-content">
          <div class="user-list-main">3次特惠包</div>
          <div class="user-list-sub">购买于 2026-05-06 · 剩余 2 次</div>
        </div>
        <span class="user-list-arrow">›</span>
      </div>
    </div>
  </div>

  <!-- 更多菜单 -->
  <div class="user-menu-list fade-up">
    <div class="user-menu-item" onclick="showHelp()">
      <span class="user-menu-icon">📖</span>
      <span class="user-menu-text">使用帮助</span>
      <span class="user-menu-arrow">›</span>
    </div>
    <div class="user-menu-item" onclick="showPrivacy()">
      <span class="user-menu-icon">🔒</span>
      <span class="user-menu-text">隐私协议</span>
      <span class="user-menu-arrow">›</span>
    </div>
    <div class="user-menu-item" onclick="showFeedback()">
      <span class="user-menu-icon">💬</span>
      <span class="user-menu-text">意见反馈</span>
      <span class="user-menu-arrow">›</span>
    </div>
    <div class="user-menu-item" onclick="logout()">
      <span class="user-menu-icon">🚪</span>
      <span class="user-menu-text">退出登录</span>
      <span class="user-menu-arrow">›</span>
    </div>
  </div>
</div>

<!-- 底部导航栏（添加到 wrap 容器内） -->
<div class="bottom-nav">
  <div class="bottom-nav-item active" onclick="switchTab('home')">
    <span class="bottom-nav-icon">🏠</span>
    <span class="bottom-nav-label">首页</span>
  </div>
  <div class="bottom-nav-item" onclick="switchTab('user')">
    <span class="bottom-nav-icon">👤</span>
    <span class="bottom-nav-label">我的</span>
  </div>
</div>
```

### JavaScript 交互

```javascript
// 切换页面
function switchTab(tab) {
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
  
  if (tab === 'home') {
    showScreen('screen-land');
  } else if (tab === 'user') {
    showScreen('screen-user');
    loadUserData();
  }
}

// 加载用户数据
function loadUserData() {
  // 从 localStorage 或 API 获取
  const userData = {
    name: localStorage.getItem('userName') || '微信用户',
    avatar: localStorage.getItem('userAvatar') || '',
    isVip: localStorage.getItem('isVip') === 'true',
    diagnosisCount: parseInt(localStorage.getItem('diagnosisCount') || '0'),
    optimizeCount: parseInt(localStorage.getItem('optimizeCount') || '0'),
    remainingFree: parseInt(localStorage.getItem('remainingFree') || '1')
  };
  
  // 更新 UI
  document.getElementById('userName').textContent = userData.name;
  document.getElementById('statDiagnosis').textContent = userData.diagnosisCount;
  document.getElementById('statOptimize').textContent = userData.optimizeCount;
  
  if (userData.avatar) {
    document.getElementById('userAvatar').innerHTML = `<img src="${userData.avatar}">`;
  }
  
  if (userData.isVip) {
    document.getElementById('userTag').className = 'tag vip';
    document.getElementById('userTag').textContent = '年度会员 · 无限次使用';
    document.getElementById('upgradeBtn').style.display = 'none';
  } else {
    document.getElementById('userTag').textContent = `免费用户 · 剩余 ${userData.remainingFree} 次诊断`;
  }
}

// 其他交互函数
function showSettings() { alert('设置功能开发中'); }
function showPayment() { showScreen('screen-result'); }
function uploadNewResume() { showScreen('screen-land'); }
function viewResume(id) { console.log('View resume:', id); }
function viewOrder(id) { console.log('View order:', id); }
function showHelp() { alert('使用帮助：\n1. 上传简历\n2. 获取 ATS 评分\n3. 选择目标大厂优化\n4. 付费解锁完整报告'); }
function showPrivacy() { alert('隐私协议内容...'); }
function showFeedback() { alert('请发送反馈至：feedback@offergo.com'); }
function logout() { 
  if (confirm('确定退出登录？')) {
    localStorage.clear();
    location.reload();
  }
}
```

---

## 四、首页入口调整

### 右上角改为用户头像入口

```html
<!-- 替换原有的 header-actions -->
<div class="header-actions">
  <div class="user-avatar-small" onclick="switchTab('user')" style="width:32px;height:32px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;">
    👤
  </div>
</div>
```

---

## 五、总结

### 改动清单

| 模块 | 改动内容 | 优先级 |
|------|---------|:------:|
| 评分页 | 新增「敬请期待」区域 | P1 |
| 结果页 | 4 SKU → 3 SKU，优化视觉层次 | P0 |
| 全局 | 新增底部导航栏 | P1 |
| 新增页 | 用户中心 MVP | P1 |
| 首页 | 右上角改为用户头像入口 | P2 |

### 技术实现建议

1. **CSS**：将新样式追加到现有 `<style>` 标签末尾
2. **HTML**：按注释位置插入新结构
3. **JS**：新函数追加到现有 `<script>` 末尾
4. **数据存储**：先使用 localStorage，后端就绪后迁移

### 视觉一致性检查

- ✅ 使用现有 CSS 变量（--primary, --card, --bg 等）
- ✅ 圆角使用 var(--radius) 系列
- ✅ 阴影使用 var(--shadow) 系列
- ✅ 动画使用 fadeUp, scaleIn 等现有动画
- ✅ 字体大小遵循 10px-17px 层级
- ✅ 间距使用 8px/12px/16px 倍数
