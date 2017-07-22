'use strict';

const statefulOrganisms = {
  /**
   * Declare keys with null values here.
   *
   * @return {object} Keyed by organism ID.
   */
  init: () => {

    return {
      'body': null,
      'logoBackground': null,
      'logoImage': null
    };
  },

  /**
   * Populate organisms object with values here.
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

export default statefulOrganisms;
