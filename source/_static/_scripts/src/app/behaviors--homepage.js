import Behaviors from './behaviors.js';
import videoGenerate from './video-generate.js';

// Declare with let outside the constructor because at this point during server-side tests, window is still undefined.
// Not feasible to declare within constructor for server-side tests because window.main_content_translate_y would be
// undefined.
let mainContentTranslateY = 150;

if (typeof window === 'object') {
  // main_content_translate_y is the rem distance the sliding pane is supposed to move.
  // We multiply this by 30 first, to translate it into px distance and second, to add buffer to determine the threshold
  // beyond which we slide another pane.
  mainContentTranslateY = window.main_content_translate_y * 30;
}

function intToRem(distance) {
  return `${distance / 10}rem`;
}

export default class extends Behaviors {
  constructor(requerio, root) {
    super(requerio, root);

    this.bgColorRevealFrameId = null;
    this.bgColorRevealRedLast = 255;
    this.bgColorRevealGreenLast = 255;
    this.bgColorRevealBlueLast = 255;
    this.bgColorRevealAlphaLast = 0;
    this.mainContentSlideInFrameId = null;
    this.mainContentSlideOutFrameId = null;
  }

  bgColorReveal(windowState) {
    if (this.bgColorRevealFrameId) {
      return;
    }

    const brandingState = this.$orgs['#branding'].getState();
    const panesOrg = this.$orgs['.content__pane'];
    const panesLength = panesOrg.getState().$members.length;
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
            red = this.root.fepper_green_r;
            green = this.root.fepper_green_g;
            blue = this.root.fepper_green_b;

            break;
          }

          case 3: {
            red = this.root.fepper_yellow_r;
            green = this.root.fepper_yellow_g;
            blue = this.root.fepper_yellow_b;

            break;
          }

          case 5: {
            red = this.root.fepper_red_r;
            green = this.root.fepper_red_g;
            blue = this.root.fepper_red_b;

            break;
          }
        }

        alpha = paneState.boundingClientRect.top - windowState.height;
        alpha = alpha / (windowState.height - brandingState.innerHeight);
        alpha = (alpha * alpha) / 10;

        if (
          this.bgColorRevealRedLast === red &&
          this.bgColorRevealGreenLast === green &&
          this.bgColorRevealBlueLast === blue &&
          this.bgColorRevealAlphaLast === alpha
        ) {
          return;
        }

        this.bgColorRevealRedLast = red;
        this.bgColorRevealGreenLast = green;
        this.bgColorRevealBlueLast = blue;
        this.bgColorRevealAlphaLast = alpha;
        // eslint-disable-next-line no-loop-func
        this.bgColorRevealFrameId = requestAnimationFrame(() => {
          this.$orgs['.content__pane']
            .dispatchAction('css', {'background-color': `rgba(${red}, ${green}, ${blue}, ${alpha})`}, i);

          this.bgColorRevealFrameId = null;
        });

        break;
      }

      // Only need this else case for testing. The pane should be out of view.
      else if (paneState.boundingClientRect.top >= windowState.height) {
        if (paneState.css['background-color'] !== 'transparent') {
          this.$orgs['.content__pane'].dispatchAction('css', {'background-color': 'transparent'}, i);
        }
      }
    }
  }

  gitHubHrefAdapt(project) {
    const hrefBase = 'redirect.html?url=https://github.com/electric-eloquence/fepper';
    let hrefDownload = hrefBase;
    let hrefReadme = hrefBase;

    switch (project) {
      case 'drupal':
      case 'wordpress':
        hrefDownload += `-${project}/releases/latest`;
        hrefReadme += `-${project}%23readme`;

        this.$orgs['.link--github__anchor--download'].dispatchAction('attr', {href: hrefDownload});
        this.$orgs['.link--github__anchor--readme'].dispatchAction('attr', {href: hrefReadme});
    }
  }

  mainContentSlideIn(windowState) {
    if (this.mainContentSlideInFrameId) {
      return;
    }

    const panesOrg = this.$orgs['.content__pane'];
    const slidersOrg = this.$orgs['.content__slider'];
    const panesCount = panesOrg.getState().$members.length;

    for (let i = 0; i < panesCount; i++) {
      if (slidersOrg.$members[i].hasClass('content__slid')) {
        continue;
      }

      const paneState = panesOrg.getState(i);
      const paneDistanceToBottom = windowState.height - paneState.boundingClientRect.top;

      if (paneDistanceToBottom > mainContentTranslateY) {
        // eslint-disable-next-line no-loop-func
        this.mainContentSlideInFrameId = requestAnimationFrame(() => {
          slidersOrg.dispatchAction('addClass', 'content__slid', i);

          this.mainContentSlideInFrameId = null;
        });

        break;
      }
    }
  }

  mainContentSlideOut(windowState) {
    if (this.mainContentSlideOutFrameId) {
      return;
    }

    const panesOrg = this.$orgs['.content__pane'];
    const slidersOrg = this.$orgs['.content__slider'];
    const panesCount = panesOrg.getState().$members.length;

    for (let i = 0; i < panesCount; i++) {
      if (!slidersOrg.$members[i].hasClass('content__slid')) {
        break;
      }

      const paneState = panesOrg.getState(i);
      const paneDistanceToBottom = windowState.height - paneState.boundingClientRect.top;

      if (paneDistanceToBottom <= mainContentTranslateY) {
        // eslint-disable-next-line no-loop-func
        this.mainContentSlideOutFrameId = requestAnimationFrame(() => {
          slidersOrg.dispatchAction('removeClass', 'content__slid', i);

          this.mainContentSlideOutFrameId = null;
        });

        break;
      }
    }
  }

  scrollButtonDisplay() {
    const brandingOrg = this.$orgs['#branding'];
    const brandingState = brandingOrg.getState();
    const scrollButtonOrg = this.$orgs['.button--scroll--up'];
    const scrollButtonState = scrollButtonOrg.getState();
    const slidersOrg = this.$orgs['.content__slider'];
    const slidersState = slidersOrg.getState();

    // This > 1 (instead of > 0) tweak helps in Firefox.
    if (Math.floor(brandingState.boundingClientRect.top) > 1) {
      if (scrollButtonState.css.display !== 'none') {
        scrollButtonOrg.dispatchAction('css', {display: 'none'});
      }
    }
    else {
      if (scrollButtonState.css.display !== 'block') {
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
  }

  scrollButtonDown() {
    const brandingState = this.$orgs['#branding'].getState();
    const bodyOrg = this.$orgs['#body'];
    const htmlOrg = this.$orgs['#html'];
    const panesOrg = this.$orgs['.content__pane'];
    const panesCount = panesOrg.$members.length;
    const videoState = this.$orgs['.video'].getState();
    let distancePanes = 0;

    for (let i = 0; i < panesCount; i++) {
      const paneState = panesOrg.getState(i);
      const distanceTop = paneState.boundingClientRect.top;

      // This + 1 tweak helps in Firefox.
      if (Math.floor(distanceTop) > brandingState.innerHeight + 1) {
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
  }

  scrollButtonUp() {
    const brandingState = this.$orgs['#branding'].getState();
    const bodyOrg = this.$orgs['#body'];
    const htmlOrg = this.$orgs['#html'];
    const panesOrg = this.$orgs['.content__pane'];
    const panesCount = panesOrg.$members.length;
    const videoState = this.$orgs['.video'].getState();
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
  }

  updateDims() {
    const blocksOrg = this.$orgs['.content__block'];
    const panesOrg = this.$orgs['.content__pane'];
    const panesCount = panesOrg.getState().$members.length;

    for (let i = 0; i < panesCount; i++) {
      let height = 0;

      if (i === 0) {
        height += blocksOrg.getState(0).innerHeight;
      }

      height += blocksOrg.getState(i + 1).innerHeight;

      panesOrg.dispatchAction('css', {height: intToRem(height)}, i);
    }
  }

  videoGenerate(logicalImages, $orgs, timeout) {
    return videoGenerate(logicalImages, $orgs, timeout);
  }

  async videoRender(logicalImages) {
    const videoPlay = this.videoGenerate(logicalImages, this.$orgs, 13000);
    let i;

    // eslint-disable-next-line no-cond-assign
    while (i = await videoPlay.next()) {
      if (i.done) {
        break;
      }
    }
  }
}
