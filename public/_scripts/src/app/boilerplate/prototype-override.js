'use strict';

/**
 * Override $.prototype with custom methods for dealing with state.
 *
 * @param {object} stateStore
 */
export default stateStore => {

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
