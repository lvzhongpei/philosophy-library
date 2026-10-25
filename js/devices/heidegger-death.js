/* ============================================================
   device: 海德格尔 · 向死而生
   终点那里有一个谁也替不了的可能性
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["heidegger-death"] = function (o) {
    var st = { k: 0.25 };

    o.controls.appendChild(
      K.slider({
        label: "回避 ←→ 直视",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.25,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.k = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var x0 = w * 0.1;
      var x1 = w * 0.86;
      var y = h * 0.56;
      var k = st.k;

      // 时间线
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.strokeStyle = "rgba(150,170,210," + (0.12 + k * 0.22) + ")";
      ctx.lineWidth = k > 0.6 ? 2 : 1;
      ctx.stroke();

      // 出生
      ctx.beginPath();
      ctx.arc(x0, y, 3, 0, TAU);
      ctx.fillStyle = "rgba(150,170,210,0.6)";
      ctx.fill();
      K.label(ctx, "生", x0, y + 22, {
        size: 9, align: "center", spacing: 1.4, color: "rgba(150,170,210,0.45)"
      });

      // 终点
      var ex = x1;
      var glow = k;
      if (glow > 0.02) {
        var g = ctx.createLinearGradient(ex - 40, 0, ex, 0);
        g.addColorStop(0, "rgba(240,200,150,0)");
        g.addColorStop(1, "rgba(240,200,150," + glow * 0.4 + ")");
        ctx.fillStyle = g;
        ctx.fillRect(ex - 40, y - 60, 40, 120);
      }
      ctx.beginPath();
      ctx.moveTo(ex, y - 46 - k * 20);
      ctx.lineTo(ex, y + 46 + k * 20);
      ctx.strokeStyle = "rgba(240,210,170," + (0.2 + glow * 0.75) + ")";
      ctx.lineWidth = 1.6 + k;
      ctx.stroke();

      K.label(ctx, "死", ex + 10, y + 4, {
        size: 12, spacing: 1.6,
        color: "rgba(240,210,170," + (0.35 + glow * 0.6) + ")"
      });

      // 回避：被雾盖住
      if (k < 0.7) {
        var fa = (1 - k / 0.7) * 0.9;
        var fg = ctx.createRadialGradient(ex - 30, y, 0, ex - 30, y, 90);
        fg.addColorStop(0, "rgba(120,130,150," + fa * 0.5 + ")");
        fg.addColorStop(1, "rgba(120,130,150,0)");
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(ex - 30, y, 90, 0, TAU);
        ctx.fill();

        ["人都有一死", "还早", "别人的事", "以后再说"].forEach(function (txt, i) {
          K.label(ctx, txt, ex - 110 + i * 4, y - 26 + i * 15, {
            size: 8, spacing: 0.8,
            color: "rgba(180,192,210," + fa * 0.55 + ")"
          });
        });
      }

      // 行走的此在
      var px = x0 + (x1 - x0) * 0.42;
      var bob = K.reduced ? 0 : Math.sin(t * 3) * 1.6;
      ctx.beginPath();
      ctx.arc(px, y - 18 + bob, 5, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252," + (0.6 + k * 0.35) + ")";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px - 7, y + bob);
      ctx.quadraticCurveTo(px, y - 18 + bob, px + 7, y + bob);
      ctx.closePath();
      ctx.fillStyle = "rgba(236,242,252," + (0.45 + k * 0.3) + ")";
      ctx.fill();

      // 读数
      K.label(ctx, "SEIN-ZUM-TODE · 直视 " + Math.round(k * 100) + "%", 20, 26, {
        size: 9, spacing: 1.4,
        color: k > 0.7 ? "rgba(240,210,170,0.8)" : "rgba(150,170,210,0.42)"
      });

      var msg = k < 0.3
        ? "「人都有一死」——用一句统计学的话，把自己的死推远。"
        : k < 0.7
        ? "雾在散。你开始看见那个终点是属于你的。"
        : "直视它，这条线才第一次是你的。这就是「向死而生」。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10,
        color: k > 0.7 ? "rgba(240,210,170,0.75)" : "rgba(150,170,210,0.6)"
      });
    });
  };
})();
