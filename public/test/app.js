'use strict';

var actionsGet = app => {
  const $orgs = app.$orgs;

  return {

    ripen: () => {
      const MAX_PERCENTAGE = 400;
      // Firefox recognizes html.scrollTop; the rest recognize body.scrollTop.
      const scrollTop = $orgs.html.scrollTop() > 0 ? $orgs.html.scrollTop() : $orgs.body.scrollTop();

      let percentage = MAX_PERCENTAGE * scrollTop / ($orgs.html.height() - app.$window.height());
      percentage = percentage < MAX_PERCENTAGE ? percentage : MAX_PERCENTAGE;

      $orgs.logoBackground.dispatchAction('css', ['right', `-${percentage}%`]);
    },

    test: () => {
      $orgs.logoBackground.dispatchAction('css', ['right', '-66%']);
    }
  }
};

/**
 * Declare keys with null values here.
 *
 * @return {object} Keyed by organism ID.
 */
var $orgs = {
  'html': null,
  'body': null,
  'logoBackground': null,
  'logoImage': null
};

/**
 * Populate $orgs values with jQuery or Cheerio objects.
 *
 * @param {object} $orgs
 */
var organismsIncept = $orgs => {

  for (let i in $orgs) {
    if (!$orgs.hasOwnProperty(i)) {
      continue;
    }

    $orgs[i] = $(`#${i}`);
  }
};

/**
 * Override $.prototype with custom methods for dealing with state.
 *
 * @param {object} stateStore
 */
var prototypeOverride = stateStore => {

  /**
   * Convenience method.
   *
   * @return {string} The organism's ID.
   */
  if (!$.prototype.id) {
    $.prototype.id = function () {return this.attr('id')};
  }

  /**
   * A shorthand for dispatching state actions.
   *   1. Apply the jQuery or Cheerio method.
   *   2. Apply any additional changes.
   *   3. Call the Redux store.dispatch() method.
   *
   * @param {string} method - The name of the method native to the component's object prototype.
   * @param {string|array} args_ - If this param is passed as a string, an array containing this string will be
   *   created and dispatched.  Otherwise, the args_ array is dispatched directly.
   * @return {object} The new application state.
   */
  if (!$.prototype.dispatchAction) {
    $.prototype.dispatchAction = function (method, args_) {

      let args = [];
      if (typeof args_ === 'string') {
        args = [args_];
      } else if (Array.isArray(args_)) {
        args = args_;
      }

      this[method].apply(this, args);

      const stateNew = stateStore.dispatch({
        type: '',
        id: this.id(),
        $org: this,
        method: method,
        args: args
      });

      return stateNew;
    };
  }

  /**
   * A reference to Redux store.getState().
   *
   * @return {object} The component's state.
   */
  if (!$.prototype.getState) {
    $.prototype.getState = function () {
      return stateStore.getState()[this.id()];
    };
  }

  /**
   * A reference to Redux store.
   *
   * @return {object} This app's state store.
   */
  if (!$.prototype.getStore) {
    $.prototype.getStore = function () {
      return stateStore;
    };
  }
};

/**
 * Closure to generate reducers specific to organisms.
 *
 * @param {string} orgId
 * @return
 */
function reducerClosure(orgId) {

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
     * @property {object} attribs - equivalent to the attribs property of a Cheerio object. This consists of simple
     *   key-value pairs, and as such, is preferable to use for storing state than a replica of the much more complex
     *   Element.attributes collection, as utilized by jQuery. The attribs property is not documented in the Cheerio
     *   documentation, and may change without notice. However, this is unlikely, since it is derived from its
     *   htmlparser2 dependency. The htmlparser2 package has had this property since its initial release.
     * @property {null|string} innerHTML - to DOM Element.innerHTML spec. null means the initial innerHTML state wasn't
     *   modified. null has a completely different meaning than empty string.
     * @property {string} method - to apply toward jQuery or Cheerio.
     * @property {object} style - to DOM Element.style spec.
     */
    const stateDefault = {
      attribs: {},
      innerHTML: null,
      method: '',
      style: {}
    };

    let state;
    try {
      // Clone old state into new state.
      state = JSON.parse(JSON.stringify(state_));
    } catch (err) {
      state = stateDefault;
    }

    if (action.id === orgId) {
      const $org = action.$org;

      try {
        // The attributes property of jQuery objects is based off of the DOM's Element.attributes collection.
        const domElAttr = $org[0].attributes;
        // jQuery.
        if (domElAttr) {
          for (let i = 0; i < domElAttr.length; i++) {
            state.attribs[domElAttr[i].name] = domElAttr[i].value;
          }

        // Cheerio.
        } else {
          state.attribs = $org[0].attribs;
        }

        switch (action.method) {
          case 'css':
            if (action.args.length === 2) {
              state.style[action.args[0]] = action.args[1];
            }
            break;
          case 'html':
          case 'text':
            if (action.args.length === 1) {
              state.innerHTML = action.args[0];
            }
            break;
          case 'prop':
            if (action.args.length === 2) {
              state.attribs[action.args[0]] = action.args[1];
            }
        }
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
        throw err;
      }
    }

    return state;
  }
}

/**
 * Combine organism-specific reducers for consumption by whole app.
 *
 * @param {object} $orgs
 * @return {object} combined reducers
 */
var reducerGet = $orgs => {
  const reducers = {};

  for (let i in $orgs) {
    if (!$orgs.hasOwnProperty(i)) {
      continue;
    }

    reducers[i] = reducerClosure(i);
  }

  return Redux.combineReducers(reducers);
};

const reducer = reducerGet($orgs);
const store = Redux.createStore(reducer);

class App {
  constructor($_, Redux_) {
    this.$ = $_;
    this.Redux = Redux_;

    if (typeof window === 'object') {
      this.$window = $(window);
    }
    else if (typeof global === 'object') {
      // Properties to server-side $window to be assigned in testing suite.
      this.$window = global.$window = {};
    }

    this.actions = actionsGet(this);
  }

  get $orgs() {
    return $orgs;
  }
}

prototypeOverride(store);
organismsIncept($orgs);

module.exports = App;
