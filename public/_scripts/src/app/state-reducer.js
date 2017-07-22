'use strict';

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
     * @property {string} innerHTML - to DOM Element.innerHTML spec. null means the initial innerHTML state wasn't
     *   modified. null has a completely different meaning than empty string.
     * @property {object} style - to DOM Element.style spec.
     */
    const stateDefault = {
      attribs: {},
      innerHTML: null,
      style: {}
    };

    let state;
    try {
      // Clone old state into new state.
      state = JSON.parse(JSON.stringify(state_));
    } catch (err) {
      state = stateDefault;
    }

    if (action.id && action.id.length) {
      const $org = action.$org;

      try {
        $org[action.method].apply($org, action.args);

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

const stateReducer = {
  /**
   * Combine organism-specific reducers for consumption by whole app.
   *
   * @param {object} $orgs
   * @return {object} combined reducers
   */
  init: $orgs => {

    const reducers = {};

    for (let i in $orgs) {
      if (!$orgs.hasOwnProperty(i)) {
        continue;
      }

      reducers[i] = reducerClosure(i);
    }

    return Redux.combineReducers(reducers);
  }
}

export default stateReducer;
