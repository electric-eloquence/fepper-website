'use strict';

export default app => {
  const $orgs = app.$orgs;

  app.$window.scroll(function () {
    if ($orgs.body.scrollTop() > 0) {
      $orgs.logoBackground.dispatchAction('css', ['right', `-${$orgs.body.scrollTop() * 2}px`]);
    }
  });
}
