'use strict';

export default $orgs => {
  return {
    ripen: () => {
      $orgs.logoBackground.dispatchAction('css', ['right', `-${$orgs.body.scrollTop() * 2}px`]);
    }
  }
};
