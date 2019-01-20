import organismsIncept from './organisms-incept.js';
import prototypeOverride from './prototype-override.js';
import reducerGet from './reducer-get.js';

class Requerio {

  /**
   * @param {object} $ - jQuery or Cheerio.
   * @param {object} Redux - Redux.
   * @param {object} $organisms - Key-value pairs of selector names and null values.
   * @param {function} [customReducer] - Custom Redux reducer for extending the built-in reducer.
   * @param {function} [storeEnhancer] - A function to extend the Redux store with additional capabilities.
   */
  constructor($, Redux, $organisms, customReducer, storeEnhancer) {
    this.$ = $;
    this.Redux = Redux;
    this.$orgs = $organisms;
    this.customReducer = customReducer;
    this.storeEnhancer = storeEnhancer;
  }

  /**
   * A distinct initialization method allows end-users to extend this class and perform operations between instantiation
   * and initialization if desired.
   */
  init() {
    const reducer = reducerGet(this.$orgs, this.Redux, this.customReducer);
    const store = this.Redux.createStore(reducer, this.storeEnhancer);

    prototypeOverride(this.$, store);
    organismsIncept(this.$orgs, this.$);
  }
}

if (typeof define === 'function') {
  define(function () {
    return Requerio;
  });
}
else if (typeof window === 'object') {
  window.Requerio = Requerio;
}

export default Requerio;
