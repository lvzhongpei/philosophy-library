/* ============================================================
   device: 笛卡尔 · 我思的圆心
   怀疑波从圆心发出，却抹不掉圆心
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["descartes-cogito"] = function (o) {
    var st = { waves: [], count: 0, core: 0 };

    function doubt() {
      st.count++;
      st.waves.push({ r: 4, a: 1 });
      if (st.waves.length > 8) st.waves.shift();
    }

    o.controls.appendChild(K.button("怀疑它", doubt));
    o.controls.appendChild(
      K.button("重置", function () { st.waves = []; st.count = 0; }, "ghost")
    );

    o.canvas.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      doubt();
    });

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w / 2;
      var cy = h * 0.5;
      var maxR = Math.hypot(w, h) * 0.6;

      st.core = K.lerp(st.core, Math.min(1, st.count / 6), 0.04);

      // 波
      st.waves = st.waves.filter(function (wv) {
        wv.r += 3.2;
        wv.a = Math.max(0, 1 - wv.r / maxR);
        if (wv.a <= 0) return false;
        ctx.beginPath();
        ctx.arc(cx, cy, wv.r, 0, TAU);
        ctx.strokeStyle = "rgba(150,170,210," + wv.a * 0.35 + ")";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        return true;
      });

      // 圆心
      var pulse = K.reduced ? 1 : 0.8 + 0.2 * Math.sin(t * 2.4);
      var R = 22 + st.core * 18;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, "rgba(238,252,255," + (0.75 + 0.25 * st.core) * pulse + ")");
      g.addColorStop(0.25, "rgba(79,209,197," + (0.3 + 0.25 * st.core) + ")");
      g.addColorStop(1, "rgba(79,209,197,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 3.2, 0, TAU);
      ctx.fillStyle = "#f4feff";
      ctx.fill();

      // 十字准星
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy);
      ctx.lineTo(cx - 10, cy);
      ctx.moveTo(cx + 10, cy);
      ctx.lineTo(cx + 26, cy);
      ctx.moveTo(cx, cy - 26);
      ctx.lineTo(cx, cy - 10);
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx, cy + 26);
      ctx.strokeStyle = "rgba(236,246,255," + (0.2 + 0.3 * st.core) + ")";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 文案
      K.label(ctx, "COGITO · 怀疑的次数 " + st.count, 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.cn(ctx, "它", cx, cy - 46, {
        size: 12, color: "rgba(236,246,255," + (0.4 + 0.4 * st.core) + ")"
      });

      var msg = st.count === 0
        ? "点一下，让怀疑从圆心向外扩散。"
        : st.count < 4
        ? "波越推越远。可圆心没被推走——波正是从它发出的。"
        : "你可以怀疑一切，除了此刻正在怀疑的这个。";
      K.cn(ctx, msg, w / 2, h - 30, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
