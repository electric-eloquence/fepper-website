import behaviorsGet from './behaviors-get.js';

function debounce(callback, wait = 200, context = this) {
  let timeout = null;
  let callbackArgs = null;

  const later = () => callback.apply(context, callbackArgs);

  return () => {
    callbackArgs = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default (app) => {
  const behaviors = behaviorsGet(app, window);
  const $orgs = app.$orgs;

  $orgs['window'].resize(debounce(behaviors.updateDims));

  $orgs['window'].scroll(function () {
    behaviors.logoRipen();
    behaviors.bgColorReveal();
    behaviors.mainContentSlideIn();
    behaviors.mainContentSlideOut();
  });

  // Create and load a non-rendered DOM Image for video generation.
  const logicalImages = {
    '03': new Image(),
    '04': new Image(),
    '05': new Image(),
    '06': new Image(),
    '07': new Image(),
    '08': new Image()
  };

  // Load and apply the logicalImages to render like a video.
  behaviors.videoRender(logicalImages);
};
