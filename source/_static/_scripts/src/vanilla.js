// Vanilla JavaScript not appropriate for the Requerio app.

function query(element, key, value) {
  var href = element.href;

  if (href.indexOf(key + '=' + value) === -1) {
    if (href.indexOf('?') > -1) {
      var hrefSplit = href.split('?');
      var hrefNew = '';

      hrefSplit.forEach(function (hrefPart, index) {
        hrefNew += hrefPart;

        if (index === 0) {
          hrefNew += '?' + key + '=' + value + '&';
        }
        else if (index < hrefSplit.length - 1) {
          hrefNew += '?';
        }
      });

      element.href = hrefNew;
    }
    else {
      element.href += '?' + key + '=' + value;
    }
  }
}

var anchors = document.getElementsByTagName('a');
var cookieObj = {};

if (typeof document.cookie === 'string') {
  document.cookie.split('; ').forEach(function (keyVal) {
    var keyValSplit = keyVal.split('=');
    cookieObj[keyValSplit[0]] = keyValSplit[1];
  });
}

for (var i = 0; i < anchors.length; i++) {
  if (!cookieObj.vw || cookieObj.vw !== window.innerWidth) {
    query(anchors[i], 'vw', window.innerWidth);
  }

  if (!cookieObj.vh || cookieObj.vh !== window.innerHeight) {
    query(anchors[i], 'vh', window.innerHeight);
  }

  // Add the bot=no query param to indicate human action.
  anchors[i].addEventListener('mouseenter', function () {query(this, 'bot', 'no')}, false);
  anchors[i].addEventListener('touchstart', function () {query(this, 'bot', 'no')}, false);
  anchors[i].addEventListener(
    'click',
    function () {
      if (!cookieObj.vw || cookieObj.vw !== window.innerWidth) {
        document.cookie = 'vw=' + window.innerWidth + ';sameSite=strict';
      }

      if (!cookieObj.vh || cookieObj.vh !== window.innerHeight) {
        document.cookie = 'vh=' + window.innerHeight+ ';sameSite=strict';
      }
    },
    false
  );
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

  document.body.insertBefore(browserAdvice, document.getElementsByClassName('video')[0]);

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
