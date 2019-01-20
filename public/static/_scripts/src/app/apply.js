import behaviorsGet from './behaviors-get.js';

export default (app) => {
  if (typeof window === 'object') {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };
  }

  const behaviors = behaviorsGet(app, window);

  behaviors.init();
  behaviors.updateDims();

  let project = '';

  if (typeof URLSearchParams === 'function') {
    const searchParams = new URLSearchParams(location.search);

    project = searchParams.get('project');
  }

  behaviors.gitHubHrefAdapt(project);
};
