import behaviorsGet from './behaviors-get.js';

export default (app) => {
  const behaviors = behaviorsGet(app, window);

  behaviors.navDocpageSlideOut();
  behaviors.navMainSlideOut();

  // So it doesn't slide when the page loads.
  setTimeout(() => {
    behaviors.navDocpageSlide();
    behaviors.navMainSlide();
  }, 0);
};
