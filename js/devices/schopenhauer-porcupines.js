/* ============================================================
   device: 叔本华 · 豪猪的两难
   太近互刺，太远冻僵；礼就是那个刚好的距离
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["schopenhauer-porcupines"] = function (o) {
    var st = { gap: 0.54, drag: false };
    var flakes = [];
    for (var i = 0; i < 26; i++) {
      flakes.push({
        x: Math.random(),
        y: Math.random(),
        s: 0.6 + Math.random() * 1.6,
        sp: 0.2 + Math.random() * 0.5
      });
    }

    o.controls.appendChild(
      K.slider({
        label: "距离",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.54,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.gap = v; }
      }).el
    );

    o.controls.appendChild(
      K.button("退回原位", function () { st.gap = 0.54; }, "ghost")
    );

    function fromPointer(clientX) {
      var r = o.canvas.getBoundingClientRect();
      var x = (clientX - r.left) / r.width;
      var e2 = Math.max(0.04, Math.min(0.58, x - 0.3));
      st.gap = (e2 - 0.04) / 0.54;
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

    function hog(ctx, x, gy, s, dir, tint, shake) {
      ctx.save();
      ctx.translate(x + shake, gy);

      // 影子
      ctx.beginPath();
      ctx.ellipse(0, 2, s * 1.15, s * 0.16, 0, 0, TAU);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fill();

      // 身体
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.quadraticCurveTo(-s * 1.02, -s * 1.05, 0, -s * 1.12);
      ctx.quadraticCurveTo(s * 1.02, -s * 1.05, s, 0);
      ctx.closePath();
      ctx.fillStyle = tint.body;
      ctx.fill();

      // 尖刺
      for (var a = Math.PI * 1.06; a < Math.PI * 1.94; a += 0.13) {
        var r1 = s * 0.98;
        var r2 = s * (1.22 + ((a * 100) % 7) / 22);
        var ox = Math.cos(a) * r1;
        var oy = Math.sin(a) * r1 - s * 0.1;
        var ex = Math.cos(a) * r2 * 1.02;
        var ey = Math.sin(a) * r2 - s * 0.1;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = tint.spike;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 鼻尖
      ctx.beginPath();
      ctx.moveTo(dir * s * 0.95, -s * 0.28);
      ctx.lineTo(dir * s * 1.22, -s * 0.16);
      ctx.lineTo(dir * s * 0.95, -s * 0.06);
      ctx.closePath();
      ctx.fillStyle = tint.nose;
      ctx.fill();

      // 眼
      ctx.beginPath();
      ctx.arc(dir * s * 0.55, -s * 0.6, Math.max(1.2, s * 0.06), 0, TAU);
      ctx.fillStyle = "rgba(250,250,255,0.9)";
      ctx.fill();

      ctx.restore();
    }

    K.stage(o.canvas, function (ctx, w, h, t) {
      var gy = h * 0.76;
      var s = Math.min(w * 0.075, h * 0.19);
      var leftX = w * 0.3;
      var eff = 0.04 + st.gap * 0.54; // 归一化到 4%–58% 画布宽
      var rightX = leftX + eff * w;

      var tooClose = eff < 0.17;
      var tooFar = eff > 0.5;
      var warmZone = !tooClose && !tooFar;
      var warm = warmZone ? 1 - Math.min(1, Math.abs(eff - 0.33) / 0.17) : 0;

      // 夜色
      var sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "rgba(20,30,50,0.5)");
      sky.addColorStop(0.7, "rgba(10,15,26,0.2)");
      sky.addColorStop(1, "rgba(4,7,12,0)");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // 雪
      if (!K.reduced) {
        flakes.forEach(function (f) {
          f.y += 0.0009 * f.sp * 3;
          if (f.y > 1) { f.y = -0.02; f.x = Math.random(); }
          var px = (f.x + Math.sin(t * 0.4 + f.s) * 0.01) * w;
          var py = f.y * (gy - 10);
          ctx.beginPath();
          ctx.arc(px, py, f.s * 0.7, 0, TAU);
          ctx.fillStyle = "rgba(200,220,235,0.28)";
          ctx.fill();
        });
      }

      // 地面
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.strokeStyle = "rgba(150,170,210,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 温度场
      var mid = (leftX + rightX) / 2;
      if (warm > 0.02) {
        var wg = ctx.createRadialGradient(mid, gy - s * 0.5, 0, mid, gy - s * 0.5, eff * w * 0.62);
        wg.addColorStop(0, "rgba(240,180,110," + 0.2 * warm + ")");
        wg.addColorStop(0.5, "rgba(224,164,88," + 0.07 * warm + ")");
        wg.addColorStop(1, "rgba(224,164,88,0)");
        ctx.fillStyle = wg;
        ctx.fillRect(mid - eff * w, gy - s * 3, eff * w * 2, s * 3.4);
      }

      var jitterL = 0;
      var jitterR = 0;
      if (!K.reduced) {
        var amp = tooClose ? 2.4 : tooFar ? 1.1 : 0;
        jitterL = Math.sin(t * 26) * amp;
        jitterR = Math.cos(t * 23) * amp;
      }

      var tintWarm = {
        body: "rgba(82,62,46,0.98)",
        spike: "rgba(232,190,140,0.9)",
        nose: "rgba(232,190,140,0.7)"
      };
      var tintCold = {
        body: "rgba(34,44,62,0.98)",
        spike: "rgba(160,192,212,0.78)",
        nose: "rgba(160,192,212,0.6)"
      };
      var tintHurt = {
        body: "rgba(70,36,38,0.98)",
        spike: "rgba(236,150,130,0.95)",
        nose: "rgba(236,150,130,0.7)"
      };
      var tint = tooClose ? tintHurt : tooFar ? tintCold : tintWarm;

      hog(ctx, leftX, gy, s, 1, tint, jitterL);
      hog(ctx, rightX, gy, s, -1, tint, jitterR);

      // 刺痛火花
      if (tooClose) {
        for (var i = 0; i < 3; i++) {
          var ang = t * 4 + i * 2.1;
          var px2 = mid + Math.cos(ang) * s * 0.35;
          var py2 = gy - s * 0.55 + Math.sin(ang) * s * 0.28;
          ctx.beginPath();
          ctx.arc(px2, py2, 1.8, 0, TAU);
          ctx.fillStyle = "rgba(240,120,100," + (0.5 + Math.sin(t * 12 + i) * 0.3) + ")";
          ctx.fill();
        }
      }

      // 距离标注
      ctx.beginPath();
      ctx.moveTo(leftX + s * 1.3, gy + 14);
      ctx.lineTo(rightX - s * 1.3, gy + 14);
      ctx.strokeStyle = "rgba(150,170,210,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(leftX + s * 1.3, gy + 10);
      ctx.lineTo(leftX + s * 1.3, gy + 18);
      ctx.moveTo(rightX - s * 1.3, gy + 10);
      ctx.lineTo(rightX - s * 1.3, gy + 18);
      ctx.stroke();

      var stateTxt = tooClose ? "刺痛" : tooFar ? "冻僵" : "刚好";
      var stateCol = tooClose
        ? "rgba(226,138,120,0.85)"
        : tooFar
        ? "rgba(150,180,200,0.8)"
        : "rgba(240,190,130,0.9)";

      K.label(ctx, "STACHELSCHWEINE", 20, 26, {
        size: 9, spacing: 1.8, color: "rgba(150,170,210,0.4)"
      });
      K.cn(ctx, stateTxt, w - 30, 30, { size: 16, color: stateCol });
      K.label(ctx, "距离 " + Math.round(st.gap * 100) + "%", w - 20, h - 18, {
        size: 9.5, align: "right", spacing: 1.4, color: "rgba(150,170,210,0.4)"
      });
      K.cn(
        ctx,
        tooClose ? "靠得太近，彼此的刺先说话。"
          : tooFar ? "离得太远，谁也暖不了谁。"
          : "人类发明礼仪，是为了停在这条线上。",
        w * 0.5,
        h - 26,
        { size: 12.5, color: "rgba(233,238,246,0.5)" }
      );
    });
  };
})();
