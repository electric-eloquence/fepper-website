import actionsGet from './actions-get.js';

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

export default app => {
  const actions = actionsGet(app, window);
  const $orgs = app.$orgs;

  $orgs['window'].resize(debounce(actions.updateDims));
  $orgs['window'].resize(debounce(actions.logoFixedPaddingAdjust));

  $orgs['window'].scroll(function () {
    actions.logoRipen();
    actions.logoFix();
    actions.bgColorReveal();
    actions.mainContentReveal();
  });
};
