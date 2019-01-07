import organismsIncept from './organisms-incept.js';
import prototypeOverride from './prototype-override.js';
import reducerGet from './reducer-get.js';

class Requerio {
  constructor($, Redux, $organisms, actionsGet) {
    let root = (typeof window === 'object' && window) || (typeof global === 'object' && global);

    this.$ = $;
    this.Redux = Redux;
    this.$orgs = $organisms;
    this.actions = actionsGet(this, root);
  }

  init() {
    const reducer = reducerGet(this.$orgs, this.Redux);
    const store = this.Redux.createStore(reducer);

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
