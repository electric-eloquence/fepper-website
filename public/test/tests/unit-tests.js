'use strict';

const expect = require('chai').expect;

const app = require('../init.js');
const $orgs = app.$orgs;

describe('Fepper website', function () {

  describe('on init', function () {
    it('should hide the browserAdvice organism on browsers supporting ES6 Modules', function () {
      // Act.
      app.actions.browserAdviceHide();

      // Get results.
      const browserAdviceDisplay = $orgs['#browserAdvice'].getState().style.display;

      // Assert.
      expect(browserAdviceDisplay).to.equal('none');
    });
  });

  describe('on logoRipen', function () {
    it('should move #logoBg between 0 and -400% right when window is scrolled', function () {
      // Act.
      $orgs.window.scrollTop((1 - Math.random()) * 1000);
      app.actions.logoRipen();

      // Get results.
      const logoBgRight = $orgs['#logoBg'].getState().style.right;
      const percentage = parseFloat(logoBgRight.slice(0, -1));

      // Assert.
      expect(percentage).to.be.within(-400, 0);
      expect(percentage).to.not.equal(0);
    });
  });

  describe('on logoFix', function () {
    const videoHeadHeight = 400;
    const videoHeadGetStateDefault = $orgs['#videoHead'].getState;
    $orgs['#videoHead'].getState = () => {
      return {
        height: videoHeadHeight
      };
    };

    const brandingGetStateDefault = $orgs['#branding'].getState;
    $orgs['#branding'].getState = () => {
      return {
        boundingClientRect: {
          height: 220
        }
      };
    };

    it('should fix #branding to top when window is scrolled within #videoHeader', function () {
      // Prep.
      $orgs.window.scrollTop(videoHeadHeight - 1);

      // Act.
      app.actions.logoFix();
      $orgs['#videoHead'].getState = videoHeadGetStateDefault;
      $orgs['#branding'].getState = brandingGetStateDefault;

      // Get results.
      const brandingState = $orgs['#branding'].getState();
      const brandingPosition = brandingState.style.position;
      const brandingTop = brandingState.style.top;
      const windowScrollTop = $orgs.window.getState().scrollTop;
      const mainPaddingTop = $orgs['#main'].getState().style['padding-top'];

      // Assert.
      expect(brandingPosition).to.equal('static');
      expect(brandingTop).to.equal('auto');
      expect(mainPaddingTop).to.equal('0');
    });

    it('should fix #branding to top when window is scrolled beyond #videoHeader', function () {
      // Prep.
      $orgs.window.scrollTop(videoHeadHeight + 1);

      // Act.
      app.actions.logoFix();
      $orgs['#videoHead'].getState = videoHeadGetStateDefault;
      $orgs['#branding'].getState = brandingGetStateDefault;

      // Get results.
      const brandingState = $orgs['#branding'].getState();
      const brandingPosition = brandingState.style.position;
      const brandingTop = brandingState.style.top;
      const windowScrollTop = $orgs.window.getState().scrollTop;
      const mainPaddingTop = $orgs['#main'].getState().style['padding-top'];

      // Assert.
      expect(brandingPosition).to.equal('fixed');
      expect(brandingTop).to.equal('0');
      expect(mainPaddingTop).to.equal('22rem');
    });
  });

  describe('on mainContentReveal', function () {
    // Prep.
    const mainContentItemFirstStateBefore = $orgs['.main__content__item'].getState(0);
    const mainContentItemSecondStateBefore = $orgs['.main__content__item'].getState(1);
    const mainContentSlidersStateBefore = $orgs['.main__content__slider'].getState();

    let mainContentItemSecondStateAfter;
    let mainContentItemSecondClassesAfter;
    let mainContentSlidersStateAfter;

    const mainContentItemFirstClassesBefore = mainContentItemFirstStateBefore.attribs.class.split(/\s+/);
    const mainContentItemSecondClassesBefore = mainContentItemSecondStateBefore.attribs.class.split(/\s+/);

    before(function () {
      // Act.
      app.actions.mainContentReveal();

      // Get Results.
      mainContentItemSecondStateAfter = $orgs['.main__content__item'].getState(1);
      mainContentItemSecondClassesAfter = mainContentItemSecondStateAfter.attribs.class.split(/\s+/);
      mainContentSlidersStateAfter = $orgs['.main__content__slider'].getState();
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
