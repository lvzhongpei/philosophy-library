/* ============================================================
   device: 斯宾诺莎 · 自由即认识必然
   一块会思考的石头，被抛了出去
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["spinoza-freedom"] = function (o) {
    var st = { know: 0.15, phase: 0 };

    o.controls.appendChild(
      K.slider({
        label: "认识",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.15,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.know = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.phase = (st.phase + 0.0035) % 1;
      var k = st.know;

      var x0 = w * 0.16;
      var y0 = h * 0.72;
      var x1 = w * 0.84;

      // 抛出的手
      ctx.beginPath();
      ctx.arc(x0 - 8, y0 - 4, 7, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252,0.35)";
      ctx.fill();

      // 轨迹
      var path = function (p) {
        return {
          x: x0 + (x1 - x0) * p,
          y: y0 - Math.sin(p * Math.PI) * h * 0.42
        };
      };

      ctx.beginPath();
      for (var i = 0; i <= 100; i++) {
        var pt = path(i / 100);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(150,170,210," + (0.1 + k * 0.28) + ")";
      ctx.setLineDash([3, 7]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // 石头
      var sp = path(st.phase);
      var prev = path(Math.max(0, st.phase - 0.02));
      var ang = Math.atan2(sp.y - prev.y, sp.x - prev.x);

      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 5.5, 0, 0, TAU);
      ctx.fillStyle = "rgba(180,190,210,0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(220,232,250,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // 认识：看见那只手
      if (k > 0.35) {
        var a = (k - 0.35) / 0.65;
        ctx.beginPath();
        ctx.moveTo(x0 - 4, y0 - 4);
        ctx.lineTo(sp.x, sp.y);
        ctx.strokeStyle = "rgba(79,209,197," + a * 0.5 + ")";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        K.label(ctx, "抛出的力 · 已知", (x0 + sp.x) / 2, (y0 + sp.y) / 2 - 10, {
          size: 8.5, align: "center", spacing: 1.2,
          color: "rgba(79,209,197," + a * 0.65 + ")"
        });
      }

      // 石头的想法
      var bubble = k < 0.35
        ? "我在飞。想飞就飞。"
        : k < 0.8
        ? "有个力在抛我——我看见了。"
        : "我知道自己为什么这样飞。";
      var bw = 168;
      var bx = Math.min(w - bw - 20, sp.x + 22);
      var by = Math.max(20, sp.y - 52);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, 34, 4);
      else ctx.rect(bx, by, bw, 34);
      ctx.fillStyle = "rgba(8,12,20,0.85)";
      ctx.fill();
      ctx.strokeStyle = "rgba(224,164,88," + (0.2 + k * 0.4) + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
      K.cn(ctx, bubble, bx + bw / 2, by + 17, {
        size: 11.5,
        color: "rgba(233,238,246," + (0.55 + 0.35 * k) + ")"
      });

      // 读数
      K.label(ctx, "LIBERTAS · 认识 " + Math.round(k * 100) + "%", 20, 26, {
        size: 9, spacing: 1.4,
        color: k > 0.8 ? "rgba(79,209,197,0.75)" : "rgba(150,170,210,0.45)"
      });

      var msg = k < 0.35
        ? "它以为自己在飞——因为它只知道自己想飞。"
        : k < 0.8
        ? "它看见了那只手，于是不再把「被抛」叫作「自由」。"
        : "自由不是摆脱因果，是知道了因果。石头还是那条抛物线。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
