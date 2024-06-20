export default class {
  constructor(requerio, root) {
    this.$orgs = requerio.$orgs;
    this.root = root;
    this.logoRipenFrameId = null;
    this.logoRipenTranslateXLast = '0%';
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

  darkModeToggle(inputOrg) {
    if (inputOrg[0].checked) {
      inputOrg.dispatchAction('prop', {checked: true});
      this.$orgs['#body'].addClass('dark');
    }
    else {
      inputOrg.dispatchAction('prop', {checked: false});
      this.$orgs['#body'].removeClass('dark');
    }
  }

  logoRipen(windowState) {
    if (this.logoRipenFrameId) {
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

    if (this.logoRipenTranslateXLast === translateX) {
      return;
    }

    this.logoRipenTranslateXLast = translateX;
    this.logoRipenFrameId = requestAnimationFrame(() => {
      this.$orgs['#logo__bg'].dispatchAction('data', {gradientPosition: percentage});
      this.$orgs['#logo__bg'].dispatchAction('css', {transform: `translateX(${translateX})`});

      this.logoRipenFrameId = null;
    });
  }

  navButtonsShift(windowState) {
    const footerState = this.$orgs['.footer'].getState();

    if (footerState.boundingClientRect.top < windowState.innerHeight - 50) {
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

  navMainSettingsOut() {
    this.$orgs['.nav--main__slider'].dispatchAction('removeClass', 'settings-in');
  }

  navMainSettingsToggle() {
    this.$orgs['.nav--main__slider'].dispatchAction('toggleClass', 'settings-in');
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
