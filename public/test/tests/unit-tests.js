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
    // Act.
    app.actions.logoFix();

    // Get results.
    const brandingState = app.$orgs['#branding'].getState();
    const brandingPosition = brandingState.style.position;
    const brandingTop = brandingState.style.top;
    const windowState = app.$orgs.window.getState();
    const windowScrollTop = windowState.scrollTop;
    const mainState = app.$orgs['#main'].getState();
    const mainPaddingTop = mainState.style['padding-top'];
    const videoHeadHeight = app.$orgs['#videoHead'].height();

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

  it('should hide the #mainContent organism on init', function () {
    // Act.
    //app.actions.mainContentInit();

    // Get results.
    const mainContent = app.$orgs['#check1'];
//    const mainContentState = app.$orgs['#checked1'].getState();

    // Assert.
  });
});
