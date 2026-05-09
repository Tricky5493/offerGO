#!/usr/bin/env python3
"""
OfferGO 2026 产品发布会 — 海报 V2（精修版）
设计哲学：绿漆新生 / Green Lacquer Rebirth
1080 × 1920 px
"""

import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920

# ── 调色板 ──────────────────────────────────────────────────────────────────
C_BG          = (18,  42,  30)    # 更深的背景绿
C_DEEP_GREEN  = (27,  58,  45)
C_MID_GREEN   = (38,  75,  55)
C_NEON        = (168, 224, 99)    # #A8E063
C_NEON_DIM    = (120, 180, 60)
C_WHITE_WARM  = (245, 240, 232)   # #F5F0E8
C_PALE        = (195, 225, 170)   # 淡绿白
C_GHOST       = (55,  88,  65)    # 幽灵绿（超低透明用于背景装饰）

# ── 字体加载 ────────────────────────────────────────────────────────────────
SYS  = "/System/Library/Fonts"
SUP  = "/System/Library/Fonts/Supplemental"

def F(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# 字体集
f_main   = f"{SYS}/STHeiti Medium.ttc"
f_light  = f"{SYS}/STHeiti Light.ttc"
f_ping   = f"{SYS}/PingFang.ttc"
f_avn    = f"{SYS}/Avenir Next Condensed.ttc"
f_avnr   = f"{SYS}/Avenir.ttc"
f_futura = f"{SUP}/Futura.ttc"
f_didot  = f"{SUP}/Didot.ttc"
f_baskv  = f"{SUP}/Baskerville.ttc"

# ── 画布 ─────────────────────────────────────────────────────────────────────
img = Image.new("RGB", (W, H), color=C_BG)
draw = ImageDraw.Draw(img)

# ── 辅助：居中文本 ──────────────────────────────────────────────────────────
def cx(text, font):
    bb = draw.textbbox((0,0), text, font=font)
    return (W - (bb[2] - bb[0])) // 2

def put(x, y, text, font, color):
    draw.text((x, y), text, font=font, fill=color)

def put_c(y, text, font, color):
    put(cx(text, font), y, text, font, color)

# ── 半透明叠层工具 ──────────────────────────────────────────────────────────
def overlay_text(img, xy, text, font, rgb, alpha):
    layer = Image.new("RGBA", img.size, (0,0,0,0))
    ld = ImageDraw.Draw(layer)
    ld.text(xy, text, font=font, fill=(rgb[0], rgb[1], rgb[2], alpha))
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")

# ═══════════════════════════════════════════════════════════════════════════════
# LAYER 1 — 渐变背景（从左上深、右下稍亮）
# ═══════════════════════════════════════════════════════════════════════════════
for y in range(H):
    t = y / H
    r = int(C_BG[0] + (C_DEEP_GREEN[0] - C_BG[0]) * t * 0.6)
    g = int(C_BG[1] + (C_DEEP_GREEN[1] - C_BG[1]) * t * 0.6)
    b = int(C_BG[2] + (C_DEEP_GREEN[2] - C_BG[2]) * t * 0.6)
    draw.line([(0,y),(W,y)], fill=(r,g,b))

# ═══════════════════════════════════════════════════════════════════════════════
# LAYER 2 — 细纹肌理（平行斜纹，模拟涂料刷痕）
# ═══════════════════════════════════════════════════════════════════════════════
for i in range(-H, W + H, 44):
    draw.line([(i, 0), (i + H, H)], fill=(30, 60, 44), width=1)
# 加一组更稀疏的反向斜纹
for i in range(-H, W + H, 130):
    draw.line([(i + H, 0), (i, H)], fill=(22, 48, 34), width=1)

# ═══════════════════════════════════════════════════════════════════════════════
# LAYER 3 — 结构几何
# ═══════════════════════════════════════════════════════════════════════════════

# — 左侧纵向荧光线（3根，渐细）—
for xi, w, c in [(62, 3, C_NEON), (75, 1, C_NEON_DIM), (84, 1, C_GHOST)]:
    draw.line([(xi, 140), (xi, H * 0.74)], fill=c, width=w)

# — 右侧纵向线 —
draw.line([(W - 62, 200), (W - 62, H * 0.64)], fill=C_NEON, width=2)
draw.line([(W - 75, 260), (W - 75, H * 0.50)], fill=C_NEON_DIM, width=1)

# — 右上角同心圆弧（涂刷轨迹感）—
cx_arc, cy_arc = W + 80, -80
for r, c_arc in [(520, (50,90,66)), (620, (38,70,52)), (720, (28,55,40))]:
    draw.arc([(cx_arc-r, cy_arc-r),(cx_arc+r, cy_arc+r)], start=100, end=200, fill=c_arc, width=1)

# — 左下角大色块（地基）—
ground = [(0, H*0.78), (W*0.52, H*0.78), (W*0.42, H), (0, H)]
draw.polygon(ground, fill=(14, 36, 24))
# 地基顶边装饰线
draw.line([(0, H*0.78), (W*0.52, H*0.78)], fill=C_GHOST, width=1)

# — 中部水平隔断线 —
def h_rule(y, col=C_GHOST, w=1):
    draw.line([(80, y), (W-80, y)], fill=col, width=w)

# ═══════════════════════════════════════════════════════════════════════════════
# LAYER 4 — 大背景装饰字（"2026"，超低透明度）
# ═══════════════════════════════════════════════════════════════════════════════
img = overlay_text(img, (-30, 540), "2026", F(f_futura, 210), C_MID_GREEN, 45)
draw = ImageDraw.Draw(img)

# ═══════════════════════════════════════════════════════════════════════════════
# CONTENT — 从上到下排布
# ═══════════════════════════════════════════════════════════════════════════════

MARGIN = 96   # 左右边距

# ── A. 品牌顶栏 ──────────────────────────────────────────────────────────────
TOP_Y = 108
put(MARGIN, TOP_Y, "OFFER", F(f_avn, 48), C_WHITE_WARM)
bbox_offer = draw.textbbox((0,0), "OFFER", font=F(f_avn, 48))
offer_w = bbox_offer[2] - bbox_offer[0]
put(MARGIN + offer_w + 8, TOP_Y, "GO", F(f_avn, 48), C_NEON)
# 品牌右侧微标注
put(W - MARGIN - 160, TOP_Y + 10, "PRODUCT LAUNCH", F(f_avn, 18), C_NEON_DIM)
put(W - MARGIN - 160, TOP_Y + 32, "CONFERENCE 2026", F(f_avn, 18), C_NEON_DIM)

# 分割线 1
h_rule(TOP_Y + 68, C_MID_GREEN, 1)

# ── B. 主题区 ─────────────────────────────────────────────────────────────────
THEME_Y = TOP_Y + 96

# 上引号
img = overlay_text(img, (MARGIN - 8, THEME_Y - 8), "「", F(f_main, 48), C_NEON, 180)
draw = ImageDraw.Draw(img)

# 「给老黄瓜」
put_c(THEME_Y, "给老黄瓜", F(f_main, 108), C_WHITE_WARM)

# 「再刷一次」
put_c(THEME_Y + 122, "再刷一次", F(f_main, 108), C_WHITE_WARM)

# 「绿漆」— 荧光绿，稍大
GV_Y = THEME_Y + 244
gv_font = F(f_main, 116)
gv_text = "绿  漆"
gv_x = cx(gv_text, gv_font)
put(gv_x, GV_Y, gv_text, gv_font, C_NEON)

# 下引号
img = overlay_text(img, (W - MARGIN - 38, GV_Y + 90), "」", F(f_main, 48), C_NEON, 180)
draw = ImageDraw.Draw(img)

# 下划线装饰 —「绿漆」底部细线
gv_bb = draw.textbbox((gv_x, GV_Y), gv_text, font=gv_font)
draw.line([(gv_bb[0], gv_bb[3]+6), (gv_bb[2], gv_bb[3]+6)], fill=C_NEON, width=2)

# 分割线 2
h_rule(GV_Y + 130, C_NEON, 2)

# ── C. 活动名称 ───────────────────────────────────────────────────────────────
EVENT_Y = GV_Y + 152

# 「OfferGO 2026 产品发布会」
put_c(EVENT_Y, "产  品  发  布  会", F(f_main, 64), C_WHITE_WARM)
put_c(EVENT_Y + 82, "OfferGO · 2026", F(f_avn, 36), C_PALE)

# ── D. 核心关键词块 ───────────────────────────────────────────────────────────
KW_Y = EVENT_Y + 140
# 背景框
draw.rectangle([(MARGIN, KW_Y), (W-MARGIN, KW_Y+82)], fill=(20, 50, 34))
draw.rectangle([(MARGIN, KW_Y), (W-MARGIN, KW_Y+3)], fill=C_NEON)     # 顶边高亮
draw.rectangle([(MARGIN, KW_Y+79), (W-MARGIN, KW_Y+82)], fill=C_GHOST) # 底边

# 关键词文字
put_c(KW_Y + 12, "共  建   ·   共  识", F(f_main, 42), C_NEON)
put_c(KW_Y + 58, "CO - BUILD   ·   CO - VISION", F(f_avn, 22), C_PALE)

# ── E. 时间 & 地点 ────────────────────────────────────────────────────────────
INFO_Y = KW_Y + 108
DOT_X  = MARGIN + 14

# 小方块图标
def dot_icon(y):
    draw.rectangle([(DOT_X-10, y+5), (DOT_X+4, y+19)], fill=C_NEON)

dot_icon(INFO_Y)
put(DOT_X + 18, INFO_Y - 2, "2026 . 06 . 15 — 06 . 17", F(f_avn, 38), C_WHITE_WARM)

dot_icon(INFO_Y + 56)
put(DOT_X + 18, INFO_Y + 54, "北京国际会展中心", F(f_light, 34), C_WHITE_WARM)
put(DOT_X + 18, INFO_Y + 96, "Beijing International Exhibition Center", F(f_avn, 22), C_PALE)

# 分割线 3
h_rule(INFO_Y + 134, C_GHOST)

# ── F. 网络节点图（「共建」隐喻）────────────────────────────────────────────
NET_Y = INFO_Y + 152
rng   = random.Random(7)
nodes = [
    (165, NET_Y+55), (310, NET_Y+20), (460, NET_Y+68), (610, NET_Y+28),
    (780, NET_Y+60), (920, NET_Y+30),
    (130, NET_Y+148),(290, NET_Y+168),(450, NET_Y+140),(600, NET_Y+175),
    (760, NET_Y+155),(900, NET_Y+170),
]
edges = [
    (0,1),(1,2),(2,3),(3,4),(4,5),
    (0,6),(1,7),(2,8),(3,9),(4,10),(5,11),
    (6,7),(7,8),(8,9),(9,10),(10,11),
]
for a, b in edges:
    draw.line([nodes[a], nodes[b]], fill=C_GHOST, width=1)
key_nodes = {2, 3, 8, 9}
for i, (nx, ny) in enumerate(nodes):
    r = 7 if i in key_nodes else 4
    col = C_NEON if i in key_nodes else (65, 105, 78)
    draw.ellipse([(nx-r,ny-r),(nx+r,ny+r)], fill=col)
    if i in key_nodes:
        draw.ellipse([(nx-r-3,ny-r-3),(nx+r+3,ny+r+3)], outline=C_NEON_DIM, width=1)

# 网络注释语
NET_TEXT_Y = NET_Y + 210
put_c(NET_TEXT_Y, "构建者之间的连接，是产品生长的根系", F(f_ping, 24), (100, 155, 115))

# ── G. 底部区 ─────────────────────────────────────────────────────────────────
BOT_Y = H - 190
h_rule(BOT_Y - 8, C_GHOST)

put_c(BOT_Y + 6,  "扫码报名  ·  关注小红书 @OfferGO文案匠", F(f_ping, 26), C_PALE)
put_c(BOT_Y + 44, "Where Great Builders Meet", F(f_avn, 24), (80, 130, 92))

# 底部小角标
corner = "© OfferGO 2026  All Rights Reserved"
corner_bb = draw.textbbox((0,0), corner, font=F(f_avn, 18))
put(W - corner_bb[2] - corner_bb[0] - MARGIN,
    H - 52, corner, F(f_avn, 18), (50, 88, 64))

# ── 左下角 URL —
put(MARGIN, H - 52, "offergoo.com", F(f_avn, 18), (55, 95, 70))

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL PASS — 整体提亮顶部 & 轻微锐化
# ═══════════════════════════════════════════════════════════════════════════════
# 顶部暗角（加深顶边，让品牌栏更沉稳）
for y in range(100):
    alpha = int(80 * (1 - y/100))
    draw.line([(0,y),(W,y)], fill=(8,22,14))  # 轻度蒙版

img = img.filter(ImageFilter.UnsharpMask(radius=0.6, percent=60, threshold=2))

# ═══════════════════════════════════════════════════════════════════════════════
# 保存
# ═══════════════════════════════════════════════════════════════════════════════
out_path = "/Users/tricky/Desktop/OfferGO/deliverables/OfferGO_2026_Poster.png"
img.save(out_path, "PNG", dpi=(300, 300))
print(f"OK: {out_path}  ({W}x{H})")
