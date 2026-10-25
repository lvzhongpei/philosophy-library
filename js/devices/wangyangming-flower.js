/* ============================================================
   device: 王阳明 · 岩中花树
   未看此花时，此花与汝心同归于寂
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["wangyangming-flower"] = function (o) {
    var st = { look: true, v: 1 };
    var pollen = [];
    var rnd = K.rng(518);

    for (var i = 0; i < 22; i++) {
      pollen.push({
        x: rnd(),
        y: rnd(),
        s: 0.4 + rnd() * 0.8,
        sp: 0.15 + rnd() * 0.4,
        ph: rnd() * TAU
      });
    }

    var btn = K.button("移开视线", function () {
      st.look = !st.look;
      btn.textContent = st.look ? "移开视线" : "看向它";
    });
    o.controls.appendChild(btn);

    o.controls.appendChild(
      K.button(
        "静观一刻",
        function () {
          st.look = true;
          btn.textContent = "移开视线";
        },
        "ghost"
      )
    );

    function petalPath(ctx, len, wid) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(wid * 0.95, -len * 0.3, wid * 0.82, -len * 0.84, 0, -len);
      ctx.bezierCurveTo(-wid * 0.82, -len * 0.84, -wid * 0.95, -len * 0.3, 0, 0);
      ctx.closePath();
    }

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.v = K.lerp(st.v, st.look ? 1 : 0, 0.05);
      var v = st.v;
      var cx = w * 0.5;
      var baseY = h * 0.88;
      var fy = h * 0.40;

      // 岩
      ctx.beginPath();
      ctx.moveTo(w * 0.58, baseY);
      ctx.lineTo(w * 0.66, h * 0.60);
      ctx.lineTo(w * 0.78, h * 0.55);
      ctx.lineTo(w * 0.88, h * 0.72);
      ctx.lineTo(w * 0.94, baseY);
      ctx.closePath();
      ctx.fillStyle = "rgba(14,18,27,0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(150,170,210,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 地面
      ctx.beginPath();
      ctx.moveTo(w * 0.08, baseY);
      ctx.lineTo(w * 0.96, baseY);
      ctx.strokeStyle = "rgba(150,170,210,0.14)";
      ctx.stroke();

      // 茎
      var stemCol = "rgba(" +
        Math.round(90 + (150 - 90) * v) + "," +
        Math.round(105 + (128 - 105) * v) + "," +
        Math.round(120 + (96 - 120) * v) + "," +
        (0.35 + 0.55 * v) + ")";
      ctx.beginPath();
      ctx.moveTo(cx - 4, baseY);
      ctx.bezierCurveTo(cx - 16, h * 0.68, cx + 12, h * 0.56, cx, fy + 8);
      ctx.strokeStyle = stemCol;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 叶
      [-1, 1].forEach(function (dir, k) {
        var lx = cx + dir * 4;
        var ly = h * (k ? 0.70 : 0.62);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.bezierCurveTo(
          lx + dir * 44, ly - 26,
          lx + dir * 62, ly + 6,
          lx + dir * 22, ly + 12
        );
        ctx.bezierCurveTo(lx + dir * 8, ly + 12, lx + dir * 2, ly + 6, lx, ly);
        var lg = "rgba(" +
          Math.round(82 + (140 - 82) * v) + "," +
          Math.round(100 + (150 - 100) * v) + "," +
          Math.round(110 + (104 - 110) * v) + "," +
          (0.18 + 0.5 * v) + ")";
        ctx.fillStyle = lg;
        ctx.fill();
        ctx.strokeStyle = stemCol;
        ctx.stroke();
      });

      // 花瓣
      var petals = 7;
      if (v > 0.02) {
        ctx.shadowColor = "rgba(224,164,88," + 0.55 * v + ")";
        ctx.shadowBlur = 26 * v;
      }
      for (var p = 0; p < petals; p++) {
        var rot = (p / petals) * TAU + 0.2;
        ctx.save();
        ctx.translate(cx, fy);
        ctx.rotate(rot);
        petalPath(ctx, h * 0.155, h * 0.062);

        if (v > 0.02) {
          var pc = p % 2 === 0 ? "236,186,132" : "224,164,88";
          ctx.fillStyle = "rgba(" + pc + "," + (0.10 + 0.72 * v) + ")";
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(" +
          Math.round(126 + (250 - 126) * v) + "," +
          Math.round(140 + (220 - 140) * v) + "," +
          Math.round(164 + (170 - 164) * v) + "," +
          (0.28 + 0.6 * v) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowBlur = 0;

      // 花心
      var cg = ctx.createRadialGradient(cx, fy, 0, cx, fy, h * 0.045);
      cg.addColorStop(0, "rgba(" + Math.round(160 + 80 * v) + "," + Math.round(150 + 60 * v) + "," + Math.round(140 + 10 * v) + "," + (0.35 + 0.6 * v) + ")");
      cg.addColorStop(1, "rgba(140,120,90," + 0.05 * v + ")");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, fy, h * 0.045, 0, TAU);
      ctx.fill();

      // 花粉
      if (v > 0.4 && !K.reduced) {
        pollen.forEach(function (q) {
          var yy = ((q.y - t * 0.02 * q.sp) % 1 + 1) % 1;
          var xx = q.x + Math.sin(t * 0.5 + q.ph) * 0.012;
          var px = w * (xx * 0.5 + 0.25);
          var py = h * (0.2 + yy * 0.6);
          ctx.beginPath();
          ctx.arc(px, py, q.s, 0, TAU);
          ctx.fillStyle = "rgba(245,215,160," + 0.35 * (v - 0.4) * 2.5 + ")";
          ctx.fill();
        });
      }

      // 状态标注
      K.label(ctx, "FLOWER IN THE ROCK", 20, 24, {
        size: 9,
        spacing: 1.8,
        color: "rgba(150,170,210,0.42)"
      });
      K.cn(ctx, v > 0.5 ? "明" : "寂", w - 34, 34, {
        size: 18,
        color: v > 0.5
          ? "rgba(224,164,88," + (0.4 + 0.6 * v) + ")"
          : "rgba(150,170,210,0.55)"
      });
      K.label(
        ctx,
        "注视强度 " + Math.round(v * 100) + "%",
        20,
        42,
        { size: 9.5, spacing: 1.4, color: "rgba(150,170,210,0.4)" }
      );
      K.cn(
        ctx,
        v > 0.5 ? "此花颜色一时明白起来" : "此花与汝心同归于寂",
        w * 0.5,
        h - 18,
        { size: 13, color: "rgba(233,238,246," + (0.22 + 0.38 * v) + ")" }
      );
    });
  };
})();
