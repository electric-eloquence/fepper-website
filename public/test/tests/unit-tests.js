'use strict';

const expect = require('chai').expect;

const app = require('../init.js');

describe('Fepper website', function () {

  it('should move #logoBg between 0 and -400% right when window is scrolled', function () {
    // Act.
    app.actions.logoRipen();

    // Get results.
    const logoBgState = app.$orgs['#logoBg'].getState();
    const logoBgRight = logoBgState.style.right;
    const percentage = parseFloat(logoBgRight.slice(0, -1));

    // Assert.
    expect(percentage).to.be.within(-400, 0);
    expect(percentage).to.not.equal(0);
  });

  it('should fix #branding to top when window is scrolled beyond #videoHeader', function () {
    // Prep.
    const videoHeadHeight = 400;
    const videoHeadGetStateDefault = app.$orgs['#videoHead'].getState;
    app.$orgs['#videoHead'].getState = () => {
      return {
        height: videoHeadHeight
      };
    };

    const brandingGetStateDefault = app.$orgs['#branding'].getState;
    app.$orgs['#branding'].getState = () => {
      return {
        boundingClientRect: {
          height: 220
        }
      };
    };

    // Act.
    app.actions.logoFix();
    app.$orgs['#videoHead'].getState = videoHeadGetStateDefault;
    app.$orgs['#branding'].getState = brandingGetStateDefault;

    // Get results.
    const brandingState = app.$orgs['#branding'].getState();
    const brandingPosition = brandingState.style.position;
    const brandingTop = brandingState.style.top;
    const windowState = app.$orgs.window.getState();
    const windowScrollTop = windowState.scrollTop;
    const mainState = app.$orgs['#main'].getState();
    const mainPaddingTop = mainState.style['padding-top'];

    // Assert.
    if (windowScrollTop > videoHeadHeight) {
      expect(brandingPosition).to.equal('fixed');
      expect(brandingTop).to.equal('0');
      expect(mainPaddingTop).to.equal('220px');
    }
    else {
      expect(brandingPosition).to.equal('static');
      expect(brandingTop).to.equal('auto');
      expect(mainPaddingTop).to.equal('0');
    }
  });

  it('should hide the browserAdvice organism on browsers supporting ES6 Modules', function () {
    // Act.
    app.actions.browserAdviceHide();

    // Get results.
    const browserAdviceState = app.$orgs['#browserAdvice'].getState();
    const browserAdviceDisplay = browserAdviceState.style.display;

    // Assert.
    expect(browserAdviceDisplay).to.equal('none');
  });

  describe('on mainContentReveal', function () {
    it('should move the main__content__slid class from the 1st .main__content__item element to the next', function () {
      // Prep.
      const mainContentItemFirstStateBefore = app.$orgs['.main__content__item'].getState(0);

//  console.warn(mainContentItemFirstStateBefore);
      // Act.
      app.actions.mainContentReveal();

      // Get results.
      const mainContentItemFirstStateAfter = app.$orgs['.main__content__item'].getState(0);
      const mainContentItemSecondStateAfter = app.$orgs['.main__content__item'].getState(1);
  console.warn(app.$orgs['.main__content__item'][1].attribs);
  console.warn(mainContentItemSecondStateAfter.attribs.class);

      // Assert.
    });

    it('should remove a main__content__slider class from the .main__content__item elements', function () {
      // Prep.
      const mainContentSliderStateBefore = app.$orgs['.main__content__slider'].getState();
      const mainContentSliderCountBefore = mainContentSliderStateBefore.$items.length;

      // Act.
      app.actions.mainContentReveal();

      // Get results.
      const mainContentSliderStateAfter = app.$orgs['.main__content__slider'].getState();
      const mainContentSliderCountAfter = mainContentSliderStateAfter.$items.length;

      // Assert.
      expect(mainContentSliderCountAfter).to.equal(mainContentSliderCountBefore - 1);
    });
  });
});
