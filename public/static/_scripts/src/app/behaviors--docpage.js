import Behaviors from './behaviors.js';
import colorGradient from './color-gradient.js';

export default class extends Behaviors {
  constructor(requerio, root) {
    super(requerio, root);
  }

  hiderHide() {
    this.$orgs['.hider'].dispatchAction('addClass', 'fade--out');
  }

  navDocpageBgColor() {
    const gradientPosition = this.$orgs['#logoBg'].getState().data.gradientPosition || 0;

    this.$orgs['.nav--docpage__slider'].dispatchAction(
      'css',
      {
        backgroundColor: 'rgb(' +
          colorGradient[gradientPosition][0] + ',' +
          colorGradient[gradientPosition][1] + ',' +
          colorGradient[gradientPosition][2] + ')'
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
}
