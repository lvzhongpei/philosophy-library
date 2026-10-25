/* ============================================================
   device: 荀子 · 节欲
   欲不灭，物有尽，中间那道缝就是「争」
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["xunzi-desire"] = function (o) {
    var st = { cut: 0.2 };

    o.controls.appendChild(
      K.slider({
        label: "节 / 分",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.2,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.cut = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var x0 = w * 0.14;
      var x1 = w * 0.9;
      var baseY = h * 0.78;
      var topY = h * 0.2;
      var cut = st.cut;

      // 坐标轴
      ctx.beginPath();
      ctx.moveTo(x0, topY);
      ctx.lineTo(x0, baseY);
      ctx.lineTo(x1, baseY);
      ctx.strokeStyle = "rgba(150,170,210,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 欲（无穷）——被「节」压低的曲线
      var peak = 0.35 + (1 - cut) * 0.6;
      ctx.beginPath();
      ctx.moveTo(x0, baseY);
      for (var i = 0; i <= 100; i++) {
        var p = i / 100;
        var yv = Math.pow(p, 0.7) * (baseY - topY) * peak;
        ctx.lineTo(x0 + (x1 - x0) * p, baseY - yv);
      }
      ctx.strokeStyle = "rgba(224,164,88,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 物（有限）
      var supplyY = baseY - (baseY - topY) * 0.46;
      ctx.beginPath();
      ctx.moveTo(x0, supplyY);
      ctx.lineTo(x1, supplyY);
      ctx.strokeStyle = "rgba(79,209,197,0.75)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 争的区域
      var cross = null;
      for (var j = 0; j <= 100; j++) {
        var pp = j / 100;
        var yv2 = Math.pow(pp, 0.7) * (baseY - topY) * peak;
        if (baseY - yv2 <= supplyY) { cross = pp; break; }
      }
      if (cross !== null) {
        var cx0 = x0 + (x1 - x0) * cross;
        ctx.beginPath();
        ctx.moveTo(cx0, supplyY);
        for (var q = cross; q <= 1; q += 0.01) {
          var yq = Math.pow(q, 0.7) * (baseY - topY) * peak;
          ctx.lineTo(x0 + (x1 - x0) * q, baseY - yq);
        }
        ctx.lineTo(x1, supplyY);
        ctx.closePath();
        ctx.fillStyle = "rgba(226,110,100,0.14)";
        ctx.fill();
        K.label(ctx, "争", (cx0 + x1) / 2, supplyY + 30, {
          size: 11, align: "center", spacing: 2,
          color: "rgba(226,140,130,0.75)"
        });
      }

      // 标注
      K.cn(ctx, "欲", x1 - 6, baseY - (baseY - topY) * peak - 12, {
        size: 12, align: "right", color: "rgba(224,164,88,0.9)"
      });
      K.cn(ctx, "物", x1 - 6, supplyY - 10, {
        size: 12, align: "right", color: "rgba(79,209,197,0.85)"
      });

      K.label(ctx, "DESIRE · 欲与物", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "已节 " + Math.round(cut * 100) + "%", w - 20, 26, {
        size: 9, align: "right", spacing: 1.4, color: "rgba(79,209,197,0.6)"
      });

      var msg = cross === null
        ? "欲被节到物以下——「争」消失了。但荀子说，欲本身没少。"
        : cut < 0.15
        ? "欲远大于物。顺着走，结果必然是争。"
        : "还有缺口。礼义的作用就是在这里划一条「分」。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
