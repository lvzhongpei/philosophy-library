/* ============================================================
   device: 尼采 · 日神与酒神
   几何的秩序 ←→ 色彩的混沌，中间那一带才叫悲剧
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["nietzsche-apollo-dionysus"] = function (o) {
    var st = { k: 0.18 };
    var pts = [];
    var cols = 15;
    var rows = 9;
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var gx = (i / (cols - 1) - 0.5) * 2;
        var gy = (j / (rows - 1) - 0.5) * 2;
        pts.push({
          gx: gx,
          gy: gy,
          ang: Math.atan2(gy, gx) + (Math.random() - 0.5) * 0.6,
          rad: Math.sqrt(gx * gx + gy * gy) * (0.7 + Math.random() * 0.7),
          ph: Math.random() * TAU,
          sp: 0.5 + Math.random() * 0.9,
          sz: 0.8 + Math.random() * 1.4
        });
      }
    }

    o.controls.appendChild(
      K.slider({
        label: "日神 ←→ 酒神",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.18,
        fmt: function (v) {
          if (v < 0.12) return "日神";
          if (v > 0.88) return "酒神";
          if (Math.abs(v - 0.5) < 0.08) return "悲剧";
          return Math.round(v * 100) + "%";
        },
        onInput: function (v) { st.k = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w / 2;
      var cy = h / 2;
      var S = Math.min(w, h) * 0.34;
      var k = st.k;

      // 日神：几何秩序
      var orderA = (1 - k) * 0.3;
      if (orderA > 0.005) {
        ctx.strokeStyle = "rgba(120,220,215," + orderA * 1.15 + ")";
        ctx.lineWidth = 1;
        for (var i = 0; i <= cols - 1; i++) {
          var px = cx + ((i / (cols - 1) - 0.5) * 2) * S;
          ctx.beginPath();
          ctx.moveTo(px, cy - S);
          ctx.lineTo(px, cy + S);
          ctx.stroke();
        }
        for (var j = 0; j <= rows - 1; j++) {
          var py = cy + ((j / (rows - 1) - 0.5) * 2) * S;
          ctx.beginPath();
          ctx.moveTo(cx - S, py);
          ctx.lineTo(cx + S, py);
          ctx.stroke();
        }
        for (var c = 1; c <= 3; c++) {
          ctx.beginPath();
          ctx.arc(cx, cy, S * (c / 3) * 0.98, 0, TAU);
          ctx.strokeStyle = "rgba(120,220,215," + orderA * 0.95 + ")";
          ctx.stroke();
        }
      }

      // 粒子
      for (var q = 0; q < pts.length; q++) {
        var p = pts[q];
        var gxp = cx + p.gx * S;
        var gyp = cy + p.gy * S;
        var ca = p.ang + t * 0.22 * p.sp;
        var chx = cx + Math.cos(ca) * p.rad * S * 0.86;
        var chy = cy + Math.sin(ca * 1.17 + p.ph * 0.2) * p.rad * S * 0.86;

        var jit = K.reduced ? 0 : Math.sin(t * 2.2 + p.ph) * 3 * k;
        var x = K.lerp(gxp, chx, k) + jit;
        var y = K.lerp(gyp, chy, k) + jit * 0.6;

        // 颜色：青 → 琥珀 → 品红
        var r, g, b;
        if (k < 0.5) {
          var m = k / 0.5;
          r = Math.round(79 + (224 - 79) * m);
          g = Math.round(209 + (164 - 209) * m);
          b = Math.round(197 + (88 - 197) * m);
        } else {
          var m2 = (k - 0.5) / 0.5;
          r = Math.round(224 + (196 - 224) * m2);
          g = Math.round(164 + (86 - 164) * m2);
          b = Math.round(88 + (128 - 88) * m2);
        }
        var a = 0.35 + 0.55 * Math.abs(Math.sin(t * 0.9 + p.ph));

        ctx.beginPath();
        ctx.arc(x, y, p.sz * (0.9 + k * 1.1), 0, TAU);
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
        ctx.fill();
      }

      // 中点：悲剧
      var nearMid = Math.abs(k - 0.5) < 0.07;
      if (nearMid) {
        var ga = 1 - Math.abs(k - 0.5) / 0.07;
        ctx.beginPath();
        ctx.arc(cx, cy, S * 1.05, 0, TAU);
        ctx.strokeStyle = "rgba(240,220,255," + ga * 0.3 + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
        K.cn(ctx, "悲剧诞生于此", cx, cy - S * 1.24, {
          size: 13,
          color: "rgba(240,220,255," + ga * 0.8 + ")"
        });
      }

      // 标注
      K.label(ctx, "APOLLO", 26, h / 2, {
        size: 10,
        spacing: 2.6,
        color: "rgba(79,209,197," + (1 - k) * 0.75 + ")"
      });
      K.label(ctx, "DIONYSUS", w - 26, h / 2, {
        size: 10,
        spacing: 2.6,
        align: "right",
        color: "rgba(226,110,140," + k * 0.85 + ")"
      });
      K.label(ctx, "形式 · 界限 · 梦", 26, h / 2 + 20, {
        size: 9.5, color: "rgba(150,170,210," + (1 - k) * 0.5 + ")"
      });
      K.label(ctx, "沉醉 · 深渊 · 醉", w - 26, h / 2 + 20, {
        size: 9.5, align: "right", color: "rgba(150,170,210," + k * 0.5 + ")"
      });

      K.label(ctx, "滑动：日神 " + Math.round((1 - k) * 100) + "% / 酒神 " + Math.round(k * 100) + "%", 20, 26, {
        size: 9, spacing: 1.5, color: "rgba(150,170,210,0.42)"
      });
    });
  };
})();
