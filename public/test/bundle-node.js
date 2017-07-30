'use strict';

var actionsGet = app => {
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

    mainContentInit: () => {
    },

    fadeTest: () => {
      if (
        app.$window.scrollTop() > 20 &&
        $orgs['.main__content__slider'].$items.length
      ) {
        $orgs['.main__content__slider'].dispatchAction('addClass', 'main__content__slid', 0);
        $orgs['.main__content__slider'].dispatchAction('removeClass', 'main__content__slider', 0);
        $orgs['.main__content__slid'].dispatchAction('removeClass', 'main__content__slid', 0);
console.warn($orgs['.main__content__slid'].getState());
      }
    }
  }
};

/**
 * Declare keys with null values here.
 *
 * @return {object} Keyed by organism ID.
 */
var $organisms = {
  '#html': null,
  '#body': null,
  '#videoHead': null,
  '#branding': null,
  '#logoBg': null,
  '#logoImg': null,
  '#main': null,
  '#browserAdvice': null,
  '#mainContent': null,
  '.main__content__slid': null,
  '.main__content__slider': null
};

var bundleNode = {
  actionsGet: actionsGet,
  $organisms: $organisms
};

module.exports = bundleNode;
