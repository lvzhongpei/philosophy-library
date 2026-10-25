/* ============================================================
   canvas-kit.js — 装置共用的画布与控件工具
   ============================================================ */
(function () {
  "use strict";

  var TAU = Math.PI * 2;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* 画布舞台：自动适配 DPR 与容器尺寸，常驻 rAF */
  function stage(canvas, draw) {
    var ctx = canvas.getContext("2d");
    var w = 0;
    var h = 0;
    var t0 = 0;
    var raf = 0;
    var visible = true;

    function fit() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var nw = Math.max(1, Math.round(r.width * dpr));
      var nh = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== nw || canvas.height !== nh) {
        canvas.width = nw;
        canvas.height = nh;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      w = r.width;
      h = r.height;
    }

    function frame(now) {
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      if (w === 0) fit();
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, t);
      raf = requestAnimationFrame(frame);
    }

    fit();
    if (window.ResizeObserver) {
      new ResizeObserver(fit).observe(canvas);
    } else {
      window.addEventListener("resize", fit, { passive: true });
    }

    // 只在视口内运行
    if (window.IntersectionObserver) {
      new IntersectionObserver(
        function (entries) {
          visible = entries[0].isIntersecting;
          if (visible && !raf) raf = requestAnimationFrame(frame);
          if (!visible && raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        },
        { threshold: 0.05 }
      ).observe(canvas);
    }

    raf = requestAnimationFrame(frame);

    return {
      get w() {
        return w;
      },
      get h() {
        return h;
      },
      fit: fit
    };
  }

  /* 滑杆 */
  function slider(opt) {
    var wrap = el("div", "ctrl");
    var id = "s" + Math.random().toString(36).slice(2, 8);
    var lab = el("label");
    lab.setAttribute("for", id);
    lab.textContent = opt.label;

    var input = document.createElement("input");
    input.type = "range";
    input.id = id;
    input.min = opt.min;
    input.max = opt.max;
    input.step = opt.step || 1;
    input.value = opt.value;

    var out = document.createElement("output");
    var fmt = opt.fmt || function (v) {
      return v;
    };
    out.textContent = fmt(opt.value);

    input.addEventListener("input", function () {
      var v = Number(input.value);
      out.textContent = fmt(v);
      if (opt.onInput) opt.onInput(v);
    });

    wrap.appendChild(lab);
    wrap.appendChild(input);
    wrap.appendChild(out);

    return {
      el: wrap,
      input: input,
      set: function (v) {
        input.value = v;
        out.textContent = fmt(Number(v));
      }
    };
  }

  /* 按钮 */
  function button(label, onClick, cls) {
    var b = el("button", "btn" + (cls ? " " + cls : ""));
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", function () {
      onClick(b);
    });
    return b;
  }

  /* 画布上的等宽小字 */
  function label(ctx, text, x, y, opt) {
    opt = opt || {};
    ctx.save();
    ctx.font =
      (opt.size || 10) +
      "px ui-monospace, 'SF Mono', Menlo, monospace";
    ctx.fillStyle = opt.color || "rgba(150,170,210,0.55)";
    ctx.textAlign = opt.align || "left";
    ctx.textBaseline = opt.baseline || "alphabetic";
    if (opt.halo) {
      ctx.shadowColor = "rgba(5,7,13,0.95)";
      ctx.shadowBlur = opt.halo;
    }
    if (opt.spacing) {
      var chars = String(text).split("");
      var total = 0;
      var widths = chars.map(function (c) {
        var cw = ctx.measureText(c).width + opt.spacing;
        total += cw;
        return cw;
      });
      var sx = x;
      if (opt.align === "center") sx = x - (total - opt.spacing) / 2;
      if (opt.align === "right") sx = x - (total - opt.spacing);
      chars.forEach(function (c, i) {
        ctx.fillText(c, sx, y);
        sx += widths[i];
      });
    } else {
      ctx.fillText(text, x, y);
    }
    ctx.restore();
  }

  /* 中文字（衬线） */
  function cn(ctx, text, x, y, opt) {
    opt = opt || {};
    ctx.save();
    ctx.font =
      (opt.size || 14) +
      "px 'Songti SC', 'STSong', 'Source Han Serif SC', serif";
    ctx.fillStyle = opt.color || "rgba(233,238,246,0.9)";
    ctx.textAlign = opt.align || "center";
    ctx.textBaseline = opt.baseline || "middle";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /* 缓动 */
  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function lerp(a, b, k) {
    return a + (b - a) * k;
  }

  /* 简单确定性随机 */
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  window.CanvasKit = {
    TAU: TAU,
    el: el,
    stage: stage,
    slider: slider,
    button: button,
    label: label,
    cn: cn,
    easeOutCubic: easeOutCubic,
    lerp: lerp,
    rng: rng,
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  window.DEVICES = window.DEVICES || {};
})();
