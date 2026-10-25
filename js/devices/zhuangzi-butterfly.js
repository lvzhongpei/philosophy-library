/* ============================================================
   device: 庄子 · 蝶梦形变
   同一团粒子，在庄周与蝴蝶之间往返
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  function ellRand(rand, cx, cy, rx, ry, rot) {
    var a = rand() * TAU;
    var r = Math.sqrt(rand());
    var x = Math.cos(a) * r * rx;
    var y = Math.sin(a) * r * ry;
    var c = Math.cos(rot);
    var s = Math.sin(rot);
    return { x: cx + x * c - y * s, y: cy + x * s + y * c };
  }

  function segRand(rand, x1, y1, x2, y2, jitter) {
    var k = rand();
    var x = x1 + (x2 - x1) * k;
    var y = y1 + (y2 - y1) * k;
    var nx = -(y2 - y1);
    var ny = x2 - x1;
    var L = Math.hypot(nx, ny) || 1;
    var j = (rand() - 0.5) * jitter;
    return { x: x + (nx / L) * j, y: y + (ny / L) * j };
  }

  var HUMAN = [
    { w: 0.15, f: function (r) { return ellRand(r, 0, -0.63, 0.125, 0.145, 0); } },
    { w: 0.39, f: function (r) { return ellRand(r, 0, -0.17, 0.165, 0.33, 0); } },
    {
      w: 0.23,
      f: function (r) {
        return r() < 0.5
          ? segRand(r, -0.15, -0.4, -0.33, 0.06, 0.05)
          : segRand(r, 0.15, -0.4, 0.33, 0.06, 0.05);
      }
    },
    {
      w: 0.23,
      f: function (r) {
        return r() < 0.5
          ? segRand(r, -0.06, 0.12, -0.15, 0.8, 0.055)
          : segRand(r, 0.06, 0.12, 0.15, 0.8, 0.055);
      }
    }
  ];

  var BUTTERFLY = [
    { w: 0.09, f: function (r) { return ellRand(r, 0, 0.01, 0.024, 0.26, 0); } },
    {
      w: 0.4,
      f: function (r) {
        return r() < 0.5
          ? ellRand(r, -0.35, -0.19, 0.33, 0.145, -0.58)
          : ellRand(r, 0.35, -0.19, 0.33, 0.145, 0.58);
      }
    },
    {
      w: 0.33,
      f: function (r) {
        return r() < 0.5
          ? ellRand(r, -0.25, 0.2, 0.24, 0.115, 0.34)
          : ellRand(r, 0.25, 0.2, 0.24, 0.115, -0.34);
      }
    },
    {
      w: 0.18,
      f: function (r) {
        return r() < 0.5
          ? segRand(r, 0, -0.26, -0.19, -0.58, 0.02)
          : segRand(r, 0, -0.26, 0.19, -0.58, 0.02);
      }
    }
  ];

  function pick(parts, r) {
    var x = r();
    var acc = 0;
    for (var i = 0; i < parts.length; i++) {
      acc += parts[i].w;
      if (x <= acc) return parts[i];
    }
    return parts[parts.length - 1];
  }

  window.DEVICES["zhuangzi-butterfly"] = function (o) {
    var N = 620;
    var pts = [];
    var rh = K.rng(20240101);
    var rb = K.rng(19870615);

    for (var i = 0; i < N; i++) {
      var hp = pick(HUMAN, rh).f(rh);
      var bp = pick(BUTTERFLY, rb).f(rb);
      pts.push({
        hx: hp.x,
        hy: hp.y,
        bx: bp.x,
        by: bp.y,
        ph: (i * 2.399) % TAU,
        sp: 0.4 + ((i * 7) % 13) / 13,
        sz: 0.7 + ((i * 11) % 9) / 9
      });
    }

    var st = { target: 0, m: 0 };

    var btn = K.button("入梦 →", function () {
      st.target = st.target === 0 ? 1 : 0;
      btn.textContent = st.target === 1 ? "← 醒来" : "入梦 →";
    });
    o.controls.appendChild(btn);

    o.controls.appendChild(
      K.button(
        "慢慢自动",
        function () {
          st.target = st.target === 0 ? 1 : 0;
          btn.textContent = st.target === 1 ? "← 醒来" : "入梦 →";
        },
        "ghost"
      )
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      st.m = K.lerp(st.m, st.target, 0.045);
      var m = st.m;
      var S = Math.min(w, h) * 0.42;
      var cx = w / 2;
      var cy = h / 2;

      // 背景呼吸光
      var bg = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.max(w, h) * 0.55
      );
      var warm = m;
      bg.addColorStop(
        0,
        "rgba(" +
          Math.round(79 + (224 - 79) * warm) +
          "," +
          Math.round(209 + (164 - 209) * warm) +
          "," +
          Math.round(197 + (88 - 197) * warm) +
          ",0.055)"
      );
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var wob = K.reduced ? 0 : Math.sin(t * p.sp + p.ph) * 1.6;
        var x = cx + (p.hx + (p.bx - p.hx) * m) * S + wob;
        var y = cy + (p.hy + (p.by - p.hy) * m) * S + wob * 0.7;

        var r = Math.round(79 + (224 - 79) * m);
        var g = Math.round(209 + (164 - 209) * m);
        var b = Math.round(197 + (88 - 197) * m);
        var a = 0.28 + 0.5 * Math.abs(Math.sin(t * 0.6 + p.ph));

        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
        ctx.beginPath();
        ctx.arc(x, y, p.sz * 1.05, 0, TAU);
        ctx.fill();
      }

      // 状态字
      var aA = m < 0.5 ? 0.9 : 0.2;
      var aB = m < 0.5 ? 0.2 : 0.9;
      K.cn(ctx, "觉", w * 0.16, h * 0.5, {
        size: 16,
        color: "rgba(79,209,197," + aA + ")"
      });
      K.label(ctx, "ZHUANG ZHOU", w * 0.16, h * 0.5 + 22, {
        size: 8.5,
        align: "center",
        spacing: 1.8,
        color: "rgba(150,170,210," + aA * 0.6 + ")"
      });
      K.cn(ctx, "梦", w * 0.84, h * 0.5, {
        size: 16,
        color: "rgba(224,164,88," + aB + ")"
      });
      K.label(ctx, "BUTTERFLY", w * 0.84, h * 0.5 + 22, {
        size: 8.5,
        align: "center",
        spacing: 1.8,
        color: "rgba(150,170,210," + aB * 0.6 + ")"
      });

      K.label(ctx, "形变 " + Math.round(m * 100) + "%", 20, 26, {
        size: 9.5,
        spacing: 1.6,
        color: "rgba(150,170,210,0.45)"
      });
      K.label(
        ctx,
        m < 0.5 ? "此刻他在庄周的形体里" : "此刻他在蝴蝶的形体里",
        w - 20,
        26,
        { size: 9.5, align: "right", color: "rgba(150,170,210,0.42)" }
      );
    });
  };
})();
