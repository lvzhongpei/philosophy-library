/* ============================================================
   device: 海德格尔 · 上手与在手
   用着的时候它不在视野里，坏了才跳出来
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["heidegger-tool"] = function (o) {
    var st = { broken: false, k: 0 };

    o.controls.appendChild(
      K.button("弄坏它", function (b) {
        st.broken = !st.broken;
        b.textContent = st.broken ? "修好它" : "弄坏它";
      })
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.k = K.lerp(st.k, st.broken ? 1 : 0, 0.07);
      var k = st.k;

      var hx = w * 0.46;
      var hy = h * 0.5;
      var s = Math.max(0.9, Math.min(1.5, Math.min(w, h) / 320));

      // 钉子（正常使用时，注意力在这里）
      var nailA = (1 - k) * 0.95;
      if (nailA > 0.02) {
        var nx = hx + 74 * s;
        var ny = hy - 40 * s;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nx + 26 * s, ny + 26 * s);
        ctx.strokeStyle = "rgba(226,236,250," + nailA + ")";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(nx + 30 * s, ny + 30 * s, 3, 0, TAU);
        ctx.fillStyle = "rgba(240,246,255," + nailA + ")";
        ctx.fill();
        // 敲击的星花
        if (!K.reduced) {
          var sp = (t * 1.6) % 1;
          ctx.beginPath();
          ctx.arc(nx + 30 * s, ny + 30 * s, 4 + sp * 14, 0, TAU);
          ctx.strokeStyle = "rgba(255,240,200," + (1 - sp) * 0.5 * nailA + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        K.label(ctx, "钉子", nx + 34 * s, ny + 8 * s, {
          size: 8.5, color: "rgba(226,236,250," + nailA * 0.5 + ")"
        });
      }

      // 锤子
      var a = 0.12 + k * 0.85;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(-0.7 + (1 - k) * Math.sin(t * 5) * 0.12);

      // 柄
      ctx.beginPath();
      ctx.moveTo(-6 * s, 44 * s);
      ctx.lineTo(2 * s, -34 * s);
      ctx.strokeStyle = "rgba(180,132,84," + a + ")";
      ctx.lineWidth = 7 * s;
      ctx.lineCap = "round";
      ctx.stroke();

      // 头
      ctx.beginPath();
      ctx.rect(-16 * s, -52 * s, 34 * s, 20 * s);
      ctx.fillStyle = "rgba(140,150,170," + a + ")";
      ctx.fill();
      ctx.strokeStyle = "rgba(226,236,250," + a * 0.8 + ")";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 裂痕
      if (k > 0.4) {
        ctx.beginPath();
        ctx.moveTo(2 * s, -34 * s);
        ctx.lineTo(-3 * s, -22 * s);
        ctx.lineTo(3 * s, -12 * s);
        ctx.strokeStyle = "rgba(255,120,100," + (k - 0.4) * 1.2 + ")";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.restore();

      // 标注
      K.label(ctx, "ZEUG · 用具", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });

      var state = k < 0.35 ? "上手" : k > 0.65 ? "在手" : "正在断裂";
      K.cn(ctx, state, w - 30, 34, {
        size: 16,
        color: k < 0.35
          ? "rgba(150,170,210,0.55)"
          : k > 0.65
          ? "rgba(226,150,120,0.9)"
          : "rgba(224,164,88,0.8)"
      });

      var msg = k < 0.35
        ? "你注意的只有钉子。锤子透明了——这就是「上手」。"
        : k > 0.65
        ? "坏了。它第一次作为「一个东西」出现在你面前。"
        : "从透明到显眼，中间只有一道裂缝的距离。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
