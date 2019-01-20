/* eslint-disable lines-around-comment */
/* eslint-disable max-len */

/**
 * Helper function to add class to state.
 *
 * @param {array} classesForReducedState - Array of classes.
 * @param {string|function} classParam - Class to add to classesForReducedState.
 * @param {object} state - Current state.
 * @returns {undefined} This function mutates the new state object.
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
 * @returns {undefined} This function mutates the new state object.
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

    let classesForReducedState = [];

    if (state.attribs && state.attribs.class) {
      classesForReducedState = state.attribs.class.split(/\s+/);
      state.classArray = classesForReducedState;
      state.classList = state.classArray;
    }

    switch (action.method) {
      /**
### addClass(classes)
For each submitted class, add that class to all matched elements which do not have that class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string` \| `function` | A space-separated string, or a function that returns a space-separated string. |
*/
      case 'addClass': {
        if (action.args.length === 1) {
          addClass(classesForReducedState, action.args[0], state);
        }

        break;
      }

      /**
### removeClass(classes)
For each submitted class, remove that class from all matched elements which have that class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string` \| `function` | A space-separated string, or a function that returns a space-separated string. |
*/
      case 'removeClass': {
        if (action.args.length === 1) {
          removeClass(classesForReducedState, action.args[0], null, state);
        }

        break;
      }

      /**
### toggleClass(classes, [switch])
For each submitted class, add or remove that class from all matched elements, depending on whether or not the element has that class, or depending on the value of the switch parameter.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string` \| `function` | A space-separated string, or a function that returns a space-separated string. |
| switch | `boolean` | `true` means add, `false` means remove. |
*/
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

      /**
### attr(attributeName, value)
Set an attribute for all matched elements.

| Param | Type | Description |
| --- | --- | --- |
| attributeName | `string` | The name of the attribute to set. |
| value | `string` \| `function` \| `null` | The value to set the attribute to. If `null`, the specified attribute will be removed. |

### attr(attributes)
Set one or more attributes for all matched elements.

| Param | Type | Description |
| --- | --- | --- |
| attributes | `object` | An object of attribute-value pairs to set. |
*/
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
            /* istanbul ignore if */
            if (!action.args[0].hasOwnProperty(i)) {
              continue;
            }
            state.attribs[i] = action.args[0][i];
          }
        }

        break;
      }

      /**
### css(propertyName, value)
Set a CSS property for all matched elements.

| Param | Type | Description |
| --- | --- | --- |
| propertyName | `string` | The name of the property to set. |
| value | `string` \| `function` | The value to set the property to. |

### css(properties)
Set one or more CSS properties for all matched elements.

| Param | Type | Description |
| --- | --- | --- |
| properties | `object` | An object of property-value pairs to set. |
*/
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
            /* istanbul ignore if */
            if (!action.args[0].hasOwnProperty(i)) {
              continue;
            }

            state.style[i] = action.args[0][i];
          }
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
Set the height (not including padding, border, or margin) of all matched elements.

| Param | Type | Description |
| --- | --- | --- |
| value | `number` \| `string` \| `function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
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
Set the innerHTML of all matched elements.

| Param | Type | Description |
| --- | --- | --- |
| htmlString | `string` \| `function` | A string of HTML or a function returning HTML. |
*/
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

      /**
### innerHeight(value)
Set the innerHeight (including padding, but not border or margin) of all matched elements.

| Param | Type | Description |
| --- | --- | --- |
| value | `number` \| `string` \| `function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
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
Set the innerWidth (including padding, but not border or margin) of all matched elements.

| Param | Type | Description |
| --- | --- | --- |
| value | `number` \| `string` \| `function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
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
### scrollTop(value)
Set the vertical scroll position (the number of CSS pixels that are hidden from view above the scrollable area) of all matched elements.

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
### setBoundingClientRect(boundingClientRect)
Copy properties of the `boundingClientRect` parameter over corresponding properties on `state.boundingClientRect`.

| Param | Type | Description |
| --- | --- | --- |
| boundingClientRect | `object` | An object of key-values. The object may contain one or more properties, but they must correspond to properties defined by the [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect) class, with the exception of `.x` and `.y` (as per compatibility with Microsoft browsers). |
*/
      case 'setBoundingClientRect': {
        if (
          typeof action.args[0] === 'object' && // Exclude functions. Don't assume what its constructor is.
          action.args[0] instanceof Object
        ) {
          const rectObj = JSON.parse(JSON.stringify(action.args[0]));

          Object.assign(state.boundingClientRect, rectObj);

          // If this is called on the server, we need to copy the rectObj to the state $members.
          if (typeof global === 'object') {
            if (
              typeof action.memberIdx !== 'undefined' &&
              typeof state.$members[action.memberIdx] !== 'undefined'
            ) {
              Object.assign(state.$members[action.memberIdx].boundingClientRect, rectObj);
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
### width(value)
Set the width (not including padding, border, or margin) of all matched elements.

| Param | Type | Description |
| --- | --- | --- |
| value | `number` \| `string` \| `function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
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
 * @param {function|undefined} customReducer - A custom reducer most likely purposed for custom methods.
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
     * A contract for future states. Initial state contains empty values. Do not to let states bloat for no reason (as
     * it could with large innerHTML).
     *
     * Be sure to update docs/state-object-defaults.md when updating any of these defaults.
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
        /* istanbul ignore next */
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

      if (typeof customReducer === 'function') {
        const customState = customReducer(state, action);

        // We need to validate customState because older versions of Requerio had the 4th constructor argument return an
        // object of action functions. We now want the 4th argument to be an optional custom reducer.
        if (
          typeof customState === 'object' && // Don't want to check constructor because this is user submitted.
          customState instanceof Object
        ) {
          for (let i in customState) {
            /* istanbul ignore if */
            if (!customState.hasOwnProperty(i)) {
              continue;
            }

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
 * @param {function} customReducer - A custom reducer most likely purposed for custom methods.
 * @returns {object} Combined reducers
 */
export default ($orgs, Redux, customReducer) => {
  const reducers = {};

  for (let i in $orgs) {
    /* istanbul ignore if */
    if (!$orgs.hasOwnProperty(i)) {
      continue;
    }

    reducers[i] = reducerClosure(i, customReducer);
  }

  return Redux.combineReducers(reducers);
};
