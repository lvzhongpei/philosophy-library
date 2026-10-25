/* ============================================================
   device: 尼采 · 永恒轮回
   一条轨道不断叠加，直到同一段人生吞没整个画面
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["nietzsche-recurrence"] = function (o) {
    var state = { turns: 3, pulseAt: -1, wantPulse: false };

    o.controls.appendChild(
      K.slider({
        label: "重复倍率",
        min: 1,
        max: 9,
        step: 1,
        value: 3,
        fmt: function (v) {
          var n = Math.pow(2, v);
          return "×" + n;
        },
        onInput: function (v) {
          state.turns = v;
        }
      }).el
    );

    o.controls.appendChild(
      K.button("再来一次", function () {
        state.wantPulse = true;
      })
    );

    function pointAt(p, turns, t) {
      var ang = p * turns * TAU + (K.reduced ? 0 : t * 0.1);
      var r = 10 + p * R;
      return { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r * 0.78 };
    }

    var cx = 0;
    var cy = 0;
    var R = 100;

    K.stage(o.canvas, function (ctx, w, h, t) {
      cx = w / 2;
      cy = h / 2;
      R = Math.min(w * 0.44, h * 0.52);

      if (state.wantPulse) {
        state.pulseAt = t;
        state.wantPulse = false;
      }
      var pulseP = state.pulseAt >= 0 ? (t - state.pulseAt) * 0.5 : -1;

      var turns = state.turns;
      var N = 160 * turns;

      // 轨道本体
      ctx.beginPath();
      for (var i = 0; i <= N; i++) {
        var pt = pointAt(i / N, turns, t);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(120,190,200,0.10)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 轨道上的粒子
      for (var j = 0; j < N; j++) {
        var p = j / N;
        var q = pointAt(p, turns, t);
        var a = 0.06 + 0.62 * Math.pow(p, 1.3);
        var mix = Math.min(1, p * 1.15);
        var r = Math.round(79 + (224 - 79) * mix);
        var g = Math.round(209 + (164 - 209) * mix);
        var b = Math.round(197 + (88 - 197) * mix);

        if (pulseP >= 0 && Math.abs(p - pulseP) < 0.03) {
          var k = 1 - Math.abs(p - pulseP) / 0.03;
          a = Math.min(1, a + k * 0.9);
        }
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
        ctx.beginPath();
        ctx.arc(q.x, q.y, 0.7 + p * 1.5, 0, TAU);
        ctx.fill();
      }

      // 行走的光点
      if (!K.reduced) {
        var qp = (t * 0.055) % 1;
        var head = pointAt(qp, turns, t);
        var g2 = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 16);
        g2.addColorStop(0, "rgba(240,250,255,0.95)");
        g2.addColorStop(0.3, "rgba(79,209,197,0.45)");
        g2.addColorStop(1, "rgba(79,209,197,0)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 16, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#eaf7ff";
        ctx.beginPath();
        ctx.arc(head.x, head.y, 1.9, 0, TAU);
        ctx.fill();
      }

      // 中心十字准星
      ctx.strokeStyle = "rgba(150,170,210,0.24)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy);
      ctx.lineTo(cx - 4, cy);
      ctx.moveTo(cx + 4, cy);
      ctx.lineTo(cx + 12, cy);
      ctx.moveTo(cx, cy - 12);
      ctx.lineTo(cx, cy - 4);
      ctx.moveTo(cx, cy + 4);
      ctx.lineTo(cx, cy + 12);
      ctx.stroke();

      K.label(ctx, "同一段人生", cx, cy + 30, {
        align: "center",
        size: 10,
        spacing: 2.6,
        halo: 12,
        color: "rgba(150,170,210,0.42)"
      });

      // 角落读数
      K.label(ctx, "TURNS " + String(turns).padStart(2, "0"), 20, 26, {
        size: 9.5,
        spacing: 1.8,
        color: "rgba(150,170,210,0.45)"
      });
      K.label(
        ctx,
        "重复次数 × " + Math.pow(2, turns) + (turns >= 9 ? "  ∞" : ""),
        w - 20,
        26,
        { size: 9.5, spacing: 1.8, align: "right", color: "rgba(224,164,88,0.65)" }
      );
      K.label(ctx, "每一圈都是同样的次序：同样的痛，同样的乐，同样的此刻。", 20, h - 22, {
        size: 11,
        color: "rgba(150,170,210,0.42)"
      });
    });
  };
})();
