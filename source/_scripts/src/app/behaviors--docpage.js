import Behaviors from './behaviors.js';

export default class extends Behaviors {
  constructor(requerio, root) {
    super(requerio, root);
  }

  navDocpageBgColor() {
    const gradientPosition = this.$orgs['#logo__bg'].getState().data.gradientPosition || 0;
    this.$orgs['.nav--docpage__sections'].dispatchAction(
      'css',
      {
        backgroundColor: 'rgba(' +
          (gradientPosition * (255 / 90)) + ',' +
          (255 - (gradientPosition * (255 / 90))) + ',' +
          '0,0.1)'
      }
    );
  }

  navDocpageButtonScrollUpHide() {
    this.$orgs['.button--scroll--up'].dispatchAction('removeClass', 'opaque');
  }

  navDocpageButtonScrollUpShow() {
    this.$orgs['.button--scroll--up'].dispatchAction('addClass', 'opaque');
  }

  navDocpageScrollUp() {
    this.$orgs['#html'].animate({scrollTop: 0});
    this.$orgs['#body'].animate({scrollTop: 0});
  }

  navDocpageSlide() {
    this.$orgs['.nav--docpage'].dispatchAction('addClass', 'slide');
  }

  navDocpageSlideIn() {
    this.$orgs['.nav--docpage'].dispatchAction('removeClass', 'out');
    this.$orgs['.nav--docpage'].dispatchAction('addClass', 'in');
  }

  navDocpageSlideOut() {
    this.$orgs['.nav--docpage'].dispatchAction('removeClass', 'in');
    this.$orgs['.nav--docpage'].dispatchAction('addClass', 'out');
  }

  overlayMiddleHeightAdjust(windowState) {
    // In desktop Safari, more than one tab shrinks the viewport height. This change in viewport height is not picked
    // up by CSS.
    const overlayMiddle = this.$orgs['.overlay--middle'];
    const overlayMiddleState = overlayMiddle.getState();
    const overlayHeightActual = overlayMiddleState.height;
    const windowOuterHeightBefore = windowState.data.outerHeight;
    const windowOuterHeightNow = windowState.outerHeight;
    let overlayHeightIdeal;

    // This behavior is useful when adding and removing tabs, but not when physically resizing the window.
    if (windowOuterHeightNow === windowOuterHeightBefore) {
      if (windowState.innerWidth < window.bp_xl_min) {
        overlayHeightIdeal = windowState.innerHeight - window.logo_height - (window.fade_height * 2);
      }
      else {
        overlayHeightIdeal = windowState.innerHeight - window.logo_height_xl - (window.fade_height_xl * 2);
      }

      if (overlayHeightActual === overlayHeightIdeal) {
        if (overlayMiddleState.css.height) {
          overlayMiddle.dispatchAction('css', {height: ''});
        }
      }
      else {
        overlayMiddle.dispatchAction('css', {height: overlayHeightIdeal + 'px'});
      }
    }
    else if (overlayMiddleState.css.height) {
      overlayMiddle.dispatchAction('css', {height: ''});
    }
  }
}
