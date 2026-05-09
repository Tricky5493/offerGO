#!/usr/bin/env python3
"""
OfferGO 2026 产品发布会 - 海报生成脚本
设计哲学：绿漆新生 / Green Lacquer Rebirth
尺寸：1080 x 1920px (竖版社交媒体)
"""

import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── 画布设置 ─────────────────────────────────────────────────────────────────
W, H = 1080, 1920
img = Image.new("RGB", (W, H), color=(27, 58, 45))   # 深墨绿底色 #1B3A2D
draw = ImageDraw.Draw(img)

# ── 调色板 ──────────────────────────────────────────────────────────────────
C_DEEP_GREEN  = (27,  58,  45)    # #1B3A2D  深墨绿（主底）
C_MID_GREEN   = (42,  82,  62)    # #2A523E  中间绿（层次）
C_NEON_GREEN  = (168, 224, 99)    # #A8E063  荧光嫩绿（点睛）
C_WARM_WHITE  = (245, 240, 232)   # #F5F0E8  暖米白（主文字）
C_PALE_GREEN  = (210, 235, 185)   # #D2EBB9  淡绿（辅助文字）
C_STROKE      = (80,  130, 90)    # 中调绿边线
C_ACCENT_LIME = (195, 255, 100)   # 高光绿

# ── 字体加载 ────────────────────────────────────────────────────────────────
FONT_DIR = "/System/Library/Fonts"
FONT_SUP = "/System/Library/Fonts/Supplemental"

def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# 中文字体
fn_pingfang   = f"{FONT_DIR}/PingFang.ttc"
fn_stheiti_l  = f"{FONT_DIR}/STHeiti Light.ttc"
fn_stheiti_m  = f"{FONT_DIR}/STHeiti Medium.ttc"
# 英文字体
fn_avenir     = f"{FONT_DIR}/Avenir Next Condensed.ttc"
fn_helvetica  = f"{FONT_DIR}/HelveticaNeue.ttc"
fn_didot      = f"{FONT_SUP}/Didot.ttc"
fn_futura     = f"{FONT_SUP}/Futura.ttc"

font_main_xl   = load_font(fn_stheiti_m, 110)   # 主标题
font_main_l    = load_font(fn_stheiti_m, 72)    # 副标题
font_main_m    = load_font(fn_stheiti_l, 44)    # 正文
font_main_s    = load_font(fn_pingfang,  34)    # 小注
font_main_xs   = load_font(fn_pingfang,  26)    # 极小注
font_en_cond   = load_font(fn_avenir,    52)    # 英文大
font_en_s      = load_font(fn_avenir,    30)    # 英文小
font_en_xl     = load_font(fn_futura,   200)    # 装饰大字
font_didot_l   = load_font(fn_didot,    80)     # Didot 装饰

# ── 辅助函数 ────────────────────────────────────────────────────────────────
def centered_text(draw, y, text, font, color, offset_x=0):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2 + offset_x
    draw.text((x, y), text, font=font, fill=color)
    return tw

def draw_text_alpha(img, xy, text, font, color, alpha=255):
    """在独立图层上绘制半透明文字"""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    rgba_color = color + (alpha,) if len(color) == 3 else color
    ld.text(xy, text, font=font, fill=rgba_color)
    img_rgba = img.convert("RGBA")
    img_rgba = Image.alpha_composite(img_rgba, layer)
    return img_rgba.convert("RGB")

# ── 1. 背景肌理层 ─────────────────────────────────────────────────────────
# 渐变底色（从深绿到更深）
for y in range(H):
    ratio = y / H
    r = int(C_DEEP_GREEN[0] * (1 - 0.15 * ratio))
    g = int(C_DEEP_GREEN[1] * (1 - 0.08 * ratio))
    b = int(C_DEEP_GREEN[2] * (1 - 0.1  * ratio))
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# ── 2. 细密网格肌理（模拟纸张/涂料质感）────────────────────────────────────
rng = random.Random(42)
# 水平细线
for y in range(0, H, 18):
    opacity_r = rng.randint(0, 8)
    c = (C_MID_GREEN[0] + opacity_r, C_MID_GREEN[1] + opacity_r, C_MID_GREEN[2] + opacity_r)
    draw.line([(0, y), (W, y)], fill=c, width=1)

# 斜向细线（左上→右下，稀疏）
for i in range(-H, W + H, 60):
    draw.line([(i, 0), (i + H, H)], fill=(35, 65, 50), width=1)

# ── 3. 大型几何装饰 ─────────────────────────────────────────────────────────

# 右上角：大圆弧（象征"涂刷轨迹"）
circle_cx, circle_cy = W + 100, -120
circle_r = 620
draw.ellipse(
    [(circle_cx - circle_r, circle_cy - circle_r),
     (circle_cx + circle_r, circle_cy + circle_r)],
    outline=(60, 110, 78), width=2
)
draw.ellipse(
    [(circle_cx - circle_r + 30, circle_cy - circle_r + 30),
     (circle_cx + circle_r - 30, circle_cy + circle_r - 30)],
    outline=(50, 90, 65), width=1
)

# 左下角：实色大扇形色块（地基感）
poly_ground = [
    (0, H),
    (W * 0.55, H),
    (W * 0.45, H * 0.62),
    (W * 0.08, H * 0.70),
    (0, H * 0.75)
]
draw.polygon(poly_ground, fill=(20, 48, 35))

# 右侧垂直荧光条带
bar_x = W - 72
draw.rectangle([(bar_x, 180), (bar_x + 6, H * 0.58)], fill=C_NEON_GREEN)
draw.rectangle([(bar_x + 16, 280), (bar_x + 20, H * 0.42)], fill=(C_NEON_GREEN[0], C_NEON_GREEN[1], C_NEON_GREEN[2]))

# 左侧极细装饰线组
for i, x_pos in enumerate([42, 52, 58]):
    draw.line([(x_pos, 160), (x_pos, H * 0.72)], fill=C_STROKE if i < 2 else C_NEON_GREEN, width=1 if i < 2 else 2)

# ── 4. 品牌标识区（顶部） ─────────────────────────────────────────────────
# OfferGO 品牌 Logo 文字
logo_y = 100
# "OFFER" - 细 Futura
img = draw_text_alpha(img, (80, logo_y), "OFFER", font_en_cond, C_WARM_WHITE, 220)
draw = ImageDraw.Draw(img)
# "GO" - 荧光绿
img = draw_text_alpha(img, (80 + 230, logo_y), "GO", font_en_cond, C_NEON_GREEN, 255)
draw = ImageDraw.Draw(img)

# 品牌下方细分割线
draw.line([(80, logo_y + 65), (W - 80, logo_y + 65)], fill=C_STROKE, width=1)

# ── 5. 年份装饰字（大背景数字，极低透明度）────────────────────────────────
img = draw_text_alpha(img, (-20, 580), "2026", font_en_xl, C_MID_GREEN, 60)
draw = ImageDraw.Draw(img)

# ── 6. 核心主题区 ─────────────────────────────────────────────────────────
# 引号装饰
quote_y = 310
img = draw_text_alpha(img, (75, quote_y), "「", load_font(fn_stheiti_l, 56), C_NEON_GREEN, 200)
draw = ImageDraw.Draw(img)

# 主题第一行
line1_y = 370
centered_text(draw, line1_y, "给老黄瓜", font_main_xl, C_WARM_WHITE)

# 主题第二行
line2_y = line1_y + 125
centered_text(draw, line2_y, "再刷一次", font_main_xl, C_WARM_WHITE)

# 主题第三行 - 绿漆两字用荧光绿突出
line3_y = line2_y + 125
# 计算总宽度居中
text_w1 = draw.textbbox((0,0), "绿漆", font=font_main_xl)[2]
text_w2 = draw.textbbox((0,0), "绿漆", font=font_main_xl)[2]  # same as w1
total_w = text_w1 + draw.textbbox((0,0), "绿", font=font_main_xl)[2] + draw.textbbox((0,0), "漆", font=font_main_xl)[2]
# 绿漆 (荧光绿) + 空格
# 手动计算"绿漆"和空文字的宽度然后居中
bbox_lv  = draw.textbbox((0,0), "绿漆", font=font_main_xl)
lv_w     = bbox_lv[2] - bbox_lv[0]
start_x  = (W - lv_w) // 2
draw.text((start_x, line3_y), "绿漆", font=font_main_xl, fill=C_NEON_GREEN)

# 闭引号
img = draw_text_alpha(img, (W - 115, line3_y + 60), "」", load_font(fn_stheiti_l, 56), C_NEON_GREEN, 200)
draw = ImageDraw.Draw(img)

# ── 7. 主标题（活动名称）────────────────────────────────────────────────────
event_y = line3_y + 165

# 装饰横线
draw.line([(80, event_y - 12), (W - 80, event_y - 12)], fill=C_NEON_GREEN, width=2)

# 产品发布会
centered_text(draw, event_y, "产品发布会", font_main_l, C_WARM_WHITE)

# OfferGO 2026 英文副行
sub_event_y = event_y + 88
centered_text(draw, sub_event_y, "OfferGO  2026", font_en_cond, C_PALE_GREEN)

# ── 8. 核心理念区 ────────────────────────────────────────────────────────────
concept_y = sub_event_y + 90

# 背景块
draw.rectangle([(80, concept_y), (W - 80, concept_y + 88)], fill=(20, 52, 36))
draw.rectangle([(80, concept_y), (W - 80, concept_y + 2)], fill=C_NEON_GREEN)  # 顶边高亮

# 「共建  共识」
centered_text(draw, concept_y + 16, "共 建     共 识", font_main_m, C_NEON_GREEN)

# 英文注解
centered_text(draw, concept_y + 60, "CO-BUILD   ·   CO-VISION", font_en_s, C_PALE_GREEN)

# ── 9. 活动信息区 ─────────────────────────────────────────────────────────
info_y = concept_y + 130

# 时间信息
time_icon_x = 110
# 小方块 icon
draw.rectangle([(time_icon_x - 24, info_y + 4), (time_icon_x - 6, info_y + 22)], fill=C_NEON_GREEN)
draw.text((time_icon_x + 4, info_y - 2), "2026.06.15 — 06.17", font=load_font(fn_avenir, 36), fill=C_WARM_WHITE)

# 地点信息
loc_y = info_y + 52
draw.rectangle([(time_icon_x - 24, loc_y + 4), (time_icon_x - 6, loc_y + 22)], fill=C_NEON_GREEN)
draw.text((time_icon_x + 4, loc_y - 2), "北京国际会展中心", font=load_font(fn_stheiti_l, 34), fill=C_WARM_WHITE)

# 英文地点注
loc_en_y = loc_y + 42
draw.text((time_icon_x + 4, loc_en_y), "Beijing International Exhibition Center", font=load_font(fn_avenir, 22), fill=C_PALE_GREEN)

# ── 10. 中部分割装饰 ─────────────────────────────────────────────────────
sep_y = loc_en_y + 60
draw.line([(80, sep_y), (W - 80, sep_y)], fill=C_STROKE, width=1)

# ── 11. 下部视觉区：根系/网络线条装饰 ──────────────────────────────────
root_y_start = sep_y + 10
# 模拟"共建"的网络节点感：多个节点 + 连线
nodes = [
    (200, root_y_start + 80),
    (400, root_y_start + 40),
    (600, root_y_start + 100),
    (800, root_y_start + 50),
    (160, root_y_start + 170),
    (360, root_y_start + 200),
    (540, root_y_start + 160),
    (720, root_y_start + 210),
    (900, root_y_start + 140),
    (280, root_y_start + 280),
    (480, root_y_start + 300),
    (660, root_y_start + 270),
    (860, root_y_start + 290),
]

# 节点连线（稀疏）
connections = [
    (0, 1), (1, 2), (2, 3),
    (0, 4), (1, 5), (2, 6), (3, 7), (3, 8),
    (4, 5), (5, 6), (6, 7), (7, 8),
    (4, 9), (5, 10), (6, 11), (7, 12), (8, 12),
    (9, 10), (10, 11), (11, 12)
]

for a, b in connections:
    n1, n2 = nodes[a], nodes[b]
    draw.line([n1, n2], fill=(60, 110, 78), width=1)

# 节点圆点
for i, (nx, ny) in enumerate(nodes):
    r = 5 if i in [1, 2, 6] else 3
    color = C_NEON_GREEN if i in [1, 2, 6] else C_STROKE
    draw.ellipse([(nx-r, ny-r), (nx+r, ny+r)], fill=color)

# 网络下方文字注：「构建者之间的连接，是产品生长的根系」
network_text_y = root_y_start + 330
centered_text(draw, network_text_y, "构建者之间的连接，是产品生长的根系", load_font(fn_stheiti_l, 26), C_PALE_GREEN)

# ── 12. 底部信息区 ─────────────────────────────────────────────────────────
bottom_y = H - 180

# 底部分割线
draw.line([(80, bottom_y - 20)  , (W - 80, bottom_y - 20)], fill=C_STROKE, width=1)

# 扫码 / 关注信息
centered_text(draw, bottom_y, "扫码报名 · 关注小红书 @OfferGO文案匠", load_font(fn_stheiti_l, 28), C_PALE_GREEN)

# 底部英文标语
centered_text(draw, bottom_y + 44, "Where Builders Meet · www.offergoo.com", load_font(fn_avenir, 24), (100, 150, 110))

# ── 13. 右下角小角标 ────────────────────────────────────────────────────────
corner_text = "© OfferGO  2026"
cbb = draw.textbbox((0,0), corner_text, font=load_font(fn_avenir, 20))
draw.text((W - cbb[2] - cbb[0] - 80, H - 52), corner_text, font=load_font(fn_avenir, 20), fill=(60, 100, 75))

# ── 14. 整体色调微调（叠加绿色调层）────────────────────────────────────────
# 顶部渐变遮罩（增加深度）
for y in range(200):
    alpha = int(60 * (1 - y / 200))
    draw.line([(0, y), (W, y)], fill=(10, 30, 20))

# 最终轻微锐化
img = img.filter(ImageFilter.UnsharpMask(radius=0.5, percent=50, threshold=3))

# ── 输出 ────────────────────────────────────────────────────────────────────
out_path = "/Users/tricky/Desktop/OfferGO/deliverables/OfferGO_2026_Poster.png"
img.save(out_path, "PNG", dpi=(300, 300))
print(f"海报已保存至：{out_path}")
print(f"尺寸：{W} × {H} px")
