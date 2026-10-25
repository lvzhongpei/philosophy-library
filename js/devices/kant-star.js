/* ============================================================
   device: 康德 · 星空与道德律
   同一个你，两种看法
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["kant-star"] = function (o) {
    var st = { mode: 0, k: 0 }; // 0 现象，1 本体
    var stars = [];
    var rnd = K.rng(17240422);
    for (var i = 0; i < 60; i++) {
      stars.push({ x: rnd(), y: rnd() * 0.3, r: 0.4 + rnd() * 1.2, ph: rnd() * TAU });
    }

    var btn = K.button("换一种看法 →", function (b) {
      st.mode = st.mode ? 0 : 1;
      b.textContent = st.mode ? "← 换回来" : "换一种看法 →";
    });
    o.controls.appendChild(btn);

    o.controls.appendChild(
      K.button(
        "两种一起看",
        function () {
          st.mode = 2;
        },
        "ghost"
      )
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var target = st.mode === 2 ? 0.5 : st.mode === 1 ? 1 : 0;
      st.k = K.lerp(st.k, target, 0.05);
      var k = st.k;

      var cx = w / 2;
      var gy = h * 0.82;
      var s = Math.max(0.75, Math.min(1.3, Math.min(w, h) / 380));

      // 星空（本体一侧）
      if (k > 0.01) {
        stars.forEach(function (st2) {
          var a = (0.3 + 0.4 * Math.abs(Math.sin(t * 0.7 + st2.ph))) * k;
          ctx.beginPath();
          ctx.arc(st2.x * w, st2.y * h, st2.r, 0, TAU);
          ctx.fillStyle = "rgba(200,225,255," + a + ")";
          ctx.fill();
        });
        // 道德律的光柱
        var beam = ctx.createLinearGradient(0, 0, 0, gy - 40 * s);
        beam.addColorStop(0, "rgba(224,164,88," + 0.22 * k + ")");
        beam.addColorStop(1, "rgba(224,164,88,0)");
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(cx - 26 * s, 0);
        ctx.lineTo(cx + 26 * s, 0);
        ctx.lineTo(cx + 54 * s, gy - 40 * s);
        ctx.lineTo(cx - 54 * s, gy - 40 * s);
        ctx.closePath();
        ctx.fill();
      }

      // 因果箭头（现象一侧）
      if (k < 0.99) {
        var a2 = (1 - k) * 0.7;
        for (var i2 = 0; i2 < 7; i2++) {
          var ang = Math.PI + (i2 / 6) * Math.PI;
          var sx = cx + Math.cos(ang) * w * 0.34;
          var sy = gy - 60 * s + Math.sin(ang) * h * 0.26;
          var ex = cx + Math.cos(ang) * 26 * s;
          var ey = gy - 60 * s + Math.sin(ang) * 16 * s;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = "rgba(150,170,210," + a2 * 0.5 + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(ex, ey, 1.6, 0, TAU);
          ctx.fillStyle = "rgba(150,170,210," + a2 * 0.6 + ")";
          ctx.fill();
        }
        // 时钟弧
        ctx.beginPath();
        ctx.arc(cx, gy - 60 * s, 54 * s, Math.PI * 1.15, Math.PI * 1.85);
        ctx.strokeStyle = "rgba(150,170,210," + a2 * 0.3 + ")";
        ctx.setLineDash([2, 6]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        K.label(ctx, "被因果决定", cx, gy - 60 * s - 62 * s, {
          size: 9, align: "center", spacing: 1.6,
          color: "rgba(150,170,210," + a2 * 0.55 + ")"
        });
      }

      // 人
      ctx.beginPath();
      ctx.arc(cx, gy - 48 * s, 8 * s, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252,0.95)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 12 * s, gy);
      ctx.quadraticCurveTo(cx, gy - 42 * s, cx + 12 * s, gy);
      ctx.closePath();
      ctx.fillStyle = "rgba(236,242,252,0.85)";
      ctx.fill();

      // 地面
      ctx.beginPath();
      ctx.moveTo(w * 0.12, gy);
      ctx.lineTo(w * 0.88, gy);
      ctx.strokeStyle = "rgba(150,170,210,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 标注
      K.label(ctx, "DER BESTIRNTE HIMMEL ÜBER MIR", 20, 26, {
        size: 8.5, spacing: 1.6, color: "rgba(150,170,210," + 0.25 + 0.3 * k + ")"
      });
      K.label(ctx, "DAS MORALISCHE GESETZ IN MIR", 20, h - 20, {
        size: 8.5, spacing: 1.6,
        color: "rgba(224,164,88," + 0.2 + 0.4 * (1 - k) + ")"
      });

      var msg = st.mode === 2
        ? "同一个你：星空之下是被决定的，道德律之下是自由的。"
        : st.mode === 1
        ? "作为本体的你：不在时空里，不受因果摆布，只服从自己立的法。"
        : "作为现象的你：每一念都有前因，你是自然这本账上的一行。";
      K.cn(ctx, msg, w * 0.5, h * 0.34, {
        size: 12.5, halo: 12, color: "rgba(233,238,246,0.55)"
      });
    });
  };
})();
