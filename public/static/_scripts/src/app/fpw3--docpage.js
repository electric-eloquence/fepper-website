import Behaviors from './behaviors--docpage.js';

export default class {
  constructor(requerio, root) {
    this.requerio = requerio;
    this.root = root;
    this.behaviors = new Behaviors(requerio, root);
    this.bodyClasses = this.requerio.$orgs['#body'].getState().classArray;
  }

  listen() {
    const $orgs = this.requerio.$orgs;

    $orgs.window.resize(this.behaviors.debounce(() => {
      const windowState = $orgs.window.getState();

      this.behaviors.navButtonsShift(windowState);
    }));

    $orgs.window.scroll(() => {
      const sectionsState = $orgs['.nav--docpage__sections'].getState();
      const windowState = $orgs.window.getState();

      this.behaviors.logoRipen(windowState);
      this.behaviors.navButtonsShift(windowState);

      if (!this.bodyClasses.includes('docpage--index')) {
        this.behaviors.navDocpageBgColor();
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
    const windowState = this.requerio.$orgs.window.getState();

    this.behaviors.logoRipen(windowState);
    this.behaviors.navDocpageSlideOut();
    this.behaviors.navMainSlideOut();

    setTimeout(() => {
      // So it doesn't slide when the page loads.
      this.behaviors.navDocpageSlide();
      this.behaviors.navMainSlide();

      // To give time to save gradient position.
      if (!this.bodyClasses.includes('docpage--index')) {
        this.behaviors.navDocpageBgColor();
      }
    }, 0);
  }
}
