'use strict';

const statefulOrganisms = {
  init: function () {
    return {
      'logoBackground': null,
      'logoImage': null
    };
  },

  populate: function ($orgs) {
    for (let i in $orgs) {
      if (!$orgs.hasOwnProperty(i)) {
        continue;
      }

      $orgs[i] = $(`#${i}`);
    }
  }
};

export default statefulOrganisms;
