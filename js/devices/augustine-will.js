/* ============================================================
   device: 奥古斯丁 · 两个意志
   我既愿意，又不愿意
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["augustine-will"] = function (o) {
    var st = { bal: 0.5 };

    o.controls.appendChild(
      K.slider({
        label: "旧人 ←→ 新人",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.5,
        fmt: function (v) {
          return v < 0.4 ? "偏向肉体" : v > 0.6 ? "偏向灵" : "相持";
        },
        onInput: function (v) { st.bal = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.5;
      var cy = h * 0.5;
      var bal = st.bal;
      var conflict = 1 - Math.abs(bal - 0.5) * 2;

      // 两股力
      var lenL = (0.18 + (1 - bal) * 0.3) * w;
      var lenR = (0.18 + bal * 0.3) * w;

      [-1, 1].forEach(function (d) {
        var len = d < 0 ? lenL : lenR;
        var col = d < 0 ? "rgba(226,110,100," : "rgba(79,209,197,";
        var wob = K.reduced ? 0 : Math.sin(t * 3 + (d > 0 ? 1 : 0)) * 3 * conflict;

        ctx.beginPath();
        ctx.moveTo(cx + d * 14, cy + wob);
        ctx.lineTo(cx + d * len, cy + wob);
        ctx.strokeStyle = col + (0.35 + (d < 0 ? 1 - bal : bal) * 0.55) + ")";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 箭头
        ctx.beginPath();
        ctx.moveTo(cx + d * len, cy + wob);
        ctx.lineTo(cx + d * (len - 10), cy - 5 + wob);
        ctx.moveTo(cx + d * len, cy + wob);
        ctx.lineTo(cx + d * (len - 10), cy + 5 + wob);
        ctx.stroke();
      });

      // 我
      var shake = K.reduced ? 0 : Math.sin(t * 11) * 2.2 * conflict;
      ctx.beginPath();
      ctx.arc(cx + shake, cy, 7, 0, TAU);
      ctx.fillStyle = "rgba(245,250,255,0.95)";
      ctx.fill();
      K.cn(ctx, "我", cx + shake, cy + 28, {
        size: 11, color: "rgba(150,170,210,0.6)"
      });

      // 标注
      K.cn(ctx, "肉体的律", cx - lenL - 4, cy - 22, {
        size: 12.5, align: "right", color: "rgba(226,130,120,0.85)"
      });
      K.cn(ctx, "心中的律", cx + lenR + 4, cy - 22, {
        size: 12.5, align: "left", color: "rgba(79,209,197,0.85)"
      });

      K.label(ctx, "DUAE VOLUNTATES", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "相持度 " + Math.round(conflict * 100) + "%", w - 20, 26, {
        size: 9, align: "right", spacing: 1.4,
        color: conflict > 0.7 ? "rgba(224,164,88,0.7)" : "rgba(150,170,210,0.45)"
      });

      var msg = conflict > 0.7
        ? "「我既愿意，又不愿意。」这不是比喻，是他那一刻的实录。"
        : bal < 0.4
        ? "旧人赢了。注意：他不是不知道什么是对的。"
        : "新人赢了。但奥古斯丁说，靠自己赢不了，这是恩典。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
