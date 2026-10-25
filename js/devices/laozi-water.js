/* ============================================================
   device: 老子 · 上善若水
   推向刚，它冲垮石头也冲垮自己；推向柔，它绕着走
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["laozi-water"] = function (o) {
    var st = { soft: 0.7, t0: 0 };
    var drops = [];

    o.controls.appendChild(
      K.slider({
        label: "刚 ←→ 柔",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.7,
        fmt: function (v) {
          return v > 0.66 ? "柔" : v < 0.34 ? "刚" : "相持";
        },
        onInput: function (v) { st.soft = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cy = h * 0.52;
      var rockX = w * 0.54;
      var rockR = Math.min(w, h) * 0.13;
      var soft = st.soft;

      // 河床
      ctx.beginPath();
      ctx.moveTo(0, cy + h * 0.22);
      ctx.lineTo(w, cy + h * 0.22);
      ctx.strokeStyle = "rgba(150,170,210,0.1)";
      ctx.stroke();

      // 水流（三条流线）
      var lanes = [-1, 0, 1];
      lanes.forEach(function (lane) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 6) {
          var dx = x - rockX;
          var bump = Math.exp(-(dx * dx) / (2 * Math.pow(rockR * 1.5, 2)));
          var deflect = lane === 0
            ? (1 - soft) * bump * -rockR * 0.2
            : lane * (1 - soft) * bump * rockR * 1.7;
          var y = cy + lane * 13 * (1 - soft * 0.55) + deflect;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(79,209,197," + (0.2 + soft * 0.42) + ")";
        ctx.lineWidth = lane === 0 ? 1.6 : 1;
        ctx.stroke();
      });

      // 水珠
      if (!K.reduced) {
        if (Math.random() < 0.5) {
          drops.push({
            x: rockX - rockR * (0.2 + Math.random() * 0.5),
            y: cy + (Math.random() - 0.5) * 30,
            vx: (1 - soft) * (60 + Math.random() * 90) + 10,
            vy: -(40 + Math.random() * 70) * (1 - soft),
            life: 1
          });
        }
      }
      drops = drops.filter(function (d) {
        d.life -= 0.014;
        d.vy += 160 * 0.014;
        d.x += d.vx * 0.014;
        d.y += d.vy * 0.014;
        if (d.life <= 0) return false;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.5, 0, TAU);
        ctx.fillStyle = "rgba(160,225,235," + d.life * 0.65 + ")";
        ctx.fill();
        return true;
      });

      // 石头
      ctx.beginPath();
      ctx.moveTo(rockX - rockR, cy + rockR * 0.9);
      ctx.quadraticCurveTo(rockX - rockR * 1.1, cy - rockR * 0.5, rockX - rockR * 0.1, cy - rockR);
      ctx.quadraticCurveTo(rockX + rockR * 0.9, cy - rockR * 0.9, rockX + rockR, cy + rockR * 0.9);
      ctx.closePath();
      ctx.fillStyle = "rgba(30,38,54,0.98)";
      ctx.fill();
      ctx.strokeStyle = "rgba(150,170,210,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 磨圆的痕迹
      if (soft > 0.5) {
        ctx.beginPath();
        ctx.arc(rockX - rockR * 0.55, cy + rockR * 0.2, rockR * 0.5, -1.2, 1.3);
        ctx.strokeStyle = "rgba(79,209,197," + (soft - 0.5) * 0.9 + ")";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 文案
      K.label(ctx, "WATER · 上善若水", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.cn(
        ctx,
        soft > 0.66
          ? "它不与石头争，却把石头磨圆。"
          : soft < 0.34
          ? "正面撞上去：石头没碎，水先散了。"
          : "半争半让——最费力的时候。",
        w * 0.5, h - 26,
        { size: 12.5, halo: 10,
          color: soft > 0.66 ? "rgba(160,225,235,0.72)" : "rgba(226,164,120,0.62)" }
      );
      K.label(ctx, "冲击力 " + Math.round((1 - soft) * 100) + "% · 通过率 " + Math.round(soft * 100) + "%", w - 20, 26, {
        size: 9, align: "right", spacing: 1.2, color: "rgba(150,170,210,0.4)"
      });
    });
  };
})();
