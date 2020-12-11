import behaviorsGet from './behaviors-get.js';

export default (app) => {
  // Scroll to top of page on page load.
  // Works in all browsers except Safari. For Safari, window.scrollTo() is invoked on DOMContentLoaded.
  if (typeof window === 'object') {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };
  }

  const behaviors = behaviorsGet(app, window);

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
    behaviors.videoRender(logicalImages);
  }
  catch (err) {}

  behaviors.updateDims();
  behaviors.navSlideOut();

  // So it doesn't slide when the page loads.
  setTimeout(() => {
    behaviors.navSlide();
  }, 0);

  let project = '';

  if (typeof URLSearchParams === 'function') {
    const searchParams = new URLSearchParams(location.search);

    project = searchParams.get('project');
  }

  behaviors.gitHubHrefAdapt(project);
};
