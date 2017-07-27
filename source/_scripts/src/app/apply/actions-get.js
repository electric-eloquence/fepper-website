'use strict';

export default app => {
  const $orgs = app.$orgs;

  return {

    browserAdviceHide: () => {
      $orgs['#browserAdvice'].dispatchAction('css', ['display', 'none']);
    },

    logoRipen: () => {
      const MAX_PERCENTAGE = 400;

      let percentage = MAX_PERCENTAGE * app.$window.scrollTop() / ($orgs['#html'].height() - app.$window.height());
      percentage = percentage < MAX_PERCENTAGE ? percentage : MAX_PERCENTAGE;

      $orgs['#logoBg'].dispatchAction('css', ['right', `-${percentage}%`]);
    },

    logoFix: () => {
      if (app.$window.scrollTop() > $orgs['#videoHead'].height()) {
        const brandingHeight = $orgs['#branding'].height();

        $orgs['#branding'].dispatchAction('css', {position: 'fixed', top: '0'});
        $orgs['#main'].dispatchAction('css', ['padding-top', `${brandingHeight}px`]);
      }
      else {
        $orgs['#branding'].dispatchAction('css', {position: 'static', top: 'auto'});
        $orgs['#main'].dispatchAction('css', ['padding-top', '0']);
      }
    },

    mainContentFadeIn: () => {
      $orgs['#mainContent'].dispatchAction('addClass', 'fade--in');
    },

    mainContentInit: () => {
      new Promise(resolve => {
        $orgs['#mainContent'].dispatchAction('removeClass', 'fade--in');
        resolve();
      }).then(() => {
        $orgs['#mainContent'].dispatchAction('addClass', 'fade');
      });
    },

    fadeTest: () => {
      if (app.$window.scrollTop() > 20) {
        $orgs['.main__content__slider'].$items[0].dispatchAction('addClass', 'fade--in');
console.warn($orgs['.main__content__slider'].$items[0]);
console.warn($orgs['.main__content__slider'].$items[0].dispatchAction);
console.warn($orgs['.main__content__slider'].$items[0].getState);
      }
    }
  }
};
