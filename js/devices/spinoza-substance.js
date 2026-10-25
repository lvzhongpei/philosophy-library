/* ============================================================
   device: 斯宾诺莎 · 一与多
   一个实体，无限属性，无尽样式
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["spinoza-substance"] = function (o) {
    var st = { rot: 0, drag: false, lastX: 0, n: 18 };

    o.controls.appendChild(
      K.slider({
        label: "样式数量",
        min: 4,
        max: 40,
        step: 1,
        value: 18,
        fmt: function (v) { return v; },
        onInput: function (v) { st.n = v; }
      }).el
    );

    o.canvas.addEventListener("pointerdown", function (e) {
      st.drag = true;
      st.lastX = e.clientX;
      o.canvas.setPointerCapture(e.pointerId);
    });
    o.canvas.addEventListener("pointermove", function (e) {
      if (!st.drag) return;
      st.rot += (e.clientX - st.lastX) * 0.008;
      st.lastX = e.clientX;
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      o.canvas.addEventListener(ev, function () { st.drag = false; });
    });

    K.stage(o.canvas, function (ctx, w, h, t) {
      if (!st.drag && !K.reduced) st.rot += 0.0025;

      var cx = w * 0.42;
      var cy = h * 0.52;
      var R = Math.min(w * 0.22, h * 0.36);

      // 球体
      var g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R);
      g.addColorStop(0, "rgba(79,209,197,0.10)");
      g.addColorStop(0.7, "rgba(79,209,197,0.04)");
      g.addColorStop(1, "rgba(79,209,197,0.01)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();

      // 纬线
      [-60, -30, 0, 30, 60].forEach(function (lat) {
        var la = (lat * Math.PI) / 180;
        var rx = R * Math.cos(la);
        var ry = R * Math.cos(la) * 0.26;
        var yy = cy - R * Math.sin(la);
        ctx.beginPath();
        ctx.ellipse(cx, yy, rx, ry, 0, 0, TAU);
        ctx.strokeStyle = "rgba(150,170,210,0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 经线
      for (var m = 0; m < 6; m++) {
        var lon = (m / 6) * Math.PI + st.rot;
        var rx2 = Math.abs(R * Math.sin(lon));
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(0.6, rx2), R, 0, 0, TAU);
        ctx.strokeStyle = "rgba(150,170,210,0.13)";
        ctx.stroke();
      }

      // 外圈
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.strokeStyle = "rgba(79,209,197,0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 样式（点）
      for (var i = 0; i < st.n; i++) {
        var lat2 = Math.asin(((i * 37) % 100) / 55 - 0.9);
        var lon2 = (i * 2.399) + st.rot;
        var px = cx + R * Math.cos(lat2) * Math.sin(lon2);
        var py = cy - R * Math.sin(lat2);
        var depth = Math.cos(lat2) * Math.cos(lon2);
        var a = depth > 0 ? 0.85 : 0.2;
        var size = depth > 0 ? 2.6 : 1.8;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, TAU);
        ctx.fillStyle = depth > 0
          ? "rgba(224,164,88," + a * 0.95 + ")"
          : "rgba(224,164,88," + a * 0.5 + ")";
        ctx.fill();
      }

      // 旁注
      var tx = w * 0.72;
      K.label(ctx, "SUBSTANTIA", tx, h * 0.3, {
        size: 8.5, spacing: 2.2, color: "rgba(150,170,210,0.35)"
      });
      K.cn(ctx, "一个", tx, h * 0.3 + 28, {
        size: 20, align: "left", color: "rgba(79,209,197,0.9)"
      });
      K.cn(ctx, "实体", tx, h * 0.3 + 56, {
        size: 12, align: "left", color: "rgba(150,170,210,0.6)"
      });

      wrap(ctx, "思想与广延，是它的两种属性；你看见的每一个心灵、每一块石头，都是它的有限样式——所以那些点，没有一个能离开这个面。",
        tx, h * 0.3 + 84, w - tx - 24);

      K.label(ctx, "样式 " + st.n + " · 拖动旋转", 20, 26, {
        size: 9, spacing: 1.4, color: "rgba(150,170,210,0.42)"
      });
      K.cn(ctx, "「一切存在的东西，都存在于神之内。」", w * 0.5, h - 24, {
        size: 12, halo: 10, color: "rgba(150,170,210,0.5)"
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
            ctx2.fillText(cur, x, y + line * 20);
            line++; cur = text[q];
          } else cur = test;
        }
        if (cur) ctx2.fillText(cur, x, y + line * 20);
        ctx2.restore();
      }
    });
  };
})();
