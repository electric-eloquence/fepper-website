import Behaviors from './behaviors.js';

export default class {
  constructor(requerio, root) {
    this.requerio = requerio;
    this.root = root;
    this.behaviors = new Behaviors(requerio, root);
  }

  listen() {
    const $orgs = this.requerio.$orgs;

    $orgs.window.resize(this.behaviors.debounce(() => this.behaviors.navButtonsShift(windowState)));

    $orgs.window.scroll(() => {
      const windowState = $orgs.window.getState();

      this.behaviors.logoRipen(windowState);
      this.behaviors.navButtonsShift(windowState);
      this.behaviors.navDocpageBgColor();

      if (windowState.scrollTop) {
        this.behaviors.hiderHide();
      }
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
    this.behaviors.navDocpageBgColor();
    this.behaviors.navDocpageSlideOut();
    this.behaviors.navMainSlideOut();

    // So it doesn't slide when the page loads.
    setTimeout(() => {
      this.behaviors.navDocpageSlide();
      this.behaviors.navMainSlide();
    }, 0);
  }
}
