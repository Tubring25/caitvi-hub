# Bolder + Delight Design Plan

**Branch:** `ui/bolder-delight`
**Created:** 2026-03-11

---

## 🔥 /bolder — 首页设计建议

### Homepage

- [x] **B1 Hero 层级拉开**："Caitlyn × Vi" 改为 eyebrow label（`text-sm uppercase tracking-[0.5em]`），移到标题上方
- [ ] **B2 Hero 构图**：考虑左对齐/偏左布局（需评估背景图适配性，延后）
- [ ] ~~**B3 Section 过渡**~~：hero-fade 渐变遮罩效果不佳，已移除。需要其他方案（延后）
- [x] **B4 品牌色运用**：标题下加 Lesbian Pride 渐变装饰线（dark-orange → pink → rose）
- [x] **B5 QuoteDisplay 放大**：Playfair Display italic + clamp fluid sizing + 品牌色引号装饰符 + 移除 bg-black 背景

### Card Grid（延后）

- [ ] **B6 打破网格节奏**：编辑推荐卡片 `col-span-2` / 穿插策展语录块

---

## ✨ /delight — Blind Box 设计建议

- [ ] **D1 MoodSelector 选择戏剧感**：选中瞬间其他选项 fade out + shrink
- [ ] **D2 OpeningAnimation 文字**：`font-mono` → `font-serif italic`；根据 mood 显示不同 Arcane 台词
- [ ] **D3 ResultCard 庆祝感**：品牌色粒子效果或 confetti 替代 🎉 emoji
- [ ] **D4 错误文案 Arcane 化**："Hextech malfunction..." 等风格化台词
- [ ] **D5 快捷重抽**：同一 mood 直接再抽按钮，降低重玩摩擦
- [ ] **D6 彩蛋文案**：首次使用特殊引导 / 连续 3 次彩蛋 / 可选音效
