/* ============================================================
   device: 康德 · 知性的眼镜
   摘不下来，但可以调它的度数
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["kant-glasses"] = function (o) {
    var st = { form: 0.85 };
    var noise = [];
    var rnd = K.rng(18040812);
    for (var i = 0; i < 520; i++) {
      noise.push({ x: rnd(), y: rnd(), r: 0.4 + rnd() * 1.5, a: 0.15 + rnd() * 0.45 });
    }

    o.controls.appendChild(
      K.slider({
        label: "先天形式",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.85,
        fmt: function (v) {
          return v > 0.8 ? "清晰" : v > 0.4 ? Math.round(v * 100) + "%" : "几乎不可知";
        },
        onInput: function (v) { st.form = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w / 2;
      var cy = h * 0.5;
      var R = Math.min(w * 0.36, h * 0.42);
      var f = st.form;

      // 底：物自体的噪点
      ctx.fillStyle = "rgba(4,6,11,0.0)";
      noise.forEach(function (n) {
        var px = n.x * w;
        var py = n.y * h;
        ctx.beginPath();
        ctx.arc(px, py, n.r, 0, TAU);
        ctx.fillStyle = "rgba(150,160,190," + n.a * 0.5 + ")";
        ctx.fill();
      });

      // 镜片
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.clip();

      // 镜内底色
      var base = ctx.createRadialGradient(cx, cy - R * 0.2, 0, cx, cy, R);
      base.addColorStop(0, "rgba(12,20,30," + (0.5 + 0.5 * f) + ")");
      base.addColorStop(1, "rgba(6,10,18," + (0.5 + 0.5 * f) + ")");
      ctx.fillStyle = base;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // 有序的世界
      ctx.globalAlpha = f;
      var horizon = cy + R * 0.22;

      // 空间网格
      for (var gx = -3; gx <= 3; gx++) {
        ctx.beginPath();
        ctx.moveTo(cx + gx * R * 0.32, cy - R * 0.7);
        ctx.lineTo(cx + gx * R * 0.32, horizon);
        ctx.strokeStyle = "rgba(120,220,215,0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      for (var gy = 1; gy <= 5; gy++) {
        ctx.beginPath();
        ctx.moveTo(cx - R * 0.96, horizon - gy * R * 0.12);
        ctx.lineTo(cx + R * 0.96, horizon - gy * R * 0.12);
        ctx.strokeStyle = "rgba(120,220,215,0.12)";
        ctx.stroke();
      }

      // 地平线
      ctx.beginPath();
      ctx.moveTo(cx - R, horizon);
      ctx.lineTo(cx + R, horizon);
      ctx.strokeStyle = "rgba(200,225,235,0.5)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 一棵树（几何化的对象）
      var tx = cx - R * 0.18;
      ctx.beginPath();
      ctx.moveTo(tx, horizon);
      ctx.lineTo(tx, horizon - R * 0.42);
      ctx.strokeStyle = "rgba(224,164,88,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      [[-1, 0.22], [1, 0.3], [-1, 0.36]].forEach(function (b) {
        ctx.beginPath();
        ctx.moveTo(tx, horizon - R * b[1]);
        ctx.lineTo(tx + b[0] * R * 0.2, horizon - R * (b[1] + 0.14));
        ctx.strokeStyle = "rgba(224,164,88,0.6)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.arc(tx + R * 0.02, horizon - R * 0.46, R * 0.09, 0, TAU);
      ctx.fillStyle = "rgba(224,164,88,0.22)";
      ctx.fill();

      // 因果箭头
      var ax = cx + R * 0.34;
      ctx.beginPath();
      ctx.moveTo(ax - R * 0.2, horizon - R * 0.1);
      ctx.lineTo(ax + R * 0.18, horizon - R * 0.28);
      ctx.strokeStyle = "rgba(79,209,197,0.7)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax + R * 0.18, horizon - R * 0.28);
      ctx.lineTo(ax + R * 0.08, horizon - R * 0.27);
      ctx.moveTo(ax + R * 0.18, horizon - R * 0.28);
      ctx.lineTo(ax + R * 0.15, horizon - R * 0.18);
      ctx.stroke();

      // 时间刻度
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.9, horizon + R * 0.16);
      ctx.lineTo(cx + R * 0.9, horizon + R * 0.16);
      ctx.strokeStyle = "rgba(150,170,210,0.35)";
      ctx.stroke();
      for (var k = 0; k < 9; k++) {
        var kx = cx - R * 0.9 + k * R * 0.225;
        ctx.beginPath();
        ctx.moveTo(kx, horizon + R * 0.13);
        ctx.lineTo(kx, horizon + R * 0.19);
        ctx.strokeStyle = "rgba(150,170,210,0.28)";
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.restore();

      // 镜框
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.strokeStyle = "rgba(200,220,240," + (0.25 + 0.35 * f) + ")";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, R + 7, 0, TAU);
      ctx.strokeStyle = "rgba(224,164,88," + (0.1 + 0.25 * f) + ")";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 文案
      K.label(ctx, "CATEGORIES · 先天形式 " + Math.round(f * 100) + "%", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.cn(ctx, f > 0.35 ? "现象" : "物自体", w - 34, 34, {
        size: 16,
        color: f > 0.35
          ? "rgba(120,220,215," + (0.4 + 0.5 * f) + ")"
          : "rgba(150,170,210,0.55)"
      });
      K.cn(
        ctx,
        f > 0.75 ? "时空与因果已经替你整理好了，你看到的世界井然有序。"
          : f > 0.35 ? "镜片变薄了。秩序在松，可你仍然在用它看。"
          : "摘下镜片，剩下的不是「真实的世界」，是「什么也说不出来」。",
        w * 0.5, h - 26,
        { size: 12.5, halo: 10, color: "rgba(150,170,210,0.58)" }
      );
    });
  };
})();
