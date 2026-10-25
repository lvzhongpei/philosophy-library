/* ============================================================
   device: 阿奎那 · 五路
   五条从世界出发的论证
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var WAYS = [
    { n: "运动", chain: ["某物在动", "被另一物推动", "不能无限后退"], end: "第一推动者" },
    { n: "因果", chain: ["有果必有因", "因又有其因", "不能无限后退"], end: "第一因" },
    { n: "偶然", chain: ["偶然者存在", "靠必然者支撑", "不能全属偶然"], end: "必然存在者" },
    { n: "完善", chain: ["有更善更真", "按接近程度比较", "必有一最高者"], end: "最完善者" },
    { n: "目的", chain: ["无理性之物", "恒常朝向目的", "非出于偶然"], end: "智慧的设计者" }
  ];

  window.DEVICES["aquinas-five"] = function (o) {
    var st = { step: 1 };

    o.controls.appendChild(
      K.button("点亮下一条", function (b) {
        st.step = Math.min(WAYS.length, st.step + 1);
        if (st.step >= WAYS.length) b.textContent = "五路已全";
      })
    );
    o.controls.appendChild(
      K.button("重来", function () { st.step = 0; }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var x0 = w * 0.14;
      var xEnd = w * 0.84;
      var y0 = h * 0.2;
      var gap = (h * 0.58) / (WAYS.length - 1);

      WAYS.forEach(function (way, i) {
        var y = y0 + i * gap;
        var on = i < st.step;
        var a = on ? 1 : 0.2;

        // 行底线
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(xEnd, y);
        ctx.strokeStyle = "rgba(150,170,210," + 0.1 * a + ")";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 链条节点
        var n = way.chain.length + 1;
        for (var k = 0; k < n; k++) {
          var px = x0 + ((xEnd - x0) * (k + 0.5)) / n;
          ctx.beginPath();
          ctx.arc(px, y, on ? 3.2 : 2, 0, TAU);
          ctx.fillStyle = on
            ? "rgba(224,164,88," + (k === n - 1 ? 0.95 : 0.6) + ")"
            : "rgba(150,170,210,0.2)";
          ctx.fill();
          if (k < n - 1) {
            ctx.beginPath();
            ctx.moveTo(px + 4, y);
            ctx.lineTo(px + (xEnd - x0) / n - 4, y);
            ctx.strokeStyle = "rgba(224,164,88," + 0.28 * a + ")";
            ctx.stroke();
          }
        }

        // 左侧名称
        K.cn(ctx, way.n, x0 - 12, y, {
          size: 13, align: "right",
          color: on ? "rgba(233,238,246,0.9)" : "rgba(150,170,210,0.28)"
        });

        // 右侧结论
        K.cn(ctx, way.end, xEnd + 12, y, {
          size: 12, align: "left",
          color: on ? "rgba(224,164,88,0.9)" : "rgba(150,170,210,0.22)"
        });

        // 前提（点亮后才显示，逐条淡入）
        if (on) {
          way.chain.forEach(function (c, ci) {
            K.label(ctx, c, x0 + ((xEnd - x0) * (ci + 0.5)) / n, y - 14, {
              size: 8, align: "center", spacing: 0.8,
              color: "rgba(150,170,210,0.45)"
            });
          });
        }
      });

      // 顶端：上帝
      if (st.step >= WAYS.length) {
        var gx = w * 0.5;
        var gl = ctx.createRadialGradient(gx, h * 0.1, 0, gx, h * 0.1, 90);
        gl.addColorStop(0, "rgba(240,220,180,0.28)");
        gl.addColorStop(1, "rgba(240,220,180,0)");
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(gx, h * 0.1, 90, 0, TAU);
        ctx.fill();
      }

      K.label(ctx, "QUINQUE VIAE · " + st.step + " / 5", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.cn(
        ctx,
        st.step === 0 ? "五条路，五个起点。不是五次重复。"
          : st.step < 5 ? "每一条都靠同一块石头：「不能无限后退」。"
          : "五条路都通向同一个词。但他自己说：这只是「众人所说的上帝」。",
        w * 0.5, h - 22,
        { size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)" }
      );
    });
  };
})();
