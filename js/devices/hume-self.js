/* ============================================================
   device: 休谟 · 一束知觉
   向内找那个「我」，只找到一束不断更替的知觉
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var WORDS = ["热", "冷", "光", "声音", "痒", "念头", "饿", "一句话", "记忆", "烦", "痛", "颜色"];

  window.DEVICES["hume-self"] = function (o) {
    var st = { bubbles: [], n: 0 };

    function look() {
      st.n++;
      st.bubbles.push({
        x: (Math.random() - 0.5) * 120,
        y: 0,
        vy: -22 - Math.random() * 26,
        word: WORDS[Math.floor(Math.random() * WORDS.length)],
        life: 1,
        r: 16 + Math.random() * 10
      });
      if (st.bubbles.length > 9) st.bubbles.shift();
    }

    o.controls.appendChild(K.button("向内看一次", look));
    o.controls.appendChild(
      K.button("重置", function () { st.bubbles = []; st.n = 0; }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var cx = w * 0.42;
      var cy = h * 0.56;

      // 内视的圈
      for (var i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * i, 0, TAU);
        ctx.strokeStyle = "rgba(150,170,210," + (0.12 - i * 0.02) + ")";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 中心
      var pulse = K.reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 2);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252," + 0.7 * pulse + ")";
      ctx.fill();
      K.cn(ctx, "我？", cx, cy + 26, {
        size: 11, color: "rgba(150,170,210,0.45)"
      });

      // 知觉
      st.bubbles = st.bubbles.filter(function (b) {
        b.y += b.vy * 0.016;
        b.vy *= 0.995;
        b.life -= 0.006;
        if (b.life <= 0) return false;
        ctx.beginPath();
        ctx.arc(cx + b.x, cy + b.y, b.r, 0, TAU);
        ctx.fillStyle = "rgba(224,164,88," + b.life * 0.14 + ")";
        ctx.fill();
        ctx.strokeStyle = "rgba(224,164,88," + b.life * 0.5 + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
        K.cn(ctx, b.word, cx + b.x, cy + b.y, {
          size: 11, color: "rgba(240,235,225," + b.life * 0.85 + ")"
        });
        return true;
      });

      // 右侧说明
      var tx = w * 0.7;
      K.label(ctx, "BUNDLE", tx, h * 0.32, {
        size: 8.5, spacing: 2.2, color: "rgba(150,170,210,0.35)"
      });
      K.cn(ctx, "看过 " + st.n + " 次", tx, h * 0.32 + 28, {
        size: 16, align: "left", color: "rgba(224,164,88,0.85)"
      });
      wrap(ctx, "每点一次，就跳出一个知觉。它们来了又走，没有一个留下来。那个把它们串起来的「我」，一次也没出现。",
        tx, h * 0.32 + 56, w - tx - 26);

      K.label(ctx, "SELF · 一束知觉", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.cn(ctx, "「我总是撞见某个特殊的知觉。」", w * 0.5, h - 24, {
        size: 12, halo: 10, color: "rgba(150,170,210,0.5)"
      });

      function wrap(ctx2, text, x, y, maxW) {
        ctx2.save();
        ctx2.font = "12px 'Songti SC', 'STSong', serif";
        ctx2.textAlign = "left";
        ctx2.fillStyle = "rgba(150,170,210,0.62)";
        var cur = "", line = 0;
        for (var q = 0; q < text.length; q++) {
          var test = cur + text[q];
          if (ctx2.measureText(test).width > maxW && cur) {
            ctx2.fillText(cur, x, y + line * 20);
            line++; cur = text[q];
          } else cur = test;
        }
        if (cur) ctx2.fillText(cur, x, y + line * 20);
        ctx2.restore();
      }
    });
  };
})();
