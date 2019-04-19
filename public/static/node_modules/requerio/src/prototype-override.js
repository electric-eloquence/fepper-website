/**
 * Apply the jQuery or Cheerio method on the organism.
 *
 * @param {object} $org - Organism object.
 * @param {string} method - Name of the method to be applied.
 * @param {array} args - Arguments array, (not array-like object).
 * @param {number} [memberIdx] - Index of member if targeting a member.
 * @param {object} [$member] - Organism member if targeting a member.
 */
function applyMethod($org, method, args, memberIdx, $member) {
  if (typeof $member === 'undefined') {
    // Apply to $org.
    $org[method].apply($org, args);
  }
  else {
    // Apply to $member.
    $member[method].apply($member, args);
  }
}

/**
 * Create a stand-in for Element.getBoundingClientRect for the server.
 * Need this closure to return a function with the organism's selector and memberIdx baked in.
 *
 * @param {string} orgSelector - The organism's selector.
 * @param {number} memberIdx - The index of the organism member.
 * @param {object} stateStore - The application's Redux store.
 * @returns {function} The returned function returns an object with properties correspond to the properties of DOMRect.
 */
function getBoundingClientRectClosure(orgSelector, memberIdx, stateStore) {
  return () => {
    const rectState = stateStore.getState()[orgSelector].$members[memberIdx].boundingClientRect;

    for (let i in rectState) {
      /* istanbul ignore if */
      if (!rectState.hasOwnProperty(i)) {
        continue;
      }

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
 * Resets the organism's members as they are added or removed.
 * This is necessary because neither jQuery nor Cheerio dynamically updates its indexed items and length properties.
 *
 * @param {object} prototype - The `this` reference from the jQuery/Cheerio prototype.
 * @param {object} stateStore - The application's Redux store.
 */
function resetMembers(prototype, stateStore) {
  if (prototype.selector === 'document' || prototype.selector === 'window') {
    return;
  }

  const $orgReset = $(prototype.selector);

  if (prototype.length !== $orgReset.length) {
    for (let i = 0; i < prototype.length; i++) {
      delete prototype[i];
    }

    prototype.length = $orgReset.length;

    $orgReset.each(function (i, elem) {
      prototype[i] = elem;

      if (
        typeof global === 'object' &&
        typeof prototype[i].getBoundingClientRect === 'undefined'
      ) {
        prototype[i].getBoundingClientRect = getBoundingClientRectClosure(prototype.selector, i, stateStore);
      }
    });

    prototype.populateMembers();
  }
}

/**
 * Override $.prototype with custom methods for dealing with state.
 *
 * @param {object} $ - jQuery or Cheerio.
 * @param {object} stateStore - Redux state store.
 */
export default ($, stateStore) => {
  /* eslint-disable max-len */
  /* eslint-disable valid-jsdoc */

  $.prototype.$members = [];

  /**
### .dispatchAction(method, [args], [memberIdx])
Dispatches actions for reduction. Side-effects occur here (not in the reducer).
1. Apply the jQuery or Cheerio method.
2. Apply any additional changes.
3. Call the Redux store.dispatch() method.

__Returns__: `object` - The dispatched action object.

| Param | Type | Description |
| --- | --- | --- |
| method | `string` | The name of the method on the organism's object prototype. |
| [args] | `*` | This param contains the values to be passed as arguments to `method`. `null` or an empty `array` may be submitted if not passing arguments, but targeting a `memberIdx`. |
| [memberIdx] | `number` | The index of the organism member (if targeting a member). |
*/
  if (!$.prototype.dispatchAction) {
    $.prototype.dispatchAction = function (method, args_, memberIdx) {
      if (typeof memberIdx !== 'undefined' && typeof this[memberIdx] === 'undefined') {
        return;
      }

      let args = [];

      if (Array.isArray(args_)) {
        args = args_;
      }
      else if (
        typeof args_ === 'string' ||
        typeof args_ === 'number' ||
        args_ instanceof Object // Functions are also instances of Object.
      ) {
        args = [args_];
      }

      // Submission of memberIdx indicates that the action is to be dispatched on the specific member of the CSS class.
      let $member;

      if (typeof memberIdx !== 'undefined') {
        $member = $(this[memberIdx]);
      }

      // Side-effects must happen here. stateStore.dispatch() depends on this.
      if (
        typeof memberIdx === 'undefined' &&
          (typeof this[method] === 'function' || (this[0] && typeof this[0][method] === 'function'))
        ||
        typeof memberIdx !== 'undefined' && $member.length &&
          (typeof $member[method] === 'function' || (this[memberIdx] && typeof this[memberIdx][method] === 'function'))
      ) {

        switch (method) {

          // Make addClass more convenient by checking if the class already exists.
          case 'addClass': {
            if (typeof memberIdx === 'undefined') {
              if (!this.hasClass(args[0])) {
                applyMethod(this, method, args, memberIdx, $member);
              }
            }
            else {
              if (!$member.hasClass(args[0])) {
                applyMethod(this, method, args, memberIdx, $member);
              }
            }

            break;
          }

          // attr method with no arg retrieves data and updates state.
          case 'attr': {
            if (args.length) {
              applyMethod(this, method, args, memberIdx, $member);
            }
            else {

              // Cheerio objects have an .attribs property for member element attributes, which is undocumented and may
              // change without notice. However, this is unlikely, since it is derived from its htmlparser2 dependency.
              // The htmlparser2 package has had this property since its initial release.
              if (this[0] && this[0].attribs) {
                if (typeof memberIdx === 'undefined') {
                  args[0] = this[0].attribs;
                }
                else if (this[memberIdx] && this[memberIdx].attribs) {
                  args[0] = this[memberIdx].attribs;
                }
              }

              // jQuery saves and keys selected DOM Element objects in an array-like manner on the jQuery object.
              // The .attributes property of each Element object are per the DOM spec.
              // We need to parse the .attributes property to create a key-value store, which we'll submit as args[0].
              else if (this[0] && this[0].attributes) {
                if (typeof memberIdx === 'undefined' && this[0].attributes.length) {
                  const attribs = {};

                  for (let i = 0; i < this[0].attributes.length; i++) {
                    const attr = this[0].attributes[i];
                    attribs[attr.name] = attr.value;
                  }

                  args[0] = attribs;
                }

                else if (this[memberIdx] && this[memberIdx].attributes && this[memberIdx].attributes.length) {
                  const attribs = {};

                  for (let i = 0; i < this[memberIdx].attributes.length; i++) {
                    const attr = this[memberIdx].attributes[i];
                    attribs[attr.name] = attr.value;
                  }

                  args[0] = attribs;
                }
              }
            }

            break;
          }

          // getBoundingClientRect takes measurements and updates state. This never accepts an argument.
          // Also has to operate on the DOM Element member of the jQuery object (or its Cheerio facsimile).
          case 'getBoundingClientRect': {
            /* istanbul ignore if */
            if (this.selector === 'document' || this.selector === 'window') {
              break;
            }

            if (typeof $member === 'undefined') {
              // Since .getBoundingClientRect() is a DOM method (and not jQuery or Cheerio), apply on first DOM item.
              args[0] = this[0][method].apply(this[0]);
            }
            else {
              // Apply on indexed DOM item.
              args[0] = this[memberIdx][method].apply(this[memberIdx]);
            }

            break;
          }

          case 'setBoundingClientRect': {
            break;
          }

          // If innerWidth and innerHeight methods are applied to the window object, copy the respective property to the
          // state.
          case 'innerWidth':
          case 'innerHeight': {
            if (this.selector === 'window' && typeof window === 'object') {
              this[method] = window[method];
              args[0] = window[method];

              break;
            }
          }

          // scrollTop, width, height, innerWidth, and innerHeight methods with no args take measurements and update
          // state. innerWidth and innerHeight, when not applied to window, run the jQuery method.
          case 'scrollTop':
          case 'width':
          case 'height':
          case 'innerWidth':
          case 'innerHeight': {
            if (args.length) {
              applyMethod(this, method, args, memberIdx, $member);
            }
            else {
              /* istanbul ignore else */
              if (typeof $member === 'undefined') {
                // Apply to $org.
                args[0] = this[method].apply(this);
              }
              else {
                // Apply to $member.
                args[0] = $member[method].apply($member);
              }
            }

            break;
          }

          // Method applications for other methods.
          default:
            applyMethod(this, method, args, memberIdx, $member);
        }
      }

      return stateStore.dispatch({
        type: '',
        selector: this.selector,
        $org: this,
        method: method,
        args: args,
        memberIdx: memberIdx
      });
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

      // In order to return the latest, most accurate state, dispatch these actions to update their properties.
      // Do not preemptively update .innerHTML property because we don't want to bloat the app with too much data.
      // Do not preemptively update .style property because we only want to track styles dispatched through Requerio.
      resetMembers(this, stateStore);

      // Update attr in case they were changed by user interaction (like the `checked` attr).
      // case state.attribs:
      this.dispatchAction('attr', [], memberIdx);

      // The rest of the cases are measurements.
      // case state.boundingClientRect:
      this.dispatchAction('getBoundingClientRect', [], memberIdx);

      // case state.innerWidth:
      this.dispatchAction('innerWidth', [], memberIdx);

      // case state.innerHeight:
      this.dispatchAction('innerHeight', [], memberIdx);

      // case state.scrollTop:
      this.dispatchAction('scrollTop', [], memberIdx);

      // case state.width:
      this.dispatchAction('width', [], memberIdx);

      // case state.height:
      this.dispatchAction('height', [], memberIdx);

      if (typeof memberIdx === 'undefined') {
        return stateStore.getState()[this.selector];
      }
      else {
        return stateStore.getState()[this.selector].$members[memberIdx];
      }
    };
  }

  /**
### .getStore()
A reference to the Redux `store`. The same reference as `requerio.store`.

__Returns__: `object` - This app's state store.
*/
  if (!$.prototype.getStore) {
    $.prototype.getStore = function () {
      return stateStore;
    };
  }

  /**
### .populateMembers()
(Re)populate an organism's `.$members` property with its (recalculated) members. `.$members` are jQuery/Cheerio objects,
not fully incepted organisms.

__Returns__: `undefined`
*/
  if (!$.prototype.populateMembers) {
    $.prototype.populateMembers = function () {
      /* istanbul ignore if */
      if (this.selector === 'document' || this.selector === 'window') {
        return;
      }

      const $org = this;
      $org.$members = [];

      $org.each(function (i, elem) {
        if (
          typeof global === 'object' &&
          typeof elem.getBoundingClientRect === 'undefined'
        ) {
          elem.getBoundingClientRect = getBoundingClientRectClosure($org.selector, i, stateStore);
        }

        $org.$members.push($(elem));
      });
    };
  }

  /**
### .setBoundingClientRect(rectObj, [memberIdx])
Give the ability to set `boundingClientRect` properties. Only for server-side testing.

__Returns__: `undefined`

| Param | Type | Description |
| --- | --- | --- |
| rectObj | `object` | Object of `boundingClientRect` measurements. Does not need to include all of them. |
| [memberIdx] | `number` | The index of the organism member (if targeting a member). |
*/
  if (typeof global === 'object') {
    $.prototype.setBoundingClientRect = function (rectObj, memberIdx) {
      this.dispatchAction('setBoundingClientRect', rectObj, memberIdx);
    };
  }
// DO NOT REMOVE FOLLOWING COMMENT.
}; // end export default ($, stateStore)
