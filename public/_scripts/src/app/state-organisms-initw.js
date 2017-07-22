'use strict';

const $orgs = {
  'logoBackground': $('#logoBackground')
};

export default function (mainReducer) {
  for (let i in $orgs) {
    if (!$orgs.hasOwnProperty(i)) {
      continue;
    }

    $orgs[i].setReducer(mainReducer);
  }

  return $orgs;
};
