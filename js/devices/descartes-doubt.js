/* ============================================================
   device: 笛卡尔 · 怀疑剥落
   一层层剥，看最后还剩什么
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var LAYERS = [
    { n: "感官", why: "远处的东西会看错形状，插在水里的棍子看着是弯的。" },
    { n: "身体", why: "截肢的人仍觉得幻肢在痛——身体未必是可靠的证人。" },
    { n: "外部世界", why: "梦里的一切也一样逼真，你怎么确定此刻不在梦里？" },
    { n: "数学", why: "也许有个恶魔，在我每次计算时让我算错。" },
    { n: "一切", why: "那就连同「我在思考」一起怀疑。" }
  ];

  window.DEVICES["descartes-doubt"] = function (o) {
    var st = { step: 0, anim: [0, 0, 0, 0, 0] };

    var btn = K.button("再怀疑一层 →", function () {
      if (st.step < LAYERS.length) st.step++;
      btn.textContent = st.step >= LAYERS.length ? "剥到底了" : "再怀疑一层 →";
    });
    o.controls.appendChild(btn);
    o.controls.appendChild(
      K.button("重建世界", function () {
        st.step = 0;
        st.anim = [0, 0, 0, 0, 0];
        btn.textContent = "再怀疑一层 →";
      }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.36;
      var cy = h * 0.5;
      var R = Math.min(w * 0.26, h * 0.36);

      for (var i = 0; i < LAYERS.length; i++) {
        st.anim[i] = K.lerp(st.anim[i], i < st.step ? 1 : 0, 0.07);
      }

      // 环
      for (var j = 0; j < LAYERS.length; j++) {
        var r = R * (1 - j * 0.165);
        var a = st.anim[j];

        if (a < 0.98) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, TAU);
          ctx.strokeStyle = "rgba(150,170,210," + 0.32 * (1 - a) + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (a > 0.02) {
          for (var k = 0; k < 54; k++) {
            var ang = (k * 2.399 + j) % TAU;
            var jitter = ((k * 37) % 19) / 19 - 0.5;
            var rr = r + jitter * 30 * a;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 1.1, 0, TAU);
            ctx.fillStyle = "rgba(140,155,180," + a * 0.32 + ")";
            ctx.fill();
          }
        }
      }

      // 中心：我思
      var alive = st.step / LAYERS.length;
      var pulse = K.reduced ? 1 : 0.75 + 0.25 * Math.sin(t * 2.2);
      var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28 + alive * 26);
      gr.addColorStop(0, "rgba(226,248,255," + (0.5 + 0.5 * alive) * pulse + ")");
      gr.addColorStop(0.3, "rgba(79,209,197," + 0.25 * pulse + ")");
      gr.addColorStop(1, "rgba(79,209,197,0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(cx, cy, 28 + alive * 26, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 3.4, 0, TAU);
      ctx.fillStyle = "rgba(240,252,255,0.95)";
      ctx.fill();

      // 右侧清单
      var lx = w * 0.66;
      K.label(ctx, "DOUBT", lx, h * 0.24, {
        size: 8.5, spacing: 2.2, color: "rgba(150,170,210,0.35)"
      });
      K.cn(ctx, st.step + " / " + LAYERS.length, lx, h * 0.24 + 30, {
        size: 17, align: "left", color: "rgba(224,164,88,0.85)"
      });

      var listY = h * 0.24 + 66;
      LAYERS.forEach(function (L, i2) {
        var gone = st.anim[i2] > 0.5;
        var y = listY + i2 * 26;
        K.label(ctx, String(i2 + 1).padStart(2, "0"), lx, y, {
          size: 8.5, spacing: 1.2,
          color: gone ? "rgba(150,170,210,0.2)" : "rgba(224,164,88,0.6)"
        });
        K.cn(ctx, L.n, lx + 24, y - 4, {
          size: 12.5, align: "left",
          color: gone ? "rgba(150,170,210,0.25)" : "rgba(233,238,246,0.85)"
        });
        if (gone) {
          ctx.beginPath();
          ctx.moveTo(lx + 22, y - 4);
          ctx.lineTo(lx + 22 + 26, y - 4);
          ctx.strokeStyle = "rgba(224,120,110,0.55)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      // 当前一层的理由
      if (st.step > 0) {
        var cur = LAYERS[st.step - 1];
        wrap(ctx, cur.why, lx, listY + LAYERS.length * 26 + 22, w - lx - 26);
      }

      if (st.step >= LAYERS.length) {
        K.cn(ctx, "我思，故我在。", cx, h - 26, {
          size: 15, halo: 12, color: "rgba(160,235,230,0.9)"
        });
      } else {
        K.cn(ctx, "撤到最后，只剩那个正在撤的人。", cx, h - 26, {
          size: 12, halo: 10, color: "rgba(150,170,210,0.5)"
        });
      }

      function wrap(ctx, text, x, y, maxW) {
        ctx.save();
        ctx.font = "12px 'Songti SC', 'STSong', serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(150,170,210,0.62)";
        var cur2 = "";
        var line = 0;
        for (var q = 0; q < text.length; q++) {
          var test = cur2 + text[q];
          if (ctx.measureText(test).width > maxW && cur2) {
            ctx.fillText(cur2, x, y + line * 20);
            line++;
            cur2 = text[q];
          } else cur2 = test;
        }
        if (cur2) ctx.fillText(cur2, x, y + line * 20);
        ctx.restore();
      }
    });
  };
})();
