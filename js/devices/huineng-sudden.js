/* ============================================================
   device: 慧能 · 顿悟
   一灯能除千年暗——但那件事不发生在时间里
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["huineng-sudden"] = function (o) {
    var st = { light: 0.04, flash: 0, mode: "" };

    o.controls.appendChild(
      K.button("渐修", function () {
        st.mode = "渐";
      })
    );
    o.controls.appendChild(
      K.button("顿悟", function () {
        st.light = 1;
        st.flash = 1;
        st.mode = "顿";
      })
    );
    o.controls.appendChild(
      K.button("重来", function () {
        st.light = 0.04;
        st.flash = 0;
        st.mode = "";
      }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      if (st.mode === "渐") st.light = Math.min(1, st.light + 0.0055);
      st.flash = Math.max(0, st.flash - 0.02);
      var L = st.light;

      var cx = w * 0.5;
      var cy = h * 0.46;

      // 暗室：一片格子
      var cols = 26;
      var rows = 12;
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var gx = w * 0.08 + (i + 0.5) * (w * 0.84 / cols);
          var gy = h * 0.1 + (j + 0.5) * (h * 0.78 / rows);
          var dx = gx - cx;
          var dy = gy - cy;
          var d = Math.sqrt(dx * dx + dy * dy);
          var fall = Math.max(0, 1 - d / (Math.min(w, h) * 0.7));
          var a = 0.02 + L * 0.16 * fall;
          ctx.fillStyle = "rgba(224,200,150," + a + ")";
          ctx.fillRect(gx - 2, gy - 2, 4, 4);
        }
      }

      // 灯光
      var rad = 20 + L * Math.min(w, h) * 0.72;
      var gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      gl.addColorStop(0, "rgba(255,232,180," + (0.25 + L * 0.6) + ")");
      gl.addColorStop(0.25, "rgba(240,190,120," + L * 0.28 + ")");
      gl.addColorStop(1, "rgba(240,190,120,0)");
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, TAU);
      ctx.fill();

      // 灯芯
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, TAU);
      ctx.fillStyle = "rgba(255,246,220," + (0.35 + L * 0.65) + ")";
      ctx.fill();

      // 闪光
      if (st.flash > 0.05) {
        ctx.fillStyle = "rgba(255,248,230," + st.flash * 0.22 + ")";
        ctx.fillRect(0, 0, w, h);
      }

      // 读数
      K.label(ctx, "SUDDEN · 明度 " + Math.round(L * 100) + "%", 20, 26, {
        size: 9, spacing: 1.5,
        color: L > 0.9 ? "rgba(240,200,140,0.85)" : "rgba(150,170,210,0.42)"
      });
      if (st.mode) {
        K.label(ctx, st.mode === "渐" ? "渐：一点一点亮" : "顿：一瞬间", w - 20, 26, {
          size: 9, align: "right", spacing: 1.4, color: "rgba(224,164,88,0.6)"
        });
      }

      var msg = L < 0.15
        ? "「千年暗室。」先试试两种点法。"
        : L < 0.85
        ? "渐：慢，但看得见过程。"
        : "「一灯能除千年暗。」注意：暗不是被赶走的，是本来就没有实体。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10,
        color: L > 0.85 ? "rgba(240,200,140,0.75)" : "rgba(150,170,210,0.55)"
      });
    });
  };
})();
