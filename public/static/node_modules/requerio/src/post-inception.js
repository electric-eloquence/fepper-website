/* eslint-disable valid-jsdoc */

/**
 * Only useful for finding when the focus has changed due to user interaction, or mocked user interaction.
 */
function getActiveOrganism($orgs, lastActiveOrganism) {
  // Return if no `document` object or `document` doesn't have .activeElement.
  /* istanbul ignore if */
  if (typeof document !== 'object' || !document.activeElement) {
    return;
  }

  // Return if user hasn't focused anywhere.
  if (document.activeElement === document.body) {
    return;
  }

  // Check if last active organism is still active organism.
  if (
    document.activeElement.tagName &&
    lastActiveOrganism &&
    document.activeElement.tagName.toLowerCase() === lastActiveOrganism.toLowerCase()
  ) {
    return lastActiveOrganism;
  }

  for (let i = 0; i < document.activeElement.attributes.length; i++) {
    const attribute = document.activeElement.attributes[i];

    if (
      attribute.name === 'id' && `#${attribute.value}` === lastActiveOrganism ||
      attribute.name === 'class' && `.${attribute.value}` === lastActiveOrganism
    ) {
      return lastActiveOrganism;
    }
  }

  for (let orgSelector of Object.keys($orgs)) {
    const $org = $orgs[orgSelector];

    for (let i = 0; i < $org.length; i++) {
      const elem = $org[i];

      // If using Cheerio and JSDOM.
      /* istanbul ignore else */
      if (typeof global === 'object' && typeof document === 'object') {
        if (document.activeElement.tagName.toLowerCase() !== elem.name.toLowerCase()) {
          continue;
        }

        // Try matching active element with the organism's element attributes.
        for (let j = 0; j < document.activeElement.attributes.length; j++) {
          const attribute = document.activeElement.attributes[j];

          if (
            attribute.name === 'id' && attribute.value === elem.attribs.id ||
            attribute.name === 'class' && attribute.value === elem.attribs.class
          ) {
            return $org.selector;
          }
        }
      }

      // Use strict object compare if using DOM on browser.
      else if (document.activeElement === elem) {
        return $org.selector;
      }
    }
  }
}

export default (requerio) => {
  const {$orgs, store} = requerio;

  for (let orgSelector of Object.keys($orgs)) {
    if ($orgs[orgSelector] && $orgs[orgSelector].hasRequerio) {
      continue;
    }

    const $org = $orgs[orgSelector];

    // Indicate that the `$` component is an incepted organism. Nothing prevents anyone from using jQuery or Cheerio
    // without Requerio within a Requerio app. This property will only be true for incepted organisms.
    $org.hasRequerio = true;

    /**
     * Must redefine .after() because we may need to reset the elements and members of sibling and descendent organisms.
     * Same params as jQuery/Cheerio .after().
     * Do not document.
     */
    const afterFnOrig = $org.after;

    $org.after = function () {
      const descendantsToReset = [];
      const $parent = $org.parent();

      if (arguments.length) {
        for (let orgSelector1 of Object.keys($orgs)) {
          const $org1 = $orgs[orgSelector1];

          // Iterate through organisms and check if the parent of this organism (dispatching the 'after' action)
          // is an ancestor.
          // This is much more efficient than searching through branches of descendants.
          for (let i = 0; i < $parent.length; i++) {
            if ($org1.parents($parent[i]).length) {
              descendantsToReset.push($org1);

              break;
            }
          }
        }
      }

      const retVal = afterFnOrig.apply($org, arguments);

      if (arguments.length) {
        $org.resetElementsAndMembers();

        for (let descendantToReset of descendantsToReset) {
          descendantToReset.resetElementsAndMembers();
        }
      }

      return retVal;
    };

    /**
     * Must redefine .append() because we may need to reset the elements and members of descendent organisms.
     * Same params as jQuery/Cheerio .append().
     * Do not document.
     */
    const appendFnOrig = $org.append;

    $org.append = function () {
      const descendantsToReset = [];

      if (arguments.length) {
        for (let orgSelector1 of Object.keys($orgs)) {
          const $org1 = $orgs[orgSelector1];

          // Iterate through organisms and check if this organism (dispatching the 'append' action) is an ancestor.
          // This is much more efficient than searching through branches of descendants.
          if ($org1.parents($org).length) {
            descendantsToReset.push($org1);
          }
        }
      }

      const retVal = appendFnOrig.apply($org, arguments);

      if (arguments.length) {
        $org.resetElementsAndMembers();

        for (let descendantToReset of descendantsToReset) {
          descendantToReset.resetElementsAndMembers();
        }
      }

      return retVal;
    };

    /**
     * Must redefine .before() because we may need to reset the elements and members of sibling and descendent organisms
     * Same params as jQuery/Cheerio .before().
     * Do not document.
     */
    const beforeFnOrig = $org.before;

    $org.before = function () {
      const descendantsToReset = [];
      const $parent = $org.parent();

      if (arguments.length) {
        for (let orgSelector1 of Object.keys($orgs)) {
          const $org1 = $orgs[orgSelector1];

          // Iterate through organisms and check if the parent of this organism (dispatching the 'before' action)
          // is an ancestor.
          // This is much more efficient than searching through branches of descendants.
          for (let i = 0; i < $parent.length; i++) {
            if ($org1.parents($parent[i]).length) {
              descendantsToReset.push($org1);

              break;
            }
          }
        }
      }

      const retVal = beforeFnOrig.apply($org, arguments);

      if (arguments.length) {
        $org.resetElementsAndMembers();

        for (let descendantToReset of descendantsToReset) {
          descendantToReset.resetElementsAndMembers();
        }
      }

      return retVal;
    };

    /**
### blur()
Remove focus from the specified element, if that element has focus.
If there is a 'document' organism and it has `state.activeOrganism` set, unset that property.
*/
    if ($orgs.document) {
      let blurOrig = () => {};

      if (typeof $org.blur === 'function') {
        blurOrig = $org.blur;
      }

      $org.blur = () => {
        blurOrig.call($org);

        if (typeof global === 'object') {
          // If using Cheerio and JSDOM.
          if (document && document.querySelector) {
            document.querySelector($org.selector).blur();
          }
        }

        if (requerio.store.getState()['document'].activeOrganism === $org.selector) {
          $orgs.document.dispatchAction('setActiveOrganism', null);
        }
      };
    }

    /**
### focus()
Set focus on the specified element, if that element can take focus. If it can take focus, and if there is a 'document'
organism, set the focused organism's selector as `state.activeOrganism`.
*/
    if ($orgs.document) {
      let focusOrig = () => {};

      if (typeof $org.focus === 'function') {
        focusOrig = $org.focus;
      }

      $org.focus = () => {
        focusOrig.call($org);

        if (typeof global === 'object') {
          // If using Cheerio and JSDOM.
          if (document && document.querySelector) {
            document.querySelector($org.selector).focus();
          }
        }

        $orgs.document.dispatchAction('setActiveOrganism', $org.selector);
      };
    }

    /**
     * For document and window organisms only.
     * Do not document.
     */
    if (orgSelector === 'document' || orgSelector === 'window') {
      $org.getState = () => {
        if (orgSelector === 'document' && typeof document === 'object') {
          const lastActiveOrganism = store.getState()[orgSelector].activeOrganism;
          const activeOrganism = getActiveOrganism($orgs, lastActiveOrganism);

          if (typeof activeOrganism !== 'undefined' && activeOrganism !== lastActiveOrganism) {
            $org.dispatchAction('setActiveOrganism', activeOrganism);
          }
        }

        const state = store.getState()[orgSelector];

        if (orgSelector === 'window' && typeof window === 'object') {
          $org.updateMeasurements(state);
        }

        return state;
      };
    }

    /**
     * Must redefine .html() because we may need to reset the elements and members of descendent organisms.
     * Same params as jQuery/Cheerio .html(). However, unlike jQuery, does not accept function params.
     * Do not document.
     */
    const htmlFnOrig = $org.html;

    $org.html = function () {
      const descendantsToReset = [];

      if (arguments.length) {
        for (let orgSelector1 of Object.keys($orgs)) {
          const $org1 = $orgs[orgSelector1];

          // Iterate through organisms and check if this organism (dispatching the 'html' action) is an ancestor.
          // This is much more efficient than searching through branches of descendants.
          if ($org1.parents($org).length) {
            descendantsToReset.push($org1);
          }
        }
      }

      const retVal = htmlFnOrig.apply($org, arguments);

      if (arguments.length) {
        $org.resetElementsAndMembers();

        for (let descendantToReset of descendantsToReset) {
          descendantToReset.resetElementsAndMembers();
        }
      }

      return retVal;
    };

    /**
     * Must redefine .prepend() because we may need to reset the elements and members of descendent organisms.
     * Same params as jQuery/Cheerio .prepend().
     * Do not document.
     */
    const prependFnOrig = $org.prepend;

    $org.prepend = function () {
      const descendantsToReset = [];
      const $parent = $org.parent();

      if (arguments.length) {
        for (let orgSelector1 of Object.keys($orgs)) {
          const $org1 = $orgs[orgSelector1];

          // Iterate through organisms and check if this organism (dispatching the 'prepend' action) is an ancestor.
          // This is much more efficient than searching through branches of descendants.
          for (let i = 0; i < $parent.length; i++) {
            if ($org1.parents($parent[i]).length) {
              descendantsToReset.push($org1);

              break;
            }
          }
        }
      }

      const retVal = prependFnOrig.apply($org, arguments);

      if (arguments.length) {
        $org.resetElementsAndMembers();

        for (let descendantToReset of descendantsToReset) {
          descendantToReset.resetElementsAndMembers();
        }
      }

      return retVal;
    };
  }
};
