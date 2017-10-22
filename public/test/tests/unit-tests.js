'use strict';

const expect = require('chai').expect;

const app = require('../init.js');
const $orgs = app.$orgs;

const videoHeadHeight = $orgs['#videoHead'].getState().innerHeight;

function bgColorBelowViewportClosure(i) {
  return () => {
    const contentPaneOrg = $orgs['.main__content__pane'];

    // Act.
    contentPaneOrg.dispatchAction('setBoundingClientRect', {top: 1001}, i);
    app.actions.bgColorReveal();

    // Get Results.
    const contentPaneStateAfter = contentPaneOrg.getState(i);

    // Assert.
    expect(contentPaneStateAfter.style['background-color']).to.equal('transparent');
  };
}

function bgColorWithinViewportClosure(i, match) {
  return () => {
    const contentPaneOrg = $orgs['.main__content__pane'];

    // Act.
    contentPaneOrg.dispatchAction('setBoundingClientRect', {top: 500}, i);
    app.actions.bgColorReveal();

    // Get Results.
    const contentPaneStateAfter = contentPaneOrg.getState(i);

    // Assert.
    expect(contentPaneStateAfter.style['background-color']).to.include(match);
  };
}

function updateDimsTest(blocksCount, blocksOrg, blockHeight, panesCount, paneHeightsBefore) {
  before(function () {
    for (let i = 0; i < blocksCount; i++) {
      blocksOrg.dispatchAction('innerHeight', blockHeight, i);
    }

    app.actions.updateDims();
  });

  it('updates the height of pane 0 to the sum of the innerHeights of block 0 and block 1', function () {
    const paneHeight = $orgs['.main__content__pane'].getState(0).style.height;

    expect(paneHeight).to.equal(`${blockHeight * 2 / 10}rem`);

    if (paneHeightsBefore) {
      paneHeightsBefore[0] = paneHeight;
    }
  });

  for (let i = 1; i < panesCount; i++) {
    it(`updates the height of pane ${i} to the innerHeight of block ${i + 1}`, function () {
      const paneHeight = $orgs['.main__content__pane'].getState(i).style.height;

      expect(paneHeight).to.equal(`${blockHeight / 10}rem`);

      if (paneHeightsBefore) {
        paneHeightsBefore[i] = paneHeight;
      }
    });
  }
}

describe('Fepper website', function () {
  describe('bgColorReveal', function () {
    for (let i = 1; i <= 5; i += 2) {
      it(
        `removes background-color from .main__content__pane[${i}] when it is scrolled below viewport`,
        bgColorBelowViewportClosure(i)
      );
    }

    it(
      'adds background-color to .main__content__pane[1] when it is scrolled within viewport',
      bgColorWithinViewportClosure(1, 'rgba(2, 125, 21')
    );
    it(
      'adds background-color to .main__content__pane[3] when it is scrolled within viewport',
      bgColorWithinViewportClosure(3, 'rgba(240, 192, 0')
    );

    it(
      'adds background-color to .main__content__pane[5] when it is scrolled within viewport',
      bgColorWithinViewportClosure(5, 'rgba(208, 0, 0')
    );
  });

  describe('flagModulesEnabled', function () {
    let htmlClassesBefore;

    // Prep.
    before(function () {
      htmlClassesBefore = $orgs['#html'].getState().attribs.class;

      app.actions.flagModulesEnabled();
    });

    it('adds .es6-modules-enabled class to #html', function () {
      // Get results.
      const htmlClassesAfter = $orgs['#html'].getState().attribs.class;

      // Assert.
      expect(htmlClassesBefore).to.not.include('es6-modules-enabled');
      expect(htmlClassesAfter).to.include('es6-modules-enabled');
    });
  });

  describe('logoFix, when window is scrolled beyond #videoHeader,', function () {
    // Prep.
    before(function () {
      $orgs.window.scrollTop(videoHeadHeight + 1);
      app.actions.logoFix();
    });

    it('fixes #branding to top', function () {
      // Get results.
      const bodyClasses = $orgs['#body'].getState().attribs.class;

      // Assert.
      expect(bodyClasses).to.include('logo-fixed');
    });

    it('adds padding-top to #foundation and #mainContent', function () {
      // Get results.
      const foundationPaddingTop = $orgs['#foundation'].getState().style['padding-top'];
      const mainContentPaddingTop = $orgs['#mainContent'].getState().style['padding-top'];

      // Assert.
      expect(foundationPaddingTop).to.equal('22rem');
      expect(mainContentPaddingTop).to.equal('22rem');
    });
  });

  describe('logoFix, when window is scrolled within #videoHeader,', function () {
    // Prep.
    before(function () {
      $orgs.window.scrollTop(videoHeadHeight - 1);
      app.actions.logoFix();
    });

    it('positions #branding statically', function () {
      // Get results.
      const bodyClasses = $orgs['#body'].getState().attribs.class;

      // Assert.
      expect(bodyClasses).to.not.include('logo-fixed');
    });

    it('removes padding-top from #foundation and #mainContent', function () {
      // Get results.
      const foundationPaddingTop = $orgs['#foundation'].getState().style['padding-top'];
      const mainContentPaddingTop = $orgs['#mainContent'].getState().style['padding-top'];

      // Assert.
      expect(foundationPaddingTop).to.equal('0');
      expect(mainContentPaddingTop).to.equal('0');
    });
  });

  describe('logoFixedPaddingAdjust', function () {
    let foundationPaddingTopBefore;
    let mainContentPaddingTopBefore;

    // Prep.
    before(function () {
      foundationPaddingTopBefore = $orgs['#foundation'].getState().style['padding-top'];
      mainContentPaddingTopBefore = $orgs['#mainContent'].getState().style['padding-top'];

      $orgs['#body'].dispatchAction('addClass', 'logo-fixed');
      app.actions.logoFixedPaddingAdjust();
    });

    it('adds padding-top to #foundation and #mainContent', function () {
      // Get results.
      const foundationPaddingTopAfter = $orgs['#foundation'].getState().style['padding-top'];
      const mainContentPaddingTopAfter = $orgs['#mainContent'].getState().style['padding-top'];

      // Assert.
      expect(foundationPaddingTopBefore).to.equal('0');
      expect(mainContentPaddingTopBefore).to.equal('0');
      expect(foundationPaddingTopAfter).to.equal('22rem');
      expect(mainContentPaddingTopAfter).to.equal('22rem');
    });
  });

  describe('logoRipen', function () {
    // Prep.
    before(function () {
      $orgs.window.scrollTop(-(1 - Math.random()) * 1000);
      app.actions.logoRipen();
    });

    it('moves #logoBg between 0 and -400% right when window is scrolled', function () {
      // Get results.
      const logoBgRight = $orgs['#logoBg'].getState().style.right;
      const percentage = parseFloat(logoBgRight.slice(0, -1));

      // Assert.
      expect(percentage).to.be.within(-400, 0);
      expect(percentage).to.not.equal(0);
    });
  });

  describe('mainContentReveal', function () {
    const panesCount = $orgs['.main__content__pane'].getState().$items.length;
    const slidHeight = 200;
    const slidsOrg = $orgs['.main__content__slid'];

    for (let i = 1; i <= panesCount; i++) {
      it(`adds .main__content__slid class to the element scrolled into position ${i}`, function () {
        const slidsCountBefore = slidsOrg.getState().$items.length;

        // Prep.
        slidsOrg.dispatchAction('innerHeight', slidHeight, slidsCountBefore - 1);

        // Act.
        $orgs.window.scrollTop((i * slidHeight) + (slidHeight / 2));
        app.actions.mainContentReveal();

        // Get results.
        const slidsCountAfter = slidsOrg.getState().$items.length;

        // Assert.
        expect(slidsCountAfter).to.equal(slidsCountBefore + 1);
      });
    }
  });

  describe('updateDims', function () {
    const blocksOrg = $orgs['.main__content__block'];
    const blocksCount = blocksOrg.getState().$items.length;
    const paneHeightsBefore = [];
    const panesCount = $orgs['.main__content__pane'].getState().$items.length;

    describe('on init', function () {
      const blockHeight = 200;

      updateDimsTest(blocksCount, blocksOrg, blockHeight, panesCount, paneHeightsBefore);
    });

    describe('on update', function () {
      const blockHeight = 300;

      updateDimsTest(blocksCount, blocksOrg, blockHeight, panesCount);

      for (let i = 1; i < panesCount; i++) {
        it(`the updated height of pane ${i} differs from its original height`, function () {
          const paneHeightAfter = $orgs['.main__content__pane'].getState(i).style.height;

          expect(paneHeightAfter).to.not.equal(paneHeightsBefore[i]);
        });
      }
    });
  });
});
