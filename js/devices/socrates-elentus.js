/* ============================================================
   device: 苏格拉底 · 诘问机
   你给出定义，它只问一个问题
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;

  var STEPS = [
    { q: "你说你知道什么是勇敢。那先告诉我：勇敢是什么？",
      a: "勇敢是坚守阵地，不逃跑。" },
    { q: "骑兵在撤退时依然守住阵形，算不算勇敢？",
      a: "……算。" },
    { q: "可见勇敢不只是「不逃跑」。那它是「知道什么该怕、什么不该怕」吗？",
      a: "是。" },
    { q: "不懂医术的人不怕瘟疫，是因为他知道该怕什么吗？",
      a: "不是。是因为他不知道。" },
    { q: "所以我们绕了一圈。你最初那个定义，现在还在吗？",
      a: "（沉默）" }
  ];

  window.DEVICES["socrates-elentus"] = function (o) {
    var st = { step: 0, reveal: 0, strike: 0 };

    var btn = K.button("追问一句 →", function () {
      if (st.step < STEPS.length - 1) {
        st.step++;
        st.reveal = 0;
      } else {
        st.step = 0;
        st.reveal = 0;
        st.strike = 0;
        btn.textContent = "追问一句 →";
      }
    });
    o.controls.appendChild(btn);
    o.controls.appendChild(
      K.button("重来", function () {
        st.step = 0;
        st.reveal = 0;
        st.strike = 0;
        btn.textContent = "追问一句 →";
      }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.reveal = Math.min(1, st.reveal + 0.05);
      if (st.step > 0) st.strike = Math.min(1, st.strike + 0.06);

      var cx = w / 2;
      var pad = w < 520 ? 26 : 56;

      // 顶部：最初的回答（会被划掉）
      var defY = h * 0.24;
      if (st.step === 0) {
        K.label(ctx, "DEFINITION · 待检验的定义", pad, 26, {
          size: 9, spacing: 1.8, color: "rgba(150,170,210,0.42)"
        });
        ctx.save();
        ctx.font = "18px 'Songti SC', 'STSong', serif";
        ctx.fillStyle = "rgba(233,238,246,0.92)";
        ctx.textAlign = "center";
        ctx.fillText(STEPS[0].a, cx, defY);
        ctx.restore();
      } else {
        ctx.save();
        ctx.font = "18px 'Songti SC', 'STSong', serif";
        ctx.fillStyle = "rgba(233,238,246," + (0.42 - st.strike * 0.18) + ")";
        ctx.textAlign = "center";
        ctx.fillText(STEPS[0].a, cx, defY);
        var tw = ctx.measureText(STEPS[0].a).width;
        ctx.restore();

        // 划掉的线
        ctx.beginPath();
        ctx.moveTo(cx - tw / 2 - 6, defY - 6);
        ctx.lineTo(cx - tw / 2 - 6 + (tw + 12) * st.strike, defY - 6);
        ctx.strokeStyle = "rgba(224,120,110,0.85)";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        K.label(ctx, "已被推翻", cx, defY + 20, {
          size: 9, align: "center", spacing: 2, color: "rgba(224,120,110,0.6)"
        });
      }

      // 追问
      var qy = h * 0.52;
      var q = STEPS[st.step].q;
      var alpha = st.reveal;
      ctx.save();
      ctx.font = "13.5px 'Songti SC', 'STSong', serif";
      ctx.fillStyle = "rgba(79,209,197," + 0.9 * alpha + ")";
      ctx.textAlign = "left";
      wrap(ctx, q, pad, qy, w - pad * 2, 26, alpha);
      ctx.restore();

      // 回答
      if (st.step > 0) {
        var ay = qy + 26 * Math.ceil(wrapLines(ctx, q, w - pad * 2).length) + 34;
        ctx.save();
        ctx.font = "13px 'Songti SC', 'STSong', serif";
        ctx.fillStyle = "rgba(224,164,88," + 0.75 * alpha + ")";
        ctx.fillText(STEPS[st.step].a, pad + 22, ay);
        ctx.restore();
      }

      // 结尾
      if (st.step === STEPS.length - 1) {
        var pulse = K.reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 2);
        K.cn(ctx, "ἀπορία · 无路可走", cx, h * 0.8, {
          size: 15, halo: 10,
          color: "rgba(224,164,88," + 0.55 * pulse + ")"
        });
        K.cn(ctx, "我唯一知道的，是我不知道。", cx, h * 0.8 + 32, {
          size: 13, halo: 10, color: "rgba(233,238,246,0.5)"
        });
      }

      // 计数
      K.label(ctx, "定义已推翻 " + (st.step > 0 ? st.step : 0) + " 次", w - pad, 26, {
        size: 9, align: "right", spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "ELENCHUS · 助产术", pad, h - 18, {
        size: 9, spacing: 1.8, color: "rgba(150,170,210,0.32)"
      });
    });

    function wrapLines(ctx, text, maxW) {
      ctx.font = "13.5px 'Songti SC', 'STSong', serif";
      var lines = [];
      var cur = "";
      for (var i = 0; i < text.length; i++) {
        var test = cur + text[i];
        if (ctx.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = text[i];
        } else {
          cur = test;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function wrap(ctx, text, x, y, maxW, lh, alpha) {
      var lines = wrapLines(ctx, text, maxW);
      lines.forEach(function (ln, i) {
        ctx.fillStyle = "rgba(79,209,197," + 0.9 * alpha + ")";
        ctx.fillText(ln, x, y + i * lh);
      });
    }
  };
})();
