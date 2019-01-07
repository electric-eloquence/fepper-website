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
 * Need this closure to return a function with $org and memberIdx baked in.
 *
 * @param {object} $org - Organism object.
 * @param {number|undefined} memberIdx_ - If targeting an organism member, its index.
 * @returns {function} The returned function returns an object with properties correspond to the properties of DOMRect.
 */
function getBoundingClientRectClosure($org, memberIdx_) {
  return () => {
    let memberIdx;

    if (memberIdx_) {
      memberIdx = memberIdx_;
    }
    else {
      memberIdx = 0;
    }

    const rectState = $org.getStore().getState()[$org.selector].$members[memberIdx].boundingClientRect;

    for (let i in rectState) {
      if (!rectState.hasOwnProperty(i)) {
        continue;
      }

      if (rectState[i] !== null) {
        return rectState;
      }
    }

    return {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0
    };
  };
}

/**
 * Resets the organism's members as they are added or removed.
 * Executes the .$membersReset() method attached to the prototype. The reason for this private function is that outside
 * this file's scope, we don't want to query for the result of the entire selector, only its members.
 *
 * @param {object} prototype - The `this` reference from the jQuery/Cheerio prototype.
 */
function $membersReset(prototype) {
  if (prototype.selector === 'document' || prototype.selector === 'window') {
    return;
  }

  const $orgToReset = $(prototype.selector);

  if (prototype.length !== $orgToReset.length) {
    for (let i in $orgToReset) {
      if (!$orgToReset.hasOwnProperty(i)) {
        continue;
      }

      prototype[i] = $orgToReset[i];

      if (i === parseInt(i, 10).toString()) {
        if (typeof global === 'object') {
          prototype[i].getBoundingClientRect = getBoundingClientRectClosure(prototype, i);
        }
      }
    }
  }

  prototype.$membersPopulate($orgToReset);
}

/**
 * Override $.prototype with custom methods for dealing with state.
 *
 * @param {object} $ - jQuery or Cheerio.
 * @param {object} stateStore - Redux state store.
 */
export default ($, stateStore) => {
  if (!$.prototype.hasRequerio) {
    $.prototype.hasRequerio = true;
  }

  /**
   * A true Array of the selection's numerically-keyed properties.
   * This is necessary for selection by class and tag, where results number more than one.
   * Members of this array will be fully-incepted organisms.
   */
  $.prototype.$members = [];

  /**
   * A shorthand for dispatching state actions.
   *   1. Apply the jQuery or Cheerio method.
   *   2. Apply any additional changes.
   *   3. Call the Redux store.dispatch() method.
   *
   * @param {string} method - The name of the method native to the component's object prototype.
   * @param {*} args_ - This param contains the values to be passed within the args array to this[method].apply()
   *   If args_ is not an array, we want to preemptively limit the allowed types to string, number, and object.
   *   If it is one of these types, it will get wrapped in an array and submitted.
   * @param {number} [memberIdx] - Index of member if targeting a member.
   * @returns {object} The new application state.
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
        args_ instanceof Object
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
              else if (this[0] && this[0].attributes && this[0].attributes.length) {
                const attribs = {};

                if (typeof memberIdx === 'undefined') {
                  for (let i = 0; i < this[0].attributes.length; i++) {
                    const attr = this[0].attributes[i];

                    attribs[attr.name] = attr.value;
                  }

                  args[0] = attribs;
                }

                else if (this[memberIdx] && this[memberIdx].attributes && this[memberIdx].attributes.length) {
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
            if (this.selector === 'document' || this.selector === 'window') {
              break;
            }

            if (typeof $member === 'undefined') {
              // Apply to $org.
              args[0] = this[0][method].apply(this[0]);
            }
            else {
              // Apply to $member.
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

      const stateNew = stateStore.dispatch({
        type: '',
        selector: this.selector,
        $org: this,
        memberIdx: memberIdx,
        method: method,
        args: args
      });

      return stateNew;
    };
  }

  /**
   * A reference to Redux store.getState().
   *
   * @param {number} [memberIdx] - If targeting a child of a selector, that child's index.
   * @returns {object} The organism's state.
   */
  if (!$.prototype.getState) {
    $.prototype.getState = function (memberIdx) {

      // In order to return the latest, most accurate state, dispatch these actions to update their properties.
      // Do not preemptively update .innerHTML property because we don't want to bloat the app with too much data.
      // Do not preemptively update .style property because we only want to keep track of styles dispatched through js.
      $membersReset(this);

      // case state.attribs:
      this.dispatchAction('attr', [], memberIdx);

      // case state.getBoundingClientRect:
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
   * A reference to Redux store.
   *
   * @returns {object} This app's state store.
   */
  if (!$.prototype.getStore) {
    $.prototype.getStore = function () {
      return stateStore;
    };
  }

  /**
   * Populate organism's members with child organisms.
   *
   * @param {object} $orgToPopulate - The parent to the child organisms.
   */
  if (!$.prototype.$membersPopulate) {
    $.prototype.$membersPopulate = function ($orgToPopulate) {
      if (this.selector === 'document' || this.selector === 'window') {
        return;
      }

      this.$members = [];

      const $org = this;

      $orgToPopulate.each(function () {
        const $this = $(this);

        $this.parentSelector = $org.selector;

        $org.$members.push($this);
      });
    };
  }

  /**
   * Give the ability to set boundingClientRect properties. Only for server-side testing.
   *
   * @param {object} rectObj - Object of boundingClientRect measurements. Does not need to include all of them.
   * @param {number} [memberIdx] - Index of member if child member.
   */
  if (typeof global === 'object') {
    $.prototype.setBoundingClientRect = function (rectObj, memberIdx) {
      this.dispatchAction('setBoundingClientRect', rectObj, memberIdx);
    };
  }
};
