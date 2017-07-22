'use strict';

export default function ($orgs, mainReducer) {
  const reducers = {};

  for (let i in $orgs) {
    if (!$orgs.hasOwnProperty(i)) {
      continue;
    }

    reducers[i] = mainReducer;
  }

  return Redux.combineReducers(reducers);
}
