import videoGenerate from './video-generate.js';

let bgColorRevealFrameId = null;
let bgColorRevealRedLast = 255;
let bgColorRevealGreenLast = 255;
let bgColorRevealBlueLast = 255;
let bgColorRevealAlphaLast = 0;
let logoRipenFrameId = null;
let logoRipenTranslateXLast = '0%';
let mainContentSlideInFrameId = null;
let mainContentSlideOutFrameId = null;
let mainContentTranslateY = 150;
let paneDistanceToBottomLast = null;

if (typeof window === 'object') {
  // main_content_translate_y is the rem distance the sliding pane is supposed to move.
  // We multiply this by 30 first, to translate it into px distance and second, to add buffer to determine the threshold
  // beyond which we slide another pane.
  mainContentTranslateY = window.main_content_translate_y * 30;
}

function intToRem(distance) {
  return `${distance / 10}rem`;
}

export default (app, root) => {
  const $orgs = app.$orgs;

  return {
    init: () => {
      // If this init function can run, we know that ES6 Modules are enabled and that the requisite styles can therefore
      // be applied.
      $orgs['#html'].dispatchAction('addClass', 'es6-modules-enabled');
    },

    bgColorReveal: () => {
      if (bgColorRevealFrameId) {
        return;
      }

      const brandingState = $orgs['#branding'].getState();
      const panesOrg = $orgs['.content__pane'];
      const panesLength = panesOrg.getState().$members.length;
      const windowState = $orgs.window.getState();
      let paneState;

      for (let i = 1; i < panesLength; i += 2) {
        paneState = panesOrg.getState(i);

        if (
          paneState.boundingClientRect.top < windowState.height &&
          paneState.boundingClientRect.top > brandingState.innerHeight
        ) {
          let red;
          let green;
          let blue;
          let alpha;

          // Calculate bgColor.
          switch (i) {
            case 1: {
              red = root.fepper_green_r;
              green = root.fepper_green_g;
              blue = root.fepper_green_b;

              break;
            }

            case 3: {
              red = root.fepper_yellow_r;
              green = root.fepper_yellow_g;
              blue = root.fepper_yellow_b;

              break;
            }

            case 5: {
              red = root.fepper_red_r;
              green = root.fepper_red_g;
              blue = root.fepper_red_b;

              break;
            }
          }

          alpha = paneState.boundingClientRect.top - windowState.height;
          alpha = alpha / (windowState.height - brandingState.innerHeight);
          alpha = (alpha * alpha) / 10;

          if (
            bgColorRevealRedLast === red &&
            bgColorRevealGreenLast === green &&
            bgColorRevealBlueLast === blue &&
            bgColorRevealAlphaLast === alpha
          ) {
            return;
          }

          bgColorRevealRedLast = red;
          bgColorRevealGreenLast = green;
          bgColorRevealBlueLast = blue;
          bgColorRevealAlphaLast = alpha;
          // eslint-disable-next-line no-loop-func
          bgColorRevealFrameId = requestAnimationFrame(() => {
            $orgs['.content__pane']
              .dispatchAction('css', {'background-color': `rgba(${red}, ${green}, ${blue}, ${alpha})`}, i);

            bgColorRevealFrameId = null;
          });

          break;
        }

        // Only need this else case for testing. The pane should be out of view.
        else if (paneState.boundingClientRect.top >= windowState.height) {
          if (paneState.style['background-color'] !== 'transparent') {
            $orgs['.content__pane'].dispatchAction('css', {'background-color': 'transparent'}, i);
          }
        }
      }
    },

    gitHubHrefAdapt: (project) => {
      const hrefBase = 'redirect.html?url=https://github.com/electric-eloquence/fepper';
      let hrefHome = hrefBase;
      let hrefDownload = hrefBase;
      let hrefReadme = hrefBase;

      switch (project) {
        case 'drupal':
        case 'wordpress':
          hrefHome += `-${project}`;
          hrefDownload += `-${project}/releases/latest`;
          hrefReadme += `-${project}%23readme`;

          $orgs['.logo--linked'].dispatchAction('attr', {href: hrefHome});
          $orgs['.link-github__anchor--download'].dispatchAction('attr', {href: hrefDownload});
          $orgs['.link-github__anchor--readme'].dispatchAction('attr', {href: hrefReadme});
      }
    },

    logoRipen: () => {
      if (logoRipenFrameId) {
        return;
      }

      const MAX_PERCENTAGE = 90;
      const htmlState = $orgs['#html'].getState();
      const windowState = $orgs.window.getState();
      const windowHeight = windowState.height;
      let percentage;
      percentage = Math.round(100 * windowState.scrollTop / (htmlState.height - windowHeight));

      if (percentage < 0) {
        percentage = 0;
      }
      else if (percentage > MAX_PERCENTAGE) {
        percentage = MAX_PERCENTAGE;
      }

      const translateX = `-${percentage}%`;

      if (logoRipenTranslateXLast === translateX) {
        return;
      }

      logoRipenTranslateXLast = translateX;
      logoRipenFrameId = requestAnimationFrame(() => {
        $orgs['#logoBg'].dispatchAction('css', {transform: `translateX(${translateX})`});

        logoRipenFrameId = null;
      });
    },

    mainContentSlideIn: () => {
      if (mainContentSlideInFrameId) {
        return;
      }

      const panesOrg = $orgs['.content__pane'];
      const slidersOrg = $orgs['.content__slider'];
      const panesCount = panesOrg.getState().$members.length;
      let i = panesCount;

      while (i--) {
        if (slidersOrg.$members[i].hasClass('content__slid')) {
          break;
        }

        const paneState = panesOrg.getState(i);
        const windowState = $orgs.window.getState();
        const paneDistanceToBottom = windowState.height - paneState.boundingClientRect.top;

        if (paneDistanceToBottomLast === paneDistanceToBottom) {
          return;
        }

        paneDistanceToBottomLast = paneDistanceToBottom;

        if (paneDistanceToBottom > mainContentTranslateY) {
          // eslint-disable-next-line no-loop-func
          mainContentSlideInFrameId = requestAnimationFrame(() => {
            slidersOrg.dispatchAction('addClass', 'content__slid', i);

            mainContentSlideInFrameId = null;
          });

          break;
        }
      }
    },

    mainContentSlideOut: () => {
      if (mainContentSlideOutFrameId) {
        return;
      }

      const panesOrg = $orgs['.content__pane'];
      const slidersOrg = $orgs['.content__slider'];
      const panesCount = panesOrg.getState().$members.length;

      for (let i = 0; i < panesCount; i++) {
        if (!slidersOrg.$members[i].hasClass('content__slid')) {
          break;
        }

        const paneState = panesOrg.getState(i);
        const windowState = $orgs.window.getState();
        const paneDistanceToBottom = windowState.height - paneState.boundingClientRect.top;

        if (paneDistanceToBottomLast === paneDistanceToBottom) {
          return;
        }

        paneDistanceToBottomLast = paneDistanceToBottom;

        if (paneDistanceToBottom <= mainContentTranslateY) {
          // eslint-disable-next-line no-loop-func
          mainContentSlideOutFrameId = requestAnimationFrame(() => {
            slidersOrg.dispatchAction('removeClass', 'content__slid', i);

            mainContentSlideOutFrameId = null;
          });

          break;
        }
      }
    },

    scrollButtonDisplay: () => {
      const brandingOrg = $orgs['#branding'];
      const brandingState = brandingOrg.getState();
      const scrollButtonOrg = $orgs['.scroll-button--up'];
      const scrollButtonState = scrollButtonOrg.getState();
      const slidersOrg = $orgs['.content__slider'];
      const slidersState = slidersOrg.getState();

      if (Math.floor(brandingState.boundingClientRect.top) > 1) {
        if (scrollButtonState.style.display !== 'none') {
          scrollButtonOrg.dispatchAction('css', {display: 'none'});
        }
      }
      else {
        if (scrollButtonState.style.display !== 'block') {
          scrollButtonOrg.dispatchAction('css', {display: 'block'});
        }
      }

      // Since this behavior runs after scroll events get debounced, use it to ensure that all sliders that require the
      // content__slid class get it.
      let hasSlid = false;
      let i = slidersState.$members.length;

      while (i--) {
        if (slidersState.$members[i].classArray.includes('content__slid')) {
          hasSlid = true;
        }
        else if (hasSlid) {
          slidersOrg.dispatchAction('addClass', 'content__slid', i);
        }
      }
    },

    scrollButtonDown: () => {
      const brandingState = $orgs['#branding'].getState();
      const bodyOrg = $orgs['#body'];
      const htmlOrg = $orgs['#html'];
      const panesOrg = $orgs['.content__pane'];
      const panesCount = panesOrg.$members.length;
      const videoState = $orgs['.video'].getState();
      let distancePanes = 0;

      for (let i = 0; i < panesCount; i++) {
        const paneState = panesOrg.getState(i);
        const distanceTop = paneState.boundingClientRect.top;

        if (Math.floor(distanceTop) > brandingState.innerHeight) {
          if (i === 0) {
            htmlOrg.animate({scrollTop: videoState.innerHeight});
            bodyOrg.animate({scrollTop: videoState.innerHeight});
          }
          else {
            htmlOrg.animate({scrollTop: videoState.innerHeight + distancePanes});
            bodyOrg.animate({scrollTop: videoState.innerHeight + distancePanes});
          }

          break;
        }

        distancePanes += paneState.innerHeight;
      }
    },

    scrollButtonUp: () => {
      const brandingState = $orgs['#branding'].getState();
      const bodyOrg = $orgs['#body'];
      const htmlOrg = $orgs['#html'];
      const panesOrg = $orgs['.content__pane'];
      const panesCount = panesOrg.$members.length;
      const videoState = $orgs['.video'].getState();
      let i;
      let distancePanes = 0;
      let scrolled = false;

      for (i = 0; i < panesCount; i++) {
        const paneState = panesOrg.getState(i);
        distancePanes += paneState.innerHeight;
      }

      while (i--) {
        const paneState = panesOrg.getState(i);
        const distanceTop = paneState.boundingClientRect.top;
        distancePanes -= paneState.innerHeight;

        if (i === panesCount - 1) {
          continue;
        }

        if (distanceTop < brandingState.innerHeight) {
          let distanceScroll = videoState.innerHeight + distancePanes;

          htmlOrg.animate({scrollTop: distanceScroll});
          bodyOrg.animate({scrollTop: distanceScroll});

          scrolled = true;

          break;
        }
      }

      if (i === -1 && !scrolled) {
        htmlOrg.animate({scrollTop: 0});
        bodyOrg.animate({scrollTop: 0});
      }
    },

    updateDims: () => {
      $orgs.window.getState();

      const blocksOrg = $orgs['.content__block'];
      const panesOrg = $orgs['.content__pane'];
      const panesCount = panesOrg.getState().$members.length;

      for (let i = 0; i < panesCount; i++) {
        let height = 0;

        if (i === 0) {
          height += blocksOrg.getState(0).innerHeight;
        }

        height += blocksOrg.getState(i + 1).innerHeight;

        panesOrg.dispatchAction('css', {height: intToRem(height)}, i);
      }
    },

    videoGenerate,

    videoRender: async (logicalImages) => {
      const videoImgsOrg = $orgs['.video__img'];
      const videoPlay = videoGenerate(logicalImages, videoImgsOrg, 13000);
      let i;

      // eslint-disable-next-line no-cond-assign
      while (i = await videoPlay.next()) {
        if (i.done) {
          break;
        }
      }
    }
  };
};
