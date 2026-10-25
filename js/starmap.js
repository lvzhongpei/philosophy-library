/* ============================================================
   starmap.js — 首页：星团布局、轨道、年代筛选、视图切换
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mapWrap = document.getElementById("mapWrap");
  var mapCanvas = document.getElementById("mapCanvas");
  var labels = document.getElementById("mapLabels");
  var cardsEl = document.getElementById("cards");
  var slider = document.getElementById("eraSlider");
  var eraOut = document.getElementById("eraOut");
  var searchEl = document.getElementById("search");
  var data = null;
  var nodes = [];
  var links = [];
  var clusters = [];

  function yearText(y) {
    return y < 0 ? "前 " + -y : String(y);
  }

  function load() {
    return fetch("data/philosophers.json").then(function (r) {
      if (!r.ok) throw new Error("数据加载失败：" + r.status);
      return r.json();
    });
  }

  /* ---------------- 星图构建 ---------------- */

  function buildMap() {
    var cw = Math.max(1, mapWrap.clientWidth);
    var ch = Math.max(1, mapWrap.clientHeight);
    var narrow = cw < 720;
    var ps = data.philosophers;

    // 把手工坐标归一化后铺满画布，避免大片空白
    var xs = ps.map(function (p) { return p.x; });
    var ys = ps.map(function (p) { return p.y; });
    var minX = Math.min.apply(null, xs);
    var maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys);
    var maxY = Math.max.apply(null, ys);

    var X0 = narrow ? 0.16 : 0.1;
    var X1 = narrow ? 0.84 : 0.9;
    var Y0 = narrow ? 0.11 : 0.2;
    var Y1 = narrow ? 0.88 : 0.78;

    function px(x) {
      var k = maxX === minX ? 0.5 : (x - minX) / (maxX - minX);
      return (X0 + k * (X1 - X0)) * cw;
    }

    function py(y) {
      var k = maxY === minY ? 0.5 : (y - minY) / (maxY - minY);
      return (Y0 + k * (Y1 - Y0)) * ch;
    }

    // 窄屏：按年代排成三列网格，避免十二颗星挤成一条线
    var grid = null;
    if (narrow) {
      grid = {};
      var order = ps.slice().sort(function (a, b) { return a.x - b.x; });
      var cols = order.length > 6 ? 3 : 2;
      var rows = Math.ceil(order.length / cols);
      order.forEach(function (p, i) {
        var c = i % cols;
        var r = Math.floor(i / cols);
        grid[p.id] = {
          x: (cols === 3 ? 0.2 + c * 0.3 : 0.28 + c * 0.44) * cw,
          y: (rows > 1 ? 0.12 + r * (0.76 / (rows - 1)) : 0.5) * ch
        };
      });
    }

    function nodePos(p) {
      if (grid) return grid[p.id];
      return { x: px(p.x), y: py(p.y) };
    }

    labels.innerHTML = "";

    nodes = ps.map(function (p) {
      var el = document.createElement("a");
      el.className = "node";
      el.href = "philosopher.html?id=" + p.id;
      var np = nodePos(p);
      el.style.left = (np.x / cw) * 100 + "%";
      el.style.top = (np.y / ch) * 100 + "%";
      el.style.setProperty("--nc", p.color);
      el.setAttribute("aria-label", p.name + "，" + p.years + "，进入");

      var core = document.createElement("span");
      core.className = "node-core";

      var label = document.createElement("span");
      label.className = "node-label";
      label.innerHTML =
        '<span class="node-cn">' + p.name + "</span>" +
        '<span class="node-yr">' + p.years + "</span>";

      el.appendChild(core);
      el.appendChild(label);
      labels.appendChild(el);

      return {
        d: p,
        el: el,
        x: np.x,
        y: np.y,
        dim: false
      };
    });

    // 星团质心与半径
    clusters = data.clusters.map(function (c) {
      var members = nodes.filter(function (n) {
        return n.d.cluster === c.id;
      });
      var cx = 0;
      var cy = 0;
      members.forEach(function (m) {
        cx += m.x;
        cy += m.y;
      });
      cx /= members.length || 1;
      cy /= members.length || 1;
      var r = 0;
      members.forEach(function (m) {
        r = Math.max(r, Math.hypot(m.x - cx, m.y - cy));
      });
      r = Math.max(narrow ? 52 : 58, Math.min(narrow ? 84 : 108, r + (narrow ? 30 : 40)));


      return { d: c, cx: cx, cy: cy, r: r };
    });

    // 连线
    links = (data.links || [])
      .map(function (l) {
        var a = nodes.filter(function (n) { return n.d.id === l.a; })[0];
        var b = nodes.filter(function (n) { return n.d.id === l.b; })[0];
        if (!a || !b) return null;

        return { a: a, b: b, style: l.style || "solid" };
      })
      .filter(Boolean);
  }

  /* ---------------- 星图画布 ---------------- */

  var ctx = mapCanvas.getContext("2d");
  var W = 0;
  var H = 0;

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = mapWrap.clientWidth;
    H = mapWrap.clientHeight;
    mapCanvas.width = Math.round(W * dpr);
    mapCanvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // 星团轨道环（窄屏为网格布局，不画环）
    if (W >= 720) clusters.forEach(function (c, ci) {
      var breathe = reduced ? 0 : Math.sin(t * 0.35 + ci * 2.1) * 4;
      ctx.save();
      ctx.translate(c.cx, c.cy);
      ctx.rotate(reduced ? 0 : t * 0.016 * (ci % 2 ? -1 : 1));

      ctx.beginPath();
      ctx.ellipse(0, 0, c.r + breathe, (c.r + breathe) * 0.5, 0, 0, Math.PI * 2);
      ctx.setLineDash([2, 7]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(150,170,210,0.17)";
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, c.r * 0.6 + breathe, c.r * 0.3 + breathe * 0.5, 0, 0, Math.PI * 2);
      ctx.setLineDash([1, 11]);
      ctx.strokeStyle = "rgba(150,170,210,0.1)";
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    // 连线
    links.forEach(function (l, i) {
      if (l.a.dim || l.b.dim) return;
      var grad = ctx.createLinearGradient(l.a.x, l.a.y, l.b.x, l.b.y);
      grad.addColorStop(0, "rgba(79,209,197,0.1)");
      grad.addColorStop(0.5, "rgba(200,220,255,0.28)");
      grad.addColorStop(1, "rgba(224,164,88,0.12)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.setLineDash(l.style === "dashed" ? [3, 9] : [1, 6]);
      ctx.lineDashOffset = reduced ? 0 : -t * 8 - i * 4;
      ctx.beginPath();
      ctx.moveTo(l.a.x, l.a.y);
      ctx.lineTo(l.b.x, l.b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (!reduced) {
        var p = (t * 0.13 + i * 0.37) % 1;
        var px2 = l.a.x + (l.b.x - l.a.x) * p;
        var py2 = l.a.y + (l.b.y - l.a.y) * p;
        ctx.beginPath();
        ctx.arc(px2, py2, 1.7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(225,238,255,0.6)";
        ctx.fill();
      }
    });

    // 每颗星的光晕
    nodes.forEach(function (n, i) {
      var base = n.dim ? 0.05 : 0.62;
      var pulse = reduced ? 1 : 0.78 + 0.22 * Math.sin(t * 1.1 + i * 1.7);
      var R = 64;
      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, R);
      g.addColorStop(0, hexA(n.d.color, base * pulse * 0.55));
      g.addColorStop(0.22, hexA(n.d.color, base * pulse * 0.16));
      g.addColorStop(0.6, hexA(n.d.color, base * pulse * 0.04));
      g.addColorStop(1, hexA(n.d.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
      ctx.fill();
    });

    // 仪器框角标
    var m = 18;
    var L = 14;
    ctx.strokeStyle = "rgba(150,170,210,0.24)";
    ctx.lineWidth = 1;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(
      function (c) {
        ctx.beginPath();
        ctx.moveTo(c[0] + L * c[2], c[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.lineTo(c[0], c[1] + L * c[3]);
        ctx.stroke();
      }
    );

    // 底部扫描线（窄屏省略，避免与星体标注拥挤）
    var sy = H - 30;
    if (W >= 720) {
      ctx.beginPath();
      ctx.moveTo(44, sy);
      ctx.lineTo(W - 44, sy);
      ctx.strokeStyle = "rgba(150,170,210,0.12)";
      ctx.stroke();

      if (!reduced) {
        var sp = ((t * 0.09) % 1.2) - 0.1;
        var sx = 44 + (W - 88) * sp;
        var sg = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0);
        sg.addColorStop(0, "rgba(79,209,197,0)");
        sg.addColorStop(0.5, "rgba(79,209,197,0.5)");
        sg.addColorStop(1, "rgba(79,209,197,0)");
        ctx.strokeStyle = sg;
        ctx.beginPath();
        ctx.moveTo(Math.max(44, sx - 90), sy);
        ctx.lineTo(Math.min(W - 44, sx + 90), sy);
        ctx.stroke();
      }

      var pad3 = function (n) { return (n < 10 ? "0" : "") + n; };
      label(ctx, "SECTOR 01 — " + pad3(nodes.length) + " · PRE-QIN → MODERN", 44, sy - 12, {
        size: 9,
        spacing: 1.6,
        color: "rgba(150,170,210,0.35)"
      });
      var dimN = nodes.filter(function (n) {
        return n.dim;
      }).length;
      var rightTxt = dimN
        ? "已滤除 " + dimN + " 位"
        : clusters
            .map(function (c) { return c.d.name; })
            .join(" · ");
      label(ctx, rightTxt, W - 44, sy - 12, {
        size: 8.5,
        spacing: 1.2,
        align: "right",
        color: "rgba(150,170,210,0.33)"
      });
    }
  }

  function label(c, text, x, y, opt) {
    c.save();
    c.font = (opt.size || 10) + "px ui-monospace, 'SF Mono', Menlo, monospace";
    c.fillStyle = opt.color || "rgba(150,170,210,0.5)";
    c.textAlign = opt.align || "left";
    if (opt.spacing) {
      var chars = String(text).split("");
      var widths = chars.map(function (ch) {
        return c.measureText(ch).width + opt.spacing;
      });
      var total = widths.reduce(function (a, b) { return a + b; }, 0) - opt.spacing;
      var sx = x;
      if (opt.align === "center") sx = x - total / 2;
      if (opt.align === "right") sx = x - total;
      chars.forEach(function (ch, i) {
        c.fillText(ch, sx, y);
        sx += widths[i];
      });
    } else {
      c.fillText(text, x, y);
    }
    c.restore();
  }

  function hexA(hex, a) {
    var h = hex.replace("#", "");
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  var raf = 0;
  var t0 = 0;

  function loop(now) {
    if (!t0) t0 = now;
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  }

  /* ---------------- 年代筛选 ---------------- */

  function applyEra() {
    var v = Number(slider.value);
    var max = Number(slider.max);
    nodes.forEach(function (n) {
      var hide = n.d.born > v;
      n.dim = hide;
      n.el.classList.toggle("is-dim", hide);
    });
    eraOut.textContent = v >= max ? "— 全部 —" : "≤ " + yearText(v);
  }

  /* ---------------- 名录 ---------------- */

  function buildCards() {
    cardsEl.innerHTML = "";
    data.philosophers.forEach(function (p, i) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "card";
      a.href = "philosopher.html?id=" + p.id;
      a.style.setProperty("--nc", p.color);
      a.dataset.key = (
        p.name + p.en + p.orig + p.school + p.schoolEn + p.years + p.oneLine +
        p.ideas.map(function (x) { return x.title + x.brief + x.detail; }).join("") +
        p.works.map(function (x) { return x.title + x.orig; }).join("") +
        p.quotes.map(function (x) { return x.cn; }).join("")
      ).toLowerCase();

      a.innerHTML =
        '<span class="card-idx">' + (i < 9 ? "0" : "") + (i + 1) +
        " / " + (data.philosophers.length < 10 ? "0" : "") + data.philosophers.length +
        " · " + p.era + "</span>" +
        "<h2>" + p.name + "</h2>" +
        '<span class="c-orig">' + p.en.toUpperCase() + "</span>" +
        '<p class="c-line">' + p.oneLine + "</p>" +
        '<span class="c-foot"><span class="c-school">' + p.school + "</span>" +
        "<span>" + p.years + "</span>" +
        '<span class="c-go">进入 →</span></span>';

      li.appendChild(a);
      cardsEl.appendChild(li);
    });
  }

  function filterCards(q) {
    q = (q || "").trim().toLowerCase();
    var shown = 0;
    Array.prototype.forEach.call(cardsEl.children, function (li) {
      var a = li.firstChild;
      var ok = !q || a.dataset.key.indexOf(q) > -1;
      li.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    var empty = document.getElementById("noResult");
    if (empty) empty.style.display = shown ? "none" : "block";
  }

  /* ---------------- 视图切换 ---------------- */

  function bindViewSwitch() {
    var btns = document.querySelectorAll(".viewswitch button");
    var views = {
      map: document.getElementById("view-map"),
      list: document.getElementById("view-list")
    };

    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener("click", function () {
        var v = b.dataset.view;
        Array.prototype.forEach.call(btns, function (x) {
          x.classList.toggle("is-on", x === b);
          x.setAttribute("aria-selected", x === b ? "true" : "false");
        });
        Object.keys(views).forEach(function (k) {
          views[k].classList.toggle("is-on", k === v);
        });

        if (v === "map") {
          sizeCanvas();
          buildMap();
          applyEra();
          history.replaceState(null, "", location.pathname + "#map");
        } else {
          history.replaceState(null, "", location.pathname + "#list");
          if (searchEl) searchEl.focus({ preventScroll: true });
        }
      });
    });

    if (location.hash === "#list") {
      document.querySelector('.viewswitch button[data-view="list"]').click();
    }
  }

  /* ---------------- 启动 ---------------- */

  load()
    .then(function (d) {
      data = d;
      buildMap();
      sizeCanvas();
      buildCards();
      applyEra();

      slider.addEventListener("input", applyEra);
      if (searchEl) {
        searchEl.addEventListener("input", function () {
          filterCards(searchEl.value);
        });
      }

      bindViewSwitch();

      if (!reduced) raf = requestAnimationFrame(loop);
      else draw(0);

      var rt = 0;
      window.addEventListener(
        "resize",
        function () {
          clearTimeout(rt);
          rt = setTimeout(function () {
            buildMap();
            sizeCanvas();
            applyEra();
            if (reduced) draw(0);
          }, 160);
        },
        { passive: true }
      );
    })
    .catch(function (err) {
      var p = document.createElement("p");
      p.style.cssText =
        "padding:60px var(--gutter);color:#e0a458;font-family:var(--mono);font-size:13px";
      p.textContent =
        "星图加载失败：" + err.message + "（请通过 http 服务打开，而非 file://）";
      mapWrap.appendChild(p);
    });
})();
