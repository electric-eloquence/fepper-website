'use strict';

import actionsGet from './actions-get.js';

export default app => {
  const actions = actionsGet(app);
  const $orgs = app.$orgs;

  $orgs['window'].resize(function () {
    actions.updateWindowDims();
  });

  $orgs['window'].scroll(function () {
    actions.logoRipen();
    actions.logoFix();
    actions.mainContentReveal();
  });
};
