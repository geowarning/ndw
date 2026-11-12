/* ================================================================
 * views/products.js —— 产品目录（互动游戏原型）视图
 * 通过 window.NDViews.products(ctx) 注册，由 app.js 传入依赖。
 * ================================================================ */
(function () {
  window.NDViews = window.NDViews || {};

  window.NDViews.products = function (ctx) {
    var state = ctx.state;
    var esc = ctx.esc;
    var T = ctx.T;

    function renderGameView() {
      var t = T();
      var g = state.game;
      var name = g === 'aqua' ? t.gameAquaName : t.gamePyroName;
      var how = g === 'aqua' ? t.gameAquaHow : t.gamePyroHow;
      ctx.viewEl.innerHTML =
        '<section class="section"><div class="container">' +
          '<button class="btn btn-outline" data-action="back-products">' + esc(t.backToProducts) + '</button>' +
          '<div class="game-frame">' +
            '<div class="game-title"><h2>' + esc(name) + '</h2><p>' + esc(how) + '</p></div>' +
            '<div class="game-hud" id="gameHUD"></div>' +
            '<canvas id="gameCanvas" class="game-canvas"></canvas>' +
            '<button class="game-help-btn" id="gameHelpBtn" type="button" aria-label="' + esc(how) + '">?</button>' +
            '<div class="game-help-panel" id="gameHelpPanel">' +
              '<button class="game-help-close" id="gameHelpClose" type="button" aria-label="Close">×</button>' +
              '<div class="game-help-body">' + esc(how) + '</div>' +
            '</div>' +
          '</div>' +
        '</div></section>';
      ctx.setTitle(name);
      ctx.explainView();
      var helpBtn = document.getElementById('gameHelpBtn');
      var helpPanel = document.getElementById('gameHelpPanel');
      var helpClose = document.getElementById('gameHelpClose');
      if (helpBtn && helpPanel) {
        helpBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          helpPanel.hidden = !helpPanel.hidden;
        });
        helpPanel.addEventListener('click', function (e) { e.stopPropagation(); });
      }
      if (helpClose && helpPanel) {
        helpClose.addEventListener('click', function (e) {
          e.stopPropagation();
          helpPanel.hidden = true;
        });
      }
      var cv = document.getElementById('gameCanvas');
      if (window.NDGames && cv) {
        window.NDGames.start(cv, g, T());
      }
    }

    function render() {
      var t = T();
      if (state.game) {
        renderGameView();
        return;
      }
      var cards = [
        {
          type: 'aqua',
          name: t.gameAquaName,
          desc: t.gameAquaDesc,
          icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><circle cx="12" cy="14" r="2.2"/><path d="M3 20c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/></svg>'
        },
        {
          type: 'pyro',
          name: t.gamePyroName,
          desc: t.gamePyroDesc,
          icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3-2 4-2 7 0 1.5 1 2.5 2 3 0-2 1.5-3 2-5 .5 2 .5 4-1 6 1.5 0 3-1 3-3 0-2-2-3-2-5 0-1.5.5-2.5 1-3z"/><path d="M8 21h8"/></svg>'
        }
      ];
      var html =
        '<section class="section"><div class="container">' +
          '<div class="page-head">' +
            '<h1>' + esc(t.productsTitle) + '</h1>' +
            '<p>' + esc(t.productsSubtitle) + '</p>' +
          '</div>' +
          '<div class="product-grid">';
      cards.forEach(function (c) {
        html +=
          '<div class="product-card">' +
            '<div class="product-icon">' + c.icon + '</div>' +
            '<h3>' + esc(c.name) + '</h3>' +
            '<p>' + esc(c.desc) + '</p>' +
            '<button class="btn btn-green" data-action="open-game" data-type="' + c.type + '">' + esc(t.startDemo) + '</button>' +
          '</div>';
      });
      html += '</div></div></section>';
      ctx.viewEl.innerHTML = html;
      ctx.setTitle(t.productsTitle);
      ctx.explainView();
    }

    return { render: render };
  };
})();
