/**
 * Populate $orgs values with jQuery or Cheerio components.
 *
 * @param {object} $orgs - Organisms keyed by selector.
 * @param {object} $ - jQuery component.
 */
export default ($orgs, $) => {
  for (let i of Object.keys($orgs)) {
    /* istanbul ignore if */
    if ($orgs[i] && $orgs[i].hasRequerio) {
      continue;
    }

    let $org;

    if (typeof window === 'object') {
      if (i === 'document') {
        $org = $(document);
      }
      else if (i === 'window') {
        $org = $(window);
      }
    }

    if (!$org) {
      $org = $(i);
    }

    // Use this property to save the Redux action object returned by a Redux dispatch.
    $org.prevAction = null;

    // Cheerio doesn't have .selector property.
    // .selector property was removed in jQuery 3.
    // Needs to get set here and not in the prototype override because $org.populateMembers() depends on it and there
    // doesn't seem to be an easy way to determine it from within the prototype.
    if (typeof $org.selector === 'undefined') {
      $org.selector = i;
    }

    if (i !== 'document' && i !== 'window') {
      $org.populateMembers();
    }

    // /////////////////////////////////////////////////////////////////////////
    // Set methods that server-side tests are likely to depend on.
    // They need to be defined here and not in the prototype override because
    // `document` and `window` organisms are not Cheerio components.
    // /////////////////////////////////////////////////////////////////////////

    /**
     * @param {number} [distance] - Distance.
     * @returns {number|undefined} Distance.
     */
    if (typeof $org.innerWidth === 'undefined') {
      $org.innerWidth = (distance) => {
        return distance;
      };
    }

    /**
     * @param {number} [distance] - Distance.
     * @returns {number|undefined} Distance.
     */
    if (typeof $org.innerHeight === 'undefined') {
      $org.innerHeight = (distance) => {
        return distance;
      };
    }

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
