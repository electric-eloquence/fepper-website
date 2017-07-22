export default function (stateStore) {
  // Override $.prototype with custom methods for dealing with state.
  /**
   * @name getState
   * @description A reference to Redux store.getState().
   * @return {object} The component's state.
   */
  if (!$.prototype.getState) {
    $.prototype.getState = function () {
      return stateStore.getState()[this.attr('id')];
    };
  }

  /**
   * @name dispatchAction
   * @description A shorthand for dispatching state actions via the Redux store.disatch() method.
   * @param {string} method - The name of the method native to the component's object prototype.
   * @param {string|array} args_ - If this param is passed as a string, an array containing this string will be
    created and dispatched.  Otherwise, the args_ array is dispatched directly.
   * @return {object} The Redux dispatched action.
   */
  if (!$.prototype.dispatchAction) {
    $.prototype.dispatchAction = function (method, args_) {
      var args = [];
      if (typeof args_ === 'string') {
        args = [args_];
      } else if (Array.isArray(args_)) {
        args = args_;
      }
      return stateStore.dispatch({
        type: '',
        id: this.attr('id'),
        method: method,
        args: args
      });
    };
  }
};
