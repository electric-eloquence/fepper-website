'use strict';

const expect = require('chai').expect;

const app = require('../init.js');

describe('Fepper website', function () {
  it('should move #logoBackground between 0 and -400% right when #bodyContainer is scrolled', function () {
    // Act.
    app.actions.ripen();

    // Get results.
    let percentage = app.$orgs.logoBackground[0].attribs.style;
    percentage = parseFloat(percentage.slice(percentage.indexOf(':') + 2, -2));

    // Assert.
    expect(percentage).to.be.within(-400, 0);
  });
});
