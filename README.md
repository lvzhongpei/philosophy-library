# 哲学图书馆 · 深空档案

把六位哲学家的思想做成一片可以操作的星空。

每位哲学家有一份完整的六段式档案——生平时间轴、流派定位、核心观点、代表著作、名言（原文与出处）、追问——外加**一个可以动手的思想实验**。

线上地址：<https://lvzhongpei.github.io/philosophy-library/>

---

## 六个人，六个装置

| 哲学家 | 装置 | 你能做什么 |
|---|---|---|
| 尼采 | 永恒轮回 | 拖动重复倍率，看同一段轨迹如何吞没整个画面 |
| 叔本华 | 痛苦与无聊的钟摆 | 推动摆锤、调低欲望强度，看它如何必然荡回 |
| 加缪 | 推石上山 | 点击推石，到顶滚落，计数器一直加，不会归零 |
| 柏拉图 | 洞穴投影 | 拖动火光，看影子变形；把「转身」推到底，看见太阳 |
| 庄子 | 蝶梦形变 | 切换梦与觉，看粒子在庄周与蝴蝶之间往返 |
| 王阳明 | 岩中花树 | 移开视线，花退回线稿；再看它，颜色一时明白 |

## 站点结构

```
.
├── index.html              星图首页（星图 ⇄ 名录，含年代筛选与全文搜索）
├── philosopher.html        详情页模板（?id=nietzsche）
├── css/
│   ├── base.css            变量、排版、详情页骨架
│   └── star.css            星图、名录卡片、年代滑杆
├── js/
│   ├── starfield.js        全站背景星尘
│   ├── starmap.js          星团布局、轨道绘制、筛选与视图切换
│   ├── render.js           详情页渲染
│   ├── canvas-kit.js       装置共用画布与控件
│   └── devices/            六个交互装置，各一个文件
└── data/
    └── philosophers.json   全部内容（唯一数据源）
```

零依赖、零构建、无 CDN。所有图形都是 Canvas 现画的，没有一张位图。

## 本地预览

```bash
cd philosophy-library
python3 -m http.server 8000
```

然后打开 <http://localhost:8000/>。

> 直接双击 `index.html` 会失败：页面用 `fetch` 读取 JSON，`file://` 协议下会被浏览器拦截。

## 加一位哲学家

只需改 `data/philosophers.json`：

1. 在 `philosophers` 数组里加一个对象，字段照抄任意现有一项（`id`、`name`、`bio`、`ideas`、`works`、`quotes`、`questions`、`device` 等）。
2. `cluster` 填 `clusters` 里已有的 id，或用新 id 并在 `clusters` 里补一项。
3. `device` 填 `js/devices/` 里已有的装置 key，或在 `philosopher.html` 里引入新脚本、在 `window.DEVICES` 上注册一个 `mount({canvas, controls})`。

星图坐标 `x`/`y` 只需要相对关系正确——页面会自动归一化铺满画布。

## 内容说明

- 引文均标注出处（卷、节或篇名）；西方原文保留德／法／希腊语，中国典籍保留文言。
- 译名为通行译法，原文以通行校勘本为准。
- 生平与观点为编译转述，非逐字翻译。
- 尼采部分特别说明：《权力意志》由妹妹伊丽莎白在身后编成并篡改，与尼采本人立场多有冲突，因此不作为其代表作列出。

## 许可

文本内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh)，
代码采用 [MIT](https://opensource.org/licenses/MIT)。
