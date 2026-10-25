/* ============================================================
   device: 韩非 · 守株待兔
   世异则事异，事异则备变
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["hanfei-rabbit"] = function (o) {
    var st = { era: 0.15, gain: 0, rabbits: [], cool: 0 };

    o.controls.appendChild(
      K.slider({
        label: "世",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.15,
        fmt: function (v) { return v < 0.5 ? "旧世" : "世异"; },
        onInput: function (v) { st.era = v; }
      }).el
    );
    o.controls.appendChild(
      K.button("重置收获", function () { st.gain = 0; }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var gy = h * 0.78;
      var stumpX = w * 0.56;
      var rabbitRate = Math.max(0, 0.9 - st.era * 1.05);

      // 田
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.strokeStyle = "rgba(150,170,210,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 禾苗（随「世」枯萎）
      for (var i = 0; i < 26; i++) {
        var px = w * 0.05 + i * (w * 0.9 / 26);
        var hgt = 10 + ((i * 13) % 9);
        var dead = st.era;
        ctx.beginPath();
        ctx.moveTo(px, gy);
        ctx.lineTo(px + Math.sin(i) * 2, gy - hgt * (1 - dead * 0.7));
        ctx.strokeStyle = "rgba(" +
          Math.round(120 + dead * 60) + "," +
          Math.round(180 - dead * 80) + ",120," +
          (0.35 - dead * 0.2) + ")";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 树桩
      ctx.beginPath();
      ctx.rect(stumpX - 16, gy - 26, 32, 26);
      ctx.fillStyle = "rgba(120,88,58,0.95)";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(stumpX, gy - 26, 16, 5, 0, 0, TAU);
      ctx.fillStyle = "rgba(160,120,80,0.95)";
      ctx.fill();

      // 农夫
      var fx = stumpX - 40;
      ctx.beginPath();
      ctx.arc(fx, gy - 44, 5, 0, TAU);
      ctx.fillStyle = "rgba(236,242,252,0.9)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(fx - 7, gy);
      ctx.quadraticCurveTo(fx, gy - 44, fx + 7, gy);
      ctx.closePath();
      ctx.fillStyle = "rgba(236,242,252,0.7)";
      ctx.fill();

      // 兔子
      st.cool -= 0.016;
      if (st.cool <= 0 && rabbitRate > 0.02) {
        st.cool = 0.5 + Math.random() * (2.2 - rabbitRate);
        if (Math.random() < rabbitRate) {
          st.rabbits.push({ x: w + 20, y: gy - 8, v: 40 + Math.random() * 50, hit: false });
        }
      }
      st.rabbits = st.rabbits.filter(function (r) {
        r.x -= r.v * 0.016;
        // 撞桩
        if (!r.hit && Math.abs(r.x - stumpX) < 20) {
          r.hit = true;
          st.gain++;
          r.v = 0;
          r.dead = 1;
        }
        if (r.dead) {
          r.dead -= 0.012;
          if (r.dead <= 0) return false;
        }
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 6, 0, 0, TAU);
        ctx.fillStyle = r.hit
          ? "rgba(226,140,120," + Math.max(0, r.dead) + ")"
          : "rgba(214,206,190,0.85)";
        ctx.fill();
        // 耳朵
        if (!r.hit) {
          ctx.beginPath();
          ctx.ellipse(-4, -7, 2, 5, -0.3, 0, TAU);
          ctx.ellipse(1, -7, 2, 5, 0.2, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
        return r.x > -30;
      });

      // 读数
      K.label(ctx, "SHOU ZHU · 收获 " + st.gain, 20, 26, {
        size: 9, spacing: 1.6,
        color: st.gain > 0 ? "rgba(224,164,88,0.7)" : "rgba(150,170,210,0.42)"
      });
      K.label(
        ctx,
        rabbitRate < 0.05 ? "田里已经没有兔子了" : "兔 " + Math.round(rabbitRate * 100) + "%",
        w - 20, 26,
        { size: 9, align: "right", spacing: 1.2, color: "rgba(150,170,210,0.45)" }
      );

      var msg = st.era < 0.35
        ? "旧世：偶然还有兔子撞上来，于是守株像是「有效」的。"
        : st.era < 0.75
        ? "世道变了，兔子在减少。他还在原地等。"
        : "「世异则事异，事异则备变。」——不是树桩错了，是他不肯换办法。";
      K.cn(ctx, msg, w * 0.5, h - 24, {
        size: 12.5, halo: 10,
        color: st.era > 0.75 ? "rgba(226,150,130,0.8)" : "rgba(150,170,210,0.6)"
      });
    });
  };
})();
