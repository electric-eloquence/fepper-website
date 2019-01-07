/**
 * Populate $orgs values with jQuery or Cheerio objects.
 *
 * @param {object} $orgs - Organisms keyed by selector.
 * @param {object} $ - jQuery object.
 */
export default ($orgs, $) => {
  for (let i in $orgs) {
    if (!$orgs.hasOwnProperty(i)) {
      continue;
    }

    let $org;

    if (i === 'document') {
      if (typeof document === 'object') {
        $org = $(document);
      }
      else {
        $org = {};
      }
    }
    else if (i === 'window') {
      if (typeof window === 'object') {
        $org = $(window);
      }
      else {
        $org = {};
      }
    }
    else {
      $org = $(`${i}`);
    }

    // Cheerio doesn't have .selector property.
    // .selector property removed in jQuery 3.
    // Needs to get set here and not in the prototype override because $org.$membersPopulate() depends on it and there
    // doesn't seem to be an easy way to determine it from within the prototype.
    if (typeof $org.selector === 'undefined') {
      $org.selector = i;
    }

    if (i !== 'document' && i !== 'window') {
      $org.$membersPopulate($org);
    }

    // /////////////////////////////////////////////////////////////////////////
    // Set methods that server-side tests are likely to depend on.
    // They need to be defined here and not in the prototype override because
    // `document` and `window` organisms are not Cheerio objects.
    // /////////////////////////////////////////////////////////////////////////

    /**
     * @param {number} [distance] - Distance.
     * @returns {number|undefined} Distance.
     */
    if (typeof $org.scrollTop === 'undefined') {
      $org.scrollTop = (distance) => {
        if (typeof distance !== 'undefined') {
          $org._scrollTop = distance;
        }

        return $org._scrollTop;
      };
    }

    /**
     * @param {number} [distance] - Distance.
     * @returns {number|undefined} Distance.
     */
    if (typeof $org.width === 'undefined') {
      $org.width = (distance) => {
        return distance;
      };
    }

    /**
     * @param {number} [distance] - Distance.
     * @returns {number|undefined} Distance.
     */
    if (typeof $org.height === 'undefined') {
      $org.height = (distance) => {
        return distance;
      };
    }

    // /////////////////////////////////////////////////////////////////////////
    // Attach the organism to the object of organisms and finish.
    // /////////////////////////////////////////////////////////////////////////

    $orgs[i] = $org;
  }
};
