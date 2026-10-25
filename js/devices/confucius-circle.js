/* ============================================================
   device: 孔子 · 推己
   仁不是一个情感，是一个由近及远的动作
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var RINGS = [
    { n: "亲", en: "KIN", at: 0.16 },
    { n: "友", en: "FRIENDS", at: 0.34 },
    { n: "乡", en: "COMMUNITY", at: 0.52 },
    { n: "国", en: "STATE", at: 0.72 },
    { n: "天下", en: "ALL UNDER HEAVEN", at: 0.94 }
  ];

  window.DEVICES["confucius-circle"] = function (o) {
    var st = { reach: 0.4 };

    o.controls.appendChild(
      K.slider({
        label: "推",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.4,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.reach = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.34;
      var cy = h * 0.5;
      var Rmax = Math.min(w * 0.24, h * 0.36);
      var lit = 0;

      function radOf(i) {
        return Rmax * RINGS[i].at + Rmax * 0.14;
      }

      RINGS.forEach(function (r, i) {
        var rad = radOf(i);
        var on = st.reach >= r.at - 0.02;
        if (on) lit++;
        var glow = on
          ? i === lit - 1 && !K.reduced
            ? 0.6 + 0.4 * Math.sin(t * 2.4)
            : 1
          : 0;

        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, TAU);
        ctx.setLineDash(on ? [] : [2, 7]);
        ctx.strokeStyle = on
          ? "rgba(224,164,88," + (0.35 + 0.45 * glow) + ")"
          : "rgba(150,170,210,0.16)";
        ctx.lineWidth = on ? 1.4 : 1;
        ctx.stroke();
        ctx.setLineDash([]);

        if (on) {
          var g = ctx.createRadialGradient(cx, cy, rad * 0.86, cx, cy, rad);
          g.addColorStop(0, "rgba(224,164,88,0)");
          g.addColorStop(1, "rgba(224,164,88," + (0.05 + 0.04 * glow) + ")");
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, TAU);
          ctx.fillStyle = g;
          ctx.fill();
        }
      });

      // 己
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252,0.95)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, TAU);
      ctx.strokeStyle = "rgba(236,242,252,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
      K.cn(ctx, "己", cx, cy + 26, { size: 11, color: "rgba(150,170,210,0.5)" });

      // 图例：右侧竖排 + 引线
      var legX = cx + Rmax + 28;
      RINGS.forEach(function (r, i) {
        var rad = radOf(i);
        var on = st.reach >= r.at - 0.02;
        var ly = cy - Math.min(70, Rmax * 0.46) + i * 30;

        ctx.beginPath();
        ctx.moveTo(cx + rad, cy);
        ctx.lineTo(legX - 10, ly);
        ctx.strokeStyle = on
          ? "rgba(224,164,88,0.32)"
          : "rgba(150,170,210,0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(legX - 6, ly, 2.2, 0, TAU);
        ctx.fillStyle = on ? "rgba(224,164,88,0.9)" : "rgba(150,170,210,0.25)";
        ctx.fill();

        K.cn(ctx, r.n, legX + 4, ly - 5, {
          size: 12.5, align: "left",
          color: on ? "rgba(233,238,246,0.88)" : "rgba(150,170,210,0.22)"
        });
        K.label(ctx, r.en, legX + 4, ly + 9, {
          size: 7, align: "left", spacing: 1.1,
          color: on ? "rgba(224,164,88,0.4)" : "rgba(150,170,210,0.14)"
        });
      });

      // 右侧说明
      var tx = w * 0.72;
      K.label(ctx, "REACH", tx, h * 0.28, {
        size: 8.5, spacing: 2, color: "rgba(150,170,210,0.35)"
      });
      K.cn(ctx, "已推及 " + lit + " / 5", tx, h * 0.28 + 26, {
        size: 15, align: "left", color: "rgba(224,164,88,0.85)"
      });

      var msg = lit <= 1
        ? "只到亲人。这已经不容易，但还只是起点。"
        : lit <= 3
        ? "从亲到乡——仁是一圈一圈推出去的。"
        : lit === 4
        ? "快到「国」了。再往外，力气就不够了。"
        : "推及天下。孔子说这极难，所以「仁」从不轻许。";
      wrapText(ctx, msg, tx, h * 0.28 + 58, w - tx - 22);

      K.cn(ctx, "能近取譬，可谓仁之方也已。", tx, h * 0.82, {
        size: 12, align: "left", halo: 8, color: "rgba(150,170,210,0.42)"
      });

      K.label(ctx, "REN · 推己及人", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });

      function wrapText(ctx2, text, x, y, maxW) {
        ctx2.save();
        ctx2.font = "12px 'Songti SC', 'STSong', serif";
        ctx2.textAlign = "left";
        ctx2.fillStyle = "rgba(150,170,210,0.7)";
        var cur = "";
        var line = 0;
        for (var i2 = 0; i2 < text.length; i2++) {
          var test = cur + text[i2];
          if (ctx2.measureText(test).width > maxW && cur) {
            ctx2.fillText(cur, x, y + line * 20);
            line++;
            cur = text[i2];
          } else {
            cur = test;
          }
        }
        if (cur) ctx2.fillText(cur, x, y + line * 20);
        ctx2.restore();
      }
    });
  };
})();
