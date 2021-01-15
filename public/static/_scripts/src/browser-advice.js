// Adding browser advice via JavaScript so it isn't picked up by web crawlers without some serious effort.
const browserAdvice = document.createElement('div');
browserAdvice.id = 'browser-advice';
browserAdvice.className = 'browser-advice';
browserAdvice.innerHTML =
  '<!--googleoff: index-->This website is best viewed on up-to-date browsers.<!--googleon: index-->';

document.body.insertBefore(browserAdvice, document.getElementsByClassName('nav--main')[0]);
document.addEventListener(
  'DOMContentLoaded',
  function () {
    // window.scrollTo() does not work onbeforeunload for Safari so need to invoke it here
    if (window.pageYOffset > 0) {
      window.scrollTo(0, 0);
    }
  }
);
