import Behaviors from './behaviors--docpage.js';

export default class {
  constructor(requerio, root) {
    this.requerio = requerio;
    this.root = root;
    this.animationFrameId = null;
    this.behaviors = new Behaviors(requerio, root);
    this.bodyClasses = this.requerio.$orgs['#body'].getState().classArray;
  }

  listen() {
    const $orgs = this.requerio.$orgs;

    $orgs.window.resize(this.behaviors.debounce(() => {
      const windowState = $orgs.window.getState();

      this.behaviors.navButtonsShift(windowState);
      this.behaviors.overlayMiddleHeightAdjust(windowState);
    }));

    $orgs.window.scroll(() => {
      const sectionsState = $orgs['.nav--docpage__sections'].getState();
      const windowState = $orgs.window.getState();

      this.behaviors.logoRipen(windowState);
      this.behaviors.navButtonsShift(windowState);

      if (!this.bodyClasses.includes('docpage--index')) {
        // To give time to save gradient position.
        if (!this.animationFrameId) {
          this.animationFrameId = requestAnimationFrame(() => {
            this.behaviors.navDocpageBgColor();
            this.animationFrameId = null;
          });
        }
      }

      if (windowState.scrollTop > sectionsState.innerHeight) {
        this.behaviors.navDocpageButtonScrollUpShow();
      }
      else {
        this.behaviors.navDocpageButtonScrollUpHide();
      }
    });

    $orgs['.button--scroll--up'].on('click', () => {
      this.behaviors.navDocpageScrollUp();
    });

    $orgs['.nav--docpage__button--left'].on('click', () => {
      this.behaviors.navDocpageSlideIn();
    });

    $orgs['.nav--docpage__button--right'].on('click', () => {
      this.behaviors.navDocpageSlideOut();
    });

    $orgs['.nav--main__button--left'].on('click', () => {
      this.behaviors.navMainSlideOut();
    });

    $orgs['.nav--main__button--right'].on('click', () => {
      this.behaviors.navMainSlideIn();
    });
  }

  stoke() {
    const doclistLinkMembers = this.requerio.$orgs['.doclist__link'].getState().members;
    const pathnameSubStr = window.location.pathname.replace(/^\/[^/]+/, '');
    const windowOrg = this.requerio.$orgs.window;
    const windowState = windowOrg.getState();

    for (let i = 0; i < doclistLinkMembers; i++) {
      const doclistLinkState = this.requerio.$orgs['.doclist__link'].getState(i);

      if (typeof doclistLinkState.attribs.href === 'string' && doclistLinkState.attribs.href.includes(pathnameSubStr)) {
        this.requerio.$orgs['.doclist__link'].dispatchAction('css', {color: 'gray', 'pointer-events': 'none'}, i);

        break;
      }
    }

    windowOrg.dispatchAction('data', {outerHeight: windowState.outerHeight});
    this.behaviors.logoRipen(windowState);
    this.behaviors.navDocpageSlideOut();
    this.behaviors.navMainSlideOut();

    setTimeout(() => {
      // So it doesn't slide when the page loads.
      this.behaviors.navDocpageSlide();
      this.behaviors.navMainSlide();
    }, 0);

    if (!this.bodyClasses.includes('docpage--index')) {
      // To give time to save gradient position.
      requestAnimationFrame(() => {
        this.behaviors.navDocpageBgColor();
      });
    }
  }
}
