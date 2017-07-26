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
   * @param {*} args_ - This param contains the values to be passed within the args array to this[method].apply()
   *   If args_ is not an array, we want to preemptively limit the allowed types to string, number, and object.
   *   If it is one of these types, it will get wrapped in an array and submitted.
   * @return {object} The new application state.
   */
  if (!$.prototype.dispatchAction) {
    $.prototype.dispatchAction = function (method, args_) {

      let args = [];

      if (Array.isArray(args_)) {
        args = args_;
      }
      else if (
        typeof args_ === 'string' ||
        typeof args_ === 'number' ||
        args_ instanceof Object && args_.constructor === Object
      ) {
        args = [args_];
      }

      // On the client, stateStore.dispatch() depends on this.
      if (typeof this[method] === 'function') {

        // Make the .addClass() more convenient by checking if the class already exists.
        if (method === 'addClass') {
          if (!this.hasClass(args[0])) {
            this[method].apply(this, args);
          }
        }
        else {
          this[method].apply(this, args);
        }
      }

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
