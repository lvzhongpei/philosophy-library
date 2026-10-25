/* ============================================================
   device: 苏格拉底 · 灵异之声
   它只否决，不建议
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["socrates-daemon"] = function (o) {
    // 每道关口有两边，其中一边被否决（确定性随机，保证每次一样）
    var VETO = [1, 0, 1, 0, 1];
    var st = { gate: 0, side: null, vetoFlash: 0, vetoCount: 0, passFlash: 0 };

    function choose(s) {
      if (st.gate >= VETO.length) return;
      st.side = s;
      if (s === VETO[st.gate]) {
        st.vetoFlash = 1;
        st.vetoCount++;
      } else {
        st.passFlash = 1;
        st.gate++;
        st.side = null;
      }
    }

    o.controls.appendChild(K.button("← 向左", function () { choose(0); }));
    o.controls.appendChild(K.button("向右 →", function () { choose(1); }));
    o.controls.appendChild(
      K.button("重走", function () {
        st.gate = 0; st.side = null; st.vetoFlash = 0; st.vetoCount = 0; st.passFlash = 0;
      }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.vetoFlash = Math.max(0, st.vetoFlash - 0.02);
      st.passFlash = Math.max(0, st.passFlash - 0.02);

      var pathY = h * 0.56;
      var pad = 40;
      var n = VETO.length;
      var stepX = (w - pad * 2) / n;

      // 路
      ctx.beginPath();
      ctx.moveTo(pad, pathY);
      ctx.lineTo(w - pad, pathY);
      ctx.strokeStyle = "rgba(150,170,210,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 已走过的部分
      var walked = pad + st.gate * stepX;
      ctx.beginPath();
      ctx.moveTo(pad, pathY);
      ctx.lineTo(walked, pathY);
      ctx.strokeStyle = "rgba(79,209,197,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 关口
      for (var i = 0; i < n; i++) {
        var gx = pad + (i + 0.5) * stepX;
        var done = i < st.gate;
        var active = i === st.gate;

        // 分岔
        [-1, 1].forEach(function (s) {
          var ex = gx + s * stepX * 0.26;
          var ey = pathY - 34;
          ctx.beginPath();
          ctx.moveTo(gx, pathY);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = active
            ? "rgba(224,164,88,0.55)"
            : "rgba(150,170,210,0.18)";
          ctx.lineWidth = 1;
          ctx.stroke();
          // 岔口小点
          ctx.beginPath();
          ctx.arc(ex, ey, 2.4, 0, TAU);
          ctx.fillStyle = active ? "rgba(224,164,88,0.8)" : "rgba(150,170,210,0.3)";
          ctx.fill();
        });

        // 关口竖线
        ctx.beginPath();
        ctx.moveTo(gx, pathY - 44);
        ctx.lineTo(gx, pathY + 8);
        ctx.strokeStyle = done
          ? "rgba(79,209,197,0.35)"
          : active
          ? "rgba(233,238,246,0.5)"
          : "rgba(150,170,210,0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();

        K.label(ctx, String(i + 1).padStart(2, "0"), gx, pathY + 24, {
          size: 8.5, align: "center", color: "rgba(150,170,210,0.3)"
        });
      }

      // 否决闪光
      if (st.vetoFlash > 0 && st.side !== null) {
        var gx2 = pad + (st.gate + 0.5) * stepX;
        var ex2 = gx2 + (st.side === 0 ? -1 : 1) * stepX * 0.26;
        ctx.beginPath();
        ctx.arc(ex2, pathY - 34, 5 + (1 - st.vetoFlash) * 16, 0, TAU);
        ctx.strokeStyle = "rgba(226,120,110," + st.vetoFlash * 0.8 + ")";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        K.cn(ctx, "它不许", ex2, pathY - 58, {
          size: 12, halo: 10,
          color: "rgba(226,140,130," + st.vetoFlash + ")"
        });
      }

      // 行者
      var px = walked;
      var bob = K.reduced ? 0 : Math.sin(t * 5) * 1.4;
      ctx.beginPath();
      ctx.arc(px, pathY - 6 + bob, 4, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252,0.95)";
      ctx.fill();

      // 文本
      K.label(ctx, "DAIMONION · 只否决，不建议", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "被拦下 " + st.vetoCount + " 次", w - 20, 26, {
        size: 9, align: "right", spacing: 1.6, color: "rgba(224,164,88,0.6)"
      });

      if (st.gate >= n) {
        K.cn(ctx, "它从没告诉我该往哪走。", w / 2, h * 0.82, {
          size: 14, halo: 10, color: "rgba(233,238,246,0.6)"
        });
        K.cn(ctx, "只是一路把我挡在错的那一边。", w / 2, h * 0.82 + 28, {
          size: 12, halo: 10, color: "rgba(150,170,210,0.5)"
        });
      } else {
        K.cn(ctx, "选一边。错了它不解释，只拦你。", w / 2, h * 0.86, {
          size: 12, color: "rgba(150,170,210,0.4)"
        });
      }
    });
  };
})();
