'use strict';

export default app => {
  const $orgs = app.$orgs;

  return {

    ripen: () => {
      const MAX_PERCENTAGE = 400;
      // Firefox recognizes html.scrollTop; the rest recognize body.scrollTop.
      const scrollTop = $orgs.html.scrollTop() > 0 ? $orgs.html.scrollTop() : $orgs.body.scrollTop();

      let percentage = MAX_PERCENTAGE * scrollTop / ($orgs.html.height() - app.$window.height());
      percentage = percentage < MAX_PERCENTAGE ? percentage : MAX_PERCENTAGE;

      $orgs.logoBackground.dispatchAction('css', ['right', `-${percentage}%`]);
    },

    test: () => {
      $orgs.logoBackground.dispatchAction('css', ['right', '-66%']);
    }
  }
};
