/* ============================================================
   device: 叔本华 · 痛苦与无聊的钟摆
   左端痛苦，右端无聊，最低点是那一下「满足」
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["schopenhauer-pendulum"] = function (o) {
    var MAXA = 1.22; // 最大摆角（弧度）
    var st = {
      theta: MAXA,
      omega: 0,
      amp: 1,
      drag: false,
      g: 1500,
      trail: []
    };

    o.controls.appendChild(
      K.slider({
        label: "欲望强度",
        min: 0.25,
        max: 1,
        step: 0.01,
        value: 1,
        fmt: function (v) {
          return Math.round(v * 100) + "%";
        },
        onInput: function (v) {
          st.amp = v;
          st.theta = (st.theta >= 0 ? 1 : -1) * MAXA * v;
          st.omega = 0;
        }
      }).el
    );

    o.controls.appendChild(
      K.button("让它停下", function () {
        st.theta = 0.001;
        st.omega = 0;
        st.trail = [];
      })
    );

    // 拖动摆锤
    var geo = { cx: 0, py: 0, L: 100 };

    function toTheta(clientX, clientY) {
      var r = o.canvas.getBoundingClientRect();
      var dx = clientX - r.left - geo.cx;
      var dy = clientY - r.top - geo.py;
      var a = Math.atan2(dx, Math.max(1, dy));
      return Math.max(-MAXA, Math.min(MAXA, a));
    }

    o.canvas.addEventListener("pointerdown", function (e) {
      st.drag = true;
      st.theta = toTheta(e.clientX, e.clientY);
      st.omega = 0;
      o.canvas.setPointerCapture(e.pointerId);
    });

    o.canvas.addEventListener("pointermove", function (e) {
      if (!st.drag) return;
      st.theta = toTheta(e.clientX, e.clientY);
      st.omega = 0;
    });

    function release() {
      st.drag = false;
    }

    o.canvas.addEventListener("pointerup", release);
    o.canvas.addEventListener("pointercancel", release);

    var last = 0;

    K.stage(o.canvas, function (ctx, w, h, t) {
      var dt = last ? Math.min(0.05, Math.max(0.001, t - last)) : 0.016;
      last = t;

      geo.cx = w / 2;
      geo.py = h * 0.16;
      geo.L = Math.min(h * 0.62, w * 0.42);

      // 物理
      if (!st.drag) {
        var acc = -(st.g / geo.L) * Math.sin(st.theta) - 0.06 * st.omega;
        st.omega += acc * dt;
        st.theta += st.omega * dt;
        if (Math.abs(st.theta) > MAXA) {
          st.theta = Math.sign(st.theta) * MAXA;
          st.omega *= -0.35;
        }
      }

      var bx = geo.cx + Math.sin(st.theta) * geo.L;
      var by = geo.py + Math.cos(st.theta) * geo.L;

      // 轨迹残影
      if (!K.reduced && !st.drag) {
        st.trail.push({ x: bx, y: by, a: 1 });
        if (st.trail.length > 34) st.trail.shift();
      }
      st.trail.forEach(function (p) {
        p.a *= 0.965;
        ctx.fillStyle = "rgba(224,164,88," + p.a * 0.22 + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, TAU);
        ctx.fill();
      });

      // 弧线刻度
      ctx.beginPath();
      ctx.arc(geo.cx, geo.py, geo.L, Math.PI / 2 - MAXA, Math.PI / 2 + MAXA);
      ctx.setLineDash([2, 8]);
      ctx.strokeStyle = "rgba(150,170,210,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      for (var a = -MAXA; a <= MAXA + 0.001; a += MAXA / 4) {
        var x1 = geo.cx + Math.sin(a) * (geo.L - 6);
        var y1 = geo.py + Math.cos(a) * (geo.L - 6);
        var x2 = geo.cx + Math.sin(a) * (geo.L + 6);
        var y2 = geo.py + Math.cos(a) * (geo.L + 6);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "rgba(150,170,210,0.3)";
        ctx.stroke();
      }

      // 两端与最低点
      var lx = geo.cx + Math.sin(-MAXA) * (geo.L + 26);
      var ly = geo.py + Math.cos(-MAXA) * (geo.L + 26);
      var rx = geo.cx + Math.sin(MAXA) * (geo.L + 26);
      var ry = geo.py + Math.cos(MAXA) * (geo.L + 26);

      K.cn(ctx, "痛苦", lx, ly, { size: 14, color: "rgba(233,238,246,0.78)" });
      K.cn(ctx, "无聊", rx, ry, { size: 14, color: "rgba(233,238,246,0.78)" });
      K.cn(ctx, "满足", geo.cx, geo.py + geo.L + 30, {
        size: 11,
        color: "rgba(79,209,197,0.6)"
      });
      K.label(ctx, "瞬时", geo.cx, geo.py + geo.L + 48, {
        size: 9,
        align: "center",
        spacing: 1.6,
        color: "rgba(79,209,197,0.42)"
      });

      // 支架
      ctx.strokeStyle = "rgba(150,170,210,0.28)";
      ctx.beginPath();
      ctx.moveTo(geo.cx - 34, geo.py);
      ctx.lineTo(geo.cx + 34, geo.py);
      ctx.stroke();
      for (var i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(geo.cx + i * 10, geo.py);
        ctx.lineTo(geo.cx + i * 10 - 5, geo.py - 6);
        ctx.strokeStyle = "rgba(150,170,210,0.16)";
        ctx.stroke();
      }

      // 摆杆
      ctx.beginPath();
      ctx.moveTo(geo.cx, geo.py);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = "rgba(200,220,255,0.42)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 摆锤
      var g = ctx.createRadialGradient(bx, by, 0, bx, by, 30);
      g.addColorStop(0, "rgba(224,164,88,0.95)");
      g.addColorStop(0.35, "rgba(224,164,88,0.24)");
      g.addColorStop(1, "rgba(224,164,88,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, 30, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by, 9, 0, TAU);
      ctx.fillStyle = "#0a0d15";
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "rgba(240,200,150,0.9)";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(geo.cx, geo.py, 3, 0, TAU);
      ctx.fillStyle = "rgba(200,220,255,0.8)";
      ctx.fill();

      K.label(ctx, "PENDULUM · SCHMERZ ↔ LANGEWEILE", 20, 24, {
        size: 9,
        spacing: 1.6,
        color: "rgba(150,170,210,0.4)"
      });
      K.label(ctx, "拖动摆锤，或调低欲望强度看它如何减速", w - 20, 24, {
        size: 9.5,
        align: "right",
        color: "rgba(150,170,210,0.4)"
      });
      K.label(ctx, "摆幅 " + Math.round(st.amp * 100) + "%", 20, h - 20, {
        size: 10,
        spacing: 1.4,
        color: "rgba(224,164,88,0.55)"
      });
    });
  };
})();
