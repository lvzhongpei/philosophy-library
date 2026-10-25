/* ============================================================
   device: 马克思 · 异化
   你造的东西，最后站到你对面
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["marx-alienation"] = function (o) {
    var st = { k: 0.2 };

    o.controls.appendChild(
      K.slider({
        label: "分工与私有制",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.2,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.k = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var k = st.k;
      var gy = h * 0.78;
      var wx = w * (0.26 - k * 0.08);
      var prodX = w * (0.46 + k * 0.3);
      var prodR = 14 + k * 34;

      // 地面
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.strokeStyle = "rgba(150,170,210,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 工人（越异化越弯腰）
      var bend = k * 10;
      ctx.beginPath();
      ctx.arc(wx, gy - 46 + bend * 0.4, 6, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252,0.92)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(wx - 8, gy);
      ctx.quadraticCurveTo(wx - 4 + bend, gy - 40, wx + 8, gy);
      ctx.closePath();
      ctx.fillStyle = "rgba(236,242,252,0.72)";
      ctx.fill();
      K.cn(ctx, "劳动者", wx, gy + 22, {
        size: 11, color: "rgba(150,170,210,0.6)"
      });

      // 产品
      var pg = ctx.createLinearGradient(prodX - prodR, gy - prodR * 2, prodX + prodR, gy);
      pg.addColorStop(0, "rgba(224,164,88," + (0.3 + k * 0.55) + ")");
      pg.addColorStop(1, "rgba(180,120,60," + (0.2 + k * 0.5) + ")");
      ctx.beginPath();
      ctx.rect(prodX - prodR, gy - prodR * 2, prodR * 2, prodR * 2);
      ctx.fillStyle = pg;
      ctx.fill();
      ctx.strokeStyle = "rgba(240,196,130," + (0.4 + k * 0.5) + ")";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      K.cn(ctx, "产品", prodX, gy + 22, {
        size: 11, color: "rgba(224,164,88," + (0.5 + k * 0.4) + ")"
      });

      // 连接线：从工人到产品的脐带，随距离变细变暗
      ctx.beginPath();
      ctx.moveTo(wx + 10, gy - 26);
      ctx.quadraticCurveTo((wx + prodX) / 2, gy - 90 - k * 30, prodX - prodR, gy - prodR);
      ctx.strokeStyle = "rgba(79,209,197," + (0.55 - k * 0.5) + ")";
      ctx.lineWidth = Math.max(0.6, 2.4 - k * 2);
      ctx.setLineDash(k > 0.5 ? [3, 6] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      // 反过来支配
      if (k > 0.55) {
        var a = (k - 0.55) / 0.45;
        ctx.beginPath();
        ctx.moveTo(prodX - prodR - 6, gy - prodR * 1.2);
        ctx.lineTo(wx + 16, gy - 74);
        ctx.strokeStyle = "rgba(226,120,110," + a * 0.75 + ")";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(wx + 16, gy - 74);
        ctx.lineTo(wx + 26, gy - 80);
        ctx.moveTo(wx + 16, gy - 74);
        ctx.lineTo(wx + 24, gy - 66);
        ctx.stroke();
        K.label(ctx, "反过来支配", (wx + prodX) / 2, gy - 96 - k * 20, {
          size: 8.5, align: "center", spacing: 1.4,
          color: "rgba(226,140,120," + a * 0.85 + ")"
        });
      }

      K.label(ctx, "ENTFREMDUNG · 异化 " + Math.round(k * 100) + "%", 20, 26, {
        size: 9, spacing: 1.4,
        color: k > 0.55 ? "rgba(226,140,120,0.8)" : "rgba(150,170,210,0.45)"
      });

      var msg = k < 0.25
        ? "产品还在手里。你知道它是你做的。"
        : k < 0.55
        ? "它离开了，变大了。你开始为它工作，而不是它为你。"
        : k < 0.85
        ? "现在它站在对面。它的价格决定你的生活。"
        : "「工人生产的财富越多，他自己越贫乏。」——这不是比喻。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10,
        color: k > 0.55 ? "rgba(226,150,130,0.78)" : "rgba(150,170,210,0.6)"
      });
    });
  };
})();
