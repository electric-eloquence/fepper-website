// import videoGenerate from '../../bld/video-generate.js';
import videoPromise from './video-promise.js';

function intToRem(distance) {
  return `${distance / 10}rem`;
}

let mainContentTranslateY = 150;

if (typeof window === 'object') {
  // main_content_translate_y is the rem distance the sliding pane is supposed to move.
  // We multiply this by 30 first, to translate it into px distance and second, to add buffer to determine the threshold
  // beyond which we slide another pane.
  mainContentTranslateY = window.main_content_translate_y * 30;
}

export default (app, root) => {
  const $orgs = app.$orgs;

  return {
    bgColorReveal: () => {
      const brandingState = $orgs['#branding'].getState();
      const paneOrg = $orgs['.main__content__pane'];
      const panesLength = paneOrg.getState().$members.length;
      const windowState = $orgs.window.getState();

      let paneState;

      for (let i = 1; i < panesLength; i += 2) {
        paneState = paneOrg.getState(i);

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

          $orgs['.main__content__pane']
            .dispatchAction('css', {'background-color': `rgba(${red}, ${green}, ${blue}, ${alpha})`}, i);
        }

        // Only need this else case for testing. The pane should be out of view.
        else if (paneState.boundingClientRect.top >= windowState.height) {
          if (paneState.style['background-color'] !== 'transparent') {
            $orgs['.main__content__pane'].dispatchAction('css', {'background-color': 'transparent'}, i);
          }
        }
      }
    },

    flagModulesEnabled: () => {
      $orgs['#html'].dispatchAction('addClass', 'es6-modules-enabled');

      // Remove this if position: sticky ever renders well on MS Edge.
      if (typeof window === 'object' && window.navigator.userAgent.indexOf('Edge') > -1) {
        $orgs['#html'].dispatchAction('addClass', 'ms-edge');
      }
    },

    logoRipen: () => {
      const MAX_PERCENTAGE = 400;
      const htmlState = $orgs['#html'].getState();
      const windowState = $orgs.window.getState();
      const windowHeight = windowState.height;

      let percentage;
      percentage = windowState.scrollTop / (htmlState.height - windowHeight);
      percentage = MAX_PERCENTAGE * percentage;

      if (percentage >= MAX_PERCENTAGE) {
        percentage = MAX_PERCENTAGE;
      }

      $orgs['#logoBg'].dispatchAction('css', {right: `-${percentage}%`});
    },

    mainContentSlideIn: () => {
      const panesOrg = $orgs['.main__content__pane'];
      const slidersOrg = $orgs['.main__content__slider'];
      const panesCount = panesOrg.getState().$members.length;

      for (let i = panesCount - 1; i >= 0; i--) {
        if (slidersOrg.$members[i].hasClass('main__content__slid')) {
          break;
        }

        const paneState = panesOrg.getState(i);
        const windowState = $orgs.window.getState();
        const paneDistanceToBottom = windowState.height - paneState.boundingClientRect.top;

        if (paneDistanceToBottom > mainContentTranslateY) {
          slidersOrg.dispatchAction('addClass', 'main__content__slid', i);
        }
      }
    },

    mainContentSlideOut: () => {
      const panesOrg = $orgs['.main__content__pane'];
      const slidersOrg = $orgs['.main__content__slider'];
      const panesCount = panesOrg.getState().$members.length;

      for (let i = 0; i < panesCount; i++) {
        if (!slidersOrg.$members[i].hasClass('main__content__slid')) {
          break;
        }

        const paneState = panesOrg.getState(i);
        const windowState = $orgs.window.getState();
        const paneDistanceToBottom = windowState.height - paneState.boundingClientRect.top;

        if (paneDistanceToBottom <= mainContentTranslateY) {
          slidersOrg.dispatchAction('removeClass', 'main__content__slid', i);
        }
      }
    },

    updateDims: () => {
      $orgs.window.getState();

      const blocksOrg = $orgs['.main__content__block'];
      const panesOrg = $orgs['.main__content__pane'];
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

    videoPromise: videoPromise,

    videoRender: async (logicalImages) => {
      const videoImgsOrg = $orgs['.video-head__img'];
      const videoPlay = videoPromise(logicalImages, videoImgsOrg, 13000);

      for (let i = 0; i < videoPlay.length; i++) {
        await videoPlay[i]();
      }

      /*
      // Async generator syntax for when support is commonplace.
      const videoPlay = videoGenerate(logicalImages, videoImgsOrg, 13000);

      let i;

      while (i = await videoPlay.next()) {
        if (i.done) {
          break;
        }
      }
      */
    }
  };
};
