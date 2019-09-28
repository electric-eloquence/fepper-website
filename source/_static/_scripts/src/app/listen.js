import behaviorsGet from './behaviors-get.js';

function debounce(callback, wait = 200, context = this) {
  let timeout;
  let callbackArgs;

  const later = () => callback.apply(context, callbackArgs);

  return () => {
    callbackArgs = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default (app) => {
  const behaviors = behaviorsGet(app, window);
  const $orgs = app.$orgs;

  $orgs.window.resize(debounce(behaviors.updateDims));

  $orgs.window.scroll(function () {
    behaviors.bgColorReveal();
    behaviors.logoRipen();
    behaviors.mainContentSlideIn();
    behaviors.mainContentSlideOut();
    behaviors.scrollButtonDisplay();
  });

  $orgs['.scroll-button--down'].on('click', function () {
    behaviors.scrollButtonDown();
  });

  $orgs['.scroll-button--up'].on('click', function () {
    behaviors.scrollButtonUp();
  });
};