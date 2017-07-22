'use strict';

/**
 * A handler to subscribe to and observe the store, and affect side-effects per organism.
 *
 * @param {object} $org - Organism object.
 * @param {function} additionalChange - Optional.
 * @return {function} Unsubscribe function.
 */
export default ($org, additionalChange = () => {}) => {

  let stateCurrent;
  const store = $org.getStore();

  function handleChange() {
    let statePrevious = stateCurrent;
    stateCurrent = $org.getState();

    if (statePrevious !== stateCurrent) {
      additionalChange($org, statePrevious);
    }
  }

  const unsubscribe = store.subscribe(handleChange);
  handleChange();

  return unsubscribe;
};
