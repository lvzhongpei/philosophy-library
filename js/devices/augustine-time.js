/* ============================================================
   device: 奥古斯丁 · 三重的现在
   时间是心灵的延展
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["augustine-time"] = function (o) {
    var st = { now: 0.5, drag: false };

    var sl = K.slider({
      label: "现在",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.5,
      fmt: function (v) { return Math.round(v * 100) + "%"; },
      onInput: function (v) { st.now = v; }
    });
    o.controls.appendChild(sl.el);

    function fromPointer(clientX) {
      var r = o.canvas.getBoundingClientRect();
      var pad = r.width * 0.1;
      var k = (clientX - r.left - pad) / (r.width - pad * 2);
      st.now = Math.max(0, Math.min(1, k));
      sl.set(st.now.toFixed(2));
    }
    o.canvas.addEventListener("pointerdown", function (e) {
      st.drag = true;
      o.canvas.setPointerCapture(e.pointerId);
      fromPointer(e.clientX);
    });
    o.canvas.addEventListener("pointermove", function (e) {
      if (st.drag) fromPointer(e.clientX);
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      o.canvas.addEventListener(ev, function () { st.drag = false; });
    });

    K.stage(o.canvas, function (ctx, w, h, t) {
      var x0 = w * 0.1;
      var x1 = w * 0.9;
      var y = h * 0.52;
      var nx = x0 + (x1 - x0) * st.now;

      // 主轴线
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.strokeStyle = "rgba(150,170,210,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 记忆（左）：密而渐暗
      for (var i = 0; i <= 120; i++) {
        var p = i / 120;
        var px = x0 + (nx - x0) * p;
        var fade = p;
        ctx.beginPath();
        ctx.arc(px, y, 1.5, 0, TAU);
        ctx.fillStyle = "rgba(224,164,88," + (0.18 + fade * 0.62) + ")";
        ctx.fill();
      }

      // 期待（右）：疏而渐暗
      for (var j = 0; j <= 60; j++) {
        var q = j / 60;
        var qx = nx + (x1 - nx) * q;
        ctx.beginPath();
        ctx.arc(qx, y, 1.1, 0, TAU);
        ctx.fillStyle = "rgba(79,209,197," + 0.5 * (1 - q) + ")";
        ctx.fill();
      }

      // 注意
      var pulse = K.reduced ? 1 : 0.75 + 0.25 * Math.sin(t * 2.6);
      ctx.beginPath();
      ctx.moveTo(nx, y - 44);
      ctx.lineTo(nx, y + 44);
      ctx.strokeStyle = "rgba(240,246,255," + 0.7 * pulse + ")";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(nx, y, 3.4, 0, TAU);
      ctx.fillStyle = "rgba(245,250,255,0.95)";
      ctx.fill();

      // 三段时间的括号
      ctx.beginPath();
      ctx.moveTo(x0, y - 58);
      ctx.lineTo(nx, y - 58);
      ctx.moveTo(nx, y - 58);
      ctx.lineTo(x1, y - 58);
      ctx.strokeStyle = "rgba(150,170,210,0.2)";
      ctx.stroke();

      K.cn(ctx, "记忆 · 过去", (x0 + nx) / 2, y - 74, {
        size: 12, color: "rgba(224,164,88,0.8)"
      });
      K.cn(ctx, "注意 · 现在", nx, y - 88, {
        size: 12, color: "rgba(240,246,255,0.85)"
      });
      K.cn(ctx, "期待 · 将来", (nx + x1) / 2, y - 74, {
        size: 12, color: "rgba(79,209,197,0.8)"
      });

      // 读数
      K.label(ctx, "TIME · 心灵的三重延展", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(
        ctx,
        "记忆 " + Math.round(st.now * 100) + "% · 期待 " + Math.round((1 - st.now) * 100) + "%",
        w - 20, 26,
        { size: 9, align: "right", spacing: 1.2, color: "rgba(150,170,210,0.45)" }
      );

      var msg = st.now < 0.25
        ? "现在几乎贴在过去上——这时候的人，活得很沉。"
        : st.now > 0.75
        ? "现在几乎贴在将来上——这时候的人，活得很飘。"
        : "过去不存在，将来尚未存在。那么「现在」有多长？";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
