/* ============================================================
   device: 休谟 · 因果是习惯
   你看见的只是先后，感受到的却是必然
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["hume-causation"] = function (o) {
    var st = { habit: true, t: 0 };

    var btn = K.button("去掉「因为」", function (b) {
      st.habit = !st.habit;
      b.textContent = st.habit ? "去掉「因为」" : "把「因为」加回来";
    });
    o.controls.appendChild(btn);

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.t = (st.t + 0.004) % 1;
      var p = st.t;
      var y = h * 0.56;

      var ax, bx;
      if (p < 0.36) {
        ax = w * 0.12 + (w * 0.33) * (p / 0.36);
        bx = w * 0.55;
      } else {
        ax = w * 0.45;
        bx = w * 0.55 + (w * 0.3) * Math.min(1, (p - 0.36) / 0.5);
      }

      // 轨道
      ctx.beginPath();
      ctx.moveTo(w * 0.08, y + 12);
      ctx.lineTo(w * 0.92, y + 12);
      ctx.strokeStyle = "rgba(150,170,210,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 碰撞瞬间
      var hit = Math.abs(p - 0.36) < 0.05;
      if (hit) {
        var ha = 1 - Math.abs(p - 0.36) / 0.05;
        ctx.beginPath();
        ctx.arc(w * 0.5, y, 26, 0, TAU);
        ctx.strokeStyle = "rgba(240,230,200," + ha * 0.5 + ")";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // 球 A
      ctx.beginPath();
      ctx.arc(ax, y, 11, 0, TAU);
      ctx.fillStyle = "rgba(79,209,197,0.9)";
      ctx.fill();
      K.cn(ctx, "A", ax, y + 28, { size: 10, color: "rgba(79,209,197,0.7)" });

      // 球 B
      ctx.beginPath();
      ctx.arc(bx, y, 11, 0, TAU);
      ctx.fillStyle = "rgba(224,164,88,0.9)";
      ctx.fill();
      K.cn(ctx, "B", bx, y + 28, { size: 10, color: "rgba(224,164,88,0.7)" });

      // 两种描述
      if (st.habit) {
        ctx.beginPath();
        ctx.moveTo(ax + 16, y - 20);
        ctx.lineTo(bx - 16, y - 20);
        ctx.strokeStyle = "rgba(240,240,255,0.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx - 16, y - 20);
        ctx.lineTo(bx - 24, y - 25);
        ctx.moveTo(bx - 16, y - 20);
        ctx.lineTo(bx - 24, y - 15);
        ctx.stroke();
        K.cn(ctx, "因为", (ax + bx) / 2, y - 38, {
          size: 13, halo: 8, color: "rgba(240,240,255,0.8)"
        });
        K.label(ctx, "必然联系", (ax + bx) / 2, y - 50, {
          size: 8, align: "center", spacing: 1.6,
          color: "rgba(240,240,255,0.45)"
        });
      } else {
        K.cn(ctx, "先", ax, y - 30, {
          size: 12, color: "rgba(79,209,197,0.7)"
        });
        K.cn(ctx, "后", bx, y - 30, {
          size: 12, color: "rgba(224,164,88,0.7)"
        });
        K.label(ctx, "只有两个印象，没有一条线", (ax + bx) / 2, y - 46, {
          size: 8.5, align: "center", spacing: 1.2,
          color: "rgba(150,170,210,0.5)"
        });
      }

      // 读数
      K.label(ctx, "CAUSATION · " + (st.habit ? "有因果" : "只有先后"), 20, 26, {
        size: 9, spacing: 1.6,
        color: st.habit ? "rgba(240,240,255,0.7)" : "rgba(224,164,88,0.7)"
      });

      var msg = st.habit
        ? "你看见 A 动了、B 动了。那条「因为」，是你自己加上去的。"
        : "去掉「因为」之后，剩下的经验只有：先，然后。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
