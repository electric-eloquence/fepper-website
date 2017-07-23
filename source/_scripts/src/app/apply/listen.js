'use strict';

import actionsGet from './actions-get.js';

export default app => {
  const actions = actionsGet(app);
  const $orgs = app.$orgs;

  app.$window.scroll(function () {
    actions.logoRipen();
    actions.logoFix();
  });
};
