/* ============================================================
   device: 庄子 · 鲲鹏积风
   「风之积也不厚，则其负大翼也无力」
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["zhuangzi-peng"] = function (o) {
    var st = {
      wind: 0.28,
      y: 0,
      vy: 0,
      x: 0.5,
      init: false,
      splash: 0,
      streaks: []
    };

    for (var i = 0; i < 46; i++) {
      st.streaks.push({
        y: Math.random(),
        x: Math.random(),
        len: 0.04 + Math.random() * 0.1,
        sp: 0.15 + Math.random() * 0.5
      });
    }

    o.controls.appendChild(
      K.slider({
        label: "风之积",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.28,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.wind = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var seaY = h * 0.82;
      if (!st.init) {
        st.y = seaY;
        st.init = true;
      }

      var lift = st.wind * 300;
      var gravity = 155;

      // 风场
      var n = Math.round(4 + st.wind * 42);
      for (var i = 0; i < Math.min(n, st.streaks.length); i++) {
        var s = st.streaks[i];
        s.x += (0.04 + st.wind * 0.22) * s.sp * 0.02;
        if (s.x > 1.1) { s.x = -0.1; s.y = Math.random(); }
        var sy = s.y * (seaY - 10);
        ctx.beginPath();
        ctx.moveTo(s.x * w, sy);
        ctx.lineTo((s.x + s.len * (0.4 + st.wind)) * w, sy);
        ctx.strokeStyle = "rgba(150,195,215," + (0.08 + st.wind * 0.34) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 物理：acc > 0 表示净升力（屏幕坐标里 y 变小）
      var acc = lift - gravity;
      st.vy -= acc * 0.016;
      st.vy *= 0.995;
      st.y += st.vy * 0.016;

      if (st.y > seaY) {
        if (st.vy > 60 && st.splash <= 0) st.splash = 1;
        st.y = seaY;
        st.vy = 0;
      }
      if (st.y < h * 0.06) {
        st.y = h * 0.06;
        st.vy *= 0.4;
      }
      st.splash = Math.max(0, st.splash - 0.016);

      var flying = st.y < seaY - 6;

      // 海面
      for (var k = 0; k < 4; k++) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 6) {
          var wy = seaY + k * 7 + Math.sin(x * 0.02 + t * (0.8 + k * 0.2)) * (2 + k);
          if (x === 0) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.strokeStyle = "rgba(90,130,160," + (0.22 - k * 0.045) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 水花
      if (st.splash > 0) {
        var r0 = (1 - st.splash) * 42;
        ctx.beginPath();
        ctx.ellipse(st.x * w, seaY + 4, r0, r0 * 0.28, 0, 0, TAU);
        ctx.strokeStyle = "rgba(180,220,235," + st.splash * 0.5 + ")";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // 鸟
      var bx = st.x * w;
      var by = st.y;
      var flapSpeed = flying ? 2.4 : 6.5;
      var flap = Math.sin(t * flapSpeed) * (0.5 + st.wind * 0.3);
      var size = Math.min(w, h) * 0.105;
      var crouch = flying ? 0 : Math.abs(Math.sin(t * 3)) * 5;

      // 影
      if (flying) {
        ctx.beginPath();
        ctx.ellipse(bx + 18, seaY + 6, size * 0.7, size * 0.16, 0, 0, TAU);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fill();
      }

      ctx.save();
      ctx.translate(bx, by + crouch);

      // 双翼
      [-1, 1].forEach(function (s) {
        ctx.beginPath();
        ctx.moveTo(s * 4, 0);
        ctx.bezierCurveTo(
          s * (size * 1.5), -size * (0.7 + flap * 0.5),
          s * (size * 2.6), -size * (0.2 + flap * 0.9),
          s * (size * 2.2), size * 0.5
        );
        ctx.bezierCurveTo(
          s * (size * 1.3), size * 0.42,
          s * (size * 0.5), size * 0.2,
          s * 4, size * 0.1
        );
        ctx.closePath();
        var wg = ctx.createLinearGradient(0, -size, 0, size * 0.6);
        wg.addColorStop(0, "rgba(190,225,235," + (0.5 + st.wind * 0.35) + ")");
        wg.addColorStop(1, "rgba(90,140,170,0.18)");
        ctx.fillStyle = wg;
        ctx.fill();
        ctx.strokeStyle = "rgba(190,225,235,0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 身体
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.55, size * 0.28, 0, 0, TAU);
      ctx.fillStyle = "rgba(214,236,244,0.85)";
      ctx.fill();

      // 头
      ctx.beginPath();
      ctx.arc(size * 0.55, -size * 0.16, size * 0.16, 0, TAU);
      ctx.fillStyle = "rgba(226,244,250,0.92)";
      ctx.fill();

      // 喙
      ctx.beginPath();
      ctx.moveTo(size * 0.68, -size * 0.18);
      ctx.lineTo(size * 0.95, -size * 0.08);
      ctx.lineTo(size * 0.66, -size * 0.04);
      ctx.closePath();
      ctx.fillStyle = "rgba(224,164,88,0.85)";
      ctx.fill();

      ctx.restore();

      // 读数
      K.label(ctx, "PENG · 风之积 " + Math.round(st.wind * 100) + "%", 20, 26, {
        size: 9, spacing: 1.6,
        color: st.wind >= 0.52 ? "rgba(79,209,197,0.6)" : "rgba(224,164,88,0.65)"
      });

      var tip = flying && st.wind >= 0.52 ? "抟扶摇而上者九万里"
        : flying ? "升着，但撑不了太久"
        : st.wind >= 0.52 ? "风到了 —— 翼还贴着水" : "风之积也不厚，则其负大翼也无力";
      K.cn(ctx, tip, w / 2, h - 24, {
        size: 13,
        color: st.wind >= 0.52 ? "rgba(200,240,245,0.62)" : "rgba(224,164,88,0.55)"
      });
    });
  };
})();
