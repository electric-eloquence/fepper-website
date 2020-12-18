import Behaviors from './behaviors.js';

export default class {
  constructor(requerio, root) {
    this.requerio = requerio;
    this.root = root;
    this.behaviors = new Behaviors(requerio, root);
  }

  listen() {
    const $orgs = this.requerio.$orgs;

    $orgs.window.scroll(() => {
      const windowState = $orgs.window.getState();

      this.behaviors.logoRipen(windowState);

      if (windowState.scrollTop) {
        this.behaviors.hiderHide();
      }
    });

    $orgs['.nav--docpage__button--left'].on('click', function () {
      this.behaviors.navDocpageSlideIn();
    });

    $orgs['.nav--docpage__button--right'].on('click', function () {
      this.behaviors.navDocpageSlideOut();
    });

    $orgs['.nav--main__button--left'].on('click', function () {
      this.behaviors.navMainSlideOut();
    });

    $orgs['.nav--main__button--right'].on('click', function () {
      this.behaviors.navMainSlideIn();
    });
  }

  stoke() {
    this.behaviors.navDocpageSlideOut();
    this.behaviors.navMainSlideOut();

    // So it doesn't slide when the page loads.
    setTimeout(() => {
      this.behaviors.navDocpageSlide();
      this.behaviors.navMainSlide();
    }, 0);
  }
}
