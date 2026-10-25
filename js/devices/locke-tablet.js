/* ============================================================
   device: 洛克 · 白板
   心灵最初什么也没有
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["locke-tablet"] = function (o) {
    var st = { marks: [] };
    var SRC = ["看", "听", "摸", "尝"];

    SRC.forEach(function (s, i) {
      o.controls.appendChild(
        K.button(s + "一次", function () {
          st.marks.push({
            x: 0.1 + Math.random() * 0.8,
            y: 0.15 + Math.random() * 0.7,
            src: s,
            rot: (Math.random() - 0.5) * 0.8
          });
        })
      );
    });
    o.controls.appendChild(
      K.button("擦掉", function () { st.marks = []; }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var bx = w * 0.18;
      var by = h * 0.22;
      var bw = w * 0.64;
      var bh = h * 0.56;

      // 板
      ctx.beginPath();
      ctx.rect(bx, by, bw, bh);
      ctx.fillStyle = "rgba(255,255,255,0.028)";
      ctx.fill();
      ctx.strokeStyle = "rgba(200,215,235,0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 空的时候的提示
      if (!st.marks.length) {
        K.cn(ctx, "什么也没有", bx + bw / 2, by + bh / 2, {
          size: 15, color: "rgba(150,170,210,0.35)"
        });
        K.label(ctx, "TABULA RASA", bx + bw / 2, by + bh / 2 + 26, {
          size: 8.5, align: "center", spacing: 2.4,
          color: "rgba(150,170,210,0.25)"
        });
      }

      // 痕迹
      st.marks.forEach(function (m, i) {
        var mx = bx + m.x * bw;
        var my = by + m.y * bh;
        var a = Math.min(0.85, 0.25 + i * 0.05);
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(m.rot);
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.quadraticCurveTo(0, -9, 14, 0);
        ctx.strokeStyle = "rgba(224,164,88," + a + ")";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
        K.cn(ctx, m.src, mx, my + 18, {
          size: 9, color: "rgba(224,164,88," + a * 0.6 + ")"
        });
      });

      K.label(ctx, "TABLET · 观念 " + st.marks.length, 20, 26, {
        size: 9, spacing: 1.6,
        color: st.marks.length ? "rgba(224,164,88,0.7)" : "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "感觉 → 反省 → 观念", w - 20, 26, {
        size: 9, align: "right", spacing: 1.2, color: "rgba(150,170,210,0.4)"
      });

      var msg = st.marks.length === 0
        ? "一块白板。它现在还没有任何观念——连「白」这个观念也还没有。"
        : st.marks.length < 5
        ? "进来的是感觉。它们先到，然后才有反省。"
        : "观念越积越多，但每一个都能追回到某一次看、听、摸。";
      K.cn(ctx, msg, w * 0.5, h - 24, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
