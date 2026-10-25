/* ============================================================
   device: 普罗提诺 · 流溢
   太一像太阳，只是发光；越远越弱
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var LEVELS = ["太一", "理智", "灵魂", "物质"];

  window.DEVICES["plotinus-emanation"] = function (o) {
    var st = { p: 0.34 };

    o.controls.appendChild(
      K.slider({
        label: "离太一的距离",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.34,
        fmt: function (v) { return LEVELS[Math.min(3, Math.floor(v * 4))]; },
        onInput: function (v) { st.p = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.44;
      var cy = h * 0.5;
      var R = Math.min(w * 0.2, h * 0.34);

      // 同心层
      LEVELS.forEach(function (name, i) {
        var rad = R * (0.28 + i * 0.24);
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, TAU);
        ctx.strokeStyle = "rgba(224,164,88," + (0.35 - i * 0.075) + ")";
        ctx.lineWidth = 1;
        ctx.setLineDash(i === 0 ? [] : [2, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
        K.cn(ctx, name, cx, cy - rad - 8, {
          size: 11, color: "rgba(224,164,88," + (0.7 - i * 0.13) + ")"
        });
      });

      // 光核
      var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.6);
      core.addColorStop(0, "rgba(255,240,200,0.9)");
      core.addColorStop(0.35, "rgba(240,190,120,0.28)");
      core.addColorStop(1, "rgba(240,190,120,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.6, 0, TAU);
      ctx.fill();

      // 溢出的光点
      for (var i = 0; i < 40; i++) {
        var a = (i * 2.399) % TAU;
        var rp = R * (0.1 + ((i * 17) % 100) / 100 * 0.95);
        var bright = Math.max(0, 1 - rp / R);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * rp, cy + Math.sin(a) * rp, 1.4, 0, TAU);
        ctx.fillStyle = "rgba(255,225,170," + bright * 0.6 + ")";
        ctx.fill();
      }

      // 被拖动的那一点
      var pr = R * (0.1 + st.p * 0.95);
      var px = cx + pr;
      var lit = Math.max(0.08, 1 - st.p);
      ctx.beginPath();
      ctx.arc(px, cy, 5, 0, TAU);
      ctx.fillStyle = "rgba(255,240,210," + lit + ")";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, cy, 12, 0, TAU);
      ctx.strokeStyle = "rgba(255,240,210," + lit * 0.5 + ")";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 侧栏
      var tx = w * 0.72;
      var li = Math.min(3, Math.floor(st.p * 4));
      K.label(ctx, "PROODOS", tx, h * 0.28, {
        size: 8.5, spacing: 2.2, color: "rgba(150,170,210,0.35)"
      });
      K.cn(ctx, LEVELS[li], tx, h * 0.28 + 30, {
        size: 20, align: "left", color: "rgba(240,200,140,0.9)"
      });
      K.cn(ctx, "光强 " + Math.round(lit * 100) + "%", tx, h * 0.28 + 56, {
        size: 11, align: "left", color: "rgba(150,170,210,0.55)"
      });
      wrap(ctx,
        li === 0 ? "这里不能说。任何描述都会把它说小。"
          : li === 1 ? "理智：理念住在这里，是多最初的形态。"
          : li === 2 ? "灵魂：既向上望，也向下经营这个世界。"
          : "物质：光几乎到不了的地方。恶不是力量，是缺席。",
        tx, h * 0.28 + 84, w - tx - 26);

      K.label(ctx, "太一 → 理智 → 灵魂 → 物质", 20, 26, {
        size: 9, spacing: 1.4, color: "rgba(150,170,210,0.42)"
      });

      function wrap(ctx2, text, x, y, maxW) {
        ctx2.save();
        ctx2.font = "12px 'Songti SC', 'STSong', serif";
        ctx2.textAlign = "left";
        ctx2.fillStyle = "rgba(150,170,210,0.62)";
        var cur = "", line = 0;
        for (var q = 0; q < text.length; q++) {
          var test = cur + text[q];
          if (ctx2.measureText(test).width > maxW && cur) {
            ctx2.fillText(cur, x, y + line * 20); line++; cur = text[q];
          } else cur = test;
        }
        if (cur) ctx2.fillText(cur, x, y + line * 20);
        ctx2.restore();
      }
    });
  };
})();
