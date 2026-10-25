/* ============================================================
   device: 维特根斯坦（前期）· 图像论
   命题是实在的图像——结构对上，才有真假
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["wittgenstein-picture"] = function (o) {
    var st = { aligned: true, k: 1 };

    o.controls.appendChild(
      K.button("打乱词序", function (b) {
        st.aligned = !st.aligned;
        b.textContent = st.aligned ? "打乱词序" : "恢复词序";
      })
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.k = K.lerp(st.k, st.aligned ? 1 : 0, 0.1);
      var k = st.k;

      var sceneX = w * 0.24;
      var sentX = w * 0.62;
      var midY = h * 0.54;

      // ---- 左：事实 ----
      K.label(ctx, "FACT · 事态", sceneX, 26, {
        size: 9, align: "center", spacing: 1.8, color: "rgba(150,170,210,0.42)"
      });

      // 垫子
      ctx.beginPath();
      ctx.ellipse(sceneX, midY + 34, 58, 12, 0, 0, TAU);
      ctx.fillStyle = "rgba(120,150,170,0.22)";
      ctx.fill();
      ctx.strokeStyle = "rgba(150,190,210,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 猫
      ctx.beginPath();
      ctx.ellipse(sceneX, midY - 4, 26, 18, 0, 0, TAU);
      ctx.fillStyle = "rgba(224,164,88,0.28)";
      ctx.fill();
      ctx.strokeStyle = "rgba(224,164,88,0.85)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // 耳朵
      ctx.beginPath();
      ctx.moveTo(sceneX - 18, midY - 16);
      ctx.lineTo(sceneX - 12, midY - 30);
      ctx.lineTo(sceneX - 4, midY - 18);
      ctx.moveTo(sceneX + 18, midY - 16);
      ctx.lineTo(sceneX + 12, midY - 30);
      ctx.lineTo(sceneX + 4, midY - 18);
      ctx.stroke();

      // 关系（在……上）
      ctx.beginPath();
      ctx.moveTo(sceneX, midY + 18);
      ctx.lineTo(sceneX, midY + 22);
      ctx.strokeStyle = "rgba(79,209,197,0.8)";
      ctx.stroke();

      // ---- 右：命题 ----
      K.label(ctx, "PROPOSITION · 命题", sentX, 26, {
        size: 9, align: "center", spacing: 1.8, color: "rgba(150,170,210,0.42)"
      });

      var words = ["猫", "在", "垫子上"];
      var order = st.aligned ? [0, 1, 2] : [1, 2, 0];
      var bw = Math.min(88, (w * 0.3) / 3);
      var gap = 8;
      var total = bw * 3 + gap * 2;
      var startX = sentX - total / 2;

      order.forEach(function (wi, slot) {
        var x = startX + slot * (bw + gap);
        var y = midY - 22;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, bw, 44, 4);
        else ctx.rect(x, y, bw, 44);
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.fill();
        ctx.strokeStyle = "rgba(150,170,210," + (0.25 + k * 0.25) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
        K.cn(ctx, words[wi], x + bw / 2, y + 22, {
          size: 15, color: "rgba(233,238,246," + (0.5 + 0.4 * k) + ")"
        });

        // 对应关系
        if (wi === 1) return;
        var targetY = wi === 0 ? midY - 4 : midY + 34;
        var a = wi === 0 ? 1 : (st.aligned ? 1 : 0.4);
        ctx.beginPath();
        ctx.moveTo(x + bw / 2, y + 44);
        ctx.lineTo(sceneX, targetY);
        ctx.setLineDash([2, 5]);
        ctx.strokeStyle = "rgba(79,209,197," + 0.45 * k * a + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 状态
      var ok = st.aligned;
      K.label(ctx, "PICTURE · " + (ok ? "结构同构" : "结构错位"), 20, h - 52, {
        size: 9, spacing: 1.6,
        color: ok ? "rgba(79,209,197,0.65)" : "rgba(226,140,120,0.7)"
      });
      K.cn(
        ctx,
        ok
          ? "命题的三个要素与事态的三个对象一一对应：所以它可以是真的。"
          : "要素对不上了。这个句子不描绘任何事实——它只是些词。",
        w * 0.5, h - 24,
        { size: 12.5, halo: 10,
          color: ok ? "rgba(150,170,210,0.62)" : "rgba(226,150,130,0.8)" }
      );
    });
  };
})();
