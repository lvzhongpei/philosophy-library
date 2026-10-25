/* ============================================================
   device: 孟子 · 四端
   四枝幼苗，长不长是另一回事
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var SPROUTS = [
    { n: "恻隐", de: "仁" },
    { n: "羞恶", de: "义" },
    { n: "辞让", de: "礼" },
    { n: "是非", de: "智" }
  ];

  window.DEVICES["mengzi-sprouts"] = function (o) {
    var st = { grow: 0.25 };

    o.controls.appendChild(
      K.slider({
        label: "扩而充之",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.25,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.grow = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var baseY = h * 0.84;
      var gap = w / 5;
      var g = st.grow;

      // 土壤
      ctx.beginPath();
      ctx.moveTo(w * 0.08, baseY + 6);
      ctx.lineTo(w * 0.92, baseY + 6);
      ctx.strokeStyle = "rgba(150,170,210,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      SPROUTS.forEach(function (s, i) {
        var x = gap * (i + 1);
        var grow = Math.max(0.2, Math.min(1, g * 1.1 + 0.12));
        var hgt = 26 + grow * h * 0.36;
        var sway = K.reduced ? 0 : Math.sin(t * 1.1 + i) * 2 * grow;

        // 茎
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.quadraticCurveTo(x + sway, baseY - hgt * 0.6, x + sway * 1.6, baseY - hgt);
        ctx.strokeStyle = "rgba(140,200,160," + (0.25 + 0.55 * grow) + ")";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 叶
        [-1, 1].forEach(function (d) {
          var ly = baseY - hgt * (d < 0 ? 0.5 : 0.68);
          var w2 = 18 + 22 * grow;
          ctx.beginPath();
          ctx.moveTo(x, ly);
          ctx.quadraticCurveTo(x + d * w2 * 0.6, ly - 12 - 8 * grow, x + d * w2, ly + 3);
          ctx.quadraticCurveTo(x + d * w2 * 0.5, ly + 9, x, ly);
          ctx.fillStyle = "rgba(120,190,150," + (0.22 + 0.42 * grow) + ")";
          ctx.fill();
        });

        // 花 / 果
        if (grow > 0.72) {
          var fa = (grow - 0.72) / 0.28;
          var pulse = K.reduced ? 1 : 0.8 + 0.2 * Math.sin(t * 2 + i);
          ctx.beginPath();
          ctx.arc(x + sway * 1.6, baseY - hgt, 3.5 + fa * 2.5, 0, TAU);
          ctx.fillStyle = "rgba(240,196,130," + fa * 0.85 * pulse + ")";
          ctx.fill();
        }

        // 标注
        K.cn(ctx, s.n, x, baseY + 26, {
          size: 12,
          color: "rgba(233,238,246," + (0.35 + 0.5 * grow) + ")"
        });
        K.cn(ctx, s.de, x, baseY + 46, {
          size: 11,
          color: "rgba(224,164,88," + (0.2 + 0.6 * grow) + ")"
        });
      });

      K.label(ctx, "SPROUTS · 四端", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "已充 " + Math.round(g * 100) + "%", w - 20, 26, {
        size: 9, align: "right", spacing: 1.4, color: "rgba(224,164,88,0.6)"
      });

      var msg = g < 0.15
        ? "四点火星。人人都有，但还没长成。"
        : g < 0.6
        ? "长起来了，但还只是枝叶。"
        : g < 0.9
        ? "「若火之始然，泉之始达」——开始挡不住了。"
        : "足以保四海。孟子说，不能者「弗为耳」，不是不能。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
