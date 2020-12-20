import Behaviors from './behaviors.js';

export default class {
  constructor(requerio, root) {
    this.requerio = requerio;
    this.root = root;
    this.behaviors = new Behaviors(requerio, root);
  }

  listen() {
    const $orgs = this.requerio.$orgs;

    $orgs.window.resize(this.behaviors.debounce(() => {
      const windowState = $orgs.window.getState();

      this.behaviors.navButtonsShift(windowState);
      this.behaviors.updateDims();
    }));

    $orgs.window.scroll(() => {
      const windowState = $orgs.window.getState();

      this.behaviors.bgColorReveal(windowState);
      this.behaviors.logoRipen(windowState);
      this.behaviors.mainContentSlideIn();
      this.behaviors.mainContentSlideOut();
      this.behaviors.navButtonsShift(windowState);
    });

    $orgs.window.scroll(this.behaviors.debounce(this.behaviors.scrollButtonDisplay, 33, this.behaviors));

    $orgs['.button--scroll--down'].on('click', () => {
      this.behaviors.scrollButtonDown();
    });

    $orgs['.button--scroll--up'].on('click', () => {
      this.behaviors.scrollButtonUp();
    });

    $orgs['.nav--main__button--left'].on('click', () => {
      this.behaviors.navMainSlideOut();
    });

    $orgs['.nav--main__button--right'].on('click', () => {
      this.behaviors.navMainSlideIn();
    });
  }

  stoke() {
    // Scroll to top of page on page load.
    // Works in all browsers except Safari. For Safari, window.scrollTo() is invoked on DOMContentLoaded.
    if (typeof window === 'object') {
      this.root.onbeforeunload = () => {
        this.root.scrollTo(0, 0);
      };
    }

    // Create and load non-rendered DOM Images for video generation.
    const logicalImages = {
      '03': new Image(),
      '04': new Image(),
      '05': new Image(),
      '06': new Image(),
      '07': new Image(),
      '08': new Image()
    };

    // Try videoRender() first to see if the browser supports async generators.
    try {
      this.behaviors.videoRender(logicalImages);
    }
    catch (err) {}

    this.behaviors.updateDims();
    this.behaviors.navMainSlideOut();

    // So it doesn't slide when the page loads.
    setTimeout(() => {
      this.behaviors.navMainSlide();
    }, 0);

    let project = '';

    if (typeof URLSearchParams === 'function') {
      const searchParams = new URLSearchParams(location.search);

      project = searchParams.get('project');
    }

    this.behaviors.gitHubHrefAdapt(project);
  }
}