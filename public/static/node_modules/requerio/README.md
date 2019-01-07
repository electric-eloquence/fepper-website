# Redux + jQuery + Cheerio = predictable client-side state + server-side testability

### Documentation to come!

#### If you want to experiment in the meantime, in Node.js:

##### Install

```bash
npm install cheerio redux requerio
```

##### Code

```javascript
const assert = require('assert');
const fs = require('fs');

const cheerio = require('cheerio');
const Redux = global.Redux = require('redux');
const Requerio = require('requerio');

const html = fs.readFileSync('./index.html', 'utf8');
const $ = global.$ = cheerio.load(html);

const $organisms = {
  'window': null,
  'html': null,
  'body': null,
  '#main': null,
  '.main__section--0': null,
  '.main__section--1': null
};

function actionsGet(requerio) {
  return {
    mainHide: () => {
      requerio.$orgs['#main'].dispatchAction('css', ['display', 'none']);
    },

    mainShow: () => {
      requerio.$orgs['#main'].dispatchAction('css', ['display', 'block']);
    }
  };
}

const requerio = new Requerio($, Redux, $organisms, actionsGet);
requerio.init();
const actions = actionsGet(requerio);

/* Test */

actions.mainHide();
const hiddenDisplayStyle = requerio.$orgs['#main'].getState().style.display;
assert.equal(hiddenDisplayStyle, 'none');

actions.mainShow();
const shownDisplayStyle = requerio.$orgs['#main'].getState().style.display;
assert.equal(shownDisplayStyle, 'block');

console.log('Tests passed');
```

#### On the client, in HTML:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.slim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/redux/3.7.2/redux.min.js"></script>
<script src="requerio/dist/requerio.min.js"></script>
```

#### On the client, in JavaScript:

```javascript
var $organisms = {
  'window': null,
  'html': null,
  'body': null,
  '#main': null,
  '.main__section--0': null,
  '.main__section--1': null
};

function actionsGet(requerio) {
  return {
    mainHide: function () {
      requerio.$orgs['#main'].dispatchAction('css', ['display', 'none']);
    },

    mainShow: function () {
      requerio.$orgs['#main'].dispatchAction('css', ['display', 'block']);
    }
  };
}

var requerio = new window.Requerio($, Redux, $organisms, actionsGet);
requerio.init();
var actions = actionsGet(requerio);

// Immediately hide #main.
actions.mainHide();

// Show #main after 1 second.
setTimeout(function () {
  actions.mainShow();
}, 1000);
```

#### Methods supported (thus far):

* addClass
* removeClass
* toggleClass
* attr
* css
* getBoundingClientRect
* setBoundingClientRect
* height
* html
* innerWidth
* innerHeight
* scrollTop
* width

#### See also the <a href="https://github.com/electric-eloquence/requerio/tree/master/examples" target="_blank">examples in GitHub</a>.
