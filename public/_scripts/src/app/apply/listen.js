'use strict';

import actionsGet from './actions-get.js';

export default app => {
  const actions = actionsGet(app);
  const $orgs = app.$orgs;

  app.$window.scroll(function () {
    // Firefox recognizes html.scrollTop; the rest recognize body.scrollTop.
    if ($orgs.html.scrollTop() > 0 || $orgs.body.scrollTop() > 0) {
      actions.ripen();
    }
  });
};
