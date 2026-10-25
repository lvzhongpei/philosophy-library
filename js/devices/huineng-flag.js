/* ============================================================
   device: 慧能 · 风幡之动
   不是风动，不是幡动，仁者心动
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["huineng-flag"] = function (o) {
    var st = { mode: 0 }; // 0 风动 1 幡动 2 心动

    [["风动", 0], ["幡动", 1], ["心动", 2]].forEach(function (p) {
      var b = K.button(p[0], function (btn) {
        st.mode = p[1];
        Array.prototype.forEach.call(
          o.controls.querySelectorAll(".btn"),
          function (x) { x.classList.remove("is-on"); }
        );
        btn.classList.add("is-on");
      });
      if (p[1] === 0) b.classList.add("is-on");
      b.dataset.mode = p[1];
      o.controls.appendChild(b);
    });

    K.stage(o.canvas, function (ctx, w, h, t) {
      var poleX = w * 0.3;
      var topY = h * 0.2;
      var botY = h * 0.88;
      var frozen = st.mode === 2;
      var tt = frozen ? 0 : t;

      // 旗杆
      ctx.beginPath();
      ctx.moveTo(poleX, topY);
      ctx.lineTo(poleX, botY);
      ctx.strokeStyle = "rgba(200,215,235,0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 风
      if (st.mode === 0) {
        for (var i = 0; i < 7; i++) {
          var wy = topY + 20 + i * 22;
          var ph = (t * 0.9 + i * 0.7) % 1;
          var sx = w * 0.05 + ph * w * 0.22;
          ctx.beginPath();
          ctx.moveTo(sx, wy);
          ctx.lineTo(sx + 30 + i * 4, wy);
          ctx.strokeStyle = "rgba(140,200,210,0.35)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 幡
      var wave = Math.sin(tt * 2.4) * 0.5 + Math.sin(tt * 1.3) * 0.5;
      var fw = w * 0.26;
      var fh = h * 0.4;
      ctx.beginPath();
      ctx.moveTo(poleX, topY + 8);
      ctx.bezierCurveTo(
        poleX + fw * 0.4, topY + 8 + wave * 16,
        poleX + fw * 0.7, topY + 8 - wave * 18,
        poleX + fw, topY + 8 + wave * 10
      );
      ctx.lineTo(poleX + fw, topY + fh + wave * 10);
      ctx.bezierCurveTo(
        poleX + fw * 0.7, topY + fh - wave * 18,
        poleX + fw * 0.4, topY + fh + wave * 16,
        poleX, topY + fh + 8
      );
      ctx.closePath();
      var fg = ctx.createLinearGradient(poleX, topY, poleX + fw, topY + fh);
      fg.addColorStop(0, "rgba(224,164,88," + (st.mode === 1 ? 0.5 : 0.4) + ")");
      fg.addColorStop(1, "rgba(190,120,80,0.18)");
      ctx.fillStyle = fg;
      ctx.fill();
      ctx.strokeStyle = st.mode === 1
        ? "rgba(240,200,140,0.95)"
        : "rgba(224,164,88,0.6)";
      ctx.lineWidth = st.mode === 1 ? 1.8 : 1;
      ctx.stroke();

      // 心动：从观者发出的脉冲
      if (st.mode === 2) {
        var ox = w * 0.78;
        var oy = h * 0.62;
        // 观者
        ctx.beginPath();
        ctx.arc(ox, oy - 16, 5, 0, TAU);
        ctx.fillStyle = "rgba(236,242,252,0.9)";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ox - 8, oy + 6);
        ctx.quadraticCurveTo(ox, oy - 16, ox + 8, oy + 6);
        ctx.closePath();
        ctx.fillStyle = "rgba(236,242,252,0.7)";
        ctx.fill();

        for (var k = 0; k < 3; k++) {
          var pr = ((t * 60 + k * 40) % 160) + 10;
          var pa = Math.max(0, 1 - pr / 170);
          ctx.beginPath();
          ctx.arc(ox, oy - 10, pr, 0, TAU);
          ctx.strokeStyle = "rgba(79,209,197," + pa * 0.55 + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        K.cn(ctx, "看的人", ox, oy + 26, {
          size: 11, color: "rgba(150,170,210,0.55)"
        });
      }

      // 标注
      var tips = ["风在动（物理）", "幡在动（对象）", "仁者心动（看的人）"];
      K.label(ctx, "FLAG · " + tips[st.mode], 20, 26, {
        size: 9, spacing: 1.5, color: "rgba(150,170,210,0.45)"
      });

      if (st.mode === 0) {
        K.cn(ctx, "风动：解释在旗子外面。", w * 0.5, h - 26, {
          size: 12.5, halo: 10, color: "rgba(150,170,210,0.55)"
        });
      } else if (st.mode === 1) {
        K.cn(ctx, "幡动：解释落在对象上。", w * 0.5, h - 26, {
          size: 12.5, halo: 10, color: "rgba(224,164,88,0.7)"
        });
      } else {
        K.cn(ctx, "心动：旗停了，问题回到你这里。", w * 0.5, h - 26, {
          size: 12.5, halo: 10, color: "rgba(79,209,197,0.75)"
        });
      }
    });
  };
})();
