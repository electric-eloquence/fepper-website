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

    const $org = $(`${i}`);

    if (typeof window === 'undefined') {
      $org.selector = i;
    }

    /**
     * @property {array} $items
     * A true Array of the selection's numerically-keyed properties.
     * This is necessary for selection by class and tag, where results number more than one.
     * Members of this array will be fully-incepted organisms.
     */
    $org.$items = [];

    /**
     * @function
     * $org.$items will be populated on organism inception and re-populated on dispatch of actions.
     * It will only be populated at the top level of the $orgs object.
     */
    $org.$itemsFill = function () {
      $org.each(function () {
        $org.$items.push($(this));
      });
    };

    $org.$itemsFill();
    $orgs[i] = $org;
  }
};
