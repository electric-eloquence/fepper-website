'use strict';

export default app => {
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
        $orgs['#main'].dispatchAction('css', ['padding-top', `${brandingState.height}px`]);
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

      const htmlState = $orgs['#html'].getState();
      const windowState = $orgs.window.getState();
      const scrollTop = windowState.scrollTop;
      const mainContentItems = $orgs['.main__content__item'];
      let mainContentItemState = $orgs['.main__content__item'].getState();
      const mainContentSliders = $orgs['.main__content__slider'];
      let mainContentSliderState = $orgs['.main__content__slider'].getState();
      const firstMainContentItemState = mainContentSliders.getState(0);
console.warn(firstMainContentItemState);

console.warn(mainContentItemState);
//console.warn(mainContentSliderState.$items);

      const scrollDistance = htmlState.height - windowState.height;
      const scrollDivisor = scrollDistance / mainContentItemState.$items.length;
//      const scrollIndex = Math.floor(scrollTop / scrollDivisor);
      const scrollIndex = mainContentItemState.$items.length - mainContentSliderState.$items.length;

      let scrollThreshold = 0;
      for (let i = 0; i < scrollIndex; i++) {
        scrollThreshold += mainContentItems.getState(i).height;
      }
/*
console.warn(scrollDistance);
console.warn(scrollDivisor);
console.warn(scrollTop);
console.warn(scrollIndex);
*/
console.warn(scrollThreshold);



//      if (scrollPercent) {
        $orgs['.main__content__slider'].dispatchAction('addClass', 'main__content__slid', 0);
        $orgs['.main__content__slider'].dispatchAction('removeClass', 'main__content__slider', 0);
        $orgs['.main__content__slid'].dispatchAction('removeClass', 'main__content__slid', 0);
//console.warn(windowState.scrollTop);
//console.warn(scrollDistance);
//      }
//console.warn($('.main__content__slider'));

      mainContentItemState = $orgs['.main__content__item'].getState();
      mainContentSliderState = $orgs['.main__content__slider'].getState();
//console.warn(mainContentItemState.$items);
//console.warn(mainContentSliderState.$items);
    }
  }
};
