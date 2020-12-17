import behaviorsGet from './behaviors-get.js';

export default (app) => {
  const behaviors = behaviorsGet(app, window);
  const $orgs = app.$orgs;

  $orgs.window.scroll(function () {
    const windowState = $orgs.window.getState();

    behaviors.logoRipen(windowState);

    if (windowState.scrollTop) {
      behaviors.hiderHide();
    }
  });

  $orgs['.nav--docpage__button--left'].on('click', function () {
    behaviors.navDocpageSlideIn();
  });

  $orgs['.nav--docpage__button--right'].on('click', function () {
    behaviors.navDocpageSlideOut();
  });

  $orgs['.nav--main__button--left'].on('click', function () {
    behaviors.navMainSlideOut();
  });

  $orgs['.nav--main__button--right'].on('click', function () {
    behaviors.navMainSlideIn();
  });
};
