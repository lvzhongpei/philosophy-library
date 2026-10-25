/* ============================================================
   device: 王阳明 · 磨镜
   良知如镜，只是被私欲蒙了尘。擦，不必造。
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  window.DEVICES["wangyangming-mirror"] = function (o) {
    var COLS = 48;
    var ROWS = 34;
    var dust = [];
    var off = document.createElement("canvas");
    off.width = COLS;
    off.height = ROWS;
    var octx = off.getContext("2d");
    var imgData = octx.createImageData(COLS, ROWS);
    var dirty = true;
    var st = { down: false, clean: 0, glow: 0 };

    function reseed() {
      dust = [];
      for (var i = 0; i < COLS * ROWS; i++) {
        dust.push(0.86 + Math.random() * 0.14);
      }
      dirty = true;
    }
    reseed();

    function rebuild() {
      if (!imgData || !imgData.data) return;
      var d = imgData.data;
      for (var i = 0; i < COLS * ROWS; i++) {
        var v = dust[i];
        var n = ((i * 37) % 11) / 11;
        d[i * 4] = 74 + n * 26;
        d[i * 4 + 1] = 68 + n * 22;
        d[i * 4 + 2] = 58 + n * 20;
        d[i * 4 + 3] = Math.min(255, v * 255);
      }
      octx.putImageData(imgData, 0, 0);
      dirty = false;
      var sum = 0;
      for (var k = 0; k < dust.length; k++) sum += dust[k];
      st.clean = 1 - sum / dust.length;
    }

    function geom() {
      var r = o.canvas.getBoundingClientRect();
      var w = r.width;
      var h = r.height;
      var R = Math.min(w * 0.34, h * 0.42);
      return { w: w, h: h, R: R, cx: w / 2, cy: h * 0.47 };
    }

    function wipeByCell(i, j, radius) {
      var g = geom();
      var cw = (g.R * 2) / COLS;
      var ch = (g.R * 2) / ROWS;
      var px = g.cx - g.R + (i + 0.5) * cw;
      var py = g.cy - g.R + (j + 0.5) * ch;
      return { x: px, y: py };
    }

    function wipe(clientX, clientY) {
      var r = o.canvas.getBoundingClientRect();
      var mx = clientX - r.left;
      var my = clientY - r.top;
      var g = geom();
      var cw = (g.R * 2) / COLS;
      var ch = (g.R * 2) / ROWS;
      var rad = Math.max(cw, ch) * 4.8;
      var changed = false;

      for (var j = 0; j < ROWS; j++) {
        for (var i = 0; i < COLS; i++) {
          var p = wipeByCell(i, j);
          var dx = p.x - mx;
          var dy = p.y - my;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d > rad) continue;
          // 只在镜面圆内
          var rx = p.x - g.cx;
          var ry = p.y - g.cy;
          if (rx * rx + ry * ry > g.R * g.R) continue;
          var k = 1 - d / rad;
          var idx = j * COLS + i;
          if (dust[idx] > 0) {
            dust[idx] = Math.max(0, dust[idx] - 0.5 * k - 0.16);
            changed = true;
          }
        }
      }
      if (changed) dirty = true;
    }

    o.canvas.addEventListener("pointerdown", function (e) {
      st.down = true;
      o.canvas.setPointerCapture(e.pointerId);
      wipe(e.clientX, e.clientY);
    });
    o.canvas.addEventListener("pointermove", function (e) {
      if (!st.down) return;
      wipe(e.clientX, e.clientY);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      o.canvas.addEventListener(ev, function () { st.down = false; });
    });

    o.controls.appendChild(
      K.button("重新蒙尘", function () {
        reseed();
        dirty = true;
      })
    );
    o.controls.appendChild(
      K.button(
        "一口气擦净",
        function () {
          dust = dust.map(function () { return 0; });
          dirty = true;
        },
        "ghost"
      )
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var g = geom();
      var cx = g.cx;
      var cy = g.cy;
      var R = g.R;

      if (dirty) rebuild();
      st.glow = K.lerp(st.glow, st.clean > 0.88 ? 1 : 0, 0.04);

      // 镜外暗场
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.28, 0, TAU);
      var bg = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.28);
      bg.addColorStop(0, "rgba(79,209,197,0.05)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fill();

      // 镜面
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.clip();

      var mg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, 0, cx, cy, R * 1.2);
      mg.addColorStop(0, "rgba(38,48,62,1)");
      mg.addColorStop(0.55, "rgba(18,25,36,1)");
      mg.addColorStop(1, "rgba(9,13,20,1)");
      ctx.fillStyle = mg;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // 镜中的像（被尘遮住的部分自然看不见）
      var ix = cx;
      var iy = cy + R * 0.42;
      var warm = "rgba(236,196,140," + (0.55 + 0.45 * st.glow) + ")";
      // 肩
      ctx.beginPath();
      ctx.moveTo(ix - R * 0.62, iy + R * 0.15);
      ctx.quadraticCurveTo(ix - R * 0.3, iy - R * 0.5, ix, iy - R * 0.52);
      ctx.quadraticCurveTo(ix + R * 0.3, iy - R * 0.5, ix + R * 0.62, iy + R * 0.15);
      ctx.closePath();
      ctx.fillStyle = "rgba(226,180,124,0.5)";
      ctx.fill();
      // 头
      ctx.beginPath();
      ctx.arc(ix, iy - R * 0.62, R * 0.24, 0, TAU);
      ctx.fillStyle = warm;
      ctx.fill();
      // 眼
      ctx.beginPath();
      ctx.arc(ix - R * 0.08, iy - R * 0.66, R * 0.026, 0, TAU);
      ctx.arc(ix + R * 0.08, iy - R * 0.66, R * 0.026, 0, TAU);
      ctx.fillStyle = "rgba(20,26,34,0.8)";
      ctx.fill();

      // 尘
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, cx - R, cy - R, R * 2, R * 2);

      // 镜面反光
      ctx.beginPath();
      ctx.ellipse(cx - R * 0.34, cy - R * 0.42, R * 0.5, R * 0.16, -0.7, 0, TAU);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fill();
      ctx.restore();

      // 镜框
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.strokeStyle = "rgba(200,220,240,0.22)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, R + 5, 0, TAU);
      ctx.strokeStyle = "rgba(224,164,88," + (0.12 + st.glow * 0.4) + ")";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (st.glow > 0.02) {
        var gg = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.5);
        gg.addColorStop(0, "rgba(224,164,88," + 0.13 * st.glow + ")");
        gg.addColorStop(1, "rgba(224,164,88,0)");
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.5, 0, TAU);
        ctx.fill();
      }

      // 读数
      K.label(ctx, "MIRROR · 明净 " + Math.round(st.clean * 100) + "%", 20, 26, {
        size: 9, spacing: 1.6,
        color: st.clean > 0.88 ? "rgba(79,209,197,0.7)" : "rgba(150,170,210,0.45)"
      });
      K.label(ctx, "按住并拖动，把它擦干净", w - 20, 26, {
        size: 9.5, align: "right", color: "rgba(150,170,210,0.4)"
      });
      K.cn(ctx, st.clean > 0.88 ? "良知本来就在这里" : "尘厚，则照不见", w / 2, h - 22, {
        size: 13,
        color: st.clean > 0.88
          ? "rgba(224,164,88,0.75)"
          : "rgba(150,170,210,0.45)"
      });
    });
  };
})();
