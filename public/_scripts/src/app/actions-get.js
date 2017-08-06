'use strict';

export default (app, params) => {
  const $orgs = app.$orgs;

  return {

    bodyHeightFix: () => {
      const htmlHeight = $orgs['#html'].getState().height;

      $orgs['#body'].dispatchAction('css', ['height', `${htmlHeight / 10}rem`]);
    },

    browserAdviceHide: () => {
      $orgs['#browserAdvice'].dispatchAction('css', ['display', 'none']);
    },

    logoFix: () => {
      const brandingState = $orgs['#branding'].getState();
      const videoHeadState = $orgs['#videoHead'].getState();
      const windowState = $orgs.window.getState();

      if (windowState.scrollTop > videoHeadState.height) {
        $orgs['#branding'].dispatchAction('css', {position: 'fixed', top: '0'});
        $orgs['#main'].dispatchAction('css', ['padding-top', `${brandingState.boundingClientRect.height / 10}rem`]);
      }
      else {
        $orgs['#branding'].dispatchAction('css', {position: 'static', top: 'auto'});
        $orgs['#main'].dispatchAction('css', ['padding-top', '0']);
      }
    },

    logoRipen: () => {
      const MAX_PERCENTAGE = 400;
      const bodyState = $orgs['#body'].getState();
      const bodyHeight = bodyState.boundingClientRect.height;
      const htmlState = $orgs['#html'].getState();
      const mainContentSliders = $orgs['.main__content__slider'];
      const windowState = $orgs.window.getState();
      const windowHeight = windowState.height;
      const windowWidth = windowState.width;
      let percentage;

      const sliderMarginHeight =
        windowHeight - (0.17 * windowWidth) - (logo_height * 10) - (2 * branding_pad * 10);
      const itemLastMarginHeight =
        windowHeight - (item_last_offset * 10) - (logo_height * 10) - (2 * branding_pad * 10);

      if (bodyState.style.height === 'auto') {
        percentage = windowState.scrollTop / (htmlState.height - windowHeight);
      }
      else {
        percentage =
          windowState.scrollTop / (htmlState.height - windowHeight - sliderMarginHeight - itemLastMarginHeight);
      }

      percentage = MAX_PERCENTAGE * percentage;

      if (percentage >= MAX_PERCENTAGE) {
        percentage = MAX_PERCENTAGE;

        if (bodyState.style.height !== 'auto') {
          $orgs['#body'].dispatchAction('css', ['height', 'auto']);
        }
      }

      $orgs['#logoBg'].dispatchAction('css', ['right', `-${percentage}%`]);
    },

    mainContentReveal: () => {
      if (!$orgs['.main__content__slider'].$items.length) {
        return;
      }

      const mainContentItems = $orgs['.main__content__item'];
      const mainContentSliders = $orgs['.main__content__slider'];
      const windowState = $orgs.window.getState();

      const scrollTop = windowState.scrollTop;
      const scrollIndex = mainContentItems.getState().$items.length - mainContentSliders.getState().$items.length;

      let scrollThreshold = 0;
      for (let i = 0; i < scrollIndex; i++) {
        scrollThreshold += mainContentItems.getState(i).boundingClientRect.height;
      }

      if (scrollTop > scrollThreshold) {
        mainContentSliders.dispatchAction('addClass', 'main__content__slid', 0);
        mainContentSliders.dispatchAction('removeClass', 'main__content__slider', 0);
      }
    }
  }
};
