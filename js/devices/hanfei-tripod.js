/* ============================================================
   device: 韩非 · 法术势
   三条腿撑一个平台，抽掉哪条，就从哪边塌
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var LEGS = [
    { n: "法", fail: "无法：赏罚没有依据，民不知所从。" },
    { n: "术", fail: "无术：君主的眼睛被臣下挡住。" },
    { n: "势", fail: "无势：令出而无人听。" }
  ];

  window.DEVICES["hanfei-tripod"] = function (o) {
    var st = { v: [0.8, 0.7, 0.85], t: 0 };

    LEGS.forEach(function (L, i) {
      o.controls.appendChild(
        K.slider({
          label: L.n,
          min: 0,
          max: 1,
          step: 0.01,
          value: st.v[i],
          fmt: function (v) { return Math.round(v * 100) + "%"; },
          onInput: function (v) { st.v[i] = v; }
        }).el
      );
    });

    K.stage(o.canvas, function (ctx, w, h, t) {
      var baseY = h * 0.82;
      var plateY = h * 0.36;
      var cx = w * 0.5;
      var span = Math.min(w * 0.28, 190);

      var minV = Math.min.apply(null, st.v);
      var weak = st.v.indexOf(minV);
      var collapsed = minV < 0.18;

      // 三条腿
      var xs = [cx - span, cx, cx + span];
      var tops = [];
      LEGS.forEach(function (L, i) {
        var topY = baseY - (baseY - plateY) * st.v[i];
        tops.push(topY);
        var weakNow = i === weak && minV < 0.45;
        ctx.beginPath();
        ctx.moveTo(xs[i], baseY);
        ctx.lineTo(xs[i], topY);
        ctx.strokeStyle = weakNow
          ? "rgba(226,120,110," + (0.5 + 0.4 * (1 - minV)) + ")"
          : "rgba(224,164,88,0.8)";
        ctx.lineWidth = weakNow ? 4 : 6;
        ctx.lineCap = "round";
        ctx.stroke();

        // 底座
        ctx.beginPath();
        ctx.ellipse(xs[i], baseY, 16, 5, 0, 0, TAU);
        ctx.fillStyle = "rgba(150,170,210,0.18)";
        ctx.fill();

        K.cn(ctx, L.n, xs[i], baseY + 26, {
          size: 15,
          color: weakNow ? "rgba(226,140,130,0.9)" : "rgba(233,238,246,0.75)"
        });
      });

      // 平台：架在最高的两条腿上，短的那条悬空
      plateY = Math.min(tops[0], tops[2]) + 7;
      var tilt = (tops[2] - tops[0]) / (span * 2) * 0.9;

      ctx.save();
      ctx.translate(cx, plateY);
      ctx.rotate(tilt);
      ctx.beginPath();
      ctx.rect(-span - 34, -7, (span + 34) * 2, 14);
      ctx.fillStyle = collapsed
        ? "rgba(120,60,55,0.85)"
        : "rgba(200,180,140,0.55)";
      ctx.fill();
      ctx.strokeStyle = collapsed
        ? "rgba(226,120,110,0.9)"
        : "rgba(240,214,170,0.85)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // 掉落的碎片
      if (collapsed && !K.reduced) {
        st.t = (st.t + 0.01) % 1;
        for (var k = 0; k < 6; k++) {
          var p = (st.t + k / 6) % 1;
          ctx.beginPath();
          ctx.arc(
            cx + (k - 2.5) * 22,
            plateY + p * p * (baseY - plateY),
            1.6,
            0, TAU
          );
          ctx.fillStyle = "rgba(226,140,120," + (1 - p) * 0.5 + ")";
          ctx.fill();
        }
      }

      // 读数
      K.label(ctx, "FA · SHU · SHI", 20, 26, {
        size: 9, spacing: 1.8, color: "rgba(150,170,210,0.42)"
      });
      K.label(
        ctx,
        collapsed ? "倾覆" : minV < 0.45 ? "偏斜" : "稳固",
        w - 20, 26,
        { size: 9, align: "right", spacing: 1.6,
          color: collapsed ? "rgba(226,120,110,0.85)"
            : minV < 0.45 ? "rgba(224,164,88,0.8)" : "rgba(79,209,197,0.7)" }
      );

      var msg = collapsed
        ? LEGS[weak].fail
        : minV < 0.45
        ? "已经在偏了。" + LEGS[weak].fail.replace("：", "——")
        : "三条腿都不能抽。「抱法处势则治，背法去势则乱。」";
      K.cn(ctx, msg, w * 0.5, h - 24, {
        size: 12.5, halo: 10,
        color: collapsed ? "rgba(226,150,130,0.8)" : "rgba(150,170,210,0.6)"
      });
    });
  };
})();
