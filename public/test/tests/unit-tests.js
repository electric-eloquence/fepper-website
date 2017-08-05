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
    // Prep.
    const mainContentItemFirstStateBefore = app.$orgs['.main__content__item'].getState(0);
    const mainContentItemSecondStateBefore = app.$orgs['.main__content__item'].getState(1);
    const mainContentSlidersStateBefore = app.$orgs['.main__content__slider'].getState();

    let mainContentItemSecondStateAfter;
    let mainContentItemSecondClassesAfter;
    let mainContentSlidersStateAfter;

    const mainContentItemFirstClassesBefore = mainContentItemFirstStateBefore.attribs.class.split(/\s+/);
    const mainContentItemSecondClassesBefore = mainContentItemSecondStateBefore.attribs.class.split(/\s+/);

    before(function () {
      // Act.
      app.actions.mainContentReveal();

      // Get Results.
      mainContentItemSecondStateAfter = app.$orgs['.main__content__item'].getState(1);
      mainContentItemSecondClassesAfter = mainContentItemSecondStateAfter.attribs.class.split(/\s+/);
      mainContentSlidersStateAfter = app.$orgs['.main__content__slider'].getState();
    });

    it('should add the main__content__slid class the first .main__content__item element without it', function () {
      // Assert.
      expect(mainContentItemFirstClassesBefore.indexOf('main__content__slid')).to.be.above(-1);
      expect(mainContentItemSecondClassesBefore.indexOf('main__content__slid')).to.equal(-1);
      expect(mainContentItemSecondClassesAfter.indexOf('main__content__slid')).to.be.above(-1);
    });

    it('should remove a main__content__slider class from the .main__content__item elements', function () {
      // Assert.
      expect(mainContentSlidersStateAfter.$items.length).to.equal(mainContentSlidersStateBefore.$items.length - 1);
    });
  });
});
