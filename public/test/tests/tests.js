'use strict';

const expect = require('chai').expect;

const app = require('../init.js');
const $orgs = app.$orgs;
const panesOrg = $orgs['.content__pane'];
const panesCount = panesOrg.getState().$members.length;
const slidersOrg = $orgs['.content__slider'];

function updateDimsTest(blocksCount, blocksOrg, blockHeight, panesCount, paneHeightsBefore) {
  before(function () {
    for (let i = 0; i < blocksCount; i++) {
      blocksOrg.dispatchAction('innerHeight', blockHeight, i);
    }

    app.behaviors.updateDims();
  });

  it('updates the height of pane 0 to the sum of the innerHeights of block 0 and block 1', function () {
    const paneHeight = $orgs['.content__pane'].getState(0).css.height;

    expect(paneHeight).to.equal(`${blockHeight * 2 / 10}rem`);

    if (paneHeightsBefore) {
      paneHeightsBefore[0] = paneHeight;
    }
  });

  for (let i = 1; i < panesCount; i++) {
    it(`updates the height of pane ${i} to the innerHeight of block ${i + 1}`, function () {
      const paneHeight = $orgs['.content__pane'].getState(i).css.height;

      expect(paneHeight).to.equal(`${blockHeight / 10}rem`);

      if (paneHeightsBefore) {
        paneHeightsBefore[i] = paneHeight;
      }
    });
  }
}

describe('Fepper website', function () {
  let htmlClassesBefore;

  before(function () {
    htmlClassesBefore = $orgs['#html'].getState().attribs.class;
  });

  describe('bgColorReveal', function () {
    describe('adds background-color', function () {
      it('to .content__pane[1] when it is scrolled within viewport', function (done) {
        // Act.
        $orgs.window.scrollTop(500);
        app.behaviors.bgColorReveal($orgs.window.getState());

        setImmediate(() => {
          // Get Results.
          const contentPaneState = panesOrg.getState(1);

          // Assert.
          expect(contentPaneState.css['background-color']).to.include('rgba(2, 125, 21');

          done();
        });
      });

      it('to .content__pane[3] when it is scrolled within viewport', function (done) {
        // Act.
        $orgs.window.scrollTop(900);
        app.behaviors.bgColorReveal($orgs.window.getState());

        setImmediate(() => {
          // Get Results.
          const contentPaneState = panesOrg.getState(3);

          // Assert.
          expect(contentPaneState.css['background-color']).to.include('rgba(240, 192, 0');

          done();
        });
      });

      it('to .content__pane[5] when it is scrolled within viewport', function (done) {
        // Act.
        $orgs.window.scrollTop(1300);
        app.behaviors.bgColorReveal($orgs.window.getState());

        setImmediate(() => {
          // Get Results.
          const contentPaneState = panesOrg.getState(5);

          // Assert.
          expect(contentPaneState.css['background-color']).to.include('rgba(208, 0, 0');

          done();
        });
      });
    });

    describe('removes background-color', function () {
      before(function () {
        $orgs.window.scrollTop(0);
        app.behaviors.bgColorReveal($orgs.window.getState());
      });

      it('from .content__pane[1] when it is scrolled beyond viewport', function () {
        // Get Results.
        const contentPaneState = panesOrg.getState(1);

        // Assert.
        expect(contentPaneState.css['background-color']).to.equal('transparent');
      });

      it('from .content__pane[3] when it is scrolled beyond viewport', function () {
        // Get Results.
        const contentPaneState = panesOrg.getState(3);

        // Assert.
        expect(contentPaneState.css['background-color']).to.equal('transparent');
      });

      it('from .content__pane[5] when it is scrolled beyond viewport', function () {
        // Get Results.
        const contentPaneState = panesOrg.getState(5);

        // Assert.
        expect(contentPaneState.css['background-color']).to.equal('transparent');
      });
    });
  });

  describe('gitHubHrefAdapt', function () {
    const gitHubDownloadHrefBefore = $orgs['.link--github__anchor--download'].getState().attribs.href;

    it('adapts GitHub Download href to Drupal project when provided project=drupal search param', function () {
      // Act.
      app.behaviors.gitHubHrefAdapt('drupal');

      // Get results.
      const gitHubDownloadHrefAfter = $orgs['.link--github__anchor--download'].getState().attribs.href;

      // Assert.
      expect(gitHubDownloadHrefBefore).to.not.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-drupal/releases/latest');
      expect(gitHubDownloadHrefAfter).to.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-drupal/releases/latest');
    });

    it('adapts GitHub Download href to WordPress project when provided project=wordpress search param', function () {
      // Act.
      app.behaviors.gitHubHrefAdapt('wordpress');

      // Get results.
      const gitHubDownloadHrefAfter = $orgs['.link--github__anchor--download'].getState().attribs.href;

      // Assert.
      expect(gitHubDownloadHrefBefore).to.not.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-wordpress/releases/latest');
      expect(gitHubDownloadHrefAfter).to.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-wordpress/releases/latest');
    });
  });

  describe('logoRipen', function () {
    // Prep.
    before(function () {
      const rn1To1200 = (1 - Math.random()) * 1200;

      $orgs.window.scrollTop(rn1To1200);
      app.behaviors.logoRipen($orgs.window.getState());
    });

    it('moves #logoBg between 0 and -90% right when window is scrolled', function () {
      // Get results.
      const logoBgRight = $orgs['#logoBg'].getState().css.transform;
      const percentage = parseFloat(logoBgRight.replace('translateX(', '').slice(0, -2));

      // Assert.
      expect(percentage).to.be.within(-90, 0);
      expect(percentage).to.not.equal(0);
    });
  });

  describe('mainContentSlideIn', function () {
    function mainContentSlideInClosure(i, scrollDistance) {
      return function (done) {
        // Act.
        $orgs.window.scrollTop(scrollDistance);
        app.behaviors.mainContentSlideIn($orgs.window.getState());

        setImmediate(() => {
          // Get results.
          const sliderClasses = slidersOrg.getState(i).classArray;

          // Assert.
          expect(sliderClasses).to.include('content__slid');

          done();
        });
      };
    }

    let scrollDistance = 0;
    let i;

    for (i = 0; i < panesCount - 1; i++) {
      it(
        `.content__slider[${i}] has class "content__slid" when window is scrolled ${scrollDistance}`,
        mainContentSlideInClosure(i, scrollDistance)
      );

      scrollDistance += 200;
    }

    // Last iteration needs to be tweaked by 1px to trigger mainContentSlideIn.
    it(
      `.content__slider[${i}] has class "content__slid" when window is scrolled ${++scrollDistance}`,
      mainContentSlideInClosure(i, scrollDistance)
    );
  });

  describe('mainContentSlideOut', function () {
    function mainContentSlideOutClosure(i, scrollDistance) {
      return function (done) {
        // Act.
        $orgs.window.scrollTop(scrollDistance);
        app.behaviors.mainContentSlideOut($orgs.window.getState());

        setImmediate(() => {
          // Get results.
          const sliderClasses = slidersOrg.getState(i).classArray;

          // Assert.
          expect(sliderClasses).to.not.include('content__slid');

          done();
        });
      };
    }

    let scrollDistance = 800;

    for (let i = panesCount - 1; i >= 1; i--) {
      it(
        // eslint-disable-next-line max-len
        `.content__slider[${i}] does not have class "content__slid" when window is scrolled ${scrollDistance}`,
        mainContentSlideOutClosure(i, scrollDistance)
      );

      scrollDistance -= 200;
    }
  });

  describe('scrollButtonDisplay', function () {
    const brandingOrg = $orgs['#branding'];
    const brandingState = brandingOrg.getState();
    const scrollButtonOrg = $orgs['.button--scroll--up'];
    const windowState = $orgs.window.getState();

    it('hides when the top of #branding is below the top of window', function () {
      const offset = 100;

      brandingOrg.dispatchAction(
        'setBoundingClientRect',
        {
          width: windowState.width,
          height: brandingState.innerHeight,
          top: offset,
          right: windowState.Width,
          bottom: offset + brandingState.innerHeight,
          left: 0
        }
      );

      app.behaviors.scrollButtonDisplay();

      const scrollButtonState = scrollButtonOrg.getState();

      expect(scrollButtonState.css.display).to.equal('none');
    });

    it('shows when the top of #branding is at the top of window', function () {
      const offset = 0;

      brandingOrg.dispatchAction(
        'setBoundingClientRect',
        {
          width: windowState.width,
          height: brandingState.innerHeight,
          top: offset,
          right: windowState.Width,
          bottom: offset + brandingState.innerHeight,
          left: 0
        }
      );

      app.behaviors.scrollButtonDisplay();

      const scrollButtonState = scrollButtonOrg.getState();

      expect(scrollButtonState.css.display).to.equal('block');
    });
  });

  describe('scrollButtonDown', function () {
    const panesOrg = $orgs['.content__pane'];

    it('scrolls 1st content pane into view on 1st click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(0);

      expect(paneState.boundingClientRect.top).to.equal(600);
      expect(paneState.boundingClientRect.bottom).to.equal(800);
    });

    it('scrolls 2nd content pane into view on 2nd click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(1);

      expect(paneState.boundingClientRect.top).to.equal(800);
      expect(paneState.boundingClientRect.bottom).to.equal(1000);
    });

    it('scrolls 3rd content pane into view on 3rd click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(2);

      expect(paneState.boundingClientRect.top).to.equal(1000);
      expect(paneState.boundingClientRect.bottom).to.equal(1200);
    });

    it('scrolls 4th content pane into view on 4th click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(3);

      expect(paneState.boundingClientRect.top).to.equal(1200);
      expect(paneState.boundingClientRect.bottom).to.equal(1400);
    });

    it('scrolls 5th content pane into view on 5th click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(4);

      expect(paneState.boundingClientRect.top).to.equal(1400);
      expect(paneState.boundingClientRect.bottom).to.equal(1600);
    });

    it('scrolls footer into view on 6th click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(5);

      expect(paneState.boundingClientRect.top).to.equal(1600);
      expect(paneState.boundingClientRect.bottom).to.equal(1800);
    });
  });

  describe('scrollButtonUp', function () {
    const panesOrg = $orgs['.content__pane'];

    it('scrolls 5th content pane into view on 1st click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(4);

      expect(paneState.boundingClientRect.top).to.equal(1400);
      expect(paneState.boundingClientRect.bottom).to.equal(1600);
    });

    it('scrolls 4th content pane into view on 2nd click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(3);

      expect(paneState.boundingClientRect.top).to.equal(1200);
      expect(paneState.boundingClientRect.bottom).to.equal(1400);
    });

    it('scrolls 3rd content pane into view on 3rd click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(2);

      expect(paneState.boundingClientRect.top).to.equal(1000);
      expect(paneState.boundingClientRect.bottom).to.equal(1200);
    });

    it('scrolls 2nd content pane into view on 4th click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(1);

      expect(paneState.boundingClientRect.top).to.equal(800);
      expect(paneState.boundingClientRect.bottom).to.equal(1000);
    });

    it('scrolls 1st content pane into view on 5th click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(0);

      expect(paneState.boundingClientRect.top).to.equal(600);
      expect(paneState.boundingClientRect.bottom).to.equal(800);
    });
  });

  describe('updateDims', function () {
    const blocksOrg = $orgs['.content__block'];
    const blocksCount = blocksOrg.getState().$members.length;
    const paneHeightsBefore = [];

    describe('on init', function () {
      const blockHeight = 200;

      updateDimsTest(blocksCount, blocksOrg, blockHeight, panesCount, paneHeightsBefore);
    });

    describe('on update', function () {
      const blockHeight = 300;

      updateDimsTest(blocksCount, blocksOrg, blockHeight, panesCount);

      for (let i = 0; i < panesCount; i++) {
        it(`updates pane ${i} with a height different from its original height`, function () {
          const paneHeightAfter = $orgs['.content__pane'].getState(i).css.height;

          expect(paneHeightAfter).to.not.equal(paneHeightsBefore[i]);
        });
      }
    });
  });

  describe('videoRender', function () {
    const logicalImages = {
      '03': new window.Image(),
      '04': new window.Image(),
      '05': new window.Image(),
      '06': new window.Image(),
      '07': new window.Image(),
      '08': new window.Image()
    };
    const videoPlay = app.behaviors.videoGenerate(logicalImages, $orgs, 0);

    function imageHideClosure(j) {
      return function () {
        // Get results.
        const videoImgDisplay = $orgs['.video__img'].getState(j).css.display;

        // Assert.
        expect(videoImgDisplay).to.equal('none');
      };
    }

    function imageSourceTest(j, key) {
      it(`videoImgsOrg member ${j} has src === logicalImages['${key}'].src`, function () {
        // Get results.
        const videoImgSrc = $orgs['.video__img'].getState(j).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages[key].src);
      });
    }

    function generationClosure(i) {
      return function () {
        const ix6 = 6 * i;
        // Prep.
        before(async function () {
          return await videoPlay.next();
        });

        for (let j = ix6 - 3; j < ix6; j++) {
          it(`videoImgsOrg member ${j} has display === "none"`, imageHideClosure(j));
        }

        imageSourceTest(ix6, '06');
        imageSourceTest(ix6 + 1, '07');
        imageSourceTest(ix6 + 2, '08');
        imageSourceTest(ix6 + 3, '03');
        imageSourceTest(ix6 + 4, '04');
        imageSourceTest(ix6 + 5, '05');
      };
    }

    describe('at Generation 0', function () {
      // Prep.
      before(async function () {
        return await videoPlay.next();
      });

      it('adds .es2018 class to #html', function () {
        // Get results.
        const htmlClassesAfter = $orgs['#html'].getState().attribs.class;

        // Assert.
        expect(htmlClassesBefore).to.not.include('es2018');
        expect(htmlClassesAfter).to.include('es2018');
      });

      it('videoImgsOrg member 3 has src === logicalImages[\'03\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video__img'].getState(3).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['03'].src);
      });

      it('videoImgsOrg member 4 has src === logicalImages[\'04\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video__img'].getState(4).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['04'].src);
      });

      it('videoImgsOrg member 5 has src === logicalImages[\'05\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video__img'].getState(5).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['05'].src);
      });
    });

    for (let i = 1; i <= 8; i++) {
      describe(`at Generation ${i}`, generationClosure(i));
    }
  });
});
