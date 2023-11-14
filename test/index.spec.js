const { resolve } = require('path');
const pkg = require('../package.json');
const { expect } = require('chai');
const DOM = require('./dom');

describe('<inline-outline/>', function () {

  let dom, outline;

  before(function () {
    dom = new DOM();
    require(resolve(pkg.browser));
  });

  after(function () {
    dom.destroy();
  });

  beforeEach(function () {
    outline = document.body.appendChild(document.createElement('inline-outline'));
  });

  afterEach(function () {
    document.body.removeChild(outline);
  });

  it('should mount a component', function () {
    expect(outline.shadowRoot).to.exist;
  });
});
