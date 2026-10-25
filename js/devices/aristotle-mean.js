/* ============================================================
   device: 亚里士多德 · 中道
   过犹不及：勇敢在鲁莽与怯懦之间，但不是正中间
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var CASES = [
    { name: "恐惧", low: "怯懦", mid: "勇敢", high: "鲁莽" },
    { name: "钱财", low: "吝啬", mid: "慷慨", high: "挥霍" },
    { name: "怒气", low: "麻木", mid: "温和", high: "易怒" },
    { name: "享乐", low: "麻木不仁", mid: "节制", high: "放纵" }
  ];

  window.DEVICES["aristotle-mean"] = function (o) {
    var st = { k: 0.5, ci: 0, drag: false };

    var sl = K.slider({
      label: "位置",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.5,
      fmt: function (v) { return Math.round(v * 100); },
      onInput: function (v) { st.k = v; }
    });
    o.controls.appendChild(sl.el);

    o.controls.appendChild(
      K.button("换一组", function () {
        st.ci = (st.ci + 1) % CASES.length;
      })
    );

    function setFromPointer(clientX) {
      var r = o.canvas.getBoundingClientRect();
      var pad = r.width * 0.14;
      var k = (clientX - r.left - pad) / (r.width - pad * 2);
      st.k = Math.max(0, Math.min(1, k));
      sl.set(st.k.toFixed(2));
    }

    o.canvas.addEventListener("pointerdown", function (e) {
      st.drag = true;
      o.canvas.setPointerCapture(e.pointerId);
      setFromPointer(e.clientX);
    });
    o.canvas.addEventListener("pointermove", function (e) {
      if (st.drag) setFromPointer(e.clientX);
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      o.canvas.addEventListener(ev, function () { st.drag = false; });
    });

    K.stage(o.canvas, function (ctx, w, h, t) {
      var c = CASES[st.ci];
      var y = h * 0.54;
      var pad = w * 0.14;
      var x0 = pad;
      var x1 = w - pad;
      var mid = (x0 + x1) / 2;
      var px = x0 + (x1 - x0) * st.k;

      // 中道区间
      var band = (x1 - x0) * 0.085;
      var inMean = Math.abs(px - mid) < band;

      // 轴
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.strokeStyle = "rgba(150,170,210,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      [-1, 0, 1].forEach(function (s) {
        var tx = s < 0 ? x0 : s > 0 ? x1 : mid;
        ctx.beginPath();
        ctx.moveTo(tx, y - 6);
        ctx.lineTo(tx, y + 6);
        ctx.strokeStyle = "rgba(150,170,210,0.4)";
        ctx.stroke();
      });

      // 中道光带
      var g = ctx.createLinearGradient(mid - band, 0, mid + band, 0);
      g.addColorStop(0, "rgba(224,164,88,0)");
      g.addColorStop(0.5, "rgba(224,164,88," + (inMean ? 0.3 : 0.12) + ")");
      g.addColorStop(1, "rgba(224,164,88,0)");
      ctx.fillStyle = g;
      ctx.fillRect(mid - band, y - 34, band * 2, 68);

      // 两端与中点标注
      K.cn(ctx, c.low, x0 + 6, y + 30, {
        size: 14, align: "left",
        color: st.k < 0.35 ? "rgba(226,140,120,0.85)" : "rgba(150,170,210,0.5)"
      });
      K.label(ctx, "不及", x0 + 6, y - 22, {
        size: 8.5, spacing: 1.8, color: "rgba(150,170,210,0.35)"
      });

      K.cn(ctx, c.high, x1 - 6, y + 30, {
        size: 14, align: "right",
        color: st.k > 0.65 ? "rgba(226,140,120,0.85)" : "rgba(150,170,210,0.5)"
      });
      K.label(ctx, "过度", x1 - 6, y - 22, {
        size: 8.5, align: "right", spacing: 1.8, color: "rgba(150,170,210,0.35)"
      });

      // 德性
      var glow = inMean ? (K.reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 2.6)) : 0.25;
      K.cn(ctx, c.mid, mid, y - 30, {
        size: 17, halo: 14,
        color: inMean
          ? "rgba(240,196,130," + (0.6 + 0.4 * glow) + ")"
          : "rgba(150,170,210,0.4)"
      });
      K.label(ctx, "中道", mid, y + 48, {
        size: 8.5, align: "center", spacing: 2.2,
        color: "rgba(224,164,88," + (inMean ? 0.7 : 0.3) + ")"
      });

      // 指针
      ctx.beginPath();
      ctx.moveTo(px, y - 52);
      ctx.lineTo(px - 6, y - 62);
      ctx.lineTo(px + 6, y - 62);
      ctx.closePath();
      ctx.fillStyle = inMean ? "rgba(224,164,88,0.95)" : "rgba(200,210,230,0.8)";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(px, y - 52);
      ctx.lineTo(px, y + 14);
      ctx.strokeStyle = inMean ? "rgba(224,164,88,0.9)" : "rgba(200,210,230,0.7)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, y, 4, 0, TAU);
      ctx.fillStyle = inMean ? "rgba(240,196,130,1)" : "rgba(200,210,230,0.85)";
      ctx.fill();

      // 说明
      K.label(ctx, "MESOTES · 中道", 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, "情境：" + c.name, w - 20, 26, {
        size: 9, align: "right", spacing: 1.4, color: "rgba(224,164,88,0.6)"
      });

      var msg = inMean
        ? "「相对于我们的中道」——不是中点，是这个处境里恰好的那一点。"
        : px < mid
        ? "不及：" + c.low + "。缺得和过得多一样，都是没做到。"
        : "过度：" + c.high + "。过犹不及。";
      K.cn(ctx, msg, w * 0.5, h - 30, {
        size: 12.5, halo: 10,
        color: inMean ? "rgba(240,196,130,0.75)" : "rgba(150,170,210,0.6)"
      });
    });
  };
})();
