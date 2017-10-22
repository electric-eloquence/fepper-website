'use strict';

function intToRem(distance) {
  return `${distance / 10}rem`;
}

var actionsGet = (app, root) => {
  const $orgs = app.$orgs;

  return {
    bgColorReveal: () => {
      const brandingState = $orgs['#branding'].getState();
      const paneOrg = $orgs['.main__content__pane'];
      const panesLength = paneOrg.getState().$items.length;
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
            .dispatchAction('css', ['background-color', `rgba(${red}, ${green}, ${blue}, ${alpha})`], i);
        }

        // Only need this else case for testing. The pane should be out of view.
        else if (paneState.boundingClientRect.top >= windowState.height) {
          if (paneState.style['background-color'] !== 'transparent') {
            $orgs['.main__content__pane'].dispatchAction('css', ['background-color', 'transparent'], i);
          }
        }
      }
    },

    flagModulesEnabled: () => {
      $orgs['#html'].dispatchAction('addClass', 'es6-modules-enabled');
    },

    logoFix: () => {
      const bodyState = $orgs['#body'].getState();
      const videoHeadState = $orgs['#videoHead'].getState();
      const windowState = $orgs.window.getState();

      if (windowState.scrollTop > videoHeadState.innerHeight) {
        if (bodyState.attribs.class.indexOf('logo-fixed') === -1) {
          const brandingState = $orgs['#branding'].getState();

          $orgs['#body'].dispatchAction('addClass', 'logo-fixed');
          $orgs['#branding'].dispatchAction('css', {position: 'fixed', top: '0'});
          $orgs['#foundation']
            .dispatchAction('css', {'padding-top': intToRem(brandingState.innerHeight)});
          $orgs['#mainContent']
            .dispatchAction('css', {'padding-top': intToRem(brandingState.innerHeight)});
        }
      }
      else {
        if (bodyState.attribs.class.indexOf('logo-fixed') > -1) {
          $orgs['#body'].dispatchAction('removeClass', 'logo-fixed');
          $orgs['#branding'].dispatchAction('css', {position: 'static', top: 'auto'});
          $orgs['#foundation'].dispatchAction('css', ['padding-top', '0']);
          $orgs['#mainContent'].dispatchAction('css', ['padding-top', '0']);
        }
      }
    },

    logoFixedPaddingAdjust: () => {
      const bodyState = $orgs['#body'].getState();

      if (bodyState.attribs.class.indexOf('logo-fixed') > -1) {
        const brandingState = $orgs['#branding'].getState();

        $orgs['#foundation'].dispatchAction('css', {'padding-top': intToRem(brandingState.innerHeight)});
        $orgs['#mainContent'].dispatchAction('css', {'padding-top': intToRem(brandingState.innerHeight)});
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

      $orgs['#logoBg'].dispatchAction('css', ['right', `-${percentage}%`]);
    },

    mainContentReveal: () => {
      const slidersOrg = $orgs['.main__content__slider'];
      const slidersCount = slidersOrg.getState().$items.length;

      if (!slidersCount) {
        return;
      }

      const slidsOrg = $orgs['.main__content__slid'];
      const slidsCount = slidsOrg.getState().$items.length;

      let scrollThreshold = 0;

      for (let i = 0; i < slidsCount; i++) {
        scrollThreshold += slidsOrg.getState(i).innerHeight;
      }

      const windowState = $orgs.window.getState();

      if (windowState.scrollTop > scrollThreshold) {
        slidersOrg.dispatchAction('addClass', 'main__content__slid', 0);
        slidersOrg.dispatchAction('removeClass', 'main__content__slider', 0);
      }
    },

    updateDims: () => {
      $orgs.window.getState();

      const blocksOrg = $orgs['.main__content__block'];
      const panesOrg = $orgs['.main__content__pane'];
      const panesCount = panesOrg.getState().$items.length;

      for (let i = 0; i < panesCount; i++) {
        let height = 0;

        if (i === 0) {
          height += blocksOrg.getState(0).innerHeight;
        }

        height += blocksOrg.getState(i + 1).innerHeight;

        panesOrg.dispatchAction('css', {height: intToRem(height)}, i);
      }
    }
  };
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
  '#bodyContain': null,
  '#videoHead': null,
  '#branding': null,
  '#logoBg': null,
  '#logoImg': null,
  '#main': null,
  '#browserAdvice': null,
  '#foundation': null,
  '#mainContent': null,
  '.main__content__pane': null,
  '.main__content__block': null,
  '.main__content__slid': null,
  '.main__content__slider': null,
  '.footer': null
};

var bundleNode = {
  actionsGet: actionsGet,
  $organisms: $organisms
};

module.exports = bundleNode;
