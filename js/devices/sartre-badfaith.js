/* ============================================================
   device: 萨特 · 自欺
   把自己当成一件有固定本质的物
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var OPEN = ["辞职", "换个城市", "说不", "重新学", "承认害怕", "什么都不做"];

  window.DEVICES["sartre-badfaith"] = function (o) {
    var st = { bad: true, k: 1 };

    var btn = K.button("切换：本真", function (b) {
      st.bad = !st.bad;
      b.textContent = st.bad ? "切换：本真" : "切换：自欺";
    });
    o.controls.appendChild(btn);

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.k = K.lerp(st.k, st.bad ? 1 : 0, 0.08);
      var k = st.k;

      var cx = w * 0.5;
      var cy = h * 0.56;

      // 人
      ctx.beginPath();
      ctx.arc(cx, cy - 26, 8, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252,0.9)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 10);
      ctx.quadraticCurveTo(cx, cy - 26, cx + 12, cy + 10);
      ctx.closePath();
      ctx.fillStyle = "rgba(236,242,252,0.7)";
      ctx.fill();

      // 可能性：本真时散开，自欺时收成一条
      var n = OPEN.length;
      for (var i = 0; i < n; i++) {
        var ang = -Math.PI * 0.9 + (i / (n - 1)) * Math.PI * 0.8;
        var openR = 108;
        var closedR = 0;
        var a = i / (n - 1);
        var target = k > 0.5 ? closedR : openR;

        // 自欺：所有可能性挤到「我就是侍者」这一条上
        var px = cx + Math.cos(ang) * openR * (1 - k) + Math.sin(a * 999) * 0;
        var py = cy - 40 + Math.sin(ang) * openR * (1 - k) + (0 - Math.sin(ang) * openR) * k;

        var alpha = (1 - k) * 0.75;
        if (alpha > 0.03) {
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * 18, cy - 22 + Math.sin(ang) * 18);
          ctx.lineTo(px, py);
          ctx.strokeStyle = "rgba(79,209,197," + alpha * 0.45 + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, TAU);
          ctx.fillStyle = "rgba(79,209,197," + alpha + ")";
          ctx.fill();
          K.cn(ctx, OPEN[i], px, py - 12, {
            size: 10.5, color: "rgba(200,225,235," + alpha + ")"
          });
        }
      }

      // 自欺的那一条
      if (k > 0.03) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 36);
        ctx.lineTo(cx, cy - 96);
        ctx.strokeStyle = "rgba(226,150,120," + k * 0.8 + ")";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy - 100, 4, 0, TAU);
        ctx.fillStyle = "rgba(226,150,120," + k * 0.9 + ")";
        ctx.fill();
        K.cn(ctx, "我就是侍者", cx, cy - 118, {
          size: 12, halo: 8,
          color: "rgba(240,170,140," + k * 0.95 + ")"
        });
      }

      // 读数
      K.label(ctx, "MAUVAISE FOI · " + (st.bad ? "自欺" : "本真"), 20, 26, {
        size: 9, spacing: 1.6,
        color: st.bad ? "rgba(226,150,120,0.8)" : "rgba(79,209,197,0.7)"
      });
      K.label(ctx, st.bad ? "1 条路" : "6 条路", w - 20, 26, {
        size: 9, align: "right", spacing: 1.4, color: "rgba(150,170,210,0.45)"
      });

      var msg = st.bad
        ? "「我不能辞职，我是这种人。」——这句话不是描述，是选择。"
        : "路一直在这里。承认它们存在，比用一条履历把自己钉死要难受得多。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10,
        color: st.bad ? "rgba(226,150,130,0.78)" : "rgba(79,209,197,0.7)"
      });
    });
  };
})();
