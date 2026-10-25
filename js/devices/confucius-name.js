/* ============================================================
   device: 孔子 · 正名
   名不正，则言不顺；言不顺，则事不成
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var CHAIN = [
    "名不正", "言不顺", "事不成", "礼乐不兴", "刑罚不中", "民无所措手足"
  ];

  window.DEVICES["confucius-name"] = function (o) {
    var st = { broken: false, cascade: 0 };

    o.controls.appendChild(
      K.button("把名分错位", function (b) {
        st.broken = !st.broken;
        st.cascade = 0;
        b.textContent = st.broken ? "把名分扶正" : "把名分错位";
      })
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      if (st.broken) st.cascade = Math.min(1, st.cascade + 0.012);
      else st.cascade = Math.max(0, st.cascade - 0.03);

      var pad = w < 560 ? 22 : 44;
      var rowY = h * 0.26;

      // 三个人物
      var people = [
        { x: w * 0.2, name: "君" },
        { x: w * 0.38, name: "臣" },
        { x: w * 0.56, name: "父" }
      ];
      var plates = st.broken ? ["臣", "君", "父"] : ["君", "臣", "父"];

      people.forEach(function (p, i) {
        // 人物剪影
        ctx.beginPath();
        ctx.arc(p.x, rowY - 16, 8, 0, TAU);
        ctx.fillStyle = "rgba(226,236,250,0.75)";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(p.x - 11, rowY + 12);
        ctx.quadraticCurveTo(p.x, rowY - 10, p.x + 11, rowY + 12);
        ctx.closePath();
        ctx.fillStyle = "rgba(226,236,250,0.55)";
        ctx.fill();

        // 名牌
        var wrong = plates[i] !== p.name;
        var pw = 26;
        var ph = 16;
        var py = rowY + 24;
        ctx.beginPath();
        ctx.rect(p.x - pw / 2, py, pw, ph);
        ctx.fillStyle = wrong ? "rgba(120,40,36,0.9)" : "rgba(60,48,32,0.9)";
        ctx.fill();
        ctx.strokeStyle = wrong ? "rgba(226,120,110,0.9)" : "rgba(224,164,88,0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();
        K.cn(ctx, plates[i], p.x, py + ph / 2 + 1, {
          size: 11,
          color: wrong ? "rgba(255,190,180,0.95)" : "rgba(233,238,246,0.85)"
        });

        // 连到下面链条的引线
        ctx.beginPath();
        ctx.moveTo(p.x, py + ph + 4);
        ctx.lineTo(p.x, h * 0.42);
        ctx.strokeStyle = "rgba(150,170,210,0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 链条
      var startY = h * 0.46;
      var gap = (h * 0.9 - startY) / CHAIN.length;
      CHAIN.forEach(function (txt, i) {
        var prog = Math.max(0, Math.min(1, st.cascade * CHAIN.length - i));
        var y = startY + i * gap;

        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(w - pad, y);
        ctx.strokeStyle = "rgba(150,170,210,0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 红色蔓延
        if (prog > 0) {
          ctx.beginPath();
          ctx.moveTo(pad, y);
          ctx.lineTo(pad + (w - pad * 2) * prog, y);
          ctx.strokeStyle = "rgba(226,110,100," + 0.55 * prog + ")";
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        K.label(ctx, String(i + 1).padStart(2, "0"), pad, y - 9, {
          size: 8.5, spacing: 1.4,
          color: prog > 0.5 ? "rgba(226,140,130,0.7)" : "rgba(150,170,210,0.3)"
        });
        K.cn(ctx, txt, pad + 42, y - 9, {
          size: 13.5, align: "left",
          color: prog > 0.5
            ? "rgba(233,238,246,0.9)"
            : "rgba(190,205,225,0.62)"
        });
      });

      // 顶部说明
      K.label(ctx, "ZHENG MING · 名与实", 20, 24, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, st.broken ? "名实已错" : "名实相符", w - 20, 24, {
        size: 9, align: "right", spacing: 1.6,
        color: st.broken ? "rgba(226,140,130,0.8)" : "rgba(79,209,197,0.7)"
      });

      if (st.cascade > 0.98) {
        K.cn(ctx, "他修的不是制度，是词与实的对应。", w / 2, h - 12, {
          size: 12, halo: 8, color: "rgba(233,238,246,0.45)"
        });
      }
    });
  };
})();
