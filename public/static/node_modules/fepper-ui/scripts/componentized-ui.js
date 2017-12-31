var React;
var isClient = typeof window === 'object';
var isServer = typeof global === 'object';

if (isClient) {
  React = window.React;
}
else if (isServer) {
  React = require('react');
}

var uiCreate = function (createRenderObj) {
  return React.createClass({

    getInitialState: function () {
      if (isClient) {
        window.uiInst = this;
        window.FEPPER_UI.reRenderFns = [];
      }
      else if (isServer) {
        global.uiInst = this;
      }
      return {};
    },

    render: function () {
      if (isClient) {
        return window.componentsForClient();
      }
      else if (isServer) {
        return createRenderObj();
      }
    },

    handleEvent: function () {
      delete window.componentsForClient;
      var docHeadObj = document.getElementsByTagName('head')[0];
      var dynamicScriptId = 'components-for-client';
      var dynamicScriptOld = document.getElementById(dynamicScriptId);
      var dynamicScriptNew = document.createElement('script');

      dynamicScriptNew.id = dynamicScriptId;
      dynamicScriptNew.innerHTML = dynamicScriptOld.innerHTML;
      docHeadObj.removeChild(dynamicScriptOld);
      docHeadObj.appendChild(dynamicScriptNew);

      while (window.FEPPER_UI.reRenderFns.length) {
        window.FEPPER_UI.reRenderFns.shift()();
      }
    }
  });
};

if (isClient) {
  window.FEPPER_UI.uiCreate = uiCreate;
}
else if (isServer) {
  module.exports = uiCreate;
}
