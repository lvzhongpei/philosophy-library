/* ============================================================
   device: 加缪 · 推石上山
   点击推石，到顶滚落，次数一直加
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["camus-sisyphus"] = function (o) {
    var st = {
      s: 0,
      mode: "idle",
      v: 0,
      count: 0,
      pause: 0,
      rot: 0,
      dust: []
    };

    function push() {
      if (st.mode !== "idle") return;
      st.mode = "push";
      st.count++;
    }

    o.controls.appendChild(K.button("推石", push));
    o.controls.appendChild(
      K.button(
        "重置计数",
        function () {
          st.count = 0;
          st.s = 0;
          st.mode = "idle";
          st.dust = [];
        },
        "ghost"
      )
    );

    o.canvas.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      push();
    });

    var last = 0;

    K.stage(o.canvas, function (ctx, w, h, t) {
      var dt = last ? Math.min(0.05, Math.max(0.001, t - last)) : 0.016;
      last = t;

      // 状态机
      if (st.mode === "push") {
        st.s += dt * (0.4 + 0.2 * (1 - st.s));
        st.rot += dt * 0.6;
        if (st.s >= 1) {
          st.s = 1;
          st.mode = "pause";
          st.pause = 0;
        }
      } else if (st.mode === "pause") {
        st.pause += dt;
        if (st.pause > 0.45) {
          st.mode = "roll";
          st.v = 0;
        }
      } else if (st.mode === "roll") {
        st.v += dt * 1.15;
        st.s -= st.v * dt;
        st.rot -= dt * (0.6 + st.v);
        if (!K.reduced && Math.random() < 0.4) {
          st.dust.push({ p: st.s, life: 1 });
        }
        if (st.s <= 0) {
          st.s = 0;
          st.mode = "idle";
          st.v = 0;
        }
      }

      var baseX = w * 0.1;
      var baseY = h * 0.86;
      var peakX = w * 0.84;
      var peakY = h * 0.18;
      var dx = peakX - baseX;
      var dy = peakY - baseY;
      var len = Math.hypot(dx, dy);
      var ux = dx / len;
      var uy = dy / len;
      var nx = uy; // 上法线（朝左上）
      var ny = -ux;

      var R = Math.max(12, Math.min(w, h) * 0.052);

      // 山体
      ctx.beginPath();
      ctx.moveTo(baseX - R * 1.4, baseY + R * 0.5);
      ctx.lineTo(peakX, peakY);
      ctx.lineTo(peakX + w * 0.16, baseY + R * 0.5);
      ctx.closePath();
      var mg = ctx.createLinearGradient(baseX, baseY, peakX, peakY);
      mg.addColorStop(0, "rgba(30,40,58,0.72)");
      mg.addColorStop(0.55, "rgba(20,27,40,0.42)");
      mg.addColorStop(1, "rgba(10,14,22,0.12)");
      ctx.fillStyle = mg;
      ctx.fill();

      // 山体剖面线
      for (var c = 0.03; c < 1; c += 0.038) {
        var qx = baseX + dx * c;
        var qy = baseY + dy * c;
        var depth = (baseY + R * 0.5 - qy) * (0.14 + 0.26 * ((c * 100) % 7) / 7);
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.lineTo(qx + depth * 0.42, qy + depth);
        ctx.strokeStyle = "rgba(150,170,210,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 坡面线
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(peakX, peakY);
      ctx.strokeStyle = "rgba(150,170,210,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 坡面刻度
      for (var i = 1; i < 10; i++) {
        var k = i / 10;
        var px = baseX + dx * k;
        var py = baseY + dy * k;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + nx * 6, py + ny * 6);
        ctx.strokeStyle = "rgba(150,170,210,0.16)";
        ctx.stroke();
      }

      // 山顶
      ctx.beginPath();
      ctx.arc(peakX, peakY, 2.6, 0, TAU);
      ctx.fillStyle = "rgba(224,164,88,0.8)";
      ctx.fill();
      K.label(ctx, "PEAK", peakX + 10, peakY + 4, {
        size: 9,
        spacing: 1.6,
        color: "rgba(224,164,88,0.5)"
      });

      // 尘土
      st.dust.forEach(function (d) {
        d.life -= 0.012;
        if (d.life <= 0) return;
        var dpx = baseX + dx * d.p + nx * R;
        var dpy = baseY + dy * d.p + ny * R;
        ctx.beginPath();
        ctx.arc(dpx, dpy, 1.4 + (1 - d.life) * 4, 0, TAU);
        ctx.fillStyle = "rgba(180,160,130," + d.life * 0.28 + ")";
        ctx.fill();
      });
      st.dust = st.dust.filter(function (d) {
        return d.life > 0;
      });

      // 巨石
      var bx = baseX + dx * st.s + nx * R;
      var by = baseY + dy * st.s + ny * R;

      // 石下投影
      ctx.beginPath();
      ctx.ellipse(bx - nx * R * 0.85, by - ny * R * 0.85, R * 0.9, R * 0.26, Math.atan2(dy, dx), 0, TAU);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fill();

      var bg = ctx.createRadialGradient(bx - R * 0.3, by - R * 0.3, R * 0.1, bx, by, R);
      bg.addColorStop(0, "rgba(158,168,188,0.98)");
      bg.addColorStop(0.55, "rgba(96,104,124,0.98)");
      bg.addColorStop(1, "rgba(44,50,64,0.98)");
      ctx.beginPath();
      ctx.arc(bx, by, R, 0, TAU);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = "rgba(200,215,240,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 石上的斑点（随滚动旋转）
      for (var q = 0; q < 5; q++) {
        var ang = st.rot + (q * TAU) / 5;
        var rr = R * (0.2 + 0.45 * ((q * 37) % 10) / 10);
        ctx.beginPath();
        ctx.arc(bx + Math.cos(ang) * rr, by + Math.sin(ang) * rr, R * 0.09, 0, TAU);
        ctx.fillStyle = "rgba(20,24,34,0.5)";
        ctx.fill();
      }

      // 地面
      ctx.beginPath();
      ctx.moveTo(0, baseY + R * 0.55);
      ctx.lineTo(w, baseY + R * 0.55);
      ctx.strokeStyle = "rgba(150,170,210,0.12)";
      ctx.stroke();

      // 读数
      K.label(ctx, "SISYPHE · 推石次数", 20, 26, {
        size: 9,
        spacing: 1.8,
        color: "rgba(150,170,210,0.45)"
      });
      K.label(
        ctx,
        String(st.count).padStart(3, "0"),
        20,
        58,
        { size: 26, spacing: 3, color: "rgba(224,164,88,0.9)" }
      );

      var tip = st.mode === "idle" ? "点击或按「推石」开始" : st.mode === "roll" ? "滚落中 —— 它总会滚落" : "上行";
      K.label(ctx, tip, w - 20, 26, {
        size: 9.5,
        align: "right",
        color: "rgba(150,170,210,0.42)"
      });

      if (st.count > 0 && st.mode === "idle") {
        K.cn(ctx, "必须想象西西弗斯是幸福的。", w / 2, h - 30, {
          size: 15,
          color: "rgba(233,238,246,0.5)"
        });
      }
    });
  };
})();
