/* ============================================================
   device: 朱熹 · 格物穷理
   今日格一物，明日格一物，积久贯通
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var COLS = 7;
  var ROWS = 4;

  window.DEVICES["zhuxi-gewu"] = function (o) {
    var st = { done: [], flash: 0 };

    function reset() { st.done = []; st.flash = 0; }

    o.controls.appendChild(
      K.button("格一个", function () {
        if (st.done.length < COLS * ROWS) st.done.push(st.done.length);
        if (st.done.length === COLS * ROWS) st.flash = 1;
      })
    );
    o.controls.appendChild(K.button("重来", reset, "ghost"));

    K.stage(o.canvas, function (ctx, w, h, t) {
      var pad = w < 560 ? 20 : 44;
      var gx0 = pad;
      var gy0 = h * 0.24;
      var cw = (w - pad * 2) / COLS;
      var ch = Math.min(cw, (h * 0.52) / ROWS);
      var total = COLS * ROWS;
      var n = st.done.length;
      var full = n >= total;

      if (st.flash > 0) st.flash = Math.max(0, st.flash - 0.012);

      for (var j = 0; j < ROWS; j++) {
        for (var i = 0; i < COLS; i++) {
          var idx = j * COLS + i;
          var on = idx < n;
          var cx = gx0 + cw * (i + 0.5);
          var cy = gy0 + ch * (j + 0.5);

          ctx.beginPath();
          ctx.rect(gx0 + cw * i + 4, gy0 + ch * j + 4, cw - 8, ch - 8);
          ctx.fillStyle = on
            ? "rgba(224,164,88,0.13)"
            : "rgba(255,255,255,0.015)";
          ctx.fill();
          ctx.strokeStyle = on
            ? "rgba(224,164,88,0.5)"
            : "rgba(150,170,210,0.14)";
          ctx.lineWidth = 1;
          ctx.stroke();

          if (on) {
            // 一个「理」字太密，用一个小十字表示已格
            ctx.beginPath();
            ctx.moveTo(cx - 4, cy);
            ctx.lineTo(cx + 4, cy);
            ctx.moveTo(cx, cy - 4);
            ctx.lineTo(cx, cy + 4);
            ctx.strokeStyle = "rgba(240,196,130,0.85)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // 贯通时的光
      if (full) {
        var a = 0.25 + st.flash * 0.5;
        var gl = ctx.createRadialGradient(w / 2, gy0 + ch * ROWS / 2, 0, w / 2, gy0 + ch * ROWS / 2, w * 0.5);
        gl.addColorStop(0, "rgba(240,200,140," + a * 0.35 + ")");
        gl.addColorStop(1, "rgba(240,200,140,0)");
        ctx.fillStyle = gl;
        ctx.fillRect(0, 0, w, h);
      }

      // 进度
      K.label(ctx, "GEWU · 已格 " + n + " / " + total, 20, 26, {
        size: 9, spacing: 1.5,
        color: full ? "rgba(240,200,140,0.85)" : "rgba(150,170,210,0.45)"
      });

      var msg = full
        ? "「一旦豁然贯通焉。」注意：是「一旦」，也是「用力之久」。"
        : n === 0
        ? "从眼前这一件开始。竹子的理也在其中——只是七天不够。"
        : n < total / 2
        ? "还不够。他的路是加法：格得越多，越接近那个贯通点。"
        : "快到了。但没有人能预先知道，还差几件。";
      K.cn(ctx, msg, w * 0.5, h - 24, {
        size: 12.5, halo: 10,
        color: full ? "rgba(240,200,140,0.8)" : "rgba(150,170,210,0.6)"
      });
      K.cn(ctx, "「即物而穷其理」——理在物上，不在心里。", w * 0.5, gy0 - 26, {
        size: 11.5, color: "rgba(150,170,210,0.4)"
      });
    });
  };
})();
