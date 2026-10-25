/* ============================================================
   device: 黑格尔 · 主奴辩证法
   主人得到的承认来自奴隶，所以那是空的
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["hegel-master-slave"] = function (o) {
    var st = { mode: 0 }; // 0 对峙 1 左屈 2 右屈

    o.controls.appendChild(
      K.button("左方屈服", function () { st.mode = st.mode === 1 ? 0 : 1; })
    );
    o.controls.appendChild(
      K.button("右方屈服", function () { st.mode = st.mode === 2 ? 0 : 2; })
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var y = h * 0.46;
      var lx = w * 0.28;
      var rx = w * 0.72;
      var R = Math.min(w * 0.07, 34);

      var leftLose = st.mode === 1;
      var rightLose = st.mode === 2;
      var settled = st.mode !== 0;

      function head(x, yy, label, dim, kneel) {
        var baseY = yy + (kneel ? 16 : 0);
        ctx.beginPath();
        ctx.arc(x, baseY - R * 0.2, R * 0.42, 0, TAU);
        ctx.fillStyle = dim ? "rgba(150,170,210,0.35)" : "rgba(236,242,252,0.9)";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - R * 0.5, baseY + R * 0.9);
        ctx.quadraticCurveTo(x, baseY - R * 0.2, x + R * 0.5, baseY + R * 0.9);
        ctx.closePath();
        ctx.fillStyle = dim ? "rgba(150,170,210,0.22)" : "rgba(236,242,252,0.7)";
        ctx.fill();
        K.cn(ctx, label, x, baseY + R * 1.4, {
          size: 12,
          color: dim ? "rgba(150,170,210,0.5)" : "rgba(233,238,246,0.85)"
        });
      }

      head(lx, y, leftLose ? "奴隶" : settled ? "主人" : "意识 A", leftLose, leftLose);
      head(rx, y, rightLose ? "奴隶" : settled ? "主人" : "意识 B", rightLose, rightLose);

      // 对峙 / 承认的线
      ctx.beginPath();
      ctx.moveTo(lx + R * 0.7, y);
      ctx.lineTo(rx - R * 0.7, y);
      ctx.strokeStyle = settled
        ? "rgba(150,170,210,0.2)"
        : "rgba(226,120,110," + (0.4 + 0.2 * Math.sin(t * 4)) + ")";
      ctx.lineWidth = settled ? 1 : 1.6;
      ctx.setLineDash(settled ? [3, 6] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      if (!settled) {
        K.cn(ctx, "生死斗争：都要求对方承认自己", w / 2, y - 54, {
          size: 12.5, halo: 8, color: "rgba(226,150,130,0.75)"
        });
      } else {
        // 胜者 → 享受；败者 → 劳动 → 自我意识
        var wx = leftLose ? rx : lx;
        var sx = leftLose ? lx : rx;

        ctx.beginPath();
        ctx.moveTo(wx, y + 46);
        ctx.lineTo(wx, y + 92);
        ctx.strokeStyle = "rgba(226,150,130,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
        K.cn(ctx, "享受 · 依赖他人", wx, y + 108, {
          size: 11, color: "rgba(226,150,130,0.7)"
        });

        ctx.beginPath();
        ctx.moveTo(sx, y + 46);
        ctx.lineTo(sx, y + 92);
        ctx.strokeStyle = "rgba(79,209,197,0.6)";
        ctx.stroke();
        K.cn(ctx, "劳动 · 改造世界", sx, y + 108, {
          size: 11, color: "rgba(79,209,197,0.8)"
        });
        K.cn(ctx, "→ 在作品里认出自己", sx, y + 128, {
          size: 10.5, color: "rgba(79,209,197,0.6)"
        });

        // 劳动的对象
        ctx.beginPath();
        ctx.rect(sx - 16, y + 150, 32, 20);
        ctx.strokeStyle = "rgba(224,164,88,0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
        K.label(ctx, "物", sx, y + 164, {
          size: 9, align: "center", color: "rgba(224,164,88,0.6)"
        });
      }

      K.label(ctx, "HERRSCHAFT UND KNECHTSCHAFT", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });

      var msg = !settled
        ? "两个意识相遇，都要求被承认。要分出胜负。"
        : "主人赢得的承认来自奴隶——一个不被当人的东西。所以这份承认是空的。";
      K.cn(ctx, msg, w * 0.5, h - 28, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.62)"
      });
    });
  };
})();
