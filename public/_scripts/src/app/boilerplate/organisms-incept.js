'use strict';

/**
 * Populate $orgs values with jQuery or Cheerio objects.
 *
 * @param {object} $orgs
 */
export default $orgs => {

  for (let i in $orgs) {
    if (!$orgs.hasOwnProperty(i)) {
      continue;
    }

    $orgs[i] = $(`#${i}`);
  }
};
