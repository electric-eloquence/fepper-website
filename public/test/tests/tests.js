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
    const paneHeight = $orgs['.content__pane'].getState(0).style.height;

    expect(paneHeight).to.equal(`${blockHeight * 2 / 10}rem`);

    if (paneHeightsBefore) {
      paneHeightsBefore[0] = paneHeight;
    }
  });

  for (let i = 1; i < panesCount; i++) {
    it(`updates the height of pane ${i} to the innerHeight of block ${i + 1}`, function () {
      const paneHeight = $orgs['.content__pane'].getState(i).style.height;

      expect(paneHeight).to.equal(`${blockHeight / 10}rem`);

      if (paneHeightsBefore) {
        paneHeightsBefore[i] = paneHeight;
      }
    });
  }
}

describe('Fepper website', function () {
  describe('init', function () {
    let htmlClassesBefore;

    // Prep.
    before(function () {
      htmlClassesBefore = $orgs['#html'].getState().attribs.class;

      app.behaviors.init();
    });

    it('adds .es6-modules-enabled class to #html', function () {
      // Get results.
      const htmlClassesAfter = $orgs['#html'].getState().attribs.class;

      // Assert.
      expect(htmlClassesBefore).to.not.include('es6-modules-enabled');
      expect(htmlClassesAfter).to.include('es6-modules-enabled');
    });
  });

  describe('bgColorReveal', function () {
    describe('adds background-color', function () {
      it('to .content__pane[1] when it is scrolled within viewport', function () {
        // Act.
        $orgs.window.scrollTop(500);
        app.behaviors.bgColorReveal();

        // Get Results.
        const contentPaneState = panesOrg.getState(1);

        // Assert.
        expect(contentPaneState.style['background-color']).to.include('rgba(2, 125, 21');
      });

      it('to .content__pane[3] when it is scrolled within viewport', function () {
        // Act.
        $orgs.window.scrollTop(900);
        app.behaviors.bgColorReveal();

        // Get Results.
        const contentPaneState = panesOrg.getState(3);

        // Assert.
        expect(contentPaneState.style['background-color']).to.include('rgba(240, 192, 0');
      });

      it('to .content__pane[5] when it is scrolled within viewport', function () {
        // Act.
        $orgs.window.scrollTop(1300);
        app.behaviors.bgColorReveal();

        // Get Results.
        const contentPaneState = panesOrg.getState(5);

        // Assert.
        expect(contentPaneState.style['background-color']).to.include('rgba(208, 0, 0');
      });
    });

    describe('removes background-color', function () {
      before(function () {
        $orgs.window.scrollTop(0);
        app.behaviors.bgColorReveal();
      });

      it('from .content__pane[1] when it is scrolled beyond viewport', function () {
        // Get Results.
        const contentPaneState = panesOrg.getState(1);

        // Assert.
        expect(contentPaneState.style['background-color']).to.equal('transparent');
      });

      it('from .content__pane[3] when it is scrolled beyond viewport', function () {
        // Get Results.
        const contentPaneState = panesOrg.getState(3);

        // Assert.
        expect(contentPaneState.style['background-color']).to.equal('transparent');
      });

      it('from .content__pane[5] when it is scrolled beyond viewport', function () {
        // Get Results.
        const contentPaneState = panesOrg.getState(5);

        // Assert.
        expect(contentPaneState.style['background-color']).to.equal('transparent');
      });
    });
  });

  describe('gitHubHrefAdapt', function () {
    const gitHubHomeHrefBefore = $orgs['.logo--linked'].getState().attribs.href;
    const gitHubDownloadHrefBefore = $orgs['.link-github__anchor--download'].getState().attribs.href;
    const gitHubReadmeHrefBefore = $orgs['.link-github__anchor--readme'].getState().attribs.href;

    it('adapts GitHub Project Home href to Drupal project when provided project=drupal search param', function () {
      // Act.
      app.behaviors.gitHubHrefAdapt('drupal');

      // Get results.
      const gitHubHomeHrefAfter = $orgs['.logo--linked'].getState().attribs.href;

      // Assert.
      expect(gitHubHomeHrefBefore).to.not.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-drupal');
      expect(gitHubHomeHrefAfter).to.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-drupal');
    });

    it('adapts GitHub Download href to Drupal project when provided project=drupal search param', function () {
      // Act.
      app.behaviors.gitHubHrefAdapt('drupal');

      // Get results.
      const gitHubDownloadHrefAfter = $orgs['.link-github__anchor--download'].getState().attribs.href;

      // Assert.
      expect(gitHubDownloadHrefBefore).to.not.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-drupal/releases/latest');
      expect(gitHubDownloadHrefAfter).to.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-drupal/releases/latest');
    });

    it('adapts GitHub Readme href to Drupal project when provided project=drupal search param', function () {
      // Act.
      app.behaviors.gitHubHrefAdapt('drupal');

      // Get results.
      const gitHubReadmeHrefAfter = $orgs['.link-github__anchor--readme'].getState().attribs.href;

      // Assert.
      expect(gitHubReadmeHrefBefore).to.not.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-drupal%23readme');
      expect(gitHubReadmeHrefAfter).to.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-drupal%23readme');
    });

    it('adapts GitHub Project Home href to WordPress project when provided project=wordpress search param', function () {
      // Act.
      app.behaviors.gitHubHrefAdapt('wordpress');

      // Get results.
      const gitHubHomeHrefAfter = $orgs['.logo--linked'].getState().attribs.href;

      // Assert.
      expect(gitHubHomeHrefBefore).to.not.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-wordpress');
      expect(gitHubHomeHrefAfter).to.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-wordpress');
    });

    it('adapts GitHub Download href to WordPress project when provided project=wordpress search param', function () {
      // Act.
      app.behaviors.gitHubHrefAdapt('wordpress');

      // Get results.
      const gitHubDownloadHrefAfter = $orgs['.link-github__anchor--download'].getState().attribs.href;

      // Assert.
      expect(gitHubDownloadHrefBefore).to.not.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-wordpress/releases/latest');
      expect(gitHubDownloadHrefAfter).to.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-wordpress/releases/latest');
    });

    it('adapts GitHub Download href to WordPress project when provided project=wordpress search param', function () {
      // Act.
      app.behaviors.gitHubHrefAdapt('wordpress');

      // Get results.
      const gitHubReadmeHrefAfter = $orgs['.link-github__anchor--readme'].getState().attribs.href;

      // Assert.
      expect(gitHubReadmeHrefBefore).to.not.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-wordpress%23readme');
      expect(gitHubReadmeHrefAfter).to.equal('redirect.html?url=https://github.com/electric-eloquence/fepper-wordpress%23readme');
    });
  });

  describe('logoRipen', function () {
    // Prep.
    before(function () {
      $orgs.window.scrollTop((1 - Math.random()) * 1200);
      app.behaviors.logoRipen();
    });

    it('moves #logoBg between 0 and -900% right when window is scrolled', function () {
      // Get results.
      const logoBgRight = $orgs['#logoBg'].getState().style.right;
      const percentage = parseFloat(logoBgRight.slice(0, -1));

      // Assert.
      expect(percentage).to.be.within(-900, 0);
      expect(percentage).to.not.equal(0);
    });
  });

  describe('mainContentSlideIn', function () {
    function mainContentSlideInClosure(i, scrollDistance) {
      return function () {
        // Act.
        $orgs.window.scrollTop(scrollDistance);
        app.behaviors.mainContentSlideIn();

        // Get results.
        const sliderClasses = slidersOrg.getState(i).classArray;

        // Assert.
        expect(sliderClasses).to.include('content__slid');
      };
    }

    let scrollDistance = 0;

    for (let i = 0; i < panesCount; i++) {
      it(
        `.content__slider[${i}] has class "content__slid" when window is scrolled ${scrollDistance}`,
        mainContentSlideInClosure(i, scrollDistance)
      );

      scrollDistance += 200;
    }
  });

  describe('mainContentSlideOut', function () {
    function mainContentSlideOutClosure(i, scrollDistance) {
      return function () {
        // Act.
        $orgs.window.scrollTop(scrollDistance);
        app.behaviors.mainContentSlideOut();

        // Get results.
        const sliderClasses = slidersOrg.getState(i).classArray;

        // Assert.
        expect(sliderClasses).to.not.include('content__slid');
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
    const scrollButtonOrg = $orgs['.scroll-button--up'];
    const windowState = $orgs.window.getState();

    it('should hide when the top of #branding is below the top of window', function () {
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

      expect(scrollButtonState.style.display).to.equal('none');
    });

    it('should show when the top of #branding is at the top of window', function () {
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

      expect(scrollButtonState.style.display).to.equal('block');
    });
  });

  describe('scrollButtonDown', function () {
    const panesOrg = $orgs['.content__pane'];
    const panesState = panesOrg.getState();
    const paneHeight = panesState.innerHeight;
    const windowState = $orgs.window.getState();
    const windowHeight = windowState.height;
    const expectedTopVal = (windowHeight - paneHeight) / 2;
    const expectedBottomVal = (windowHeight + paneHeight) / 2;

    it('should center 1st content pane on 1st click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(0);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
    });

    it('should center 2nd content pane on 2nd click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(1);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
    });

    it('should center 3rd content pane on 3rd click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(2);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
    });

    it('should center 4th content pane on 4th click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(3);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
    });

    it('should center 5th content pane on 5th click', function () {
      app.behaviors.scrollButtonDown();

      const paneState = panesOrg.getState(4);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
    });

    it('should show footer on 6th click', function () {
      app.behaviors.scrollButtonDown();

      const windowState = $orgs.window.getState();
      const htmlState = $orgs['#html'].getState();

      expect(windowState.scrollTop).to.equal(htmlState.innerHeight - windowState.height);
    });
  });

  describe('scrollButtonUp', function () {
    const panesOrg = $orgs['.content__pane'];
    const panesState = panesOrg.getState();
    const paneHeight = panesState.innerHeight;
    const windowState = $orgs.window.getState();
    const windowHeight = windowState.height;
    const expectedTopVal = (windowHeight - paneHeight) / 2;
    const expectedBottomVal = (windowHeight + paneHeight) / 2;

    it('should center 5th content pane on 1st click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(4);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
    });

    it('should center 4th content pane on 2nd click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(3);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
    });

    it('should center 3rd content pane on 3rd click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(2);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
    });

    it('should center 2nd content pane on 4th click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(1);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
    });

    it('should center 1st content pane on 5th click', function () {
      app.behaviors.scrollButtonUp();

      const paneState = panesOrg.getState(0);

      expect(paneState.boundingClientRect.top).to.equal(expectedTopVal);
      expect(paneState.boundingClientRect.bottom).to.equal(expectedBottomVal);
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
          const paneHeightAfter = $orgs['.content__pane'].getState(i).style.height;

          expect(paneHeightAfter).to.not.equal(paneHeightsBefore[i]);
        });
      }
    });
  });

  describe('videoRender', function () {
    const logicalImages = {
      '03': new Image(),
      '04': new Image(),
      '05': new Image(),
      '06': new Image(),
      '07': new Image(),
      '08': new Image()
    };
    const videoImgsOrg = $orgs['.video__img'];
    const videoPlay = app.behaviors.videoPromise(logicalImages, videoImgsOrg, 0);

    function imageHideClosure(j) {
      return function () {
        // Get results.
        const videoImgDisplay = $orgs['.video__img'].getState(j).style.display;

        // Assert.
        expect(videoImgDisplay).to.equal('none');
      };
    }

    function imageKillClosure(j) {
      return function () {
        // Get results.
        const videoImgSrc = $orgs['.video__img'].getState(j).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal('#');
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
        before(function () {
          return videoPlay[i + 1]();
        });

        for (let j = ix6 - 3; j < ix6; j++) {
          it(`videoImgsOrg member ${j} has display === "none"`, imageHideClosure(j));
        }

        for (let j = ix6 - 3; j < ix6; j++) {
          it(`videoImgsOrg member ${j} has src === "#"`, imageKillClosure(j));
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
        await videoPlay[0]();

        return videoPlay[1]();
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
