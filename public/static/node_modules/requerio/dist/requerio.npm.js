'use strict';

/**
 * Populate $orgs values with jQuery or Cheerio components.
 *
 * @param {object} $orgs - Organisms keyed by selector.
 * @param {object} $ - jQuery component.
 */
var organismsIncept = ($orgs, $) => {
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

var postInception = (requerio) => {
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

/**
 * Apply the jQuery or Cheerio method on the organism.
 *
 * @param {object} $org - Organism object.
 * @param {string} method - Name of the method to be applied.
 * @param {array} args - Arguments array, (not array-like object).
 * @param {object|object[]} [$member] - Organism member, or array of members.
 */
function applyMethod($org, method, args, $member) {
  if (Array.isArray($member)) {
    // Apply on each iteration of $member array.
    for (let $elem of $member) {
      if (typeof $elem[method] === 'function') {
        $elem[method].apply($elem, args);
      }
    }
  }
  else if ($member) {
    // Apply to $member.
    if (typeof $member[method] === 'function') {
      $member[method].apply($member, args);
    }
  }
  else {
    // Apply to $org.
    if (typeof $org[method] === 'function') {
      $org[method].apply($org, args);
    }
  }
}

/**
 * Apply the .attr() jQuery/Cheerio method.
 *
 * @param {object} $org - Organism object.
 * @param {array} args - Arguments array, (not array-like object).
 * @param {object|object[]} [$member] - Organism member, or array of members.
 * @param {number|number[]} [memberIdx] - Organism member index, or array of indices.
 */
function applyAttr($org, args, $member, memberIdx) {
  if (args.length) {
    applyMethod($org, 'attr', args, $member);
  }
  else {

    // Cheerio components have an .attribs property for element attributes, which is undocumented and may change without
    // notice. However, this is unlikely, since it is derived from its htmlparser2 dependency. The htmlparser2 package
    // has had this property since its initial release and its public position is that this won't change.
    // https://github.com/fb55/htmlparser2/issues/35
    // https://github.com/cheeriojs/cheerio/issues/547
    if ($org[0] && $org[0].attribs) {
      if (Array.isArray(memberIdx)) {
        // Get attribs from first valid iteration of elements.
        for (let idx of memberIdx) {
          if ($org[idx] && $org[idx].attribs) {
            args[0] = $org[idx].attribs;

            break;
          }
        }
      }
      else if ($org[memberIdx] && $org[memberIdx].attribs) {
        args[0] = $org[memberIdx].attribs;
      }
      else {
        args[0] = $org[0].attribs;
      }
    }

    // jQuery saves and keys selected DOM Element objects in an array-like manner on the jQuery component.
    // The .attributes property of each Element object are per the DOM spec.
    // We need to parse the .attributes property to create a key:value store, which we'll submit as args[0].
    else if ($org[0] && $org[0].attributes) {
      if (Array.isArray(memberIdx)) {
        // Get attribs from first valid iteration of elements.
        for (let idx of memberIdx) {
          if ($org[idx] && $org[idx].attributes && $org[idx].attributes.length) {
            const attribs = {};

            // .attributes is not an Iterable so no for of.
            for (let i = 0; i < $org[idx].attributes.length; i++) {
              const attribute = $org[idx].attributes[i];
              attribs[attribute.name] = attribute.value;
            }

            args[0] = attribs;

            break;
          }
        }
      }
      else if ($org[memberIdx] && $org[memberIdx].attributes && $org[memberIdx].attributes.length) {
        const attribs = {};

        // .attributes is not an Iterable, so no for...of.
        for (let i = 0; i < $org[memberIdx].attributes.length; i++) {
          const attribute = $org[memberIdx].attributes[i];
          attribs[attribute.name] = attribute.value;
        }

        args[0] = attribs;
      }
      else if ($org[0].attributes.length) {
        const attribs = {};

        // .attributes is not an Iterable so no for of.
        for (let i = 0; i < $org[0].attributes.length; i++) {
          const attribute = $org[0].attributes[i];
          attribs[attribute.name] = attribute.value;
        }

        args[0] = attribs;
      }
    }
  }
}

/**
 * Apply the .css() jQuery/Cheerio method. If a string or array is submitted as the arg, will update the state with the
 * current style value.
 *
 * @param {object} $org - Organism object.
 * @param {array} args - Arguments array, (not array-like object).
 * @param {object|object[]} [$member] - Organism member, or array of members.
 */
function applyCss($org, args, $member) {
  const method = 'css';

  if (Array.isArray($member)) {
    // Set operation.
    if (args[0] instanceof Object && args[0].constructor === Object) {
      // Apply on each iteration of $member array.
      for (let $elem of $member) {
        $elem[method].apply($elem, args);
      }
    }

    // Get operation. Only iterate once.
    for (let $elem of $member) {
      if (args[0] instanceof Object && args[0].constructor === Object) {
        const keys = Object.keys(args[0]);
        args[0] = $elem[method].apply($elem, [keys]);
      }
      else if (typeof args[0] === 'string') {
        const key = args[0];
        const value = $elem[method].apply($elem, args);
        args[0] = {};
        args[0][key] = value;
      }
      else if (Array.isArray(args[0])) {
        args[0] = $elem[method].apply($elem, args);
      }
      else /* istanbul ignore next */ {
        args[0] = {};
      }

      break;
    }

    if (!$member.length) {
      /* istanbul ignore next */
      args[0] = {};
    }
  }
  else if ($member) {
    // Set operation.
    if (args[0] instanceof Object && args[0].constructor === Object) {
      // Apply to $member.
      $member[method].apply($member, args);

      const keys = Object.keys(args[0]);

      if (keys.length === 1) {
        args[0] = {};
        args[0][keys[0]] = $member[method].apply($member, keys);
      }
      else {
        args[0] = $member[method].apply($member, [keys]);
      }
    }
    // Get operation.
    else if (typeof args[0] === 'string') {
      const key = args[0];
      const value = $member[method].apply($member, args);
      args[0] = {};
      args[0][key] = value;
    }
    else if (Array.isArray(args[0])) {
      args[0] = $member[method].apply($member, args);
    }
  }
  else {
    // Set operation.
    if (args[0] instanceof Object && args[0].constructor === Object) {
      // Apply to $org.
      $org[method].apply($org, args);

      // Retrieve updated css.
      const keys = Object.keys(args[0]);

      if (keys.length === 1) {
        args[0] = {};
        args[0][keys[0]] = $org[method].apply($org, keys);
      }
      else {
        args[0] = $org[method].apply($org, [keys]);
      }
    }
    // Get operation.
    else {
      if (typeof args[0] === 'string') {
        const key = args[0];
        const value = $org[method].apply($org, args);
        args[0] = {};
        args[0][key] = value;
      }
      else if (Array.isArray(args[0])) {
        args[0] = $org[method].apply($org, args);
      }
    }
  }
}

function applyData($org, args, $member) {
  const method = 'data';

  if (args[0] instanceof Object && args[0].constructor === Object) {
    applyMethod($org, method, args, $member);
  }

  if (Array.isArray($member)) {
    // Get all data to submit for updating state. Only iterate once.
    for (let $elem of $member) {
      args[0] = $elem[method].apply($elem);

      break;
    }
  }
  else if ($member) {
    args[0] = $member[method].apply($member);
  }
  else {
    args[0] = $org[method].apply($org);
  }
}

/**
 * Convert camelCase "method" to CAPS_SNAKE_CASE "type".
 *
 * @param {string} method - The jQuery/Cheerio/Requerio "method" name.
 * @returns {string} The Redux action "type" per Redux casing convention.
 */
function convertMethodToType(method) {
  return method.replace(/([A-Z])/g, '_$1').toUpperCase();
}

/**
 * Convenience method for getting boundingClientRect whether on client or server.
 *
 * @param {object} $org - Organism object.
 * @param {array} args - Arguments array, (not array-like object). Must always be an empty array. Will write the
 *   measurement to its element 0.
 * @param {number|number[]} [memberIdx] - Organism member index, or array of member indices.
 * @returns {array} The `args` array.
 */
function getBoundingClientRect($org, args, memberIdx) {
  const method = 'getBoundingClientRect';

  if (Array.isArray(memberIdx)) {
    memberIdx.forEach((idx) => {
      // Apply on indexed element.
      /* istanbul ignore else */
      if (typeof $org[method] === 'function') {
        args[0] = $org[method].call($org, idx);
      }
      else if (typeof window === 'object') {
        if ($org[idx] && typeof $org[idx][method] === 'function') {
          args[0] = $org[idx][method].call($org[idx]);
        }
      }
    });
  }
  else if (typeof memberIdx === 'number') {
    // Apply on indexed element.
    /* istanbul ignore else */
    if (typeof $org[method] === 'function') {
      args[0] = $org[method].call($org, memberIdx);
    }
    else if (typeof window === 'object') {
      if ($org[memberIdx] && typeof $org[memberIdx][method] === 'function') {
        args[0] = $org[memberIdx][method].call($org[memberIdx]);
      }
    }
  }
  else {
    // If no memberIdx, apply on first item.
    /* istanbul ignore else */
    if (typeof $org[method] === 'function') {
      args[0] = $org[method].call($org);
    }
    else if (typeof window === 'object') {
      if ($org[0] && typeof $org[0][method] === 'function') {
        args[0] = $org[0][method].call($org[0]);
      }
    }
  }

  return args;
}

/**
 * Apply a jQuery/Cheerio method to get a measurement.
 *
 * @param {object} $org - Organism object.
 * @param {string} method - Name of the method to be applied.
 * @param {array} args - Arguments array, (not array-like object). Must always be an empty array. Will write the
 *   measurement to its element 0.
 * @param {object|object[]} [$member] - Organism member, or array of members.
 * @returns {array} The `args` array.
 */
function getMeasurement($org, method, args, $member) {
  if (Array.isArray($member)) {
    // Apply on first valid iteration of $member array.
    $member.forEach(($elem) => {
      /* istanbul ignore if */
      if (typeof $elem[method] === 'function') {
        args[0] = $elem[method].apply($elem);

        return;
      }
    });
  }
  else if ($member) {
    // Apply to $member.
    /* istanbul ignore if */
    if (typeof $member[method] === 'function') {
      args[0] = $member[method].apply($member);
    }
  }
  else {
    // Apply to $org.
    if (typeof $org[method] === 'function') {
      args[0] = $org[method].apply($org);
    }
  }

  return args;
}

/**
 * Override $.prototype with custom methods for dealing with state.
 *
 * @param {object} requerio - Requerio instance.
 */
var prototypeOverride = (requerio) => {
  /* eslint-disable max-len */
  /* eslint-disable valid-jsdoc */

  const {$, store} = requerio;
  $.prototype.$members = [];

  /**
### .blur()
A server-side stand-in for client-side `.blur()`.
*/
  if (!$.prototype.blur) {
    $.prototype.blur = function () {};
  }

  /**
### .dispatchAction(method, [args], [memberIdx])
Dispatches actions for reduction. Side-effects occur here (not in the reducer).
1. Applies the jQuery or Cheerio method.
2. Applies any additional changes.
3. Calls the Redux `store.dispatch()` method.

__Returns__: `object` - The organism. Allows for action dispatches to be chained.

| Param | Type | Description |
| --- | --- | --- |
| method | `string` | The name of the method on the organism's prototype. |
| [args] | `*` | This param contains the values to be passed as arguments to the method. null or an empty array may be submitted if not passing arguments, but targeting a memberIdx. |
| [memberIdx] | `number`\|`number[]` | The index, or array of indices, of the organism member(s), if targeting one or more members. |
*/
  if (!$.prototype.dispatchAction) {
    $.prototype.dispatchAction = function (method, args_, memberIdx_) {
      const type = convertMethodToType(method);

      let args = [];

      // eslint-disable-next-line eqeqeq
      if (args_ != null) {
        args = [args_];
      }

      let memberIdx = memberIdx_;
      let membersLength = 0;

      this.$members.forEach(() => membersLength++);

      if (membersLength < this.$members.length) {
        memberIdx = [];

        this.$members.forEach(($member, idx) => memberIdx.push(idx));
      }

      // Submission of memberIdx indicates that the action is to be dispatched on the specific member of the CSS class.
      let $member;

      if (Array.isArray(memberIdx)) {
        $member = [];

        for (let idx of memberIdx) {
          $member.push($(this[idx]));
        }
      }
      else if (typeof memberIdx === 'number') {
        // Exit if the memberIdx points to nothing.
        if (typeof this[memberIdx] === 'undefined') {
          return;
        }

        $member = $(this[memberIdx]);
      }

      // Side-effects must happen here. store.dispatch() depends on this.
      switch (method) {

        case 'attr': {
          applyAttr(this, args, $member, memberIdx); // Mutates args.

          break;
        }

        // Dispatching 'css' with a property (or properties) but no value will write the existing property and value to
        // the .style property on the state.
        case 'css': {
          applyCss(this, args, $member); // Mutates args.

          break;
        }

        case 'data': {
          applyData(this, args, $member); // Mutates args.

          break;
        }

        // getBoundingClientRect takes measurements and updates state. This never accepts an argument.
        // On the client, it has to operate on the DOM Element member of the jQuery component.
        case 'getBoundingClientRect': {
          if (this.selector === 'document' || this.selector === 'window') {
            break;
          }

          getBoundingClientRect(this, args, memberIdx);

          break;
        }

        case 'html': {
          // If the 'html' action is dispatched without an arg, or with a null arg, and the .innerHTML property on the
          // state is unset, we want to set the .innerHTML property.
          // eslint-disable-next-line eqeqeq
          if (args[0] == null) {
            const state = store.getState()[this.selector];

            if (Array.isArray($member) && Array.isArray(memberIdx)) {
              // Dispatch on each iteration of $member array.
              $member.forEach(($elem, idx) => {
                const memberState = state.$members[memberIdx[idx]];

                // eslint-disable-next-line eqeqeq
                if (!memberState || memberState.innerHTML == null) {
                  this.prevAction = store.dispatch({
                    type,
                    selector: this.selector,
                    $org: this,
                    method,
                    args: [$elem.html()],
                    memberIdx: memberIdx[idx]
                  });
                }
              });
            }
            else if ($member && typeof memberIdx === 'number') {
              const memberState = state.$members[memberIdx];

              // eslint-disable-next-line eqeqeq
              if (!memberState || memberState.innerHTML == null) {
                // Dispatch on $member.
                this.prevAction = store.dispatch({
                  type,
                  selector: this.selector,
                  $org: this,
                  method,
                  args: [$member.html()],
                  memberIdx: memberIdx
                });
              }
            }
            else {
              // eslint-disable-next-line eqeqeq
              if (state.innerHTML == null) {
                // Dispatch on $org.
                this.prevAction = store.dispatch({
                  type,
                  selector: this.selector,
                  $org: this,
                  method,
                  args: [this.html()],
                  memberIdx: memberIdx
                });
              }
            }

            // Return because we don't want to invoke the default dispatch.
            return this;
          }

          applyMethod(this, method, args, $member);

          break;
        }

        // If innerWidth and innerHeight methods are applied to the `window` object, copy the respective property to the
        // state.
        case 'innerWidth':
        case 'innerHeight': {
          /* istanbul ignore if */
          if (this.selector === 'window' && typeof window === 'object') {
            this[method] = window[method];
            args[0] = window[method];

            break;
          }
        }

        // innerWidth, innerHeight, scrollTop, width, and height methods with no args take measurements and update
        // state. innerWidth and innerHeight, when not applied to window, run the jQuery method.
        case 'innerWidth':
        case 'innerHeight':
        case 'scrollTop':
        case 'width':
        case 'height': {
          if (args.length) {
            applyMethod(this, method, args, $member);
          }
          else {
            getMeasurement(this, method, args, $member); // Mutates args.
          }

          break;
        }

        case 'setActiveOrganism': {
          break;
        }

        case 'setBoundingClientRect': {
          break;
        }

        case 'toggleClass': {
          if (Array.isArray(args[0])) {
            args = args[0];
          }
          applyMethod(this, method, args, $member);

          break;
        }

        // Method applications for other methods.
        default: {
          applyMethod(this, method, args, $member);
        }
      }

      if (membersLength < this.$members.length) {
        this.populateMembers();
      }

      this.prevAction = store.dispatch({
        type,
        selector: this.selector,
        $org: this,
        method,
        args,
        memberIdx
      });

      return this;
    };
  }

  /**
### .exclude(selector)
Exclude (temporarily) a selected member or members from an organism's `.$members`
array. A `.dispatchAction()` is meant to be ultimately chained to this method.
Invoking `.dispatchAction()` will restore all original `.$members`.

__Returns__: `object` - The organism with its `.$members` winnowed of selected exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object`\|`function` | A selector string, a DOM (or DOM-like) element, a jQuery/Cheerio component, or a function returning true or false. |
*/
  $.prototype.exclude = function (selector) {
    if (typeof selector === 'function') {
      this.each((i, elem) => {
        if (selector.call(elem, i, elem)) {
          // Hack a mismatch between length and number of array elements to signal to repopulate members.
          delete this.$members[i];
        }
      });

      return this;
    }
    else {
      let $exclusions = selector;

      if (selector.constructor !== $) {
        $exclusions = $(selector);
      }

      const $members = [];

      this.each((i) => {
        if (this.$members[i] && this.$members[i][0]) {
          $members.push(this.$members[i][0]);
        }
      });

      for (let i = 0; i < $members.length; i++) {
        $exclusions.each((j, elem) => {
          if ($members[i] === elem) {
            // Hack a mismatch between length and number of array elements to signal to repopulate members.
            delete this.$members[i];
          }
        });
      }

      return this;
    }
  };

  /**
### .focus([options])
A server-side stand-in for client-side `.focus()`.
*/
  if (!$.prototype.focus) {
    $.prototype.focus = function () {};
  }

  /**
   * Internal. Do not document.
   *
   * Create a stand-in for Element.getBoundingClientRect for the server.
   * Cannot be attached to Cheerio Element stand-ins because they frequently reference each other.
   * Working with or around such references creates far too much complexity.
   *
   * @param {number} [memberIdx] - The index of the organism member (if targeting a member).
   */
  if (!$.prototype.getBoundingClientRect && typeof global === 'object') {
    $.prototype.getBoundingClientRect = function (memberIdx) {
      let rectState;

      if (typeof memberIdx === 'number') {
        rectState = store.getState()[this.selector].$members[memberIdx].boundingClientRect;
      }
      else {
        rectState = store.getState()[this.selector].boundingClientRect;
      }

      for (let i of Object.keys(rectState)) {
        if (rectState[i] !== null) {
          return rectState;
        }
      }

      return {
        bottom: null,
        height: null,
        left: null,
        right: null,
        top: null,
        width: null
      };
    };
  }

  /**
### .getState([memberIdx])
A reference to Redux `store.getState()`.

__Returns__: `object` - The organism's state.

| Param | Type | Description |
| --- | --- | --- |
| [memberIdx] | `number` | The index of the organism member (if targeting a member). |
*/
  if (!$.prototype.getState) {
    $.prototype.getState = function (memberIdx) {
      const $member = this.$members[memberIdx];
      let state;
      let updateState = false;

      if (typeof memberIdx === 'number') {
        state = store.getState()[this.selector].$members[memberIdx];

        /* istanbul ignore if */
        if (!state) {
          updateState = true;
        }
      }

      if (!state) {
        state = store.getState()[this.selector];
      }

      // Do not preemptively update .style property because we only want to track styles dispatched through Requerio.

      // Do update .attribs property if attr were changed by user interaction, e.g., `checked` attr.
      const argsAttr = [];

      applyAttr(this, argsAttr, $member, memberIdx); // Mutates argsAttr.

      if (JSON.stringify(state.attribs) !== JSON.stringify(argsAttr[0])) {
        store.dispatch({
          type: 'ATTR',
          selector: this.selector,
          $org: this,
          method: 'attr',
          args: argsAttr,
          memberIdx
        });

        updateState = true;
      }

      // Do update .data property if data were updated on a data attribute, i.e., not by a 'data' action.
      const argsData = [];

      applyData(this, argsData, $member); // Mutates argsData.

      if (JSON.stringify(state.data) !== JSON.stringify(argsData[0])) {
        store.dispatch({
          type: 'DATA',
          selector: this.selector,
          $org: this,
          method: 'data',
          args: argsData,
          memberIdx
        });

        updateState = true;
      }

      // Do update measurements if they were changed by user interaction, e.g., resizing viewport.
      updateState = this.updateMeasurements(state, $member, memberIdx);

      // Do not preemptively update .innerHTML property because we don't want to bloat the app with too much data,
      // nor do we want to preform unnecessary .html() reads.
      // Therefore, only proceed with an 'html' action if innerHTML is already set.
      const innerHTMLOld = state.innerHTML;

      // eslint-disable-next-line eqeqeq
      if (innerHTMLOld != null) {
        let innerHTMLNew;

        if (typeof memberIdx === 'number') {
          innerHTMLNew = $member.html();
        }
        else {
          innerHTMLNew = this.html();
        }

        if (innerHTMLNew !== innerHTMLOld) {
          store.dispatch({
            type: 'HTML',
            selector: this.selector,
            $org: this,
            method: 'html',
            args: [innerHTMLNew],
            memberIdx
          });

          updateState = true;
        }
      }

      // Do update form field values if they were changed by user interaction.
      const valueOld = state.value;

      // eslint-disable-next-line eqeqeq
      if (valueOld != null) {
        let valueNew;

        if (typeof memberIdx === 'number') {
          valueNew = $member.val();
        }
        else {
          valueNew = this.val();
        }

        if (valueNew !== valueOld) {
          store.dispatch({
            type: 'VAL',
            selector: this.selector,
            $org: this,
            method: 'val',
            args: [valueNew],
            memberIdx
          });

          updateState = true;
        }
      }

      if (updateState) {
        if (typeof memberIdx === 'number') {
          state = store.getState()[this.selector].$members[memberIdx];
        }
        else {
          state = store.getState()[this.selector];
        }
      }

      return state;
    };
  }

  /**
### .getStore()
A reference to the Redux `store`. The same reference as `requerio.store`.

__Returns__: `object` - This app's state store.
*/
  if (!$.prototype.getStore) {
    $.prototype.getStore = function () {
      return store;
    };
  }

  /**
### .hasChild(selector)
Filter (temporarily) an organism's `.$members` array to include only those with
a child matching the selector. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |
*/
  $.prototype.hasChild = function (selector) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i]) {
        const $children = this.$members[i].children(selector);

        if ($children.length) {
          if (typeof selector === 'string') {
            continue;
          }
          else if ($children[0] === selector) {
            continue;
          }
        }
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasElement(element)
Filter (temporarily) an organism's `.$members` to include only that whose element
matches the param. A `.dispatchAction()` is meant to be ultimately chained to
this method. Invoking `.dispatchAction()` will restore all original `$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| element | `object` | A DOM (or DOM-like) element. |
*/
  $.prototype.hasElement = function (element) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i] && this.$members[i][0] === element) {
        continue;
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasNext(selector)
Filter (temporarily) an organism's `.$members` array to include only those whose
"next" sibling is matched by the selector. A `.dispatchAction()` is meant to be
ultimately chained to this method. Invoking `.dispatchAction()` will restore all
original `$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |
*/
  $.prototype.hasNext = function (selector) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i]) {
        const $next = this.$members[i].next(selector);

        if ($next.length) {
          if (typeof selector === 'string') {
            continue;
          }
          else if ($next[0] === selector) {
            continue;
          }
        }
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasParent(selector)
Filter (temporarily) an organism's `.$members` to include only those with a
parent matching the selector. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |
*/
  $.prototype.hasParent = function (selector) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i]) {
        const $parent = this.$members[i].parent(selector);

        if ($parent.length) {
          if (typeof selector === 'string') {
            continue;
          }
          else if ($parent[0] === selector) {
            continue;
          }
        }
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasPrev(selector)
Filter (temporarily) an organism's `.$members` to include only those whose "prev"
sibling is matched by the selector. A `.dispatchAction()` is meant to be
ultimately chained to this method. Invoking `.dispatchAction()` will restore all
original `$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |
*/
  $.prototype.hasPrev = function (selector) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i]) {
        const $prev = this.$members[i].prev(selector);

        if ($prev.length) {
          if (typeof selector === 'string') {
            continue;
          }
          else if ($prev[0] === selector) {
            continue;
          }
        }
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasSelector(selector)
Filter (temporarily) an organism's `.$members` to include only those that match
the selector criteria. A `.dispatchAction()` is meant to be ultimately chained
to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string` | A jQuery/Cheerio selector. |
*/
  $.prototype.hasSelector = function (selector) {
    const $selection = $(selector);

    for (let i = 0; i < this.$members.length; i++) {
      /* istanbul ignore if */
      if (!this.$members[i]) {
        continue;
      }

      let hasSelector = false;

      for (let j = 0; j < $selection.length; j++) {
        // Hack a mismatch between length and number of array elements to signal to repopulate members.
        if (this.$members[i][0] === $selection[j]) {
          hasSelector = true;

          break;
        }
      }

      if (!hasSelector) {
        delete this.$members[i];
      }
    }

    return this;
  };

  /**
### .hasSibling(selector)
Filter (temporarily) an organism's `.$members` to include only those with a
sibling matched by the selector. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |
*/
  $.prototype.hasSibling = function (selector) {
    const $selection = $(selector);

    for (let i = 0; i < this.$members.length; i++) {
      /* istanbul ignore if */
      if (!this.$members[i]) {
        continue;
      }

      let hasSibling = false;

      for (let j = 0; j < $selection.length; j++) {
        // Hack a mismatch between length and number of array elements to signal to repopulate members.
        const $siblings = this.$members[i].siblings($selection[j]);

        if ($siblings.length) {
          hasSibling = true;
        }
      }

      if (!hasSibling) {
        delete this.$members[i];
      }
    }

    return this;
  };

  /**
### .populateMembers()
(Re)populate an organism's `.$members` array with its (recalculated) members.
`.$members` are jQuery/Cheerio components, not fully incepted organisms.
*/
  if (!$.prototype.populateMembers) {
    $.prototype.populateMembers = function () {
      /* istanbul ignore if */
      if (this.selector === 'document' || this.selector === 'window') {
        return;
      }

      const $org = this;
      $org.$members = [];

      $org.each((i, elem) => {
        $org.$members.push($(elem));
      });
    };
  }

  /**
### .resetElementsAndMembers()
Reset the organism's elements and members as they are added or removed. This is
necessary because neither jQuery nor Cheerio dynamically updates the indexed
elements or length properties on a saved jQuery or Cheerio component.
*/
  if (!$.prototype.resetElementsAndMembers) {
    $.prototype.resetElementsAndMembers = function () {
      const $orgReset = $(this.selector);
      let reset = false;

      if (this.length !== $orgReset.length) {
        reset = true;
      }
      else {
        for (let i = 0; i < this.length; i++) {
          if (this[i] !== $orgReset[i]) {
            reset = true;

            break;
          }
        }
      }

      if (reset) {
        for (let i = 0; i < this.length; i++) {
          delete this[i];
        }

        this.length = $orgReset.length;

        $orgReset.each((i, elem) => {
          this[i] = elem;
        });

        this.populateMembers();
      }
    };
  }

  /**
### .setBoundingClientRect(rectObj, [memberIdx])
Give the ability to set `boundingClientRect` properties. Only for server-side
testing.

| Param | Type | Description |
| --- | --- | --- |
| rectObj | `object` | An object of `boundingClientRect` measurements. Does not need to include all of them. |
| [memberIdx] | `number`\|`number[]` | The index (or array of indices) of the organism member(s) if targeting one or more members. |
*/
  if (typeof global === 'object') {
    $.prototype.setBoundingClientRect = function (rectObj, memberIdx) {
      this.dispatchAction('setBoundingClientRect', rectObj, memberIdx);
    };
  }

  /**
### .updateMeasurements()
Update measurements on the state object as per changes to attributes and styles.

__Returns__: `boolean` - Whether or not to update state based on a change in measurement.

| Param | Type | Description |
| --- | --- | --- |
| state | `object` | The most recent state. |
| [member] | `object`\|`object[]` | The object (or array or objects) representing the organism member(s) (if targeting one or more members). |
| [memberIdx] | `number`\|`number[]` | The index (or array of indices) of the organism member(s) (if targeting one or more members). |
*/
  $.prototype.updateMeasurements = function (state, $member, memberIdx) {
    let updateState = false;

    // Be sure to add to these if more measurements are added to the state object.
    for (let method of [
      'innerWidth',
      'innerHeight',
      'scrollTop',
      'width',
      'height'
    ]) {
      const args = [];

      getMeasurement(this, method, args, $member); // Mutates args.

      if (state[method] !== args[0]) {
        store.dispatch({
          type: convertMethodToType(method),
          selector: this.selector,
          $org: this,
          method,
          args,
          memberIdx
        });

        updateState = true;
      }
    }

    if (this.selector === 'window') {
      return false;
    }

    const args = [];

    // Dependent on dispatches of other measurements to populate members.
    getBoundingClientRect(this, args, memberIdx); // Mutates args.

    for (let measurement of Object.keys(state.boundingClientRect)) {
      if (state.boundingClientRect[measurement] !== args[0][measurement]) {
        store.dispatch({
          type: 'SET_BOUNDING_CLIENT_RECT',
          selector: this.selector,
          $org: this,
          method: 'setBoundingClientRect',
          args,
          memberIdx
        });

        updateState = true;

        break;
      }
    }

    return updateState;
  };

// DO NOT REMOVE FOLLOWING COMMENT.
}; // end export default (requerio)

/* eslint-disable lines-around-comment */
/* eslint-disable max-len */

/**
 * This builds state objects for organisms and their members.
 *
 * @param {object} $org - Organism.
 * @param {object} state - Preinitialized state.
 * @param {object} action - Object defining how we'll act.
 * @returns {undefined} This function mutates the state param.
 */
function stateBuild($org, state, action) {
  try {
    // Cheerio.
    if ($org[0] && $org[0].attribs) {
      state.attribs = JSON.parse(JSON.stringify($org[0].attribs));
    }

    // jQuery.
    else if ($org[0] && $org[0].attributes && $org[0].attributes.length) {
      for (let i = 0; i < $org[0].attributes.length; i++) {
        const attr = $org[0].attributes[i];

        state.attribs[attr.name] = attr.value;
      }
    }

    const memberIdx = action.memberIdx;
    let classesForReduction = [];

    if (state.attribs && typeof state.attribs.class === 'string') {
      classesForReduction = state.attribs.class.trim() ? state.attribs.class.split(/\s+/) : [];
      state.classArray = classesForReduction;
      state.classList = state.classArray;
    }

    switch (action.method) {

      /**
### addClass(classes)
For each submitted class, add that class to all matches which do not have that
class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string`\|`function` | A space-separated string, or a function that returns a space-separated string. |
*/
      case 'addClass': {
        // Handled by running the method as a side-effect and splitting the class attribute into an array and copying
        // that to .classArray and .classList
        break;
      }

      /**
### after(...content)
Add HTML content immediately after all matches.

| Param | Type | Description |
| --- | --- | --- |
| ...content | `string`\|`object`\|`array` | A string, a DOM (or DOM-like) element, a jQuery/Cheerio component, an array thereof, or a comma-separated combination thereof. |

### after(content)
Add HTML content immediately after all matches.

| Param | Type | Description |
| --- | --- | --- |
| content | `function` | A function that returns an HTML string. |
*/
      case 'after': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected organisms.
        // Will not automatically update any state's .innerHTML.
        break;
      }

      /**
### append(...content)
Append HTML content to the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| ...content | `string`\|`object`\|`array` | A string, a DOM (or DOM-like) element, a jQuery/Cheerio component, an array thereof, or a comma-separated combination thereof. |

### append(content)
Append HTML content to the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| content | `function` | A function that returns an HTML string. |
*/
      case 'append': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected organisms.
        // Will not automatically update any state's .innerHTML.
        break;
      }

      /**
### attr(attributes)
Set one or more attributes for all matches.

| Param | Type | Description |
| --- | --- | --- |
| attributes | `object` | An object of attribute:value pairs. A string value will add or update the corresponding attribute. A null value will remove the corresponding attribute. |
*/
      case 'attr': {
        if (action.args[0] instanceof Object && action.args[0].constructor === Object) {
          Object.assign(state.attribs, action.args[0]);
        }

        break;
      }

      /**
### before(...content)
Add HTML content immediately before all matches.

| Param | Type | Description |
| --- | --- | --- |
| ...content | `string`\|`object`\|`array` | A string, a DOM (or DOM-like) element, a jQuery/Cheerio component, an array thereof, or a comma-separated combination thereof. |

### before(content)
Add HTML content immediately before all matches.

| Param | Type | Description |
| --- | --- | --- |
| content | `function` | A function that returns an HTML string. |
*/
      case 'before': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected organisms.
        // Will not automatically update any state's .innerHTML.
        break;
      }

      /**
### css(properties)
Set one or more CSS properties for all matches.

| Param | Type | Description |
| --- | --- | --- |
| properties | `object` | An object of property:value pairs to set. |

### css(properties)
Update `state.style` with the computed style of the actual element. Requerio
does not preemptively set all styles on the state, given how wasteful that would
be across all styles across all organisms.

| Param | Type | Description |
| --- | --- | --- |
| properties | `string`\|`string[]` | The name or names of properties to get from the element, and set on the state. |
*/
      case 'css': {
        Object.assign(state.style, action.args[0]);

        break;
      }

      /**
### data(keyValues)
Set one or more key:value pairs of data. Does not affect HTML attributes in the
DOM.

| Param | Type | Description |
| --- | --- | --- |
| keyValues | `object` | An object of key:value pairs. |
*/
      case 'data': {
        if (action.args[0] instanceof Object && action.args[0].constructor === Object) {
          Object.assign(state.data, action.args[0]);
        }

        break;
      }

      // Internal. Do not document.
      case 'getBoundingClientRect': {
        if (action.args.length === 1) {
          if (
            typeof action.args[0] === 'object' && // Exclude functions. Don't assume what its constructor is.
            action.args[0] instanceof Object
          ) {

            // Must copy, not reference, but can't use JSON.parse(JSON.stringify()) in FF and Edge because in those
            // browsers, DOMRect properties are inherited, not "own" properties (as in hasOwnProperty).
            const rectObj = action.args[0];

            for (let i in rectObj) {
              if (typeof rectObj[i] === 'number') {
                state.boundingClientRect[i] = rectObj[i];
              }
            }
          }
        }

        break;
      }

      /**
### height(value)
Set the height (not including padding, border, or margin) of all matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
*/
      case 'height': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.height = action.args[0];

            if (typeof global === 'object') {
              state.boundingClientRect.height = action.args[0];
            }
          }
        }

        break;
      }

      /**
### html(htmlString)
Set the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| htmlString | `string` | A string of HTML. Functions are not supported. |

### html()
Dispatching an 'html' action without an htmlString parameter will set
`state.innerHTML` to the string value of the innerHTML of the actual element.
Prior to that, `state.innerHTML` will be null. Simply invoking `.getState()`
where `state.innerHTML` is null will not update `state.innerHTML`. However,
once `state.innerHTML` has been set to a string, subsequent invocations of
`.getState()` will update `state.innerHTML`. Set `state.innerHTML` only when
necessary, since very large innerHTML strings across many organisms with many
members can add up to a large amount of data.
*/
      case 'html': {
        if (action.args.length === 1) {
          state.innerHTML = action.args[0];
        }

        break;
      }

      /**
### innerHeight(value)
Set the innerHeight (including padding, but not border or margin) of all
matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
*/
      case 'innerHeight': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.innerHeight = action.args[0];
          }
        }

        break;
      }

      /**
### innerWidth(value)
Set the innerWidth (including padding, but not border or margin) of all
matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
*/
      case 'innerWidth': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.innerWidth = action.args[0];
          }
        }

        break;
      }

      /**
### prepend(...content)
Prepend HTML content to the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| ...content | `string`\|`object`\|`array` | A string, a DOM (or DOM-like) element, a jQuery/Cheerio component, an array thereof, or a comma-separated combination thereof. |

### prepend(content)
Prepend HTML content to the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| content | `function` | A function that returns an HTML string. |
*/
      case 'prepend': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected organisms.
        // Will not automatically update any state's .innerHTML.
        break;
      }

      /**
### removeClass(classes)
For each submitted class, remove that class from all matches which have that
class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string`\|`function` | A space-separated string, or a function that returns a space-separated string. |
*/
      case 'removeClass': {
        // Handled by running the method as a side-effect and splitting the class attribute into an array and copying
        // that to .classArray and .classList
        break;
      }

      /**
### scrollTop(value)
Set the vertical scroll position (the number of CSS pixels that are hidden from
view above the scrollable area) of the match.

| Param | Type | Description |
| --- | --- | --- |
| value | `number` | The number to set the scroll position to. |
*/
      case 'scrollTop': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.scrollTop = action.args[0];
          }
        }

        break;
      }

      /**
### setActiveOrganism(selector)
Only applicable if 'document' is an incepted organism. When a 'focus' action is
dispatched by an organism, this sets the 'document' organism's
`state.activeOrganism` to the selector of the focused organism. The
'setActiveOrganism' action can only be dispatched by the 'document' organism.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string` | The identifying selector of the focused organism. |
*/
      case 'setActiveOrganism': {
        if ($org.selector === 'document') {
          state.activeOrganism = action.args[0] || null;
        }

        break;
      }

      /**
### setBoundingClientRect(boundingClientRect)
Copy properties of the boundingClientRect parameter over the corresponding
properties on `state.boundingClientRect`.

| Param | Type | Description |
| --- | --- | --- |
| boundingClientRect | `object` | An object of key:values. The object may contain one or more properties, but they must correspond to properties defined by the [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect) class, with the exception of `.x` and `.y` (as per compatibility with Microsoft browsers). |
*/
      case 'setBoundingClientRect': {
        if (
          typeof action.args[0] === 'object' && // Exclude functions. Don't assume what its constructor is.
          action.args[0] instanceof Object
        ) {
          const rectObj = action.args[0];

          // Must iterate through "own" properties and copy from rectObj. Shortcuts like Object.assign won't work
          // because rectObj is not a plain object in browsers.
          for (let measurement of Object.keys(state.boundingClientRect)) {
            if (
              state.boundingClientRect[measurement] !== action.args[0][measurement] &&
              action.args[0][measurement] != null // eslint-disable-line eqeqeq
            ) {
              state.boundingClientRect[measurement] = action.args[0][measurement];
            }
          }

          // If this is dispatched on the server, we need to copy the rectObj to the state $members.
          if (typeof global === 'object') {
            if (
              typeof memberIdx === 'number' &&
              state.$members[memberIdx]
            ) {
              Object.assign(state.$members[memberIdx].boundingClientRect, rectObj);
            }
            else {
              state.$members.forEach(($member) => {
                Object.assign($member.boundingClientRect, rectObj);
              });
            }
          }
        }

        break;
      }

      /**
### toggleClass(classes)
For each submitted class, add or remove that class from all matches, depending
on whether or not the member has that class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string`\|`function` | A space-separated string, or a function that returns a space-separated string. |

### toggleClass(paramsArray)
For each submitted class, add or remove that class from all matches, depending
on a true/false switch.

| Param | Type | Description |
| --- | --- | --- |
| paramsArray | `array` | An array: where element 0 is a space-separated string, or a function that returns a space-separated string; and element 1 is a boolean switch, where true means add, false means remove. |
*/
      case 'toggleClass': {
        // Handled by running the method as a side-effect and splitting the class attribute into an array and copying
        // that to .classArray and .classList
        break;
      }

      /**
### val(value)
Set the value of all matches, typically form fields. This will set `state.value`.

| Param | Type | Description |
| --- | --- | --- |
| value | `string`\|`number` | The value to which to set the form field's value. Functions are not supported. |
*/
      case 'val': {
        state.value = action.args[0] || null;

        break;
      }

      /**
### width(value)
Set the width (not including padding, border, or margin) of all matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
*/
      case 'width': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.width = action.args[0];

            if (typeof global === 'object') {
              state.boundingClientRect.width = action.args[0];
            }
          }
        }

        break;
      }
    // DO NOT REMOVE FOLLOWING COMMENT.
    } // end switch (action.method)
  }
  catch (err) {
    /* istanbul ignore next */
    console.error(err); // eslint-disable-line no-console
    /* istanbul ignore next */
    throw err;
  }
}

/**
 * Closure to generate reducers specific to organisms.
 *
 * @param {string} orgSelector - The organism's selector.
 * @param {function} [customReducer] - A custom reducer most likely purposed for custom methods.
 * @returns {function} A function configured to work on the orgSelector.
 */
function reducerClosure(orgSelector, customReducer) {

  /**
   * Clone an old state, update the clone based on an action, and return the clone.
   *
   * @param {object} state_ - Old state.
   * @param {object} action - An object with properties defining an action.
   * @returns {object} New state.
   */
  return function (state_, action) {

    /**
     * Contracts for future states. Initial states contain empty values.
     * Do not to let states bloat for no reason (as it could with large .innerHTML).
     *
     * Be sure to update docs/state-object-defaults.md when updating any of these defaults.
     */
    let stateDefault = {};

    if (orgSelector === 'document') {
      stateDefault = {
        activeOrganism: null
      };
    }
    else if (orgSelector === 'window') {
      stateDefault = {
        scrollTop: null,
        width: null,
        height: null
      };
    }
    else {
      stateDefault = {
        attribs: {},
        boundingClientRect: {
          width: null,
          height: null,
          top: null,
          right: null,
          bottom: null,
          left: null
        },
        classArray: [],
        classList: [],
        data: {},
        innerHTML: null,
        innerWidth: null,
        innerHeight: null,
        scrollTop: null,
        style: {},
        width: null,
        height: null,
        $members: []
      };
    }

    // If this is the reducer for the selected organism, reduce and return a new state.
    if (action.selector === orgSelector) {

      let state;
      const $org = action.$org;

      try {
        // Clone old state into new state.
        state = JSON.parse(JSON.stringify(state_));
      }
      catch (err) {
        // Clone default state into new state if state_ param is undefined.
        /* istanbul ignore next */
        state = JSON.parse(JSON.stringify(stateDefault));
      }

      // Update length of state.$members array to match length of $org.$members.
      if (Array.isArray($org.$members) && Array.isArray(state.$members)) {
        if ($org.$members.length < state.$members.length) {
          try {
            // Update $members array with clones of stateDefault.
            state.$members = [];
            $org.$members.forEach(($member, idx) => {
              state.$members[idx] = JSON.parse(JSON.stringify(stateDefault));
            });
          }
          catch (err) {
            /* istanbul ignore next */
            console.error(err); // eslint-disable-line no-console
          }
        }

        else if ($org.$members.length > state.$members.length) {
          try {
            // Populate $members array with clones of stateDefault if necessary.
            $org.$members.forEach(($member, idx) => {
              if (!state.$members[idx]) {
                state.$members[idx] = JSON.parse(JSON.stringify(stateDefault));
              }
            });
          }
          catch (err) {
            /* istanbul ignore next */
            console.error(err); // eslint-disable-line no-console
          }
        }
      }

      // Build new state for organism.
      stateBuild($org, state, action);

      const memberIdx = action.memberIdx;

      // Build new state for selection in $members array.
      if (
        typeof memberIdx === 'number' &&
        $org.$members[memberIdx] &&
        state.$members[memberIdx]
      ) {
        stateBuild($org.$members[memberIdx], state.$members[memberIdx], action);
      }
      else if (Array.isArray(memberIdx)) {
        for (let idx of memberIdx) {
          stateBuild($org.$members[idx], state.$members[idx], action);
        }
      }

      if (typeof customReducer === 'function') {
        const customState = customReducer(state, action);

        // We need to validate customState because older versions of Requerio had the 4th constructor argument return an
        // object of action functions. We now want the 4th argument to be an optional custom reducer.
        if (
          typeof customState === 'object' && // Don't want to check constructor because this is user submitted.
          customState instanceof Object
        ) {
          for (let i of Object.keys(customState)) {
            if (typeof customState[i] === 'function') {
              // The older Requerio versions would have functions as properties of this object.
              // If this is the case, ignore the output of customReducer and return the state as built earlier.
              return state;
            }
          }

          return customState;
        }
      }

      return state;
    }

    // If this is not the reducer for the selected organism, return the unmutated state if submitted as a defined param.
    // Else return the default state.
    else {
      if (state_) {
        return state_;
      }
      else {
        return stateDefault;
      }
    }
  };
}

/**
 * Combine organism-specific reducers for consumption by whole app.
 *
 * @param {object} $orgs - Organisms keyed by selector.
 * @param {object} Redux - Redux object.
 * @param {function} [customReducer] - A custom reducer most likely purposed for custom methods.
 * @returns {object} Combined reducers
 */
var reducerGet = ($orgs, Redux, customReducer) => {
  const reducers = {};

  for (let i of Object.keys($orgs)) {
    reducers[i] = reducerClosure(i, customReducer);
  }

  return Redux.combineReducers(reducers);
};

class Requerio {

  /**
   * @param {object} $ - jQuery or Cheerio.
   * @param {object} Redux - Redux.
   * @param {object} $organisms - Key:value pairs of selector names and null values.
   * @param {function} [customReducer] - Custom Redux reducer for extending the built-in reducer.
   * @param {function} [storeEnhancer] - A function to extend the Redux store with additional capabilities.
   */
  constructor($, Redux, $organisms, customReducer, storeEnhancer) {
    this.$ = $;
    this.Redux = Redux;
    this.$orgs = $organisms;
    this.customReducer = customReducer;
    this.storeEnhancer = storeEnhancer;
    this.store = null;
  }

  /**
   * A distinct initialization method allows end-users to extend this class and perform operations between instantiation
   * and initialization if desired.
   */
  init() {
    const reducer = reducerGet(this.$orgs, this.Redux, this.customReducer);
    this.store = this.Redux.createStore(reducer, this.storeEnhancer);

    prototypeOverride(this);
    organismsIncept(this.$orgs, this.$);
    postInception(this);
  }

  /**
   * @param {...string} selectors - jQuery/Cheerio selectors.
   */
  incept(...selectors) {
    const $organisms = {};

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];

      if (typeof this.$orgs[selector] === 'undefined') {
        $organisms[selector] = null;
      }
    }

    organismsIncept($organisms, this.$);
    Object.assign(this.$orgs, $organisms);
    postInception(this);

    const reducer = reducerGet(this.$orgs, this.Redux, this.customReducer);
    this.store.replaceReducer(reducer);
  }
}

if (typeof define === 'function') {
  define(function () {
    return Requerio;
  });
}
else if (typeof window === 'object') {
  window.Requerio = Requerio;
}

module.exports = Requerio;
