/* ============================================================
   device: 普罗提诺 · 回归
   越往上，能说的越少
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var WORDS = [
    "我看见了万物",
    "它们都来自同一个源头",
    "但那源头本身",
    "不在任何范畴里",
    "不能说它是什么",
    "不能说它存在",
    ""
  ];

  window.DEVICES["plotinus-return"] = function (o) {
    var st = { h: 0.15 };

    o.controls.appendChild(
      K.slider({
        label: "上升",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.15,
        fmt: function (v) {
          return v > 0.85 ? "合一" : v > 0.5 ? "沉默" : "言说";
        },
        onInput: function (v) { st.h = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.4;
      var bottom = h * 0.84;
      var top = h * 0.16;
      var y = bottom - (bottom - top) * st.h;

      // 竖直的轴
      ctx.beginPath();
      ctx.moveTo(cx, bottom);
      ctx.lineTo(cx, top - 20);
      ctx.strokeStyle = "rgba(150,170,210,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 刻度
      for (var i = 0; i <= 4; i++) {
        var ky = bottom - (bottom - top) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(cx - 8, ky);
        ctx.lineTo(cx + 8, ky);
        ctx.strokeStyle = "rgba(150,170,210,0.2)";
        ctx.stroke();
      }

      // 顶部的光
      var gl = ctx.createRadialGradient(cx, top - 20, 0, cx, top - 20, 40 + st.h * 80);
      gl.addColorStop(0, "rgba(255,242,210," + (0.25 + st.h * 0.6) + ")");
      gl.addColorStop(1, "rgba(255,242,210,0)");
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(cx, top - 20, 40 + st.h * 80, 0, TAU);
      ctx.fill();

      // 上升的灵魂
      var pulse = K.reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 2);
      ctx.beginPath();
      ctx.arc(cx, y, 5, 0, TAU);
      ctx.fillStyle = "rgba(255,246,222," + (0.6 + 0.4 * st.h) * pulse + ")";
      ctx.fill();
      for (var k = 1; k <= 4; k++) {
        ctx.beginPath();
        ctx.arc(cx, y + k * 12, 4 - k * 0.6, 0, TAU);
        ctx.fillStyle = "rgba(255,246,222," + (0.25 - k * 0.05) + ")";
        ctx.fill();
      }

      // 右侧：逐级消失的话
      var tx = w * 0.58;
      var idx = Math.min(WORDS.length - 1, Math.floor(st.h * (WORDS.length - 1) + 0.001));
      for (var q = 0; q <= idx && q < WORDS.length; q++) {
        var a = q === idx ? 0.85 - (st.h > 0.9 ? 0.5 : 0) : 0.22;
        if (!WORDS[q]) continue;
        K.cn(ctx, WORDS[q], tx, h * 0.3 + q * 24, {
          size: 13, align: "left",
          color: "rgba(233,238,246," + a + ")"
        });
      }

      // 读数
      K.label(ctx, "EPISTROPHE · 回归 " + Math.round(st.h * 100) + "%", 20, 26, {
        size: 9, spacing: 1.4,
        color: st.h > 0.85 ? "rgba(255,230,180,0.8)" : "rgba(150,170,210,0.45)"
      });

      var msg = st.h > 0.92
        ? "「独自飞向那独自者。」到这里，话就没了。"
        : st.h > 0.6
        ? "越往上，能说的越少。这不是修辞，是方法。"
        : "向下经营世界，向上收回自己——同一条路，两个方向。";
      K.cn(ctx, msg, w * 0.5, h - 24, {
        size: 12.5, halo: 10,
        color: st.h > 0.85 ? "rgba(255,230,180,0.75)" : "rgba(150,170,210,0.6)"
      });
    });
  };
})();
