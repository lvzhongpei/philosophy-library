/* ============================================================
   device: 柏拉图 · 洞穴投影
   侧剖洞穴：火光 — 器物 — 被缚者 — 墙
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["plato-cave"] = function (o) {
    var st = { fire: 0.45, turn: 0 };

    o.controls.appendChild(
      K.slider({
        label: "火光位置",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.45,
        fmt: function (v) {
          return Math.round(v * 100) + "%";
        },
        onInput: function (v) {
          st.fire = v;
        }
      }).el
    );

    var turnSlider = K.slider({
      label: "转身",
      min: 0,
      max: 100,
      step: 1,
      value: 0,
      fmt: function (v) {
        return v + "%";
      },
      onInput: function (v) {
        st.turn = v;
      }
    });
    o.controls.appendChild(turnSlider.el);

    o.controls.appendChild(
      K.button("转身看见", function () {
        st.turn = 100;
        turnSlider.set(100);
      })
    );

    o.controls.appendChild(
      K.button(
        "转回墙前",
        function () {
          st.turn = 0;
          turnSlider.set(0);
        },
        "ghost"
      )
    );

    function vase(ctx, ox, gy, s, tv) {
      var hgt = 70 * s;
      var halfW = 16 * s;
      ctx.beginPath();
      ctx.moveTo(ox - halfW * 0.8, gy);
      ctx.bezierCurveTo(
        ox - halfW * 2.0, gy - hgt * 0.28,
        ox - halfW * 1.35, gy - hgt * 0.78,
        ox - halfW * 0.45, gy - hgt * 0.9
      );
      ctx.lineTo(ox + halfW * 0.45, gy - hgt * 0.9);
      ctx.bezierCurveTo(
        ox + halfW * 1.35, gy - hgt * 0.78,
        ox + halfW * 2.0, gy - hgt * 0.28,
        ox + halfW * 0.8, gy
      );
      ctx.closePath();
      ctx.fillStyle =
        tv > 0.25
          ? "rgba(" +
            Math.round(30 + 150 * tv) + "," +
            Math.round(38 + 96 * tv) + "," +
            Math.round(54 + 30 * tv) + "," +
            (0.35 + 0.6 * tv) + ")"
          : "rgba(32,40,56,0.96)";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(226,176,120," + (0.42 + 0.45 * tv) + ")";
      ctx.stroke();
    }

    function column(ctx, ox, gy, s, tv) {
      var hgt = 92 * s;
      var halfW = 9 * s;
      var base =
        tv > 0.25
          ? "rgba(" +
            Math.round(30 + 130 * tv) + "," +
            Math.round(38 + 86 * tv) + "," +
            Math.round(54 + 28 * tv) + "," +
            (0.35 + 0.6 * tv) + ")"
          : "rgba(32,40,56,0.96)";
      ctx.fillStyle = base;
      ctx.fillRect(ox - halfW, gy - hgt, halfW * 2, hgt);
      ctx.fillRect(ox - halfW * 1.6, gy - hgt - 8 * s, halfW * 3.2, 8 * s);
      ctx.fillRect(ox - halfW * 1.4, gy - 6 * s, halfW * 2.8, 6 * s);
      ctx.strokeStyle = "rgba(226,176,120," + (0.35 + 0.45 * tv) + ")";
      ctx.lineWidth = 1;
      ctx.strokeRect(ox - halfW, gy - hgt, halfW * 2, hgt);
    }

    function prisoner(ctx, px, gy, s, tv) {
      var headR = 11 * s;
      var headY = gy - 46 * s;
      var rim = 0.32 + 0.28 * (1 - tv);
      ctx.fillStyle = "rgba(16,21,32,0.98)";
      ctx.beginPath();
      ctx.moveTo(px - 17 * s, gy);
      ctx.quadraticCurveTo(px - 19 * s, gy - 34 * s, px - 8 * s, gy - 40 * s);
      ctx.lineTo(px + 8 * s, gy - 40 * s);
      ctx.quadraticCurveTo(px + 20 * s, gy - 34 * s, px + 19 * s, gy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(224,164,88," + rim * 0.55 + ")";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, headY, headR, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(224,164,88," + rim * 0.45 + ")";
      ctx.stroke();

      // 火光侧的轮廓光
      ctx.beginPath();
      ctx.arc(px, headY, headR, -0.6, 0.95);
      ctx.strokeStyle = "rgba(240,190,130," + rim + ")";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 锁链
      ctx.beginPath();
      ctx.moveTo(px + 4 * s, gy - 6 * s);
      ctx.lineTo(px + 30 * s, gy - 2 * s);
      ctx.strokeStyle = "rgba(150,170,210,0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    K.stage(o.canvas, function (ctx, w, h, t) {
      var gy = h * 0.82;
      var wallX = w * 0.15;
      var fy = h * 0.60;
      var fx = w * (0.52 + 0.33 * st.fire);
      var tv = st.turn / 100;
      var s = Math.max(0.62, Math.min(1.15, h / 360));

      // 洞顶暗块
      var cg = ctx.createLinearGradient(0, 0, 0, h * 0.26);
      cg.addColorStop(0, "rgba(4,6,11,0.95)");
      cg.addColorStop(1, "rgba(4,6,11,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, w, h * 0.26);

      // 墙（被火光照亮的一面）
      var glow = 0.55 * (1 - tv * 0.75);
      var wg = ctx.createLinearGradient(0, 0, wallX, 0);
      wg.addColorStop(0, "rgba(60,46,30,0)");
      wg.addColorStop(1, "rgba(128,98,62," + glow + ")");
      ctx.fillStyle = wg;
      ctx.fillRect(0, h * 0.12, wallX, gy - h * 0.12);

      ctx.beginPath();
      ctx.moveTo(wallX, h * 0.12);
      ctx.lineTo(wallX, gy);
      ctx.strokeStyle = "rgba(224,164,88," + glow * 0.8 + ")";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 器物
      var objs = [
        { ox: w * 0.36, top: gy - 70 * s, hTop: 9 * s, hBot: 27 * s, draw: vase },
        { ox: w * 0.47, top: gy - 100 * s, hTop: 16 * s, hBot: 10 * s, draw: column }
      ];

      // 影子：光从火穿过器物投到墙上，越远越大越淡
      objs.forEach(function (ob) {
        var k = (wallX - fx) / (ob.ox - fx);
        if (!isFinite(k) || k <= 0) return;

        var yT = fy + (ob.top - fy) * k;
        var yB = fy + (gy - fy) * k;
        var hT = Math.min(wallX * 0.9, ob.hTop * k);
        var hB = Math.min(wallX * 0.9, ob.hBot * k);
        var a = 0.86 * (1 - tv * 0.94);

        ctx.beginPath();
        ctx.moveTo(wallX, yT);
        ctx.lineTo(wallX - hT, yT);
        ctx.lineTo(wallX - hB, yB);
        ctx.lineTo(wallX, yB);
        ctx.closePath();
        ctx.fillStyle = "rgba(3,5,9," + a + ")";
        ctx.fill();

        // 影子边缘的散射
        ctx.strokeStyle = "rgba(3,5,9," + a * 0.5 + ")";
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      // 被缚者
      for (var i = 0; i < 3; i++) {
        prisoner(ctx, wallX + w * 0.055 + i * w * 0.042, gy, s, tv);
      }

      // 地面
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.strokeStyle = "rgba(150,170,210,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 火光在地面上的漫射
      var amb = ctx.createRadialGradient(fx, gy, 0, fx, gy, (fx - wallX) * 1.5);
      amb.addColorStop(0, "rgba(224,164,88,0.14)");
      amb.addColorStop(0.5, "rgba(224,164,88,0.05)");
      amb.addColorStop(1, "rgba(224,164,88,0)");
      ctx.save();
      ctx.beginPath();
      ctx.rect(wallX, h * 0.3, w - wallX, gy - h * 0.3);
      ctx.clip();
      ctx.fillStyle = amb;
      ctx.fillRect(wallX, h * 0.3, w - wallX, gy - h * 0.3);
      ctx.restore();

      // 实物（随转身而亮起）
      objs.forEach(function (ob) {
        ob.draw(ctx, ob.ox, gy, s, tv);
      });

      // 火
      var fl = K.reduced ? 1 : 1 + 0.05 * Math.sin(t * 7.3) + 0.035 * Math.sin(t * 13.1);
      var fr = 74 * fl;
      var fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
      fg.addColorStop(0, "rgba(255,226,170,0.95)");
      fg.addColorStop(0.16, "rgba(240,170,90,0.55)");
      fg.addColorStop(0.55, "rgba(200,110,50,0.14)");
      fg.addColorStop(1, "rgba(180,90,40,0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(fx, fy - 15 * fl);
      ctx.quadraticCurveTo(fx + 7, fy - 6, fx, fy + 5);
      ctx.quadraticCurveTo(fx - 7, fy - 6, fx, fy - 15 * fl);
      ctx.fillStyle = "rgba(255,238,200,0.92)";
      ctx.fill();

      // 火光到墙的光锥（极淡）
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(wallX, fy - h * 0.34);
      ctx.lineTo(wallX, fy + h * 0.34);
      ctx.closePath();
      var sg = ctx.createLinearGradient(fx, 0, wallX, 0);
      sg.addColorStop(0, "rgba(224,164,88,0.10)");
      sg.addColorStop(1, "rgba(224,164,88,0.02)");
      ctx.fillStyle = sg;
      ctx.fill();

      // 洞外的太阳（转身之后才看见）
      if (tv > 0.45) {
        var sa = (tv - 0.45) / 0.55;
        var sx = w * 0.925;
        var sy = h * 0.28;
        var sunG = ctx.createRadialGradient(sx, sy, 0, sx, sy, 78 * sa);
        sunG.addColorStop(0, "rgba(230,250,255," + 0.75 * sa + ")");
        sunG.addColorStop(0.3, "rgba(79,209,197," + 0.3 * sa + ")");
        sunG.addColorStop(1, "rgba(79,209,197,0)");
        ctx.fillStyle = sunG;
        ctx.beginPath();
        ctx.arc(sx, sy, 78 * sa, 0, TAU);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, 9 * sa, 0, TAU);
        ctx.fillStyle = "rgba(235,252,255," + 0.95 * sa + ")";
        ctx.fill();
      }

      // 标注
      K.label(ctx, "CAVE · SECTION", 20, 24, {
        size: 9,
        spacing: 1.8,
        color: "rgba(150,170,210,0.42)"
      });
      K.cn(ctx, "影", wallX - 14, h * 0.24, {
        size: 12,
        color: "rgba(150,170,210," + 0.5 * (1 - tv * 0.7) + ")"
      });
      K.cn(ctx, "火", fx, fy + 30, {
        size: 12,
        color: "rgba(224,164,88,0.65)"
      });
      K.cn(ctx, "器物", w * 0.415, gy + 20, {
        size: 11,
        color: "rgba(150,170,210," + (0.3 + 0.4 * tv) + ")"
      });
      K.label(ctx, "转身 " + Math.round(st.turn) + "%", w - 20, 24, {
        size: 9.5,
        align: "right",
        spacing: 1.6,
        color: "rgba(79,209,197,0.6)"
      });
      K.label(
        ctx,
        tv < 0.3 ? "他们只看见墙上的影子，并为影子的次序建立荣辱。" : "影子退去，事物第一次显出自己的形状。",
        20,
        h - 18,
        { size: 11, color: "rgba(150,170,210,0.42)" }
      );
    });
  };
})();
