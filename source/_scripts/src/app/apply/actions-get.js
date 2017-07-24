'use strict';

export default app => {
  const $orgs = app.$orgs;

  return {

    browserAdviceHide: () => {
      $orgs.browserAdvice.dispatchAction('css', ['display', 'none']);
    },

    logoRipen: () => {
      const MAX_PERCENTAGE = 400;

      let percentage = MAX_PERCENTAGE * app.$window.scrollTop() / ($orgs.html.height() - app.$window.height());
      percentage = percentage < MAX_PERCENTAGE ? percentage : MAX_PERCENTAGE;

      $orgs.logoBg.dispatchAction('css', ['right', `-${percentage}%`]);
    },

    logoFix: () => {
      if (app.$window.scrollTop() > $orgs.videoHead.height()) {
        $orgs.branding.dispatchAction('css', {position: 'fixed', top: '0'});
      }
      else {
        $orgs.branding.dispatchAction('css', {position: 'static', top: 'auto'});
      }
    }
  }
};
