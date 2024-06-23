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

  darkModeInit() {
    // First, check if a browser extension has implemented a dark mode.
    const bodyBgColor = getComputedStyle(document.documentElement).backgroundColor;
    const bodyBgColorSplit = typeof bodyBgColor === 'string' && bodyBgColor.split('(');

    if (bodyBgColorSplit && bodyBgColorSplit[1]) {
      const bodyBgRgb = bodyBgColorSplit[1].slice(0, -1).split(',');

      if (bodyBgRgb.length > 2) {
        const red = Number(bodyBgRgb[0]);
        const green = Number(bodyBgRgb[1]);
        const blue = Number(bodyBgRgb[2]);
        const brightness = red + green + blue;

        // Skip if regular dark mode or default bg.
        if (brightness > 0) {
          // Check if browser extension has set dark body background-color.
          if (brightness < 100) {
            this.$orgs['#html'].addClass('dark');

            if (typeof window === 'object') {
              this.root.onload = () => {
                this.$orgs['.settings__dark-mode__input'].dispatchAction('prop', {checked: true});
              };
            }
          }
        }
      }
    }

    const cookieObj = {};

    if (typeof document.cookie === 'string') {
      document.cookie.split('; ').forEach(function (keyVal) {
        var keyValSplit = keyVal.split('=');
        cookieObj[keyValSplit[0]] = keyValSplit[1];
      });
    }

    if (cookieObj.dark_mode === 'true') {
      this.$orgs['.settings__dark-mode__input'].dispatchAction('prop', {checked: true});
      this.$orgs['#html'].addClass('dark');
    }
    else {
      this.$orgs['.settings__dark-mode__input'].dispatchAction('prop', {checked: false});
    }
  }

  darkModeToggle(inputOrg) {
    if (inputOrg[0].checked) {
      document.cookie = `dark_mode=true;max-age=31536000;domain=${window.location.hostname};sameSite=strict;path=/`;

      inputOrg.dispatchAction('prop', {checked: true});
      this.$orgs['#html'].addClass('dark');
    }
    else {
      document.cookie = `dark_mode=;max-age=0;domain=${window.location.hostname};sameSite=strict;path=/`;

      inputOrg.dispatchAction('prop', {checked: false});
      this.$orgs['#html'].removeClass('dark');
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
      let classToAdd;
      let classToRemove;

      if (footerState.innerHeight > window.footer_height) {
        classToAdd = 'shifted--more';
        classToRemove = 'shifted';
      }
      else {
        classToAdd = 'shifted';
        classToRemove = 'shifted--more';
      }

      this.$orgs['.nav--main']
        .dispatchAction('removeClass', classToRemove)
        .dispatchAction('addClass', classToAdd);

      if (this.$orgs['.button--scroll--down']) {
        this.$orgs['.button--scroll--down']
          .dispatchAction('removeClass', classToRemove)
          .dispatchAction('addClass', classToAdd);
      }

      if (this.$orgs['.nav--docpage__buttons']) {
        this.$orgs['.nav--docpage__buttons']
          .dispatchAction('removeClass', classToRemove)
          .dispatchAction('addClass', classToAdd);
      }
    }
    else {
      this.$orgs['.nav--main']
        .dispatchAction('removeClass', 'shifted')
        .dispatchAction('removeClass', 'shifted--more');

      if (this.$orgs['.button--scroll--down']) {
        this.$orgs['.button--scroll--down']
          .dispatchAction('removeClass', 'shifted')
          .dispatchAction('removeClass', 'shifted--more');
      }

      if (this.$orgs['.nav--docpage__buttons']) {
        this.$orgs['.nav--docpage__buttons']
          .dispatchAction('removeClass', 'shifted')
          .dispatchAction('removeClass', 'shifted--more');
      }
    }
  }

  navMainSettingsOut() {
    this.$orgs['.nav--main__slider'].dispatchAction('removeClass', 'settings-in');
  }

  navMainSettingsToggle() {
    this.$orgs['.nav--main__slider'].dispatchAction('toggleClass', 'settings-in');
  }

  navMainSlideIn() {
    this.$orgs['.nav--main'].dispatchAction('addClass', 'in');
  }

  navMainSlideOut() {
    this.$orgs['.nav--main'].dispatchAction('removeClass', 'in');
    this.$orgs['.nav--main__slider'].dispatchAction('removeClass', 'settings-in');
  }
}
