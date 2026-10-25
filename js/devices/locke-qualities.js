/* ============================================================
   device: 洛克 · 两种性质
   形状在物里，颜色在眼睛里
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var OBS = [
    { n: "人", body: "rgba(224,164,88,0.85)", aura: "rgba(224,164,88,0.2)", smell: "甜" },
    { n: "蜜蜂", body: "rgba(150,120,220,0.85)", aura: "rgba(150,120,220,0.2)", smell: "无" },
    { n: "色盲者", body: "rgba(160,168,180,0.85)", aura: "rgba(160,168,180,0.2)", smell: "甜" },
    { n: "没有人", body: "rgba(90,98,112,0.6)", aura: "rgba(90,98,112,0.12)", smell: "—" }
  ];

  window.DEVICES["locke-qualities"] = function (o) {
    var st = { i: 0, k: 0 };

    o.controls.appendChild(
      K.slider({
        label: "观察者",
        min: 0,
        max: 3,
        step: 1,
        value: 0,
        fmt: function (v) { return OBS[v].n; },
        onInput: function (v) { st.i = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.k = K.lerp(st.k, st.i, 0.1);
      var a = OBS[Math.floor(st.k)];
      var b = OBS[Math.min(3, Math.floor(st.k) + 1)];
      var f = st.k - Math.floor(st.k);

      var cx = w * 0.36;
      var cy = h * 0.5;
      var R = Math.min(w * 0.16, h * 0.26);

      // 物体（形状永远不变）
      var bg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R);
      bg.addColorStop(0, a.body);
      bg.addColorStop(1, b.body);
      ctx.beginPath();
      ctx.moveTo(cx - R, cy - R * 0.1);
      ctx.bezierCurveTo(cx - R * 1.1, cy + R * 0.9, cx + R * 1.1, cy + R * 0.9, cx + R, cy - R * 0.1);
      ctx.closePath();
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = "rgba(233,238,246,0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 光晕（第二性质）
      var aura = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 2.1);
      aura.addColorStop(0, a.aura);
      aura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 2.1, 0, TAU);
      ctx.fill();

      // 尺寸标注（第一性质：恒定）
      ctx.beginPath();
      ctx.moveTo(cx - R, cy + R * 1.25);
      ctx.lineTo(cx + R, cy + R * 1.25);
      ctx.strokeStyle = "rgba(79,209,197,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
      K.label(ctx, "直径不变", cx, cy + R * 1.25 + 14, {
        size: 8.5, align: "center", spacing: 1.2, color: "rgba(79,209,197,0.6)"
      });

      // 右侧对照表
      var tx = w * 0.64;
      K.label(ctx, "PRIMARY", tx, h * 0.3, {
        size: 8.5, spacing: 2, color: "rgba(79,209,197,0.5)"
      });
      K.cn(ctx, "形状 · 大小 · 运动", tx, h * 0.3 + 24, {
        size: 12, align: "left", color: "rgba(233,238,246,0.75)"
      });
      K.label(ctx, "在物之中，与谁看无关", tx, h * 0.3 + 44, {
        size: 8.5, spacing: 1, color: "rgba(150,170,210,0.42)"
      });

      K.label(ctx, "SECONDARY", tx, h * 0.52, {
        size: 8.5, spacing: 2, color: "rgba(224,164,88,0.5)"
      });
      K.cn(ctx, "颜色 · 气味 · 味道", tx, h * 0.52 + 24, {
        size: 12, align: "left", color: "rgba(233,238,246,0.75)"
      });
      K.cn(ctx, "现在是：" + a.n + " 在看", tx, h * 0.52 + 48, {
        size: 11, align: "left", color: "rgba(224,164,88,0.75)"
      });
      K.cn(ctx, "气味：" + a.smell, tx, h * 0.52 + 70, {
        size: 11, align: "left", color: "rgba(150,170,210,0.55)"
      });

      K.label(ctx, "QUALITIES", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.cn(ctx, st.i === 3
        ? "没有人看的时候，它还是一块有形状的东西——但没有任何颜色。"
        : "换个观察者：形状没变，颜色变了。哪一个是「它的」？",
        w * 0.5, h - 24,
        { size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)" });
    });
  };
})();
