/* ============================================================
   device: 老子 · 当其无
   器皿的用处，在那个被挖空的地方
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["laozi-void"] = function (o) {
    var st = { v: 0.42 };

    o.controls.appendChild(
      K.slider({
        label: "空",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.42,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.v = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.46;
      var cy = h * 0.54;
      var R = Math.min(w * 0.3, h * 0.36);
      var v = st.v;
      var ri = R * (0.06 + v * 0.92);
      var wall = R - ri;

      // 状态
      var solid = v < 0.08;
      var thin = v > 0.86;

      // 器身（陶土）
      var bodyG = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R * 1.15);
      bodyG.addColorStop(0, "rgba(146,104,66,0.95)");
      bodyG.addColorStop(0.6, "rgba(104,72,46,0.95)");
      bodyG.addColorStop(1, "rgba(62,42,28,0.95)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fillStyle = bodyG;
      ctx.fill();

      // 陶土颗粒
      for (var i = 0; i < 90; i++) {
        var a = (i * 2.399) % TAU;
        var rr = R * (0.2 + ((i * 37) % 100) / 100 * 0.78);
        var px = cx + Math.cos(a) * rr;
        var py = cy + Math.sin(a) * rr;
        if (Math.hypot(px - cx, py - cy) < ri) continue;
        ctx.beginPath();
        ctx.arc(px, py, 0.8 + ((i * 7) % 5) / 6, 0, TAU);
        ctx.fillStyle = "rgba(30,20,12,0.28)";
        ctx.fill();
      }

      // 空腔
      if (!solid) {
        var cav = ctx.createRadialGradient(cx, cy - ri * 0.3, 0, cx, cy, ri);
        cav.addColorStop(0, "rgba(6,10,16,1)");
        cav.addColorStop(0.75, "rgba(8,13,20,1)");
        cav.addColorStop(1, "rgba(14,20,30,1)");
        ctx.beginPath();
        ctx.arc(cx, cy, ri, 0, TAU);
        ctx.fillStyle = cav;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, ri, 0, TAU);
        ctx.strokeStyle = "rgba(79,209,197,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 液面
        var fill = K.reduced ? 0.55 : 0.5 + 0.16 * Math.sin(t * 0.9);
        var lvl = cy + ri * (0.45 - fill * 0.85);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, ri, 0, TAU);
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(cx - ri, lvl);
        for (var xw = -ri; xw <= ri; xw += 3) {
          ctx.lineTo(cx + xw, lvl + Math.sin(xw * 0.055 + t * 1.5) * ri * 0.035);
        }
        ctx.lineTo(cx + ri, cy + ri);
        ctx.lineTo(cx - ri, cy + ri);
        ctx.closePath();
        var lg = ctx.createLinearGradient(0, lvl, 0, cy + ri);
        lg.addColorStop(0, "rgba(79,209,197,0.42)");
        lg.addColorStop(1, "rgba(60,160,180,0.16)");
        ctx.fillStyle = lg;
        ctx.fill();

        // 液面高光
        ctx.beginPath();
        ctx.moveTo(cx - ri, lvl);
        for (var xw2 = -ri; xw2 <= ri; xw2 += 3) {
          ctx.lineTo(cx + xw2, lvl + Math.sin(xw2 * 0.055 + t * 1.5) * ri * 0.035);
        }
        ctx.strokeStyle = "rgba(160,230,235,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 外缘
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.strokeStyle = "rgba(226,180,132,0.7)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 裂纹（太薄）
      if (thin) {
        var crack = (v - 0.86) / 0.14;
        for (var k = 0; k < 5; k++) {
          var ang = k * 1.31 + 0.4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * ri, cy + Math.sin(ang) * ri);
          var mx = cx + Math.cos(ang + 0.1) * (ri + wall * 0.5);
          var my = cy + Math.sin(ang + 0.1) * (ri + wall * 0.5);
          ctx.lineTo(mx, my);
          ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
          ctx.strokeStyle = "rgba(255,120,100," + (0.3 + crack * 0.6) + ")";
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }

      // 壁厚标注
      ctx.beginPath();
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy - ri);
      ctx.strokeStyle = "rgba(224,164,88,0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
      if (wall > 16) {
        K.label(ctx, "壁 " + Math.round(wall) + "px", cx + 8, cy - (R + ri) / 2, {
          size: 8.5, color: "rgba(224,164,88,0.6)"
        });
      }

      // 文案
      K.label(ctx, "VOID · 当其无，有器之用", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });

      var msg = solid
        ? "实心一块泥。它很坚固，但没有一处可以盛东西。"
        : thin
        ? "挖过头了：器壁薄得像纸，一碰就碎。"
        : "这一处空，才是它被叫作「器」的原因。";
      var col = solid || thin ? "rgba(226,140,120,0.75)" : "rgba(233,238,246,0.62)";
      K.cn(ctx, msg, w * 0.5, h - 34, { size: 12.5, halo: 10, color: col });

      K.label(
        ctx,
        solid ? "无一处可用" : thin ? "器将不成" : "可用",
        w - 20, 26,
        { size: 9, align: "right", spacing: 1.8,
          color: solid || thin ? "rgba(226,140,120,0.7)" : "rgba(79,209,197,0.7)" }
      );
    });
  };
})();
