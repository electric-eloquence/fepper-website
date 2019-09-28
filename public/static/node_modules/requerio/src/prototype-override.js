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
export default (requerio) => {
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
