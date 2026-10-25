/* ============================================================
   device: 阿奎那 · 类比
   同名 ←→ 同名异义，中间那条窄路
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["aquinas-analogy"] = function (o) {
    var st = { k: 0.5 };

    o.controls.appendChild(
      K.slider({
        label: "同名 ←→ 异义",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.5,
        fmt: function (v) {
          if (v < 0.18) return "同名";
          if (v > 0.82) return "同名异义";
          return "类比";
        },
        onInput: function (v) { st.k = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.5;
      var cy = h * 0.5;
      var R = Math.min(w * 0.16, h * 0.26);
      var sep = R * (0.1 + st.k * 2.0);
      var ax = cx - sep / 2 - R * 0.35;
      var bx = cx + sep / 2 + R * 0.35;

      var overlap = Math.max(0, (R * 2 - (bx - ax)) / (R * 2));
      var isAnalogy = st.k > 0.18 && st.k < 0.82;

      // 人的善
      ctx.beginPath();
      ctx.arc(ax, cy, R, 0, TAU);
      ctx.fillStyle = "rgba(79,209,197,0.16)";
      ctx.fill();
      ctx.strokeStyle = "rgba(79,209,197,0.8)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      K.cn(ctx, "人的善", ax, cy - R - 18, {
        size: 13, color: "rgba(79,209,197,0.9)"
      });

      // 神的善
      ctx.beginPath();
      ctx.arc(bx, cy, R, 0, TAU);
      ctx.fillStyle = "rgba(224,164,88,0.16)";
      ctx.fill();
      ctx.strokeStyle = "rgba(224,164,88,0.8)";
      ctx.stroke();
      K.cn(ctx, "神的善", bx, cy - R - 18, {
        size: 13, color: "rgba(224,164,88,0.9)"
      });

      // 交集
      if (overlap > 0.01 && overlap < 0.99) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ax, cy, R, 0, TAU);
        ctx.clip();
        ctx.beginPath();
        ctx.arc(bx, cy, R, 0, TAU);
        ctx.fillStyle = "rgba(240,235,255,0.18)";
        ctx.fill();
        ctx.restore();

        K.cn(ctx, "类比", cx, cy + 4, {
          size: 14, halo: 10, color: "rgba(240,240,255,0.85)"
        });
        K.label(ctx, "ANALOGIA", cx, cy + 22, {
          size: 8, align: "center", spacing: 2, color: "rgba(240,240,255,0.5)"
        });
      } else if (overlap >= 0.99) {
        K.cn(ctx, "完全重合", cx, cy - R - 44, {
          size: 12, color: "rgba(226,140,120,0.75)"
        });
      } else {
        K.cn(ctx, "毫无关系", cx, cy - R - 44, {
          size: 12, color: "rgba(226,140,120,0.75)"
        });
      }

      // 读数
      K.label(ctx, "ANALOGY · " + (isAnalogy ? "类比" : st.k < 0.5 ? "同名" : "同名异义"), 20, 26, {
        size: 9, spacing: 1.6,
        color: isAnalogy ? "rgba(240,240,255,0.7)" : "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "重合度 " + Math.round(overlap * 100) + "%", w - 20, 26, {
        size: 9, align: "right", spacing: 1.4, color: "rgba(150,170,210,0.45)"
      });

      var msg = st.k < 0.18
        ? "同名：把神说得跟人一样。神就被拉低成一个更大的好人。"
        : st.k > 0.82
        ? "同名异义：两个「善」毫无关系。那这个词就等于没说。"
        : "类比：既不是同一个意义，也不是毫无关系。这是他能找到的唯一一条窄路。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.6)"
      });
    });
  };
})();
