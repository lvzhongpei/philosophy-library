/* ============================================================
   device: 马克思 · 基础与上层
   生产力一动，上层建筑总是慢一步
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var UPPER = ["法律", "政治", "宗教", "艺术"];

  window.DEVICES["marx-base"] = function (o) {
    var st = { force: 0.35, shown: 0.35 };

    o.controls.appendChild(
      K.slider({
        label: "生产力",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.35,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.force = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      // 上层滞后：每帧只追一点点
      st.shown = K.lerp(st.shown, st.force, 0.022);
      var f = st.force;
      var s = st.shown;
      var lag = f - s;

      var baseY = h * 0.8;
      var x0 = w * 0.14;
      var x1 = w * 0.86;

      // 地基（生产力）
      ctx.beginPath();
      ctx.rect(x0, baseY, x1 - x0, 30);
      ctx.fillStyle = "rgba(79,209,197,0.16)";
      ctx.fill();
      ctx.strokeStyle = "rgba(79,209,197,0.7)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 地基内部的填充（生产力水平）
      ctx.beginPath();
      ctx.rect(x0, baseY, (x1 - x0) * f, 30);
      ctx.fillStyle = "rgba(79,209,197,0.28)";
      ctx.fill();

      K.cn(ctx, "生产力", (x0 + x1) / 2, baseY + 15, {
        size: 12, color: "rgba(10,14,20,0.9)"
      });
      K.label(ctx, "经济基础 · BASIS", (x0 + x1) / 2, baseY + 46, {
        size: 8.5, align: "center", spacing: 2,
        color: "rgba(79,209,197,0.6)"
      });

      // 上层建筑：四块，随 s 升高、变宽
      var bh = 26;
      UPPER.forEach(function (name, i) {
        var bw = (x1 - x0) / 4 - 12;
        var bx = x0 + i * ((x1 - x0) / 4) + 6;
        var lift = 26 + s * 128;
        var by = baseY - lift - bh;

        ctx.beginPath();
        ctx.rect(bx, by, bw, bh);
        ctx.fillStyle = "rgba(224,164,88," + (0.08 + s * 0.14) + ")";
        ctx.fill();
        ctx.strokeStyle = "rgba(224,164,88," + (0.35 + s * 0.3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
        K.cn(ctx, name, bx + bw / 2, by + bh / 2, {
          size: 12, color: "rgba(233,238,246," + (0.5 + s * 0.35) + ")"
        });

        // 支柱
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2, by + bh);
        ctx.lineTo(bx + bw / 2, baseY);
        ctx.strokeStyle = "rgba(150,170,210,0.14)";
        ctx.setLineDash([2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 滞后提示
      if (Math.abs(lag) > 0.02) {
        var up = lag > 0;
        K.cn(ctx, (up ? "↑ " : "↓ ") + "上层正在" + (up ? "跟上" : "回落"),
          w * 0.5, h * 0.14, {
            size: 11.5, halo: 8,
            color: "rgba(224,164,88," + Math.min(0.85, Math.abs(lag) * 2.4) + ")"
          });
      }

      K.label(ctx, "ÜBERBAU · 上层建筑", (x0 + x1) / 2, h * 0.2, {
        size: 8.5, align: "center", spacing: 2,
        color: "rgba(224,164,88,0.38)"
      });
      K.label(ctx, "BASIS · ÜBERBAU", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "生产力 " + Math.round(f * 100) + "% · 上层 " + Math.round(s * 100) + "%",
        w - 20, 26, {
          size: 9, align: "right", spacing: 1, color: "rgba(150,170,210,0.45)"
        });

      var msg = Math.abs(lag) < 0.03
        ? "暂时稳住了。但「暂时」是关键——它从不真正停在这里。"
        : lag > 0
        ? "生产力已经跑在前面。这段时间差，就是「社会矛盾」的物理形态。"
        : "生产力回落，上层还在高位——这种脱节同样要付账。";
      K.cn(ctx, msg, w * 0.5, h - 24, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
