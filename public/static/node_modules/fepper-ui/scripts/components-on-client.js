((
  uiCreate,
  ReactDOM
) => {
  'use strict';

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      ReactDOM.render(React.createFactory(uiCreate())(), document);
    },
    false
  );

})(
  window.FEPPER_UI.uiCreate,
  window.ReactDOM
);
