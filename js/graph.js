/* ============================================================
   graph.js — 概念图谱：力导向布局 + 交互
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = Math.PI * 2;

  // 冷色＝西方，暖色＝中国，同一传统内再分色相
  var COLORS = {
    laozi: "#e0a458",
    confucius: "#d9b25c",
    zhuangzi: "#c98a4f",
    wangyangming: "#e6c072",
    socrates: "#4fd1c5",
    plato: "#46b8c9",
    aristotle: "#6fcfd6",
    descartes: "#8fa8e0",
    kant: "#b48ee0",
    schopenhauer: "#8f7fd8",
    nietzsche: "#e07a9a",
    camus: "#c98fb0"
  };

  var EAST = { laozi: 1, confucius: 1, zhuangzi: 1, wangyangming: 1 };

  var wrapEl = document.querySelector(".canvas-wrap");
  var cv = document.getElementById("graphCanvas");
  var ctx = cv.getContext("2d");
  var chipsEl = document.getElementById("chips");
  var panelEl = document.getElementById("panel");
  var statEl = document.getElementById("statLine");

  var W = 0, H = 0;
  var nodes = [], edges = [], idxOf = {};
  var phiName = {}, phiSchool = {}, phiYears = {}, phis = [];
  var order = [];        // 按出生年排序的哲学家 id
  var orderIdx = {};     // phi -> 在时间轴上的位次
  var tl = { pos: 1, v: 1, playing: false, last: 0 };
  var tlRange, tlOut, playBtn;

  var state = {
    hover: -1,
    sel: -1,
    drag: -1,
    dragMoved: 0,
    pointer: { x: 0, y: 0 },
    filter: null
  };

  function hexA(hex, a) {
    var h = hex.replace("#", "");
    return (
      "rgba(" +
      parseInt(h.slice(0, 2), 16) + "," +
      parseInt(h.slice(2, 4), 16) + "," +
      parseInt(h.slice(4, 6), 16) + "," + a + ")"
    );
  }

  /* ---------------- 尺寸 ---------------- */

  function resize(keep) {
    var r = wrapEl.getBoundingClientRect();
    var oldW = W, oldH = H;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(240, r.width);
    H = Math.max(220, r.height);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (keep && oldW && oldH) {
      var sx = W / oldW, sy = H / oldH;
      nodes.forEach(function (n) {
        n.x *= sx; n.y *= sy;
      });
    }
    nodes.forEach(function (n) {
      n.x = Math.max(40, Math.min(W - 40, n.x));
      n.y = Math.max(40, Math.min(H - 40, n.y));
    });
  }

  /* ---------------- 布局 ---------------- */

  function seed() {
    var rnd = K.rng(20260816);
    var anchors = {};
    phis.forEach(function (p, k) {
      var ang = (k / phis.length) * TAU - Math.PI / 2;
      anchors[p] = {
        x: W / 2 + Math.cos(ang) * W * 0.24,
        y: H / 2 + Math.sin(ang) * H * 0.26
      };
    });
    nodes.forEach(function (n) {
      var a = anchors[n.d.phi] || { x: W / 2, y: H / 2 };
      n.x = a.x + (rnd() - 0.5) * W * 0.22;
      n.y = a.y + (rnd() - 0.5) * H * 0.22;
      n.vx = 0;
      n.vy = 0;
    });
  }

  var REP = 2600;
  var SPRING = 0.013;
  var LEN = 96;

  function tuneFor(n) {
    var f = Math.max(0.6, n / 42);
    REP = 2600 * f;
    LEN = 96 * Math.sqrt(f);
  }
  var CENTER = 0.0022;
  var DAMP = 0.87;

  function step() {
    var i, j, n, m, dx, dy, d, d2, f, ux, uy;

    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        m = nodes[j];
        dx = m.x - n.x;
        dy = m.y - n.y;
        d2 = dx * dx + dy * dy;
        if (d2 < 1) d2 = 1;
        d = Math.sqrt(d2);
        ux = dx / d;
        uy = dy / d;
        f = REP / d2;
        var minD = n.r + m.r + 16;
        if (d < minD) f += (minD - d) * 0.55;
        n.vx -= ux * f;
        n.vy -= uy * f;
        m.vx += ux * f;
        m.vy += uy * f;
      }
    }

    for (i = 0; i < edges.length; i++) {
      var e = edges[i];
      n = nodes[e.a];
      m = nodes[e.b];
      dx = m.x - n.x;
      dy = m.y - n.y;
      d = Math.sqrt(dx * dx + dy * dy) || 1;
      var target = e.cross ? LEN * 1.45 : LEN;
      f = (d - target) * SPRING;
      ux = dx / d;
      uy = dy / d;
      n.vx += ux * f;
      n.vy += uy * f;
      m.vx -= ux * f;
      m.vy -= uy * f;
    }

    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      n.vx += (W / 2 - n.x) * CENTER;
      n.vy += (H / 2 - n.y) * CENTER;
      if (n.fixed) {
        n.vx = 0;
        n.vy = 0;
        continue;
      }
      n.vx *= DAMP;
      n.vy *= DAMP;
      var sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (sp > 14) {
        n.vx *= 14 / sp;
        n.vy *= 14 / sp;
      }
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 40) { n.x = 40; n.vx *= -0.4; }
      if (n.x > W - 46) { n.x = W - 46; n.vx *= -0.4; }
      if (n.y < 26) { n.y = 26; n.vy *= -0.4; }
      if (n.y > H - 44) { n.y = H - 44; n.vy *= -0.4; }
    }
  }

  /* ---------------- 时间轴 ---------------- */

  function litAmt(phi) {
    var i = orderIdx[phi];
    if (i == null) return 1;
    return Math.max(0, Math.min(1, tl.v - i));
  }

  function syncTlUi() {
    if (!tlRange) return;
    if (tl.pos >= order.length) {
      tlOut.textContent = "全部";
      tlRange.value = order.length;
    } else {
      var i = Math.max(0, Math.min(order.length - 1, Math.ceil(tl.pos) - 1));
      tlOut.textContent = phiName[order[i]] + " · " + phiYears[order[i]];
      tlRange.value = Math.max(1, Math.round(tl.pos));
    }
  }

  function stopPlay() {
    tl.playing = false;
    if (playBtn) playBtn.textContent = "▶ 沿时间播放";
  }

  function togglePlay() {
    if (tl.playing) {
      stopPlay();
      return;
    }
    if (tl.pos >= order.length) {
      tl.pos = 1;
      tl.v = 0.999;
    }
    tl.playing = true;
    if (playBtn) playBtn.textContent = "❚❚ 暂停";
  }

  /* ---------------- 绘制 ---------------- */

  function focusSet() {
    var f = state.drag >= 0 ? state.drag : state.hover >= 0 ? state.hover : state.sel;
    if (f < 0) return null;
    var s = {};
    s[f] = true;
    edges.forEach(function (e) {
      if (e.a === f) s[e.b] = true;
      if (e.b === f) s[e.a] = true;
    });
    return s;
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    var fs = focusSet();

    // 连线
    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      var a = nodes[e.a];
      var b = nodes[e.b];
      var la1 = litAmt(a.d.phi);
      var lb1 = litAmt(b.d.phi);
      var ea = Math.min(la1, lb1);
      if (ea < 0.03) continue;

      var dimFilter = state.filter && (a.d.phi !== state.filter && b.d.phi !== state.filter);
      var a1 = ea;
      if (dimFilter) a1 = 0.05;
      else if (fs) a1 = fs[e.a] && fs[e.b] ? ea : 0.12;

      // 刚被点亮的那条边闪一下
      var late = Math.max(orderIdx[a.d.phi] == null ? 0 : orderIdx[a.d.phi],
                          orderIdx[b.d.phi] == null ? 0 : orderIdx[b.d.phi]);
      var rec = Math.max(0, 1 - (tl.pos - late - 1));
      if (rec > 0.05 && !dimFilter) a1 = Math.min(1, a1 + rec * 0.7);

      var col = e.cross ? "#e0a458" : COLORS[a.d.phi];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.setLineDash(e.cross ? [3, 6] : []);
      ctx.strokeStyle = hexA(col, (e.cross ? 0.34 : 0.2) * a1);
      ctx.lineWidth = e.cross ? 1.2 : 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 节点
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var la = litAmt(n.d.phi);
      if (la < 0.02) continue;
      var dimmed = state.filter && n.d.phi !== state.filter;
      var inFocus = !fs || fs[k];
      var base = (dimmed ? 0.1 : inFocus ? 1 : 0.22) * la;
      var col2 = COLORS[n.d.phi];

      if (!dimmed && base > 0.5) {
        var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4.4);
        g.addColorStop(0, hexA(col2, 0.3 * base));
        g.addColorStop(1, hexA(col2, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4.4, 0, TAU);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (0.6 + 0.4 * la), 0, TAU);
      ctx.fillStyle = hexA(col2, (dimmed ? 0.35 : 0.92) * (inFocus ? 1 : 0.6) * (0.25 + 0.75 * la));
      ctx.fill();
      ctx.strokeStyle = "rgba(5,7,13,0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (state.sel === k || state.hover === k) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 4.5 + Math.sin(t * 3) * 1.2, 0, TAU);
        ctx.strokeStyle = hexA(col2, 0.75);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 标签
    var dense = nodes.length > 50;
    var fs2 = dense ? 8.5 : 9.5;
    ctx.font = fs2 + "px ui-monospace, 'SF Mono', Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var showAll = W >= 640;
    for (var q = 0; q < nodes.length; q++) {
      var m = nodes[q];
      var dim2 = state.filter && m.d.phi !== state.filter;
      var foc = !fs || fs[q];
      if (dim2 || litAmt(m.d.phi) < 0.15) continue;
      // 窄屏只显示主干节点，避免文字挤成一团
      var must = state.sel === q || state.hover === q || (fs && fs[q]);
      if (!must && !showAll && m.deg < 4) continue;
      var alpha = must ? 0.95 : foc ? (dense ? 0.62 : 0.86) : 0.22;
      ctx.save();
      ctx.shadowColor = "rgba(4,6,11,0.95)";
      ctx.shadowBlur = 6;
      ctx.fillStyle = "rgba(226,236,250," + alpha + ")";
      ctx.fillText(m.d.name, m.x, m.y + m.r + 11);
      ctx.restore();
    }

    // 时间轴进度线（姓名与年代在下方控制条里）
    if (tl.pos < order.length - 0.999) {
      var ci2 = Math.max(0, Math.min(order.length - 1, Math.ceil(tl.pos) - 1));
      var col3 = COLORS[order[ci2]] || "#4fd1c5";
      var pw = W - 52;
      ctx.beginPath();
      ctx.moveTo(26, H - 34);
      ctx.lineTo(26 + pw, H - 34);
      ctx.strokeStyle = "rgba(150,170,210,0.12)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(26, H - 34);
      ctx.lineTo(26 + pw * Math.min(1, tl.pos / order.length), H - 34);
      ctx.strokeStyle = hexA(col3, 0.75);
      ctx.stroke();
    }
  }

  /* ---------------- 面板 ---------------- */

  function panel(n) {
    var d = n.d;
    var col = COLORS[d.phi];
    var rel = d.links
      .map(function (id) {
        return (
          '<li><button type="button" data-id="' + id + '">' +
          nodes[idxOf[id]].d.name +
          "</button></li>"
        );
      })
      .join("");

    panelEl.innerHTML =
      '<div class="gp-phi" style="--c:' + col + '"><span class="dot-c"></span>' +
      phiName[d.phi] + " · " + phiSchool[d.phi] + "</div>" +
      "<h2>" + d.name + "</h2>" +
      '<p class="gp-en" style="--c:' + col + '">' + d.en + "</p>" +
      '<p class="gp-desc">' + d.desc + "</p>" +
      '<div class="gp-rel"><h4>关联 · LINKS</h4><ul>' + rel + "</ul></div>" +
      '<a class="gp-go" style="--c:' + col + '" href="philosopher.html?id=' +
      d.phi + '">在档案中查看 ' + phiName[d.phi] + " →</a>";

    Array.prototype.forEach.call(
      panelEl.querySelectorAll(".gp-rel button"),
      function (b) {
        b.addEventListener("click", function () {
          select(idxOf[b.dataset.id]);
        });
      }
    );
  }

  function select(i) {
    state.sel = i;
    if (i >= 0) panel(nodes[i]);
  }

  function defaultPanel() {
    var rows = phis
      .map(function (p) {
        var n = nodes.filter(function (x) { return x.d.phi === p; }).length;
        return (
          '<div class="gp-leg-row">' +
          '<span class="dot-c" style="--c:' + COLORS[p] + '"></span>' +
          '<span class="gp-leg-name">' + phiName[p] + "</span>" +
          '<span class="gp-leg-sub">' + phiSchool[p] + "</span>" +
          '<span class="gp-leg-count">' + n + "</span>" +
          "</div>"
        );
      })
      .join("");

    panelEl.innerHTML =
      '<p class="gp-empty">点一个节点，看它是什么。</p>' +
      '<div class="gp-legend">' + rows + "</div>" +
      '<p class="gp-note">实线是同一位哲学家内部的脉络；虚线是跨越传统的呼应——' +
      "「理念」通向「意志」，「齐物」通向「视角主义」，「坐忘」通向「意志的否定」。</p>";
  }

  /* ---------------- 交互 ---------------- */

  function hitTest(x, y) {
    var best = -1;
    var bd = 22 * 22;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var dx = n.x - x;
      var dy = n.y - y;
      var d2 = dx * dx + dy * dy;
      if (d2 < bd) {
        bd = d2;
        best = i;
      }
    }
    return best;
  }

  function localPos(e) {
    var r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  cv.addEventListener("pointerdown", function (e) {
    var p = localPos(e);
    var i = hitTest(p.x, p.y);
    state.dragMoved = 0;
    if (i >= 0) {
      state.drag = i;
      nodes[i].fixed = true;
      cv.classList.add("is-dragging");
      cv.setPointerCapture(e.pointerId);
    }
  });

  cv.addEventListener("pointermove", function (e) {
    var p = localPos(e);
    state.pointer = p;
    if (state.drag >= 0) {
      var n = nodes[state.drag];
      state.dragMoved += Math.abs(n.x - p.x) + Math.abs(n.y - p.y);
      n.x = Math.max(24, Math.min(W - 24, p.x));
      n.y = Math.max(24, Math.min(H - 24, p.y));
      n.vx = 0;
      n.vy = 0;
      return;
    }
    var h = hitTest(p.x, p.y);
    if (h !== state.hover) {
      state.hover = h;
      cv.style.cursor = h >= 0 ? "pointer" : "grab";
    }
  });

  function endDrag() {
    if (state.drag >= 0) {
      var i = state.drag;
      nodes[i].fixed = false;
      state.drag = -1;
      cv.classList.remove("is-dragging");
      if (state.dragMoved < 6) select(i);
    }
  }

  cv.addEventListener("pointerup", endDrag);
  cv.addEventListener("pointercancel", endDrag);
  cv.addEventListener("pointerleave", function () {
    if (state.drag < 0) state.hover = -1;
  });

  document.getElementById("resetLayout").addEventListener("click", function () {
    seed();
    for (var i = 0; i < 160; i++) step();
  });

  /* ---------------- 筛选 ---------------- */

  function buildChips() {
    var all = document.createElement("button");
    all.className = "chip-btn is-on";
    all.type = "button";
    all.textContent = "全部";
    all.style.setProperty("--c", "#4fd1c5");
    all.addEventListener("click", function () {
      state.filter = null;
      syncChips(null);
    });
    chipsEl.appendChild(all);

    phis.forEach(function (p) {
      var b = document.createElement("button");
      b.className = "chip-btn";
      b.type = "button";
      b.dataset.phi = p;
      b.style.setProperty("--c", COLORS[p]);
      b.innerHTML = '<span class="dot-c"></span>' + phiName[p];
      b.addEventListener("click", function () {
        state.filter = state.filter === p ? null : p;
        syncChips(state.filter);
        if (state.filter) {
          var first = nodes.filter(function (n) {
            return n.d.phi === state.filter;
          })[0];
          if (first) select(nodes.indexOf(first));
        }
      });
      chipsEl.appendChild(b);
    });
  }

  function syncChips(f) {
    var btns = chipsEl.querySelectorAll(".chip-btn");
    Array.prototype.forEach.call(btns, function (b) {
      var isAll = !b.dataset.phi;
      b.classList.toggle("is-on", isAll ? !f : b.dataset.phi === f);
    });
  }

  /* ---------------- 启动 ---------------- */

  fetch("data/philosophers.json")
    .then(function (r) {
      if (!r.ok) throw new Error("数据加载失败：" + r.status);
      return r.json();
    })
    .then(function (data) {
      phis = data.philosophers.map(function (p) {
        phiName[p.id] = p.name;
        phiSchool[p.id] = p.school;
        phiYears[p.id] = p.years;
        return p.id;
      });

      order = data.philosophers
        .slice()
        .sort(function (a2, b2) { return a2.born - b2.born; })
        .map(function (p) { return p.id; });
      order.forEach(function (id, i) { orderIdx[id] = i; });
      tl.pos = order.length;
      tl.v = tl.pos;

      data.concepts.forEach(function (c, i) {
        idxOf[c.id] = i;
      });

      var deg = {};
      data.concepts.forEach(function (c, i) {
        deg[i] = 0;
      });

      var seen = {};
      data.concepts.forEach(function (c, i) {
        c.links.forEach(function (t) {
          var j = idxOf[t];
          if (j == null || j === i) return;
          var key = i < j ? i + "-" + j : j + "-" + i;
          if (seen[key]) return;
          seen[key] = true;
          deg[i]++;
          deg[j]++;
          edges.push({
            a: i,
            b: j,
            cross: !!EAST[data.concepts[i].phi] !== !!EAST[data.concepts[j].phi]
          });
        });
      });

      nodes = data.concepts.map(function (c, i) {
        return {
          d: c,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          fixed: false,
          deg: deg[i],
          r: Math.min(9, 3.4 + deg[i] * 0.62)
        };
      });

      var cross = edges.filter(function (e) { return e.cross; }).length;
      if (statEl) {
        statEl.textContent =
          nodes.length + " 个概念、" + edges.length + " 条连线（其中 " + cross + " 条跨传统）";
      }

      tuneFor(nodes.length);
      buildChips();
      defaultPanel();
      resize(false);
      seed();
      for (var s = 0; s < 220; s++) step();

      tlRange = document.getElementById("tlRange");
      tlOut = document.getElementById("tlOut");
      playBtn = document.getElementById("playBtn");

      if (tlRange) {
        tlRange.min = 1;
        tlRange.max = order.length;
        tlRange.value = order.length;
        tlRange.addEventListener("input", function () {
          stopPlay();
          tl.pos = Number(tlRange.value);
          syncTlUi();
        });
      }
      if (playBtn) {
        playBtn.addEventListener("click", togglePlay);
      }

      var raf;
      function loop(now) {
        if (!tl.last) tl.last = now;
        var dt = Math.min(0.06, Math.max(0, (now - tl.last) / 1000));
        tl.last = now;

        if (tl.playing) {
          tl.pos += dt * 1.4;
          if (tl.pos >= order.length) {
            tl.pos = order.length;
            stopPlay();
          }
          syncTlUi();
        }
        tl.v += (tl.pos - tl.v) * 0.14;

        step();
        step();
        draw(now / 1000);
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);

      var rt = 0;
      window.addEventListener(
        "resize",
        function () {
          clearTimeout(rt);
          rt = setTimeout(function () { resize(true); }, 160);
        },
        { passive: true }
      );

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          cancelAnimationFrame(raf);
        } else {
          cancelAnimationFrame(raf);
          tl.last = 0;
          raf = requestAnimationFrame(loop);
        }
      });
    })
    .catch(function (err) {
      panelEl.innerHTML =
        '<p class="gp-empty" style="color:#e0a458">图谱加载失败：' +
        err.message +
        "（请通过 http 服务打开）</p>";
    });
})();
