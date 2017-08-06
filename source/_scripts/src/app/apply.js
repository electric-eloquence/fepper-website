'use strict';

import actionsGet from './actions-get.js';

export default app => {
  const actions = actionsGet(app);

  if (typeof window === 'object') {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };
  }

  actions.bodyHeightFix();
  actions.browserAdviceHide();
};
