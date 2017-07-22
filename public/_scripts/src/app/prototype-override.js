'use strict';

import storeObserve from './store-observe.js';

/**
 * Override $.prototype with custom methods for dealing with state.
 *
 * @param {object} stateStore
 */
export default stateStore => {

  /**
   * @name id
   * @description A convenience method.
   * @return {string} The organism's ID.
   */
  if (!$.prototype.id) {
    $.prototype.id = function () {return this.attr('id')};
  }

  /**
   * @name dispatchAction
   * @description A shorthand for dispatching state actions via the Redux store.disatch() method.
   * @param {string} method - The name of the method native to the component's object prototype.
   * @param {string|array} args_ - If this param is passed as a string, an array containing this string will be
    created and dispatched.  Otherwise, the args_ array is dispatched directly.
   * @return {object} The new application state.
   */
  if (!$.prototype.dispatchAction) {
    $.prototype.dispatchAction = function (method, args_, additionalChange = () => {}) {
      const $org = this;
      const unsubscribe = storeObserve($org);

      //let stateNew = stateStore.dispatch({type: `${this.id().toUpperCase()}_INCREMENT`});

      let args = [];
      if (typeof args_ === 'string') {
        args = [args_];
      } else if (Array.isArray(args_)) {
        args = args_;
      }

      const stateNew = stateStore.dispatch({
        type: '',
        id: this.id(),
        $org: this,
        method: method,
        args: args
      });

      unsubscribe();
      return stateNew;
    };
  }

  /**
   * @name getState
   * @description A reference to Redux store.getState().
   * @return {object} The component's state.
   */
  if (!$.prototype.getState) {
    $.prototype.getState = function () {
      return stateStore.getState()[this.id()];
    };
  }

  /**
   * @name getStore
   * @return {object} This app's state store.
   */
  if (!$.prototype.getStore) {
    $.prototype.getStore = function () {
      return stateStore;
    };
  }
};
