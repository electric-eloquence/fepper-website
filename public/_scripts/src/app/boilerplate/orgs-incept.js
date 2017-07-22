'use strict';

import organisms from '../apply/organisms.js';

const orgsIncept = {
  /**
   * @return {object} Configured by end-user in ../apply/organisms.js.
   */
  init: () => {

    return organisms;
  },

  /**
   * Populate $orgs object with values here.
   *
   * @param {object} $orgs
   */
  populate: $orgs => {

    for (let i in $orgs) {
      if (!$orgs.hasOwnProperty(i)) {
        continue;
      }

      $orgs[i] = $(`#${i}`);
    }
  }
};

export default orgsIncept;
