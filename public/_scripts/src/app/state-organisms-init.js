'use strict';

export default function (mainReducer) {
  const $orgs = {
    'logoBackground': $('#logoBackground')
  };
/*
  for (let i in $orgs) {
    if (!$orgs.hasOwnProperty(i)) {
      continue;
    }

    $orgs[i].setReducer(mainReducer);
  }
*/

  return $orgs;
};
