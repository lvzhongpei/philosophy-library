/* ============================================================
   device: 荀子 · 化性起伪
   枸木必将待檗括烝矫然后直——松手就弹回去
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;

  window.DEVICES["xunzi-bend"] = function (o) {
    var st = { force: 0.15, cur: 0.15 };

    o.controls.appendChild(
      K.slider({
        label: "师法 / 礼义",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.15,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.force = v; }
      }).el
    );
    o.controls.appendChild(
      K.button("完全松开", function () { st.force = 0; }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.cur = K.lerp(st.cur, st.force, 0.05);
      var bend = 1 - st.cur;
      var x0 = w * 0.14;
      var x1 = w * 0.86;
      var y = h * 0.52;
      var amp = h * 0.22 * bend;

      // 直的标准线（檗括）
      if (st.cur > 0.55) {
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.setLineDash([3, 8]);
        ctx.strokeStyle = "rgba(224,164,88," + (st.cur - 0.55) * 0.9 + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        K.label(ctx, "檗括", x1 + 4, y - 6, {
          size: 8.5, color: "rgba(224,164,88,0.6)"
        });
      }

      // 木材
      var mid = (x0 + x1) / 2;
      ctx.beginPath();
      ctx.moveTo(x0, y + amp);
      ctx.bezierCurveTo(
        mid - (x1 - x0) * 0.15, y + amp,
        mid + (x1 - x0) * 0.15, y - amp,
        x1, y - amp
      );
      ctx.strokeStyle = "rgba(180,132,84,0.95)";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.stroke();

      // 木纹
      ctx.strokeStyle = "rgba(90,62,38,0.6)";
      ctx.lineWidth = 1;
      for (var k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(x0 + 6, y + amp + k * 2);
        ctx.bezierCurveTo(
          mid - (x1 - x0) * 0.15, y + amp + k * 2,
          mid + (x1 - x0) * 0.15, y - amp + k * 2,
          x1 - 6, y - amp + k * 2
        );
        ctx.stroke();
      }

      // 外力箭头
      if (st.cur > 0.05) {
        [-1, 1].forEach(function (d) {
          var ax = mid;
          var ay = y + d * amp * 0.65;
          ctx.beginPath();
          ctx.moveTo(ax - 40, ay + d * 26 * st.cur);
          ctx.lineTo(ax, ay);
          ctx.strokeStyle = "rgba(79,209,197," + 0.3 + st.cur * 0.5 + ")";
          ctx.lineWidth = 1.4;
          ctx.stroke();
        });
      }

      // 读数
      K.label(ctx, "BEND · 弯曲度 " + Math.round(bend * 100) + "%", 20, 26, {
        size: 9, spacing: 1.4,
        color: bend > 0.5 ? "rgba(224,120,110,0.75)" : "rgba(150,170,210,0.45)"
      });

      var msg = st.cur < 0.2
        ? "「枸木必将待檗括烝矫然后直。」它自己不会直。"
        : st.cur < 0.8
        ? "正在被矫正。注意：矫正它的力量，来自外面。"
        : "「其善者伪也」——这个「伪」，是人为。";
      K.cn(ctx, msg, w * 0.5, h - 30, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
      K.cn(ctx, "松开试试", w * 0.5, h - 8, {
        size: 10.5, color: "rgba(150,170,210,0.28)"
      });
    });
  };
})();
