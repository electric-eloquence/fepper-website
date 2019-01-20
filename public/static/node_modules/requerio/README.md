# Redux + jQuery + Cheerio = predictable client-side state + server-side testability

[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Mac/Linux Build Status][travis-image]][travis-url]
[![Windows Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![License][license-image]][license-url]

#### Install:

```bash
npm install cheerio redux requerio
```

#### Declare `$`:

```html
<script src="jquery.min.js"></script>
```

##### - or -

```javascript
const cheerio = require('cheerio');
const html = fs.readFileSync('./index.html', 'utf8');
const $ = global.$ = cheerio.load(html);
```

#### Declare `Redux`:

```html
<script src="redux.min.js"></script>
```

##### - or -

```javascript
const Redux = global.Redux = require('redux');
```

#### Declare `Requerio`:

```html
<script src="requerio.min.js"></script>
```

##### - or -

```javascript
const Requerio = require('requerio');
```

#### Declare `$organisms`:

At declaration, organisms are just empty namespaces.

```javascript
const $organisms = {
  '#yoda': null,
  '.midi-chlorian': null
};
```

#### Instantiate `requerio`:

```javascript
const requerio = new Requerio($, Redux, $organisms);
```

#### Initialize `requerio`:

```javascript
requerio.init();
```

#### Use:

```javascript
// During initialization, the null `$organisms['#yoda']` underwent
// inception into Requerio organism `requerio.$orgs['#yoda']`. This
// organism has properties, methods, and state. It is home to the
// `.midi-chlorian` organisms. (A well-working application would want them
// to be symbionts and not parasites!) To demonstrate that `#yoda` is alive
// and stateful, we'll dispatch a `css` action to give it a `color:green
//`style property.
requerio.$orgs['#yoda'].dispatchAction('css', ['color', 'green']);

// This action will turn the organism's text green in the browser.
// We can observe its state after dispatching the action.
const mainState = requerio.$orgs['#main'].getState();

// In Node, we can test to ensure the action updated the state correctly.
assert.equal(mainState.style.color, 'green');
```

[__Why Requerio?__](docs/why-requerio.md)

[__API docs__](docs/README.md)

### Methods supported:

* [addClass](docs/methods.md#addclassclasses)
* [removeClass](docs/methods.md#removeclassclasses)
* [toggleClass](docs/methods.md#toggleclassclasses-switch)
* [attr](docs/methods.md#attrattributename-value)
* [css](docs/methods.md#csspropertyname-value)
* [height](docs/methods.md#heightvalue)
* [html](docs/methods.md#htmlhtmlstring)
* [innerHeight](docs/methods.md#innerheightvalue)
* [innerWidth](docs/methods.md#innerwidthvalue)
* [scrollTop](docs/methods.md#scrolltopvalue)
* [setBoundingClientRect](docs/methods.md#setboundingclientrectboundingclientrect)
* [width](docs/methods.md#widthvalue)

#### See also the <a href="https://github.com/electric-eloquence/requerio/tree/master/examples" target="_blank">code examples</a>.

[snyk-image]: https://snyk.io/test/github/electric-eloquence/requerio/master/badge.svg
[snyk-url]: https://snyk.io/test/github/electric-eloquence/requerio/master

[travis-image]: https://img.shields.io/travis/electric-eloquence/requerio.svg?label=mac%20%26%20linux
[travis-url]: https://travis-ci.org/electric-eloquence/requerio

[appveyor-image]: https://img.shields.io/appveyor/ci/e2tha-e/requerio.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/e2tha-e/requerio

[coveralls-image]: https://img.shields.io/coveralls/electric-eloquence/requerio/master.svg
[coveralls-url]: https://coveralls.io/r/electric-eloquence/requerio

[license-image]: https://img.shields.io/github/license/electric-eloquence/requerio.svg
[license-url]: https://raw.githubusercontent.com/electric-eloquence/requerio/master/LICENSE
