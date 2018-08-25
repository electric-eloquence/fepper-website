'use strict';

const expect = require('chai').expect;
const fs = require('fs-extra');

describe('Base Installer', function () {
  it('should copy paragraph.mustache to /source/_patterns/00-elements/', function () {
    expect(fs.existsSync('source/_patterns/00-elements/paragraph.mustache')).to.equal(true);
  });

  it('should populate paragraph.mustache with content: "Fepper Base"', function () {
    const content = fs.readFileSync('source/_patterns/00-elements/paragraph.mustache', 'utf8');

    expect(content).to.equal('<p>Fepper Base</p>\n');
  });
});
