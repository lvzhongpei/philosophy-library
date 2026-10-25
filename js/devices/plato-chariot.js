/* ============================================================
   device: 柏拉图 · 灵魂马车
   激情与欲望的配比，决定马车是向上飞还是往下坠
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["plato-chariot"] = function (o) {
    var st = {
      passion: 0.55,
      desire: 0.45,
      x: 0,
      y: 0,
      vy: 0,
      trail: [],
      feathers: [],
      state: "run",
      hold: 0,
      last: 0
    };

    o.controls.appendChild(
      K.slider({
        label: "激情",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.55,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.passion = v; }
      }).el
    );

    o.controls.appendChild(
      K.slider({
        label: "欲望",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.45,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.desire = v; }
      }).el
    );

    function reset(w, h) {
      st.x = w * 0.11;
      st.y = h * 0.82;
      st.vy = 0;
      st.trail = [];
      st.feathers = [];
      st.state = "run";
      st.hold = 0;
    }

    K.stage(o.canvas, function (ctx, w, h, t) {
      var dt = st.last ? Math.min(0.05, Math.max(0.001, t - st.last)) : 0.016;
      st.last = t;
      if (!st.trail.length && !st.x) reset(w, h);

      var groundY = h * 0.84;
      var net = st.passion * 1.08 - st.desire * 0.96 - 0.1;
      var S = Math.max(1, Math.min(2.2, Math.min(w, h) / 210));

      // 光（善的理念）
      var lx = w * 0.85;
      var ly = h * 0.18;
      var lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 120);
      lg.addColorStop(0, "rgba(226,248,255,0.5)");
      lg.addColorStop(0.28, "rgba(79,209,197,0.15)");
      lg.addColorStop(1, "rgba(79,209,197,0)");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(lx, ly, 120, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, TAU);
      ctx.fillStyle = "rgba(238,253,255,0.95)";
      ctx.fill();
      K.label(ctx, "善的理念", lx, ly + 24, {
        size: 9, align: "center", spacing: 1.8, color: "rgba(150,170,210,0.5)"
      });

      // 地平线
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.strokeStyle = "rgba(150,170,210,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 运动
      if (st.state === "run") {
        var vt = -Math.sign(net) * Math.pow(Math.abs(net), 0.55) * 215;
        st.vy = K.lerp(st.vy, vt, 0.06);
        st.x += 40 * dt;
        st.y += st.vy * dt;

        st.trail.push({ x: st.x, y: st.y });
        if (st.trail.length > 110) st.trail.shift();

        if (st.y < h * 0.2) {
          st.state = "win";
          st.hold = 0;
        } else if (st.y > groundY - 4 || st.x > w * 0.96) {
          st.state = "crash";
          st.hold = 0;
          for (var i = 0; i < 18; i++) {
            st.feathers.push({
              x: st.x, y: Math.min(st.y, groundY),
              vx: (Math.random() - 0.5) * 110,
              vy: -Math.random() * 80,
              r: (Math.random() * 6 + 3) * S * 0.7,
              ph: Math.random() * TAU
            });
          }
        }
      } else {
        st.hold += dt;
        if (st.hold > 1.8) reset(w, h);
      }

      // 轨迹
      if (st.trail.length > 2) {
        ctx.beginPath();
        st.trail.forEach(function (p, i) {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = "rgba(79,209,197,0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      var cx = st.x;
      var cy = Math.min(st.y, groundY);
      var flap = Math.sin(t * 5.2) * 0.34 + 0.62;

      // 翅膀（左右各一，向上展开）
      [-1, 1].forEach(function (s) {
        ctx.beginPath();
        ctx.moveTo(cx + s * 5 * S, cy - 4 * S);
        ctx.bezierCurveTo(
          cx + s * 14 * S, cy - (16 + flap * 8) * S,
          cx + s * 30 * S, cy - (24 + flap * 12) * S,
          cx + s * 34 * S, cy - (6 + flap * 4) * S
        );
        ctx.bezierCurveTo(
          cx + s * 26 * S, cy + 2 * S,
          cx + s * 14 * S, cy + 3 * S,
          cx + s * 5 * S, cy - 1 * S
        );
        ctx.closePath();
        ctx.fillStyle = "rgba(226,240,255," + (0.12 + st.passion * 0.34) + ")";
        ctx.fill();
        ctx.strokeStyle = "rgba(200,230,255," + (0.28 + st.passion * 0.42) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 羽脉
        for (var f = 1; f <= 3; f++) {
          var q = f / 4;
          ctx.beginPath();
          ctx.moveTo(cx + s * 5 * S, cy - 4 * S);
          ctx.quadraticCurveTo(
            cx + s * (13 + 11 * q) * S, cy - (14 + 7 * q) * S,
            cx + s * (25 + 9 * q) * S, cy - (7 + 9 * q) * S
          );
          ctx.strokeStyle = "rgba(200,230,255,0.13)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // 车身
      ctx.beginPath();
      ctx.moveTo(cx - 9 * S, cy);
      ctx.lineTo(cx + 12 * S, cy - 2 * S);
      ctx.lineTo(cx + 12 * S, cy + 6 * S);
      ctx.lineTo(cx - 9 * S, cy + 7 * S);
      ctx.closePath();
      ctx.fillStyle = "rgba(26,34,48,0.96)";
      ctx.fill();
      ctx.strokeStyle = "rgba(226,176,120,0.7)";
      ctx.stroke();

      // 车轮
      ctx.beginPath();
      ctx.arc(cx + 3 * S, cy + 9 * S, 4.4 * S, 0, TAU);
      ctx.strokeStyle = "rgba(224,164,88,0.85)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 3 * S, cy + 9 * S, 1 * S, 0, TAU);
      ctx.fillStyle = "rgba(224,164,88,0.9)";
      ctx.fill();

      // 驭者
      ctx.beginPath();
      ctx.arc(cx - 3 * S, cy - 7 * S, 3 * S, 0, TAU);
      ctx.fillStyle = "rgba(240,245,255,0.92)";
      ctx.fill();

      // 两股拉力
      var pullA = st.passion * 70 * S;
      var pullB = st.desire * 70 * S;
      ctx.beginPath();
      ctx.moveTo(cx + 12 * S, cy + 2 * S);
      ctx.quadraticCurveTo(cx + 22 * S, cy + 2 * S - pullA * 0.3, cx + 28 * S, cy + 8 * S - pullA);
      ctx.strokeStyle = "rgba(79,209,197," + (0.22 + st.passion * 0.5) + ")";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 12 * S, cy + 5 * S);
      ctx.quadraticCurveTo(cx + 22 * S, cy + 9 * S + pullB * 0.3, cx + 28 * S, cy + 9 * S + pullB);
      ctx.strokeStyle = "rgba(224,164,88," + (0.22 + st.desire * 0.5) + ")";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 落羽
      st.feathers = st.feathers.filter(function (f) {
        f.vy += 120 * dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vx *= 0.99;
        var alive = f.y < groundY + 20;
        if (alive) {
          ctx.beginPath();
          ctx.ellipse(f.x, f.y, f.r, f.r * 0.38, Math.sin(t * 2 + f.ph) * 0.9, 0, TAU);
          ctx.fillStyle = "rgba(226,240,255,0.5)";
          ctx.fill();
        }
        return alive;
      });

      // 读数
      K.label(ctx, "CHARIOT · 升力 " + (net >= 0 ? "+" : "") + net.toFixed(2), 20, 26, {
        size: 9, spacing: 1.6,
        color: net >= 0 ? "rgba(79,209,197,0.55)" : "rgba(224,164,88,0.7)"
      });
      var tip =
        st.state === "win" ? "抵达光 —— 翼羽未落"
          : st.state === "crash" ? "坠翼。劣马赢了。"
          : net >= 0 ? "上行" : "下沉";
      K.label(ctx, tip, w - 20, 26, {
        size: 9.5, align: "right",
        color: st.state === "crash" ? "rgba(224,164,88,0.85)" : "rgba(150,170,210,0.45)"
      });
      K.label(ctx, "激情 ← 良马 · 欲望 → 劣马", 20, h - 18, {
        size: 10, spacing: 1.2, color: "rgba(150,170,210,0.38)"
      });
    });
  };
})();
