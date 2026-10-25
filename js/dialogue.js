/* ============================================================
   dialogue.js — 十组对话渲染
   ============================================================ */
(function () {
  "use strict";

  var EAST = { laozi: 1, confucius: 1, zhuangzi: 1, wangyangming: 1 };
  var listEl = document.getElementById("list");
  var tocEl = document.getElementById("toc");

  function colorOf(phi) {
    return EAST[phi] ? "#e0a458" : "#4fd1c5";
  }

  function sideHTML(side, tag) {
    var col = colorOf(side.phi);
    return (
      '<div class="dg-side" style="--tc:' + col + '">' +
      '<div class="dg-tag">' + tag + "</div>" +
      '<div class="dg-cn">' + side.cn + "</div>" +
      '<div class="dg-en">' + side.en + "</div>" +
      '<p class="dg-quote">' + side.quote + "</p>" +
      (side.orig ? '<p class="dg-orig">' + side.orig + "</p>" : "") +
      '<p class="dg-src">' + side.src + "</p>" +
      '<div class="dg-phi">' + side.phiName +
      ' · <a href="philosopher.html?id=' + side.phi + '">在档案中查看 →</a></div>' +
      "</div>"
    );
  }

  function render(data) {
    var items = data.items;

    tocEl.innerHTML = items
      .map(function (it) {
        return (
          '<a href="#' + it.id + '"><span class="n">' + it.n + "</span>" +
          it.title + "</a>"
        );
      })
      .join("");

    listEl.innerHTML = items
      .map(function (it) {
        var body = it.body
          .map(function (p) {
            return "<p>" + p + "</p>";
          })
          .join("");
        return (
          '<article class="dg" id="' + it.id + '">' +
          '<div class="dg-head"><span class="dg-n">' + it.n + "</span>" +
          "<h2>" + it.title + "</h2></div>" +
          '<div class="dg-pair">' +
          sideHTML(it.a, "甲") +
          '<div class="dg-vs">×</div>' +
          sideHTML(it.b, "乙") +
          "</div>" +
          '<div class="dg-body">' + body + "</div>" +
          '<p class="dg-ask">' + it.ask + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  fetch("data/dialogues.json")
    .then(function (r) {
      if (!r.ok) throw new Error("数据加载失败：" + r.status);
      return r.json();
    })
    .then(render)
    .catch(function (err) {
      listEl.innerHTML =
        '<p style="color:#e0a458;font-family:var(--mono);font-size:13px;padding:40px 0">' +
        err.message +
        "（请通过 http 服务打开页面，而非直接双击 file://）</p>";
    });
})();
