/* ============================================================
   render.js — 详情页渲染
   ============================================================ */
(function () {
  "use strict";

  var SECTIONS = [
    { id: "bio", n: "01", cn: "生平", en: "LIFE" },
    { id: "position", n: "02", cn: "流派定位", en: "POSITION" },
    { id: "ideas", n: "03", cn: "核心观点", en: "IDEAS" },
    { id: "works", n: "04", cn: "代表著作", en: "WORKS" },
    { id: "device", n: "05", cn: "思想实验", en: "EXPERIMENT" },
    { id: "quotes", n: "06", cn: "名言", en: "QUOTES" },
    { id: "asks", n: "07", cn: "追问", en: "QUESTIONS" }
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function secHead(n, cn, en) {
    return (
      '<div class="sec-head">' +
      '<span class="sec-num">' +
      n +
      "</span>" +
      '<h2 class="sec-title">' +
      cn +
      "</h2>" +
      '<span class="sec-en">' +
      en +
      "</span>" +
      "</div>"
    );
  }

  function section(id, inner) {
    var s = SECTIONS.filter(function (x) {
      return x.id === id;
    })[0];
    var el = document.createElement("section");
    el.className = "sec reveal";
    el.id = id;
    el.innerHTML = secHead(s.n, s.cn, s.en) + inner;
    return el;
  }

  function getParam(k) {
    return new URLSearchParams(location.search).get(k);
  }

  fetch("data/philosophers.json")
    .then(function (r) {
      if (!r.ok) throw new Error("数据加载失败：" + r.status);
      return r.json();
    })
    .then(boot)
    .catch(function (e) {
      $("article").innerHTML =
        '<p style="color:#e0a458;font-family:var(--mono);font-size:13px;padding:40px 0">' +
        e.message +
        "（请通过 http 服务打开页面，而非直接双击 file://）</p>";
    });

  function boot(data) {
    var list = data.philosophers;
    var id = getParam("id") || list[0].id;
    var idx = list.findIndex(function (p) {
      return p.id === id;
    });
    if (idx < 0) idx = 0;
    var p = list[idx];

    document.title = p.name + " · 哲学图书馆";

    /* ---------------- 头部 ---------------- */
    $("heroMeta").innerHTML =
      "<span>0" + (idx + 1) + " / 06</span>" +
      '<span class="dot"></span><span>' + p.era + "</span>" +
      '<span class="dot"></span><span>' + p.years + "</span>" +
      '<span class="dot"></span><span style="color:' + p.color + '">' + p.school + "</span>";
    $("heroName").textContent = p.name;
    var sameName = p.orig.replace(/\s/g, "").toLowerCase() === p.en.replace(/\s/g, "").toLowerCase();
    $("heroOrig").textContent = sameName ? p.orig : p.orig + " · " + p.en.toUpperCase();
    $("heroLine").textContent = p.oneLine;

    /* ---------------- 侧栏 ---------------- */
    var nav = $("sideNav");
    SECTIONS.forEach(function (s) {
      var a = document.createElement("a");
      a.href = "#" + s.id;
      a.dataset.for = s.id;
      a.innerHTML = '<span class="n">' + s.n + "</span><span>" + s.cn + "</span>";
      nav.appendChild(a);
    });

    /* ---------------- 正文 ---------------- */
    var art = $("article");

    // 01 生平
    var tl = p.bio
      .map(function (b) {
        return (
          "<li><span class=\"y\">" + b.y + "</span><p>" + b.t + "</p></li>"
        );
      })
      .join("");
    art.appendChild(section("bio", '<ol class="timeline">' + tl + "</ol>"));

    // 02 流派
    var up = (p.positioning.upstream || [])
      .map(function (s) {
        return '<span class="chip up">' + s + "</span>";
      })
      .join("");
    var down = (p.positioning.downstream || [])
      .map(function (s) {
        return '<span class="chip down">' + s + "</span>";
      })
      .join("");
    art.appendChild(
      section(
        "position",
        '<p class="pos-text">' + p.positioning.text + "</p>" +
          '<div class="pos-map">' +
          "<div><h4>上游 · SOURCES</h4><div class=\"chip-row\">" + up + "</div></div>" +
          "<div><h4>下游 · LEGACY</h4><div class=\"chip-row\">" + down + "</div></div>" +
          "</div>"
      )
    );

    // 03 观点
    var ideas = p.ideas
      .map(function (i) {
        return (
          '<div class="idea">' +
          '<div class="idea-top"><h3>' + i.title + "</h3>" +
          (i.orig ? '<span class="orig">' + i.orig + "</span>" : "") +
          "</div>" +
          '<p class="brief">' + i.brief + "</p>" +
          '<p class="detail">' + i.detail + "</p>" +
          "</div>"
        );
      })
      .join("");
    art.appendChild(
      section("ideas", '<div class="idea-list">' + ideas + "</div>")
    );

    // 04 著作
    var works = p.works
      .map(function (w) {
        return (
          "<li>" +
          '<div class="w-top"><span class="w-title">' + w.title + "</span>" +
          '<span class="w-orig">' + w.orig + "</span>" +
          '<span class="w-year">' + w.year + "</span></div>" +
          '<p class="w-gist">' + w.gist + "</p>" +
          "</li>"
        );
      })
      .join("");
    art.appendChild(section("works", '<ul class="works">' + works + "</ul>"));

    // 05 装置（两个）
    function panel(i, title, desc, hint) {
      return (
        '<div class="device">' +
        '<div class="device-head"><h3>' + title + "</h3>" +
        '<span class="tag">装置 ' + (i === 1 ? "一" : "二") + " · INTERACTIVE</span></div>" +
        '<p class="device-desc">' + desc + "</p>" +
        '<div class="stage-wrap"><canvas id="deviceCanvas' + i +
        '" aria-label="' + title + '"></canvas></div>' +
        '<div class="controls" id="deviceControls' + i + '"></div>' +
        '<p class="device-hint">' + hint + "</p>" +
        "</div>"
      );
    }

    var devEl = section(
      "device",
      '<div class="devices">' +
        panel(1, p.deviceTitle, p.deviceDesc, p.deviceHint) +
        panel(2, p.device2Title, p.device2Desc, p.device2Hint) +
        "</div>"
    );
    art.appendChild(devEl);

    // 06 名言
    var quotes = p.quotes
      .map(function (q) {
        return (
          '<div class="quote">' +
          '<p class="cn">' + q.cn + "</p>" +
          (q.orig ? '<p class="orig">' + q.orig + "</p>" : "") +
          '<p class="src">' + q.src + "</p>" +
          (q.note ? '<p class="note">' + q.note + "</p>" : "") +
          "</div>"
        );
      })
      .join("");
    art.appendChild(section("quotes", quotes));

    // 07 追问
    var asks = p.questions
      .map(function (q) {
        return "<li>" + q + "</li>";
      })
      .join("");
    art.appendChild(section("asks", '<ol class="asks">' + asks + "</ol>"));

    /* ---------------- 装置挂载 ---------------- */
    [[1, p.device], [2, p.device2]].forEach(function (pair) {
      var idx = pair[0];
      var key = pair[1];
      var canvas = $("deviceCanvas" + idx);
      var controls = $("deviceControls" + idx);
      var mount = window.DEVICES && window.DEVICES[key];
      if (!canvas || !controls) return;
      if (!mount) {
        controls.innerHTML =
          '<span style="color:#e0a458;font-family:var(--mono);font-size:11px">未找到装置：' +
          key +
          "</span>";
        return;
      }
      try {
        mount({ canvas: canvas, controls: controls });
      } catch (err) {
        controls.innerHTML =
          '<span style="color:#e0a458;font-family:var(--mono);font-size:11px">装置初始化失败：' +
          err.message +
          "</span>";
      }
    });

    /* ---------------- 上下篇 ---------------- */
    var prev = list[(idx - 1 + list.length) % list.length];
    var next = list[(idx + 1) % list.length];
    $("pager").innerHTML =
      '<a href="philosopher.html?id=' + prev.id + '">' +
      '<span class="p-dir">← PREV</span><span class="p-name">' + prev.name + "</span></a>" +
      '<a href="philosopher.html?id=' + next.id + '">' +
      '<span class="p-dir">NEXT →</span><span class="p-name">' + next.name + "</span></a>";

    /* ---------------- 滚动进场 ---------------- */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
      );
      document.querySelectorAll(".reveal").forEach(function (el) {
        io.observe(el);
      });

      // 侧栏高亮
      var links = nav.querySelectorAll("a");
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            links.forEach(function (a) {
              a.classList.toggle("is-on", a.dataset.for === en.target.id);
            });
          });
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      document.querySelectorAll(".sec").forEach(function (s) {
        spy.observe(s);
      });
    } else {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("in");
      });
    }
  }
})();
