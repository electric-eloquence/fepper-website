'use strict';

import actionsGet from './apply/actions-get.js';
import $orgs from './apply/organisms.js';
import organismsIncept from './boilerplate/organisms-incept.js';
import prototypeOverride from './boilerplate/prototype-override.js';
import reducerGet from './boilerplate/reducer-get.js';

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

export default App;
