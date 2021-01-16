// Vanilla JavaScript not appropriate for the Requerio app.

// Adding the bot=no query param to indicate human action is not server-side testable.
function queryNoBot() {
  var href = this.href;

  if (href.indexOf('bot=no') === -1) {
    if (href.indexOf('?') > -1) {
      var hrefSplit = href.split('?');
      var hrefNew = '';

      hrefSplit.forEach(function (hrefPart, index) {
        hrefNew += hrefPart;

        if (index === 0) {
          hrefNew += '?bot=no&';
        }
        else if (index < hrefSplit.length - 1) {
          hrefNew += '?';
        }
      });

      this.href = hrefNew;
    }
    else {
      this.href += '?bot=no';
    }
  }
}

var anchors = document.getElementsByTagName('a');

for (var i = 0; i < anchors.length; i++) {
  anchors[i].addEventListener('mouseenter', queryNoBot, false);
  anchors[i].addEventListener('touchstart', queryNoBot, false);
}

/* PAGE-SPECIFIC */
var bodyClasses = document.body.className;

if (bodyClasses.indexOf('homepage') > -1) {
  // Add browser advice via JavaScript so it isn't picked up by web crawlers without some serious effort.
  var browserAdvice = document.createElement('div');
  browserAdvice.id = 'browser-advice';
  browserAdvice.className = 'browser-advice';
  browserAdvice.innerHTML =
    '<!--googleoff: index-->This website is best viewed on up-to-date browsers.<!--googleon: index-->';

  document.body.insertBefore(browserAdvice, document.getElementsByClassName('nav--main')[0]);

  // Not server-side testable. It's super simple and not worth complicating. Leave as vanilla js.
  document.addEventListener(
    'DOMContentLoaded',
    function () {
      // window.scrollTo() does not work onbeforeunload for Safari so need to invoke it here
      if (window.pageYOffset > 0) {
        window.scrollTo(0, 0);
      }
    },
    false
  );
}
