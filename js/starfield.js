/* ============================================================
   starfield.js — 全站背景星尘
   极慢漂移 + 呼吸式明暗，不做视差抖动，避免抢戏
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("stars");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stars = [];
  var w = 0;
  var h = 0;
  var dpr = 1;

  function seeded(i) {
    var x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function build() {
    var area = w * h;
    var count = Math.max(90, Math.min(520, Math.round(area / 5200)));
    stars = [];
    for (var i = 0; i < count; i++) {
      var r = seeded(i + 1);
      var g = seeded(i + 91);
      var b = seeded(i + 271);
      var c = seeded(i + 733);
      stars.push({
        x: r * w,
        y: g * h,
        r: 0.35 + b * b * 1.5,
        a: 0.18 + c * 0.62,
        ph: c * Math.PI * 2,
        sp: 0.25 + r * 0.85,
        hue: c > 0.93 ? "warm" : c < 0.06 ? "cool" : "plain"
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (reduced) draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var pulse = reduced ? 1 : 0.62 + 0.38 * Math.sin(t * s.sp + s.ph);
      var alpha = s.a * pulse;
      var x = s.x + (reduced ? 0 : Math.sin(t * 0.06 + s.ph) * 3.2);
      var y = s.y + (reduced ? 0 : Math.cos(t * 0.05 + s.ph * 1.3) * 2.6);

      if (s.hue === "warm") ctx.fillStyle = "rgba(224,164,88," + alpha + ")";
      else if (s.hue === "cool") ctx.fillStyle = "rgba(79,209,197," + alpha + ")";
      else ctx.fillStyle = "rgba(226,236,255," + alpha + ")";

      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (s.r > 1.15) {
        ctx.fillStyle =
          s.hue === "warm"
            ? "rgba(224,164,88," + alpha * 0.14 + ")"
            : "rgba(200,225,255," + alpha * 0.12 + ")";
        ctx.beginPath();
        ctx.arc(x, y, s.r * 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  var raf = 0;
  var t0 = 0;

  function loop(now) {
    if (!t0) t0 = now;
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  if (!reduced) raf = requestAnimationFrame(loop);

  document.addEventListener("visibilitychange", function () {
    if (reduced) return;
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      raf = requestAnimationFrame(loop);
    }
  });
})();
