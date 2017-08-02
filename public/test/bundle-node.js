'use strict';

var actionsGet = app => {
  const $orgs = app.$orgs;

  return {

    browserAdviceHide: () => {
      $orgs['#browserAdvice'].dispatchAction('css', ['display', 'none']);
    },

    logoRipen: () => {
      const MAX_PERCENTAGE = 400;
      const htmlState = $orgs['#html'].getState();
      const windowState = $orgs.window.getState();

      let percentage = MAX_PERCENTAGE * windowState.scrollTop / (htmlState.height - windowState.height);
      percentage = percentage < MAX_PERCENTAGE ? percentage : MAX_PERCENTAGE;

      $orgs['#logoBg'].dispatchAction('css', ['right', `-${percentage}%`]);
    },

    logoFix: () => {
      const brandingState = $orgs['#branding'].getState();
      const videoHeadState = $orgs['#videoHead'].getState();
      const windowState = $orgs.window.getState();

      if (windowState.scrollTop > videoHeadState.height) {
        $orgs['#branding'].dispatchAction('css', {position: 'fixed', top: '0'});
        $orgs['#main'].dispatchAction('css', ['padding-top', `${brandingState.boundingClientRect.height}px`]);
      }
      else {
        $orgs['#branding'].dispatchAction('css', {position: 'static', top: 'auto'});
        $orgs['#main'].dispatchAction('css', ['padding-top', '0']);
      }
    },

    mainContentReveal: () => {
      if (!$orgs['.main__content__slider'].$items.length) {
        return;
      }

      const bodyState = $orgs['#body'].getState();
      const mainContentItems = $orgs['.main__content__item'];
      const mainContentItemState = $orgs['.main__content__item'].getState();
      const mainContentSliders = $orgs['.main__content__slider'];
      const mainContentSliderState = $orgs['.main__content__slider'].getState();
      const windowState = $orgs.window.getState();

      const scrollTop = windowState.scrollTop;
      const firstMainContentItemState = mainContentSliders.getState(0);
      const scrollIndex = mainContentItemState.$items.length - mainContentSliderState.$items.length;
console.warn(scrollTop);
console.warn(bodyState.boundingClientRect.height);

      let scrollThreshold = 0;
      for (let i = 0; i < scrollIndex; i++) {
        scrollThreshold += mainContentItems.getState(i).boundingClientRect.height;
      }

      if (scrollTop > scrollThreshold) {
        mainContentSliders.dispatchAction('addClass', 'main__content__slid', 0);
        mainContentSliders.dispatchAction('removeClass', 'main__content__slider', 0);
        $orgs['.main__content__slid'].dispatchAction('removeClass', 'main__content__slid', 0);
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
  'window': null,
  '#html': null,
  '#body': null,
  '#videoHead': null,
  '#branding': null,
  '#logoBg': null,
  '#logoImg': null,
  '#main': null,
  '#browserAdvice': null,
  '#mainContent': null,
  '.main__content__item': null,
  '.main__content__slid': null,
  '.main__content__slider': null
};

var bundleNode = {
  actionsGet: actionsGet,
  $organisms: $organisms
};

module.exports = bundleNode;
