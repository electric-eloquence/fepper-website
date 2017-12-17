'use strict';

const expect = require('chai').expect;

const app = require('../init.js');
const $orgs = app.$orgs;
const panesOrg = $orgs['.main__content__pane'];
const panesCount = panesOrg.getState().$members.length;
const slidersOrg = $orgs['.main__content__slider'];

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
    describe('adds background-color', function () {
      it('to .main__content__pane[1] when it is scrolled within viewport', function () {
        // Act.
        $orgs.window.scrollTop(500);
        app.actions.bgColorReveal();

        // Get Results.
        const contentPaneState = panesOrg.getState(1);

        // Assert.
        expect(contentPaneState.style['background-color']).to.include('rgba(2, 125, 21');
      });

      it('to .main__content__pane[3] when it is scrolled within viewport', function () {
        // Act.
        $orgs.window.scrollTop(900);
        app.actions.bgColorReveal();

        // Get Results.
        const contentPaneState = panesOrg.getState(3);

        // Assert.
        expect(contentPaneState.style['background-color']).to.include('rgba(240, 192, 0');
      });

      it('to .main__content__pane[5] when it is scrolled within viewport', function () {
        // Act.
        $orgs.window.scrollTop(1300);
        app.actions.bgColorReveal();

        // Get Results.
        const contentPaneState = panesOrg.getState(5);

        // Assert.
        expect(contentPaneState.style['background-color']).to.include('rgba(208, 0, 0');
      });
    });

    describe('removes background-color', function () {
      before(function () {
        $orgs.window.scrollTop(0);
        app.actions.bgColorReveal();
      });

      it('from .main__content__pane[1] when it is scrolled beyond viewport', function () {
        // Get Results.
        const contentPaneState = panesOrg.getState(1);

        // Assert.
        expect(contentPaneState.style['background-color']).to.equal('transparent');
      });

      it('from .main__content__pane[3] when it is scrolled beyond viewport', function () {
        // Get Results.
        const contentPaneState = panesOrg.getState(3);

        // Assert.
        expect(contentPaneState.style['background-color']).to.equal('transparent');
      });

      it('from .main__content__pane[5] when it is scrolled beyond viewport', function () {
        // Get Results.
        const contentPaneState = panesOrg.getState(5);

        // Assert.
        expect(contentPaneState.style['background-color']).to.equal('transparent');
      });
    });
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

  describe('logoRipen', function () {
    // Prep.
    before(function () {
      $orgs.window.scrollTop((1 - Math.random()) * 1200);
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

  describe('mainContentSlideIn', function () {
    function mainContentSlideInClosure(i, scrollDistance) {
      return function () {
        // Act.
        $orgs.window.scrollTop(scrollDistance);
        app.actions.mainContentSlideIn();

        // Get results.
        const sliderClasses = slidersOrg.getState(i).classArray;

        // Assert.
        expect(sliderClasses).to.include('main__content__slid');
      };
    }

    let scrollDistance = 0;

    for (let i = 0; i < panesCount; i++) {
      it(
        `.main__content__slider[${i}] has class "main__content__slid" when window is scrolled ${scrollDistance}`,
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
        app.actions.mainContentSlideOut();

        // Get results.
        const sliderClasses = slidersOrg.getState(i).classArray;

        // Assert.
        expect(sliderClasses).to.not.include('main__content__slid');
      };
    }

    let scrollDistance = 800;

    for (let i = panesCount - 1; i >= 1; i--) {
      it(
        // eslint-disable-next-line max-len
        `.main__content__slider[${i}] does not have class "main__content__slid" when window is scrolled ${scrollDistance}`,
        mainContentSlideOutClosure(i, scrollDistance)
      );

      scrollDistance -= 200;
    }
  });

  describe('updateDims', function () {
    const blocksOrg = $orgs['.main__content__block'];
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
          const paneHeightAfter = $orgs['.main__content__pane'].getState(i).style.height;

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
    const videoImgsOrg = $orgs['.video-head__img'];
    const videoPlay = app.actions.videoPromise(logicalImages, videoImgsOrg, 0);

    describe('at Generation 0', function () {
      // Prep.
      before(async function () {
        await videoPlay[0]();

        return videoPlay[1]();
      });

      it('videoImgsOrg member 3 has src === logicalImages[\'03\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(3).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['03'].src);
      });

      it('videoImgsOrg member 4 has src === logicalImages[\'04\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(4).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['04'].src);
      });

      it('videoImgsOrg member 5 has src === logicalImages[\'05\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(5).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['05'].src);
      });
    });

    describe('at Generation 1', function () {
      // Prep.
      before(function () {
        return videoPlay[2]();
      });

      it('videoImgsOrg member 3 has display === "none"', function () {
        // Get results.
        const videoImgDisplay = $orgs['.video-head__img'].getState(3).style.display;

        // Assert.
        expect(videoImgDisplay).to.equal('none');
      });

      it('videoImgsOrg member 4 has display === "none"', function () {
        // Get results.
        const videoImgDisplay = $orgs['.video-head__img'].getState(4).style.display;

        // Assert.
        expect(videoImgDisplay).to.equal('none');
      });

      it('videoImgsOrg member 5 has display === "none"', function () {
        // Get results.
        const videoImgDisplay = $orgs['.video-head__img'].getState(5).style.display;

        // Assert.
        expect(videoImgDisplay).to.equal('none');
      });

      it('videoImgsOrg member 3 has src === "#"', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(3).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal('#');
      });

      it('videoImgsOrg member 4 has src "#"', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(4).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal('#');
      });

      it('videoImgsOrg member 5 has src "#"', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(5).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal('#');
      });

      it('videoImgsOrg member 6 has src === logicalImages[\'06\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(6).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['06'].src);
      });

      it('videoImgsOrg member 7 has src === logicalImages[\'07\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(7).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['07'].src);
      });

      it('videoImgsOrg member 8 has src === logicalImages[\'08\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(8).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['08'].src);
      });

      it('videoImgsOrg member 9 has src === logicalImages[\'03\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(9).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['03'].src);
      });

      it('videoImgsOrg member 10 has src === logicalImages[\'04\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(10).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['04'].src);
      });

      it('videoImgsOrg member 11 has src === logicalImages[\'05\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(11).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['05'].src);
      });
    });

    describe('at Generation 2', function () {
      // Prep.
      before(function () {
        return videoPlay[3]();
      });

      it('videoImgsOrg member 9 has display === "none"', function () {
        // Get results.
        const videoImgDisplay = $orgs['.video-head__img'].getState(9).style.display;

        // Assert.
        expect(videoImgDisplay).to.equal('none');
      });

      it('videoImgsOrg member 10 has display === "none"', function () {
        // Get results.
        const videoImgDisplay = $orgs['.video-head__img'].getState(10).style.display;

        // Assert.
        expect(videoImgDisplay).to.equal('none');
      });

      it('videoImgsOrg member 11 has display === "none"', function () {
        // Get results.
        const videoImgDisplay = $orgs['.video-head__img'].getState(11).style.display;

        // Assert.
        expect(videoImgDisplay).to.equal('none');
      });

      it('videoImgsOrg member 9 has src === "#"', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(9).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal('#');
      });

      it('videoImgsOrg member 10 has src "#"', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(10).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal('#');
      });

      it('videoImgsOrg member 11 has src "#"', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(11).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal('#');
      });

      it('videoImgsOrg member 12 has src === logicalImages[\'06\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(12).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['06'].src);
      });

      it('videoImgsOrg member 13 has src === logicalImages[\'07\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(13).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['07'].src);
      });

      it('videoImgsOrg member 14 has src === logicalImages[\'08\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(14).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['08'].src);
      });

      it('videoImgsOrg member 15 has src === logicalImages[\'03\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(15).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['03'].src);
      });

      it('videoImgsOrg member 16 has src === logicalImages[\'04\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(16).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['04'].src);
      });

      it('videoImgsOrg member 17 has src === logicalImages[\'05\'].src', function () {
        // Get results.
        const videoImgSrc = $orgs['.video-head__img'].getState(17).attribs.src;

        // Assert.
        expect(videoImgSrc).to.equal(logicalImages['05'].src);
      });
    });
  });
});
