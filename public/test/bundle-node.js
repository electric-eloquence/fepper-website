'use strict';

let isClient = false;
let isEdge = false;

if (typeof window === 'object') {
  isClient = true;
  isEdge = window.navigator.userAgent.indexOf('Edge') > -1;
}

function videoPromise(logicalImages, videoImgsOrg, timeout) {
  function cacheBust() {
    return `?${Date.now()}`;
  }

  function dispatch(memberIdxs) {
    videoImgsOrg.dispatchAction('css', ['display', 'none'], memberIdxs[0]);
    videoImgsOrg.dispatchAction('css', ['display', 'none'], memberIdxs[1]);
    videoImgsOrg.dispatchAction('css', ['display', 'none'], memberIdxs[2]);

    videoImgsOrg.dispatchAction('attr', ['src', '#'], memberIdxs[0]);
    videoImgsOrg.dispatchAction('attr', ['src', '#'], memberIdxs[1]);
    videoImgsOrg.dispatchAction('attr', ['src', '#'], memberIdxs[2]);

    videoImgsOrg.dispatchAction('attr', ['src', logicalImages['06'].src], memberIdxs[3]);
    videoImgsOrg.dispatchAction('attr', ['src', logicalImages['07'].src], memberIdxs[4]);
    videoImgsOrg.dispatchAction('attr', ['src', logicalImages['08'].src], memberIdxs[5]);

    videoImgsOrg.dispatchAction('attr', ['src', logicalImages['03'].src], memberIdxs[6]);
    videoImgsOrg.dispatchAction('attr', ['src', logicalImages['04'].src], memberIdxs[7]);
    videoImgsOrg.dispatchAction('attr', ['src', logicalImages['05'].src], memberIdxs[8]);
  }

  function generate(memberIdxs, resolve) {
    setTimeout(() => {
      if (isEdge) {
        logicalImages['03'].src = `../../_assets/src/video-03.gif${cacheBust()}`;
        logicalImages['04'].src = `../../_assets/src/video-04.gif${cacheBust()}`;
        logicalImages['05'].src = `../../_assets/src/video-05.gif${cacheBust()}`;
        logicalImages['06'].src = `../../_assets/src/video-06.gif${cacheBust()}`;
        logicalImages['07'].src = `../../_assets/src/video-07.gif${cacheBust()}`;
        logicalImages['08'].src = `../../_assets/src/video-08.gif${cacheBust()}`;
      }

      dispatch(memberIdxs);

      resolve();
    }, timeout);
  }

  return [
    // Iteration 0
    // Generation 0
    function () {
      return new Promise((resolve) => {
        logicalImages['03'].src = '../../_assets/src/video-03.gif';
        logicalImages['04'].src = '../../_assets/src/video-04.gif';
        logicalImages['05'].src = '../../_assets/src/video-05.gif';

        if (isClient) {
          logicalImages['03'].onload = function () {
            if (logicalImages['04'].complete && logicalImages['05'].complete) {
              resolve();
            }
          };

          logicalImages['04'].onload = () => {
            if (logicalImages['03'].complete && logicalImages['05'].complete) {
              resolve();
            }
          };

          logicalImages['05'].onload = () => {
            if (logicalImages['03'].complete && logicalImages['04'].complete) {
              resolve();
            }
          };
        }

        resolve();
      });
    },

    // Iteration 1
    // Generation 0
    function () {
      logicalImages['06'].src = '../../_assets/src/video-06.gif';
      logicalImages['07'].src = '../../_assets/src/video-07.gif';
      logicalImages['08'].src = '../../_assets/src/video-08.gif';

      videoImgsOrg.dispatchAction('attr', ['src', logicalImages['03'].src], 3);
      videoImgsOrg.dispatchAction('attr', ['src', logicalImages['04'].src], 4);
      videoImgsOrg.dispatchAction('attr', ['src', logicalImages['05'].src], 5);

      return Promise.resolve();
    },

    // Iteration 2
    // Generation 1
    function () {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (isEdge) {
            logicalImages['03'].src = `../../_assets/src/video-03.gif${cacheBust()}`;
            logicalImages['04'].src = `../../_assets/src/video-04.gif${cacheBust()}`;
            logicalImages['05'].src = `../../_assets/src/video-05.gif${cacheBust()}`;
          }

          dispatch([3, 4, 5, 6, 7, 8, 9, 10, 11]);

          resolve();
        }, timeout);
      });
    },

    // Iteration 3
    // Generation 2
    function () {
      return new Promise((resolve) => {
        generate([9, 10, 11, 12, 13, 14, 15, 16, 17], resolve);
      });
    },

    // Iteration 4
    // Generation 3
    function () {
      return new Promise((resolve) => {
        generate([15, 16, 17, 18, 19, 20, 21, 22, 23], resolve);
      });
    },

    // Iteration 5
    // Generation 4
    function () {
      return new Promise((resolve) => {
        generate([21, 22, 23, 24, 25, 26, 27, 28, 29], resolve);
      });
    },

    // Iteration 6
    // Generation 5
    function () {
      return new Promise((resolve) => {
        generate([27, 28, 29, 30, 31, 32, 33, 34, 35], resolve);
      });
    },

    // Iteration 7
    // Generation 6
    function () {
      return new Promise((resolve) => {
        generate([33, 34, 35, 36, 37, 38, 39, 40, 41], resolve);
      });
    },

    // Iteration 8
    // Generation 7
    function () {
      return new Promise((resolve) => {
        generate([39, 40, 41, 42, 43, 44, 45, 46, 47], resolve);
      });
    },

    // Iteration 9
    // Generation 8
    function () {
      return new Promise((resolve) => {
        generate([45, 46, 47, 48, 49, 50, 51, 52, 53], resolve);
      });
    }
  ];
}

// import videoGenerate from '../../bld/video-generate.js';
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

var behaviorsGet = (app, root) => {
  const $orgs = app.$orgs;

  return {
    init: () => {
      // If this init function can run, we know that ES6 Modules are enabled and that the requisite styles can therefore
      // be applied.
      $orgs['#html'].dispatchAction('addClass', 'es6-modules-enabled');

      // Remove this if position: sticky ever renders well on MS Edge.
      if (typeof window === 'object' && window.navigator.userAgent.indexOf('Edge') > -1) {
        $orgs['#html'].dispatchAction('addClass', 'ms-edge');
      }
    },

    bgColorReveal: () => {
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

          $orgs['.content__pane']
            .dispatchAction('css', {'background-color': `rgba(${red}, ${green}, ${blue}, ${alpha})`}, i);
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
      const hrefBase = 'https://github.com/electric-eloquence/fepper';

      let hrefDownload = hrefBase;
      let hrefReadme = hrefBase;

      switch (project) {
        case 'drupal':
        case 'wordpress':
          hrefDownload += `-${project}/releases/latest`;
          hrefReadme += `-${project}#readme`;

          $orgs['.link-github__anchor--download'].dispatchAction('attr', {href: hrefDownload});
          $orgs['.link-github__anchor--readme'].dispatchAction('attr', {href: hrefReadme});
      }
    },

    logoRipen: () => {
      const MAX_PERCENTAGE = 900;
      const htmlState = $orgs['#html'].getState();
      const windowState = $orgs.window.getState();
      const windowHeight = windowState.height;

      let percentage;
      percentage = windowState.scrollTop / (htmlState.height - windowHeight);
      percentage = MAX_PERCENTAGE - (MAX_PERCENTAGE * percentage);

      if (percentage < 0) {
        percentage = 0;
      }
      else if (percentage > MAX_PERCENTAGE) {
        percentage = MAX_PERCENTAGE;
      }

      $orgs['#logoBg'].dispatchAction('css', {right: `-${percentage}%`});
    },

    mainContentSlideIn: () => {
      const panesOrg = $orgs['.content__pane'];
      const slidersOrg = $orgs['.content__slider'];
      const panesCount = panesOrg.getState().$members.length;

      for (let i = panesCount - 1; i >= 0; i--) {
        if (slidersOrg.$members[i].hasClass('content__slid')) {
          break;
        }

        const paneState = panesOrg.getState(i);
        const windowState = $orgs.window.getState();
        const paneDistanceToBottom = windowState.height - paneState.boundingClientRect.top;

        if (paneDistanceToBottom > mainContentTranslateY) {
          slidersOrg.dispatchAction('addClass', 'content__slid', i);
        }
      }
    },

    mainContentSlideOut: () => {
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

        if (paneDistanceToBottom <= mainContentTranslateY) {
          slidersOrg.dispatchAction('removeClass', 'content__slid', i);
        }
      }
    },

    scrollButtonDisplay: () => {
      const brandingOrg = $orgs['#branding'];
      const brandingState = brandingOrg.getState();
      const scrollButtonOrg = $orgs['.scroll-button--up'];
      const scrollButtonState = scrollButtonOrg.getState();

      if (brandingState.boundingClientRect.top > 0) {
        if (scrollButtonState.style.display !== 'none') {
          scrollButtonOrg.dispatchAction('css', {display: 'none'});
        }
      }
      else {
        if (scrollButtonState.style.display !== 'block') {
          scrollButtonOrg.dispatchAction('css', {display: 'block'});
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
      const windowState = $orgs.window.getState();
      const windowHeight = windowState.height;

      let i;
      let distancePanes = 0;

      for (i = 0; i < panesCount; i++) {
        const htmlState = htmlOrg.getState();
        const paneState = panesOrg.getState(i);
        const distanceTop = paneState.boundingClientRect.top;
        const threshold = (windowHeight - paneState.innerHeight) / 2;

        if (Math.floor(distanceTop) > Math.ceil(threshold)) {
          if (i < panesCount - 1) {
            const distanceScroll = videoState.innerHeight + brandingState.innerHeight + distancePanes - threshold;

            htmlOrg.animate({scrollTop: distanceScroll});
            bodyOrg.animate({scrollTop: distanceScroll});
          }
          else {
            htmlOrg.animate({scrollTop: htmlState.innerHeight - windowHeight});
            bodyOrg.animate({scrollTop: htmlState.innerHeight - windowHeight});
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
      const windowState = $orgs.window.getState();
      const windowHeight = windowState.height;

      let i;
      let distancePanes = 0;

      for (i = 0; i < panesCount; i++) {
        const paneState = panesOrg.getState(i);
        distancePanes += paneState.innerHeight;
      }

      while (i--) {
        const paneState = panesOrg.getState(i);
        const distanceTop = paneState.boundingClientRect.top;
        const threshold = (windowHeight - paneState.innerHeight) / 2;
        distancePanes -= paneState.innerHeight;

        if (distanceTop < threshold) {
          const distanceScroll = videoState.innerHeight + brandingState.innerHeight + distancePanes - threshold;

          htmlOrg.animate({scrollTop: distanceScroll});
          bodyOrg.animate({scrollTop: distanceScroll});

          break;
        }
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

    videoPromise: videoPromise,

    videoRender: async (logicalImages) => {
      const videoImgsOrg = $orgs['.video__img'];
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

/**
 * Declare keys with null values here.
 *
 * @returns {object} Keyed by organism ID.
 */
var $organisms = {
  'window': null,
  '#html': null,
  '#body': null,
  '.scroll-button--up': null,
  '.scroll-button--down': null,
  '.video': null,
  '.video__img': null,
  '#branding': null,
  '#logoBg': null,
  '.content__pane': null,
  '.content__block': null,
  '.content__slider': null,
  '.hider': null,
  '.link-github__anchor--download': null,
  '.link-github__anchor--readme': null
};

var bundleNode = {
  behaviorsGet,
  $organisms
};

module.exports = bundleNode;
