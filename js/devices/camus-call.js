/* ============================================================
   device: 加缪 · 荒诞的裂缝
   人在喊，世界不答，而人还在喊
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["camus-call"] = function (o) {
    var st = { rings: [], calls: 0 };
    var stars = [];
    for (var i = 0; i < 70; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.62,
        r: 0.4 + Math.random() * 1.2,
        ph: Math.random() * TAU,
        sp: 0.4 + Math.random() * 0.8
      });
    }

    function shout() {
      st.calls++;
      st.rings.push({ r: 0, a: 1 });
      if (st.rings.length > 7) st.rings.shift();
    }

    o.controls.appendChild(K.button("喊一声", shout));
    o.controls.appendChild(
      K.button(
        "重置",
        function () {
          st.rings = [];
          st.calls = 0;
        },
        "ghost"
      )
    );

    o.canvas.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      shout();
    });

    var last = 0;

    K.stage(o.canvas, function (ctx, w, h, t) {
      var dt = last ? Math.min(0.05, Math.max(0.001, t - last)) : 0.016;
      last = t;

      var gy = h * 0.84;
      var gapY = h * 0.4;
      var fx = w / 2;

      // 星野
      stars.forEach(function (s) {
        var a = 0.25 + 0.35 * Math.abs(Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, TAU);
        ctx.fillStyle = "rgba(214,232,252," + a + ")";
        ctx.fill();
      });

      // 世界的沉默：一条不动的界线
      ctx.beginPath();
      ctx.moveTo(w * 0.08, gapY);
      ctx.lineTo(w * 0.92, gapY);
      ctx.setLineDash([2, 10]);
      ctx.strokeStyle = "rgba(150,170,210,0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      K.label(ctx, "世界的沉默 · 不回答", w * 0.08, gapY - 12, {
        size: 9, spacing: 1.8, color: "rgba(150,170,210,0.4)"
      });

      // 声波
      st.rings = st.rings.filter(function (r) {
        r.r += 320 * dt;
        r.a -= 0.55 * dt;
        if (r.a <= 0) return false;
        var rr = r.r;
        for (var k = 0; k < 3; k++) {
          var rad = rr - k * 9;
          if (rad < 1) continue;
          ctx.beginPath();
          ctx.arc(fx, gy - 26, rad, Math.PI * 1.12, Math.PI * 1.88);
          ctx.strokeStyle = "rgba(79,209,197," + Math.max(0, r.a - k * 0.12) * 0.55 + ")";
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
        // 撞上沉默后消失
        return true;
      });

      // 地面
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.strokeStyle = "rgba(150,170,210,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 小人
      var bob = K.reduced ? 0 : Math.sin(t * 1.4) * 1.2;
      ctx.save();
      ctx.translate(fx, gy + bob);
      ctx.beginPath();
      ctx.arc(0, -30, 4.2, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252,0.9)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5.5, -25);
      ctx.lineTo(5.5, -25);
      ctx.lineTo(4, 0);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fillStyle = "rgba(236,242,252,0.85)";
      ctx.fill();
      // 举起的手
      ctx.beginPath();
      ctx.moveTo(4, -22);
      ctx.lineTo(13, -33 + Math.sin(t * 3) * 1.5);
      ctx.strokeStyle = "rgba(236,242,252,0.75)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      K.label(ctx, "人的呼喊", fx + 22, gy - 4, {
        size: 9, spacing: 1.8, color: "rgba(150,170,210,0.42)"
      });

      // 读数
      K.label(ctx, "CALLS " + String(st.calls).padStart(2, "0") + " · 回应 00", 20, 26, {
        size: 9, spacing: 1.8,
        color: st.calls > 0 ? "rgba(224,164,88,0.65)" : "rgba(150,170,210,0.42)"
      });

      if (st.calls >= 2) {
        K.cn(ctx, "沉默不是回答，是它本来的样子。", w / 2, gapY + 46, {
          size: 13, halo: 12,
          color: "rgba(233,238,246,0.5)"
        });
      }
      if (st.calls >= 4) {
        K.cn(ctx, "但你还是喊了。这就是荒诞里的那个「人」。", w / 2, gapY + 72, {
          size: 13, halo: 12,
          color: "rgba(233,238,246,0.4)"
        });
      }

      K.cn(ctx, "点击任意处，再喊一次", w / 2, h - 20, {
        size: 11, color: "rgba(150,170,210,0.35)"
      });
    });
  };
})();
