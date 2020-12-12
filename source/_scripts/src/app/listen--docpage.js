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

  $orgs['.button--nav--left'].on('click', function () {
    behaviors.navSlideOut();
  });

  $orgs['.button--nav--right'].on('click', function () {
    behaviors.navSlideIn();
  });
};
