let logoRipenFrameId = null;
let logoRipenTranslateXLast = '0%';

export default class {
  constructor(requerio, root) {
    this.$orgs = requerio.$orgs;
    this.root = root;
  }

  debounce(callback, wait = 200, context = this) {
    let timeout;
    let callbackArgs;

    const later = () => callback.apply(context, callbackArgs);

    return () => {
      callbackArgs = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  logoRipen(windowState) {
    if (logoRipenFrameId) {
      return;
    }

    const MAX_PERCENTAGE = 90;
    const htmlState = this.$orgs['#html'].getState();
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
      this.$orgs['#logoBg'].dispatchAction('data', {gradientPosition: percentage});
      this.$orgs['#logoBg'].dispatchAction('css', {transform: `translateX(${translateX})`});

      logoRipenFrameId = null;
    });
  }

  navButtonsShift(windowState) {
    const bottomState = this.$orgs['.bottom'].getState();

    if (bottomState.boundingClientRect.top < windowState.innerHeight - 66) {
      this.$orgs['.nav--main__slider'].dispatchAction('addClass', 'shifted');

      if (this.$orgs['.button--scroll--up']) {
        this.$orgs['.button--scroll--up'].dispatchAction('addClass', 'shifted');
      }

      if (this.$orgs['.nav--docpage__buttons']) {
        this.$orgs['.nav--docpage__buttons'].dispatchAction('addClass', 'shifted');
      }
    }
    else {
      this.$orgs['.nav--main__slider'].dispatchAction('removeClass', 'shifted');

      if (this.$orgs['.button--scroll--up']) {
        this.$orgs['.button--scroll--up'].dispatchAction('removeClass', 'shifted');
      }

      if (this.$orgs['.nav--docpage__buttons']) {
        this.$orgs['.nav--docpage__buttons'].dispatchAction('removeClass', 'shifted');
      }
    }
  }

  navMainSlide() {
    this.$orgs['.nav--main'].dispatchAction('addClass', 'slide');
  }

  navMainSlideIn() {
    this.$orgs['.nav--main'].dispatchAction('removeClass', 'out');
    this.$orgs['.nav--main'].dispatchAction('addClass', 'in');
  }

  navMainSlideOut() {
    this.$orgs['.nav--main'].dispatchAction('removeClass', 'in');
    this.$orgs['.nav--main'].dispatchAction('addClass', 'out');
  }
}
