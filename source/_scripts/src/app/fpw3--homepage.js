import Behaviors from './behaviors--homepage.js';

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
      const panesOrg = $orgs['.content__pane'];
      const panesLength = panesOrg.getState().$members.length;
      const paneStatesArr = [];
      const windowState = $orgs.window.getState();

      for (let i = 0; i < panesLength; i++) {
        paneStatesArr.push(panesOrg.getState(i));
      }

      this.behaviors.bgColorReveal(windowState, panesLength, paneStatesArr);
      this.behaviors.logoRipen(windowState);
      this.behaviors.mainContentSlideIn(windowState, panesLength, paneStatesArr);
      this.behaviors.mainContentSlideOut(windowState, panesLength, paneStatesArr);
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
      this.behaviors.navMainSettingsOut();
    });

    $orgs['.nav--main__button--settings'].on('click', () => {
      this.behaviors.navMainSettingsToggle();
    });

    $orgs['.settings__dark-mode__input'].on('change', () => {
      this.behaviors.darkModeToggle($orgs['.settings__dark-mode__input']);
    });

    $orgs['.nav--main__button--right'].on('click', () => {
      this.behaviors.navMainSlideIn();
    });
  }

  stoke() {
    // Scroll to top of page on beforeunload. This is so refreshing loads the page scrolled to the top.
    // Does not work in Safari. For Safari, window.scrollTo() is invoked on DOMContentLoaded in vanilla.js.
    if (typeof window === 'object') {
      this.root.onbeforeunload = () => {
        const htmlState = this.requerio.$orgs['#html'].getState();

        if (htmlState.scrollTop > 0) {
          // First hide the body so the video and branding don't suddenly appear if navigating away from page.
          // Need to exclude Safari. It doesn't clear visibility hidden if navigating back.
          if (!htmlState.classArray.includes('safari')) {
            this.requerio.$orgs['#body'].dispatchAction('css', {visibility: 'hidden'});
          }

          this.requerio.$orgs['#html'].dispatchAction('scrollTop', 0);
        }
      };
    }

    // Create and load non-rendered Images for video generation.
    const logicalImages = {
      '03': new window.Image(),
      '04': new window.Image(),
      '05': new window.Image(),
      '06': new window.Image(),
      '07': new window.Image(),
      '08': new window.Image()
    };

    // Try videoRender() first to see if the browser supports async generators.
    try {
      this.behaviors.videoRender(logicalImages);
    }
    catch (err) {}

    this.behaviors.hiderOut();
    this.behaviors.updateDims();
    this.behaviors.navMainSlideOut();

    let project = '';

    if (typeof URLSearchParams === 'function') {
      const searchParams = new URLSearchParams(window.location.search);

      project = searchParams.get('project');
    }

    this.behaviors.gitHubHrefAdapt(project);
  }
}
