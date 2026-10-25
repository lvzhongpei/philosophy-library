/* ============================================================
   device: 朱熹 · 月印万川
   理只有一个，而每片水面各自完整地映着它
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["zhuxi-moon"] = function (o) {
    var st = { n: 5 };

    o.controls.appendChild(
      K.slider({
        label: "水面",
        min: 1,
        max: 12,
        step: 1,
        value: 5,
        fmt: function (v) { return v + " 处"; },
        onInput: function (v) { st.n = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var mx = w * 0.5;
      var my = h * 0.24;
      var mr = Math.min(w * 0.07, h * 0.11);

      // 天
      ctx.beginPath();
      ctx.moveTo(0, h * 0.42);
      ctx.lineTo(w, h * 0.42);
      ctx.strokeStyle = "rgba(150,170,210,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 月
      var gl = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 2.6);
      gl.addColorStop(0, "rgba(255,246,222,0.55)");
      gl.addColorStop(0.3, "rgba(240,220,180,0.16)");
      gl.addColorStop(1, "rgba(240,220,180,0)");
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(mx, my, mr * 2.6, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, TAU);
      ctx.fillStyle = "rgba(255,250,235,0.95)";
      ctx.fill();
      K.label(ctx, "理一", mx, my - mr - 16, {
        size: 10, align: "center", spacing: 2,
        color: "rgba(255,246,222,0.7)"
      });

      // 水面
      var n = st.n;
      var cols = Math.min(n, 6);
      var rows = Math.ceil(n / cols);
      var gy0 = h * 0.56;
      var gw = (w - 80) / cols;
      var gh = Math.min(gw * 0.6, (h * 0.34) / rows);

      for (var i = 0; i < n; i++) {
        var r = Math.floor(i / cols);
        var c = i % cols;
        var px = 40 + gw * (c + 0.5);
        var py = gy0 + gh * (r + 0.4);

        // 水面
        ctx.beginPath();
        ctx.ellipse(px, py, gw * 0.36, gh * 0.26, 0, 0, TAU);
        ctx.fillStyle = "rgba(79,209,197,0.07)";
        ctx.fill();
        ctx.strokeStyle = "rgba(79,209,197,0.28)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 倒影：每一个都完整
        var rr = Math.min(gw * 0.13, 9);
        var flick = K.reduced ? 0 : Math.sin(t * 1.6 + i) * 0.6;
        ctx.beginPath();
        ctx.ellipse(px, py + flick, rr, rr * 0.7, 0, 0, TAU);
        ctx.fillStyle = "rgba(255,248,226,0.75)";
        ctx.fill();
      }

      // 说明
      K.label(ctx, "LI YI FEN SHU · 理一分殊", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, n + " 处水面 · 仍是同一个月", w - 20, 26, {
        size: 9, align: "right", spacing: 1.2, color: "rgba(150,170,210,0.45)"
      });
      K.cn(ctx, n === 1
        ? "只有一处的时候，最容易以为月只属于它。"
        : "不是把月亮切成 " + n + " 块，是每片水面都完整地映着它。",
        w * 0.5, h - 24,
        { size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)" });
    });
  };
})();
