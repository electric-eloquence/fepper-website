import actionsGet from './actions-get.js';

export default (app) => {
  if (typeof window === 'object') {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };
  }

  const actions = actionsGet(app, window);

  actions.init();
  actions.updateDims();

  let project = '';

  if (typeof URLSearchParams === 'function') {
    const searchParams = new URLSearchParams(location.search);

    project = searchParams.get('project');
  }

  actions.gitHubHrefAdapt(project);
};
