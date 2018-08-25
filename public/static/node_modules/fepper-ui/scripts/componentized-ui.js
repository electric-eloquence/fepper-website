(() => {
  'use strict';

  const isClient = typeof window === 'object';
  const isServer = typeof global === 'object';

  let React;

  if (isClient) {
    React = window.React;
  }
  else if (isServer) {
    React = require('react');
  }

  function uiCreate(createRenderObj) {
    return class extends React.Component {
      constructor(props) {
        super(props);

        if (isClient) {
          window.uiInst = this;
          window.FEPPER_UI.reRenderFns = [];
        }
        else if (isServer) {
          global.uiInst = this;
        }
      }

      render() {
        if (isClient) {
          return window.componentsForClient();
        }
        else if (isServer) {
          return createRenderObj();
        }
      }

      handleEvent() {
        delete window.componentsForClient;
        const docHeadObj = document.getElementsByTagName('head')[0];
        const dynamicScriptId = 'components-for-client';
        const dynamicScriptOld = document.getElementById(dynamicScriptId);
        const dynamicScriptNew = document.createElement('script');

        dynamicScriptNew.id = dynamicScriptId;
        dynamicScriptNew.innerHTML = dynamicScriptOld.innerHTML;
        docHeadObj.removeChild(dynamicScriptOld);
        docHeadObj.appendChild(dynamicScriptNew);

        while (window.FEPPER_UI.reRenderFns.length) {
          window.FEPPER_UI.reRenderFns.shift()();
        }
      }
    };
  }

  if (isClient) {
    window.FEPPER_UI.uiCreate = uiCreate;
  }
  else if (isServer) {
    module.exports = uiCreate;
  }
})();
