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
    const windowState = $orgs.window.getState();

    behaviors.bgColorReveal(windowState);
    behaviors.logoRipen(windowState);
    behaviors.mainContentSlideIn();
    behaviors.mainContentSlideOut();
  });

  $orgs.window.scroll(debounce(behaviors.scrollButtonDisplay, 33));

  $orgs['.button--scroll--down'].on('click', function () {
    behaviors.scrollButtonDown();
  });

  $orgs['.button--scroll--up'].on('click', function () {
    behaviors.scrollButtonUp();
  });

  $orgs['.nav--main__button-left'].on('click', function () {
    behaviors.navMainSlideOut();
  });

  $orgs['.nav--main__button-right'].on('click', function () {
    behaviors.navMainSlideIn();
  });
};
