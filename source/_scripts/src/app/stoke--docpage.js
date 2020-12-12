import behaviorsGet from './behaviors-get.js';

export default (app) => {
  const behaviors = behaviorsGet(app, window);

  behaviors.navSlideOut();

  // So it doesn't slide when the page loads.
  setTimeout(() => {
    behaviors.navSlide();
  }, 0);
};
