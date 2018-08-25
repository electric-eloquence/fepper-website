((
  ReactDOM,
  React,
  uiCreate
) => {
  'use strict';

  document.addEventListener(
    'DOMContentLoaded',
    function () {
      ReactDOM.render(React.createFactory(uiCreate())(), document);
    },
    false
  );

})(
  window.ReactDOM,
  window.React,
  window.FEPPER_UI.uiCreate
);
