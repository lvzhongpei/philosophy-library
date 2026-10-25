/* ============================================================
   device: 黑格尔 · 正反合
   合题不是折中，是把前两步都保留下来、又都否掉
   ============================================================ */
(function () {
  "use strict";

  var K = window.CanvasKit;
  var TAU = K.TAU;

  var TRIADS = [
    { t: ["存在", "无", "变"], note: ["纯粹的存在，没有任何规定", "抽掉一切规定，它就什么也不是", "存在与无互相过渡——这就是生成"] },
    { t: ["主", "奴", "自我意识"], note: ["要求被承认的意识", "怕死而屈服，却在劳动中对象化自己", "意识在奴隶这一边真正回到了自身"] },
    { t: ["抽象法", "道德", "伦理"], note: ["只讲权利与契约", "只讲内心意图", "在家庭、市民社会、国家里才落地"] },
    { t: ["自在", "自为", "自在自为"], note: ["潜在的", "展开并对自身有了意识", "两者合一——概念的运动到此完成"] }
  ];

  window.DEVICES["hegel-dialectic"] = function (o) {
    var st = { step: 0, gi: 0 };

    o.controls.appendChild(
      K.button("推进 →", function (b) {
        st.step = (st.step + 1) % 3;
        b.textContent = st.step === 0 ? "推进 →" : "推进 →";
      })
    );
    o.controls.appendChild(
      K.button("换一组", function () { st.gi = (st.gi + 1) % TRIADS.length; st.step = 0; }, "ghost")
    );

    K.stage(o.canvas, function (ctx, w, h, t) {
      var g = TRIADS[st.gi];
      var cx = w / 2;
      var y = h * 0.44;
      var spacing = Math.min(w * 0.24, 170);
      var xs = [cx - spacing, cx, cx + spacing];

      // 连线
      for (var i = 0; i < 2; i++) {
        var on = st.step >= i + 1;
        ctx.beginPath();
        ctx.moveTo(xs[i] + 34, y);
        ctx.lineTo(xs[i + 1] - 34, y);
        ctx.strokeStyle = on
          ? "rgba(224,164,88,0.7)"
          : "rgba(150,170,210,0.15)";
        ctx.lineWidth = on ? 1.6 : 1;
        ctx.setLineDash(on ? [] : [3, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
        if (on) {
          ctx.beginPath();
          ctx.arc((xs[i] + xs[i + 1]) / 2, y, 2.4, 0, TAU);
          ctx.fillStyle = "rgba(224,164,88,0.8)";
          ctx.fill();
        }
      }

      // 三个环节
      ["正", "反", "合"].forEach(function (lab, i) {
        var active = i <= st.step;
        var isNow = i === st.step;
        var pulse = K.reduced ? 1 : 0.75 + 0.25 * Math.sin(t * 2.4);

        ctx.beginPath();
        ctx.arc(xs[i], y, isNow ? 34 : 30, 0, TAU);
        ctx.fillStyle = active
          ? "rgba(224,164,88," + (isNow ? 0.16 * pulse + 0.06 : 0.05) + ")"
          : "rgba(255,255,255,0.012)";
        ctx.fill();
        ctx.strokeStyle = active
          ? "rgba(224,164,88," + (isNow ? 0.9 : 0.45) + ")"
          : "rgba(150,170,210,0.18)";
        ctx.lineWidth = isNow ? 1.8 : 1;
        ctx.stroke();

        K.label(ctx, lab, xs[i], y - 50, {
          size: 8.5, align: "center", spacing: 2,
          color: active ? "rgba(224,164,88,0.7)" : "rgba(150,170,210,0.25)"
        });
        K.cn(ctx, g.t[i], xs[i], y, {
          size: g.t[i].length > 3 ? 13 : 16,
          color: active ? "rgba(240,246,255," + (isNow ? 0.95 : 0.6) + ")" : "rgba(150,170,210,0.25)"
        });
      });

      // 说明
      K.label(ctx, "DIALEKTIK · " + g.t[st.step], 20, 26, {
        size: 9, spacing: 1.6, color: "rgba(150,170,210,0.42)"
      });
      K.label(ctx, ["第 1 / 3 环节", "第 2 / 3 环节", "第 3 / 3 环节"][st.step], w - 20, 26, {
        size: 9, align: "right", spacing: 1.4, color: "rgba(150,170,210,0.45)"
      });

      var msg = g.note[st.step];
      if (st.step === 2) msg += "　—— 这个「合」还不是终点，它自己也会再分裂。";
      K.cn(ctx, msg, w * 0.5, h - 46, {
        size: 12.5, halo: 10, color: "rgba(150,170,210,0.65)"
      });
      K.cn(ctx, "扬弃 = 取消 + 保存 + 提升", w * 0.5, h - 22, {
        size: 11, color: "rgba(224,164,88,0.55)"
      });
    });
  };
})();
