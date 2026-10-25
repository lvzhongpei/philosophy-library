/* ============================================================
   device: 维特根斯坦（后期）· 家族相似
   逐个检查每一列，你会发现没有一列是全勾的
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var ROWS = ["国际象棋", "扑克", "足球", "过家家", "单人纸牌"];
  var COLS = ["有输赢", "有规则", "有对手", "有运气", "要技巧"];
  // 1 = 有这个特征
  var M = [
    [1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [1, 1, 0, 1, 1]
  ];

  window.DEVICES["wittgenstein-family"] = function (o) {
    var st = { col: -1 };

    o.controls.appendChild(
      K.button("检查下一列", function (b) {
        st.col = st.col + 1;
        if (st.col >= COLS.length) {
          st.col = 0;
          b.textContent = "再查一轮";
        } else {
          b.textContent = "检查下一列";
        }
      })
    );
    o.controls.appendChild(
      K.button("重置", function () { st.col = -1; }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var pad = w < 560 ? 18 : 42;
      var labelW = w < 560 ? 74 : 92;
      var x0 = pad + labelW;
      var y0 = h * 0.24;
      var cw = (w - x0 - pad) / COLS.length;
      var rh = Math.min(44, (h * 0.6) / ROWS.length);

      // 表头
      COLS.forEach(function (c, j) {
        var active = j === st.col;
        K.cn(ctx, c, x0 + cw * (j + 0.5), y0 - 16, {
          size: 11,
          color: active
            ? "rgba(240,200,140,0.95)"
            : "rgba(150,170,210,0.45)"
        });
        if (active) {
          ctx.beginPath();
          ctx.moveTo(x0 + cw * j + 3, y0 - 4);
          ctx.lineTo(x0 + cw * (j + 1) - 3, y0 - 4);
          ctx.strokeStyle = "rgba(224,164,88,0.6)";
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      });

      // 行
      ROWS.forEach(function (r, i) {
        var y = y0 + i * rh;
        K.cn(ctx, r, pad + labelW - 10, y + rh / 2, {
          size: 11.5, align: "right", color: "rgba(233,238,246,0.72)"
        });

        COLS.forEach(function (c, j) {
          var cx = x0 + cw * (j + 0.5);
          var cy = y + rh / 2;
          var has = M[i][j];
          var active = j === st.col;

          // 底格
          ctx.beginPath();
          ctx.rect(x0 + cw * j + 3, y + 3, cw - 6, rh - 6);
          ctx.fillStyle = active
            ? (has ? "rgba(224,164,88,0.16)" : "rgba(226,120,110,0.10)")
            : "rgba(255,255,255,0.015)";
          ctx.fill();

          if (has) {
            ctx.beginPath();
            ctx.arc(cx, cy, 3.4, 0, TAU);
            ctx.fillStyle = active
              ? "rgba(240,200,140,0.95)"
              : "rgba(150,170,210,0.5)";
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(cx - 3, cy - 3);
            ctx.lineTo(cx + 3, cy + 3);
            ctx.moveTo(cx + 3, cy - 3);
            ctx.lineTo(cx - 3, cy + 3);
            ctx.strokeStyle = active
              ? "rgba(226,140,120,0.8)"
              : "rgba(150,170,210,0.22)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        });
      });

      // 底部：这一列的统计
      var verdict;
      if (st.col < 0) {
        verdict = "点「检查下一列」，一列一列地找共同点。";
      } else {
        var cnt = 0;
        ROWS.forEach(function (r, i) { if (M[i][st.col]) cnt++; });
        verdict =
          cnt === ROWS.length
            ? "这一列全勾了——但这样的列并不存在。"
            : "「" + COLS[st.col] + "」：5 个里有 " + cnt + " 个。差一个，就不算本质。";
      }
      K.label(ctx, "FAMILY RESEMBLANCE", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.cn(ctx, verdict, w * 0.5, h - 26, {
        size: 12.5, halo: 10,
        color: st.col < 0 ? "rgba(150,170,210,0.55)" : "rgba(240,200,140,0.75)"
      });
    });
  };
})();
