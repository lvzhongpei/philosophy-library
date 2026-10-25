/* ============================================================
   device: 亚里士多德 · 四因
   质料、形式、动力、目的：缺一个，解释就不完整
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var FACTORS = [
    { key: "mat", n: "质料因", en: "MATERIAL" },
    { key: "form", n: "形式因", en: "FORMAL" },
    { key: "eff", n: "动力因", en: "EFFICIENT" },
    { key: "tel", n: "目的因", en: "FINAL" }
  ];

  window.DEVICES["aristotle-four"] = function (o) {
    var st = { show: { mat: true, form: true, eff: true, tel: true } };

    FACTORS.forEach(function (f) {
      var b = K.button(f.n, function (btn) {
        st.show[f.key] = !st.show[f.key];
        btn.style.color = st.show[f.key] ? "" : "var(--faint)";
        btn.style.borderColor = st.show[f.key] ? "" : "rgba(150,170,210,0.14)";
      });
      b.style.marginRight = "0";
      if (st.show[f.key]) b.classList.add("on");
      o.controls.appendChild(b);
    });

    function vasePath(ctx, cx, cy, s) {
      ctx.beginPath();
      ctx.moveTo(cx - 46 * s, cy - 52 * s);
      ctx.bezierCurveTo(cx - 58 * s, cy + 6 * s, cx - 40 * s, cy + 56 * s, cx - 26 * s, cy + 62 * s);
      ctx.lineTo(cx + 26 * s, cy + 62 * s);
      ctx.bezierCurveTo(cx + 40 * s, cy + 56 * s, cx + 58 * s, cy + 6 * s, cx + 46 * s, cy - 52 * s);
      ctx.closePath();
    }

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.5;
      var cy = h * 0.42;
      var s = Math.max(0.7, Math.min(1.25, Math.min(w, h) / 380));
      var S = st.show;

      // 质料（陶胎）
      if (S.mat) {
        vasePath(ctx, cx, cy, s);
        var mg = ctx.createLinearGradient(cx - 60 * s, cy - 60 * s, cx + 60 * s, cy + 60 * s);
        mg.addColorStop(0, "rgba(150,106,68,0.95)");
        mg.addColorStop(0.5, "rgba(108,74,48,0.95)");
        mg.addColorStop(1, "rgba(66,44,30,0.95)");
        ctx.fillStyle = mg;
        ctx.fill();
        // 陶土颗粒
        for (var i = 0; i < 40; i++) {
          var a = (i * 2.7) % TAU;
          var r = 20 + ((i * 13) % 40);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * r * s, cy + 10 * s + Math.sin(a) * r * 0.9 * s, 0.9, 0, TAU);
          ctx.fillStyle = "rgba(30,20,12,0.3)";
          ctx.fill();
        }
      }

      // 形式（轮廓）
      if (S.form) {
        vasePath(ctx, cx, cy, s);
        ctx.strokeStyle = "rgba(79,209,197,0.9)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else {
        // 没有形式：只剩一团
        if (S.mat) {
          ctx.beginPath();
          ctx.ellipse(cx, cy + 34 * s, 52 * s, 26 * s, 0, 0, TAU);
          ctx.strokeStyle = "rgba(150,170,210,0.35)";
          ctx.setLineDash([3, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 动力（陶工之手）
      if (S.eff) {
        var hx = cx + 108 * s;
        var hy = cy - 6 * s;
        ctx.beginPath();
        ctx.moveTo(hx + 42 * s, hy - 34 * s);
        ctx.quadraticCurveTo(hx + 10 * s, hy - 8 * s, cx + 34 * s, cy + 4 * s);
        ctx.strokeStyle = "rgba(224,164,88,0.75)";
        ctx.lineWidth = 2;
        ctx.stroke();
        // 箭头
        ctx.beginPath();
        ctx.moveTo(cx + 34 * s, cy + 4 * s);
        ctx.lineTo(cx + 46 * s, cy - 2 * s);
        ctx.moveTo(cx + 34 * s, cy + 4 * s);
        ctx.lineTo(cx + 44 * s, cy + 12 * s);
        ctx.stroke();
        K.cn(ctx, "陶工", hx + 40 * s, hy - 46 * s, {
          size: 11, align: "left", color: "rgba(224,164,88,0.7)"
        });
      }

      // 目的（盛水）
      if (S.tel) {
        var wig = K.reduced ? 0 : Math.sin(t * 4) * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + wig, cy - 96 * s);
        ctx.lineTo(cx + wig, cy - 54 * s);
        ctx.strokeStyle = "rgba(120,205,225,0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
        // 水波
        ctx.beginPath();
        ctx.ellipse(cx, cy - 52 * s, 40 * s, 7 * s, 0, 0, TAU);
        ctx.strokeStyle = "rgba(120,205,225,0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
        K.cn(ctx, "盛水", cx, cy - 112 * s, {
          size: 11, color: "rgba(120,205,225,0.7)"
        });
      }

      // 底部：四因标签
      var by = h * 0.86;
      FACTORS.forEach(function (f, i) {
        var fx = w * (0.16 + i * 0.226);
        var on = S[f.key];
        ctx.beginPath();
        ctx.arc(fx, by, 3, 0, TAU);
        ctx.fillStyle = on ? "rgba(224,164,88,0.9)" : "rgba(150,170,210,0.25)";
        ctx.fill();
        K.label(ctx, f.en, fx, by + 16, {
          size: 8, align: "center", spacing: 1.2,
          color: on ? "rgba(150,170,210,0.6)" : "rgba(150,170,210,0.22)"
        });
      });

      // 计数
      var onN = FACTORS.filter(function (f) { return S[f.key]; }).length;
      K.label(ctx, "TETRA · 四因 " + onN + " / 4", 20, 26, {
        size: 9, spacing: 1.6,
        color: onN === 4 ? "rgba(79,209,197,0.7)" : "rgba(150,170,210,0.42)"
      });
      K.cn(
        ctx,
        onN === 4 ? "四因俱全 —— 这才叫「说清楚了」。"
          : onN === 0 ? "什么都撤掉，你连「那里有个东西」都说不出来。"
          : "少一个因，解释就缺一角。",
        w * 0.5, h - 26,
        { size: 12.5, halo: 10,
          color: onN === 4 ? "rgba(150,230,220,0.7)" : "rgba(150,170,210,0.55)" }
      );
    });
  };
})();
