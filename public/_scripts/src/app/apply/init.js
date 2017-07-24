'use strict';

import actionsGet from './actions-get.js';

export default app => {
  const actions = actionsGet(app);

  actions.browserAdviceHide();
};
