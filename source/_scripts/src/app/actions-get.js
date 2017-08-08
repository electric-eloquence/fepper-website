'use strict';

export default (app, params) => {
  const $orgs = app.$orgs;

  function debounce(callback, wait = 200, context = this) {
    let timeout = null;
    let callbackArgs = null;

    const later = () => callback.apply(context, callbackArgs);

    return () => {
      callbackArgs = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  return {

    bodyHeightFix: () => {
      const videoHeadHeight = $orgs['#videoHead'].getState().boundingClientRect.height;
      const mainContentSliderFirstHeight = $orgs['.main__content__slider'].getState(0).boundingClientRect.height;
      const mainContentItemLastHeight = $orgs['.main__content__item--last'].getState().boundingClientRect.height;

      $orgs['.main__content__slider'].dispatchAction('css', ['display', 'none'], 0);
      $orgs['.main__content__item--last'].dispatchAction('css', ['display', 'none']);

      let bodyContainHeight = $orgs['#bodyContain'].getState().boundingClientRect.height;
      bodyContainHeight += (videoHeadHeight / 2) + mainContentSliderFirstHeight + mainContentItemLastHeight;

      $orgs['#bodyContain'].dispatchAction('css',['height', `${bodyContainHeight / 10}rem`]);
      $orgs['.main__content__slider'].dispatchAction('css', ['display', 'block'], 0);
      $orgs['.main__content__item--last'].dispatchAction('css', ['display', 'block']);
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
      const bodyContainState = $orgs['#bodyContain'].getState();
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

      if (bodyContainState.style.height === 'auto') {
        percentage = windowState.scrollTop / (htmlState.height - windowHeight);
      }
      else {
        percentage =
          windowState.scrollTop / (bodyContainState.boundingClientRect.height - windowHeight);
      }

      percentage = MAX_PERCENTAGE * percentage;

      if (percentage >= MAX_PERCENTAGE) {
        percentage = MAX_PERCENTAGE;
      }

      $orgs['#logoBg'].dispatchAction('css', ['right', `-${percentage}%`]);
    },

    mainContentReveal: () => {
      const bodyContainState = $orgs['#bodyContain'].getState();
      const mainContentItemLastTop = $orgs['.main__content__item--last'].getState().boundingClientRect.top;
      const windowState = $orgs.window.getState();

      if (mainContentItemLastTop < windowState.height && bodyContainState.style.height !== 'auto') {
        $orgs['#bodyContain'].dispatchAction('css', ['height', 'auto']);
      }

      // Do not proceed if all sliders have slid.
      if (!$orgs['.main__content__slider'].$items.length) {
        return;
      }

      const mainContentItems = $orgs['.main__content__item'];
      const mainContentSliders = $orgs['.main__content__slider'];

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
    },

    updateWindowDims: debounce(() => {$orgs.window.getState();})
  }
};
