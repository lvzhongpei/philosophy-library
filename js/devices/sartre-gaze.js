/* ============================================================
   device: 萨特 · 凝视
   他人把我从主体变成对象
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var ACTS = ["读", "写", "走", "拿", "发呆"];

  window.DEVICES["sartre-gaze"] = function (o) {
    var st = { g: 0.1 };

    o.controls.appendChild(
      K.slider({
        label: "被注视",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.1,
        fmt: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { st.g = v; }
      }).el
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var g = st.g;
      var cx = w * 0.46;
      var cy = h * 0.54;
      var roomW = Math.min(w * 0.62, 560);
      var roomH = h * 0.58;
      var rx0 = cx - roomW / 2;
      var ry0 = cy - roomH / 2;

      // 房间
      ctx.beginPath();
      ctx.rect(rx0, ry0, roomW, roomH);
      ctx.strokeStyle = "rgba(150,170,210,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 门缝的光（注视的来源）
      var doorX = rx0 + roomW;
      var dg = ctx.createLinearGradient(doorX - 90, 0, doorX, 0);
      dg.addColorStop(0, "rgba(226,236,250,0)");
      dg.addColorStop(1, "rgba(226,236,250," + (0.06 + g * 0.34) + ")");
      ctx.fillStyle = dg;
      ctx.fillRect(doorX - 90, ry0, 90, roomH);

      if (g > 0.08) {
        K.label(ctx, "有人在那里", doorX + 6, ry0 + roomH / 2, {
          size: 8.5, align: "left", spacing: 1.2,
          color: "rgba(226,236,250," + g * 0.6 + ")"
        });
      }

      // 人
      var shrink = g * 0.16;
      ctx.beginPath();
      ctx.arc(cx, cy - 18, 7, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252," + (0.9 - g * 0.45) + ")";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 11 * (1 - shrink), cy + 14);
      ctx.quadraticCurveTo(cx, cy - 18, cx + 11 * (1 - shrink), cy + 14);
      ctx.closePath();
      ctx.fillStyle = "rgba(236,242,252," + (0.7 - g * 0.35) + ")";
      ctx.fill();

      // 行动选项
      ACTS.forEach(function (a, i) {
        var ang = -Math.PI / 2 + (i - 2) * 0.55;
        var R = 96;
        var px = cx + Math.cos(ang) * R;
        var py = cy + Math.sin(ang) * R * 0.72;

        var frozen = g > 0.25 + i * 0.14;
        var alpha = frozen ? 0.16 : 0.75;

        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(px - 22, py - 12, 44, 24, 4);
        else ctx.rect(px - 22, py - 12, 44, 24);
        ctx.fillStyle = frozen
          ? "rgba(150,170,210,0.04)"
          : "rgba(79,209,197,0.08)";
        ctx.fill();
        ctx.strokeStyle = frozen
          ? "rgba(150,170,210,0.16)"
          : "rgba(79,209,197," + alpha + ")";
        ctx.lineWidth = 1;
        ctx.stroke();

        K.cn(ctx, a, px, py, {
          size: 11,
          color: frozen
            ? "rgba(150,170,210,0.22)"
            : "rgba(200,235,235,0.8)"
        });

        if (frozen) {
          // 冻结的叉
          ctx.beginPath();
          ctx.moveTo(px + 14, py - 8);
          ctx.lineTo(px + 20, py - 2);
          ctx.moveTo(px + 20, py - 8);
          ctx.lineTo(px + 14, py - 2);
          ctx.strokeStyle = "rgba(226,140,120,0.5)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // 状态
      var frozenCount = ACTS.filter(function (a, i) { return g > 0.25 + i * 0.14; }).length;
      K.label(ctx, "REGARD · 被注视 " + Math.round(g * 100) + "%", 20, 26, {
        size: 9, spacing: 1.4,
        color: g > 0.5 ? "rgba(226,150,120,0.8)" : "rgba(150,170,210,0.45)"
      });
      K.label(ctx, "可选 " + (ACTS.length - frozenCount) + " / " + ACTS.length, w - 20, 26, {
        size: 9, align: "right", spacing: 1.4,
        color: "rgba(150,170,210,0.45)"
      });

      // 对象的标签
      if (g > 0.55) {
        var a2 = (g - 0.55) / 0.45;
        K.cn(ctx, "对象", cx, cy + 52, {
          size: 13, halo: 8,
          color: "rgba(226,150,130," + a2 * 0.9 + ")"
        });
      }

      var msg = g < 0.25
        ? "没人看的时候，你只是你在做的事。"
        : g < 0.55
        ? "有目光落下来，动作开始变形——你开始「表演一个正在读书的人」。"
        : "到这一步，你不再是一个做事的自由主体，而是他眼里的一个东西。";
      K.cn(ctx, msg, w * 0.5, h - 26, {
        size: 12.5, halo: 10,
        color: g > 0.55 ? "rgba(226,150,130,0.75)" : "rgba(150,170,210,0.6)"
      });
    });
  };
})();
