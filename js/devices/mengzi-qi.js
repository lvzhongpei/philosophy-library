/* ============================================================
   device: 孟子 · 浩然之气
   集义一次，气厚一分
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["mengzi-qi"] = function (o) {
    var st = { q: 0.18, bits: [] };

    o.controls.appendChild(
      K.slider({
        label: "集义",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.18,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.q = v; }
      }).el
    );
    o.controls.appendChild(
      K.button("泄气", function () {
        st.q = 0.05;
      }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.5;
      var baseY = h * 0.86;
      var topY = h * 0.14;
      var q = st.q;

      // 人
      ctx.beginPath();
      ctx.arc(cx, baseY - 34, 6, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252,0.9)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 10, baseY);
      ctx.quadraticCurveTo(cx, baseY - 34, cx + 10, baseY);
      ctx.closePath();
      ctx.fillStyle = "rgba(236,242,252,0.75)";
      ctx.fill();

      // 气柱
      var colH = (baseY - topY - 10) * q;
      var grd = ctx.createLinearGradient(0, baseY, 0, baseY - colH);
      grd.addColorStop(0, "rgba(224,164,88,0.55)");
      grd.addColorStop(0.6, "rgba(224,164,88,0.18)");
      grd.addColorStop(1, "rgba(224,164,88,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      var halfW = 16 + q * 46;
      ctx.moveTo(cx - 8, baseY - 40);
      ctx.quadraticCurveTo(cx - halfW, baseY - colH * 0.6, cx - halfW * 1.15, baseY - colH - 40);
      ctx.lineTo(cx + halfW * 1.15, baseY - colH - 40);
      ctx.quadraticCurveTo(cx + halfW, baseY - colH * 0.6, cx + 8, baseY - 40);
      ctx.closePath();
      ctx.fill();

      // 上升的粒子
      if (!K.reduced) {
        if (Math.random() < 0.5) {
          st.bits.push({
            x: cx + (Math.random() - 0.5) * halfW * 1.6,
            y: baseY - 40,
            sp: 20 + Math.random() * 60,
            life: 1
          });
        }
      }
      st.bits = st.bits.filter(function (b) {
        b.y -= b.sp * 0.012 * (0.4 + q);
        b.life -= 0.008;
        if (b.y < baseY - colH - 40 || b.life <= 0) return false;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 1.4, 0, TAU);
        ctx.fillStyle = "rgba(255,214,150," + b.life * 0.55 * q + ")";
        ctx.fill();
        return true;
      });

      // 满格时的光
      if (q > 0.9) {
        var a = (q - 0.9) / 0.1;
        var gl = ctx.createRadialGradient(cx, baseY - colH * 0.5, 0, cx, baseY - colH * 0.5, w * 0.4);
        gl.addColorStop(0, "rgba(255,220,160," + 0.09 * a + ")");
        gl.addColorStop(1, "rgba(255,220,160,0)");
        ctx.fillStyle = gl;
        ctx.fillRect(0, 0, w, h);
      }

      // 标注
      K.label(ctx, "QI · 浩然之气", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "集义 " + Math.round(q * 100) + "%", w - 20, 26, {
        size: 9, align: "right", spacing: 1.4, color: "rgba(224,164,88,0.6)"
      });

      var msg = q < 0.2
        ? "气很薄。这时候说「我有浩然之气」，是不作数。"
        : q < 0.7
        ? "「以直养而无害」——每一次做得对，都在加厚它。"
        : "「则塞于天地之间。」注意：是养出来的，不是鼓出来的。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
