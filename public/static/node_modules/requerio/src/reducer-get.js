/**
 * Helper function to add class to state.
 *
 * @param {array} classesForReducedState - Array of classes.
 * @param {string|function} classParam - Class to add to classesForReducedState.
 * @param {object} state - Current state.
 * @return {undefined} This function mutates the new state object.
 */
function addClass(classesForReducedState, classParam, state) {
  let classesToAdd;

  if (typeof classParam === 'string') {
    classesToAdd = classParam.split(/\s+/);
  }
  else if (typeof classParam === 'function') {
    const retVal = classParam();

    if (typeof retVal === 'string') {
      classesToAdd = retVal.split(/\s+/);
    }
  }

  classesToAdd.forEach((classToAdd) => {
    if (classesForReducedState.indexOf(classToAdd) === -1) {
      state.attribs.class += ` ${classToAdd}`;
    }
  });

  state.classArray = classesToAdd;
  state.classList = state.classArray;
}

/**
 * Helper function to remove class from state.
 *
 * @param {array} classesForReducedState - Array of classes.
 * @param {string|function} classParam - Class to remove from classesForReducedState.
 * @param {number|null} classIdx_ - Index of class to be removed.
 * @param {object} state - Current state.
 * @return {undefined} This function mutates the new state object.
 */
function removeClass(classesForReducedState, classParam, classIdx_, state) {
  let classesToRemove = [];

  if (typeof classParam === 'string') {
    classesToRemove = classParam.split(/\s+/);
  }
  else if (typeof classParam === 'function') {
    const retVal = classParam();

    if (typeof retVal === 'string') {
      classesToRemove = retVal.split(/\s+/);
    }
  }

  classesToRemove.forEach((classToRemove) => {
    let classIdx;

    if (typeof classIdx_ === 'number') {
      classIdx = classIdx_;
    }
    else {
      classesForReducedState.indexOf(classToRemove);
    }

    if (classIdx > -1) {
      classesForReducedState.splice(classIdx, 1);
    }
  });

  state.attribs.class = classesForReducedState.join(' ');
  state.classArray = classesForReducedState;
  state.classList = state.classArray;
}

/**
 * This builds state objects for organisms and their members.
 *
 * @param {object} $org - Organism.
 * @param {object} state - Preinitialized state.
 * @param {object} action - Object defining how we'll act.
 * @return {undefined} This function mutates the state param.
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

    let classesForReducedState = [];

    if (state.attribs && state.attribs.class) {
      classesForReducedState = state.attribs.class.split(/\s+/);
      state.classArray = classesForReducedState;
      state.classList = state.classArray;
    }

    switch (action.method) {
      case 'addClass': {
        if (action.args.length === 1) {
          addClass(classesForReducedState, action.args[0], state);
        }

        break;
      }

      case 'removeClass': {
        if (action.args.length === 1) {
          removeClass(classesForReducedState, action.args[0], null, state);
        }

        break;
      }

      case 'toggleClass': {
        let classesToToggle = [];

        if (typeof action.args[0] === 'string') {
          classesToToggle = action.args[0].split(/\s+/);
        }
        else if (typeof action.args[0] === 'function') {
          const retVal = action.args[0]();

          if (typeof retVal === 'string') {
            classesToToggle = retVal.split(/\s+/);
          }
        }

        classesToToggle.forEach((classToToggle) => {
          if (action.args.length === 1) {
            const classIdx = classesForReducedState.indexOf(classToToggle);

            if (classIdx === -1) {
              addClass(classesForReducedState, classToToggle, state);
            }
            else {
              removeClass(classesForReducedState, classToToggle, classIdx, state);
            }
          }

          else if (action.args.length === 2) {
            if (action.args[1]) {
              addClass(classesForReducedState, classToToggle, state);
            }
            else {
              const classIdx = classesForReducedState.indexOf(classToToggle);

              removeClass(classesForReducedState, classToToggle, classIdx, state);
            }
          }
        });

        break;
      }

      case 'attr': {
        if (action.args.length === 2) {
          if (typeof action.args[0] === 'string') {
            if (typeof action.args[1] === 'string') {
              state.attribs[action.args[0]] = action.args[1];
            }
            else if (typeof action.args[1] === 'function') {
              const retVal = action.args[1]();

              if (typeof retVal === 'string') {
                state.attribs[action.args[0]] = retVal;
              }
            }
          }
        }
        else if (
          action.args.length === 1 &&
          action.args[0] instanceof Object &&
          action.args[0].constructor === Object
        ) {
          for (let i in action.args[0]) {
            if (!action.args[0].hasOwnProperty(i)) {
              continue;
            }
            state.attribs[i] = action.args[0][i];
          }
        }

        break;
      }

      case 'css': {
        if (action.args.length === 2) {
          if (typeof action.args[0] === 'string') {
            if (typeof action.args[1] === 'string') {
              state.style[action.args[0]] = action.args[1];
            }
            else if (typeof action.args[1] === 'function') {
              const retVal = action.args[1]();

              if (typeof retVal === 'string') {
                state.style[action.args[0]] = retVal;
              }
            }
          }
        }
        else if (
          action.args.length === 1 &&
          action.args[0] instanceof Object &&
          action.args[0].constructor === Object
        ) {
          for (let i in action.args[0]) {
            if (!action.args[0].hasOwnProperty(i)) {
              continue;
            }

            state.style[i] = action.args[0][i];
          }
        }

        break;
      }

      case 'getBoundingClientRect': {
        if (action.args.length === 1) {
          if (action.args[0] instanceof Object) {

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

      case 'setBoundingClientRect': {
        if (action.args[0] instanceof Object) {
          const rectObj = JSON.parse(JSON.stringify(action.args[0]));

          Object.assign(state.boundingClientRect, rectObj);
        }

        break;
      }

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

      case 'html': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'string') {
            state.innerHTML = action.args[0];
          }
          else if (typeof action.args[0] === 'function') {
            const retVal = action.args[0]();

            if (typeof retVal === 'string') {
              state.style[action.args[0]] = retVal;
            }
          }
        }

        break;
      }

      case 'innerWidth': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.innerWidth = action.args[0];
          }
        }

        break;
      }

      case 'innerHeight': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.innerHeight = action.args[0];
          }
        }

        break;
      }

      case 'scrollTop': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.scrollTop = action.args[0];
          }
        }

        break;
      }

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
    }
  }
  catch (err) {
    console.error(err); // eslint-disable-line no-console
    throw err;
  }
}

/**
 * Closure to generate reducers specific to organisms.
 *
 * @param {string} orgSelector - The organism's selector.
 * @return {function} A function configured to work on the orgSelector.
 */
function reducerClosure(orgSelector) {

  /**
   * Clone an old state, update the clone based on an action, and return the clone.
   *
   * @param {object} state_ - Old state.
   * @param {object} action - An object with properties defining an action.
   * @return {object} New state.
   */
  return function (state_, action) {

    /**
     * A contract for future states. Initial state contains empty values. Do not to let states bloat for no reason (as
     *   it could with large innerHTML).
     *
     * @property {object} attribs - Equivalent to the attribs property of a Cheerio object. This consists of simple
     *   key-value pairs, and as such, is preferable to use for storing state than a replica of the much more complex
     *   Element.attributes collection, as utilized by jQuery. The attribs property is not documented in the Cheerio
     *   documentation, and may change without notice. However, this is unlikely, since it is derived from its
     *   htmlparser2 dependency. The htmlparser2 package has had this property since its initial release.
     * @property {object} boundingClientRect - Key-value copy of object returned by Element.getBoundingClientRect().
     * @property {null|string} innerHTML - To DOM Element.innerHTML spec. null means the initial innerHTML state wasn't
     *   modified. null has a completely different meaning than empty string.
     * @property {null|number} scrollTop - Number of pixels scrolled.
     * @property {object} style - To DOM Element.style spec.
     * @property {null|number} width - Width in number of pixels.
     * @property {null|number} height - Height in number of pixels.
     * @property {array} $members - jQuery/Cheerio object members belonging to selection.
     */
    const stateDefault = {
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
      innerHTML: null,
      innerWidth: null,
      innerHeight: null,
      scrollTop: null,
      style: {},
      width: null,
      height: null,
      $members: []
    };

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
        state = JSON.parse(JSON.stringify(stateDefault));
      }

      // Update length of state.$members array to match length of $org.$members.
      if ($org.$members.length < state.$members.length) {
        try {
          // Update $members array with clones of stateDefault.
          state.$members = [];
          $org.$members.forEach(($member, idx) => {
            state.$members[idx] = JSON.parse(JSON.stringify(stateDefault));
          });
        }
        catch (err) {
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
          console.error(err); // eslint-disable-line no-console
        }
      }

      // Preinitialize.
      if (state.attribs) {
        state.attribs.class = $org.attr('class');
      }

      // Build new state for organism.
      stateBuild($org, state, action);

      // Build new state for selection in $members array.
      if (
        typeof action.memberIdx !== 'undefined' &&
        typeof $org.$members[action.memberIdx] !== 'undefined' &&
        typeof state.$members[action.memberIdx] !== 'undefined'
      ) {
        stateBuild($org.$members[action.memberIdx], state.$members[action.memberIdx], action);
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
 * @return {object} Combined reducers
 */
export default ($orgs, Redux) => {
  const reducers = {};

  for (let i in $orgs) {
    if (!$orgs.hasOwnProperty(i)) {
      continue;
    }

    reducers[i] = reducerClosure(i);
  }

  return Redux.combineReducers(reducers);
};
