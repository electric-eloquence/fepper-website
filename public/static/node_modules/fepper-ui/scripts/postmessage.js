((d) => {
  'use strict';

  const Mousetrap = window.Mousetrap;

  const targetOrigin =
    (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host;

  // Watch the iframe source so that it can be sent back to everyone else.
  function receiveIframeMessage(event) {
    let data = {};

    try {
      data = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data;
    }
    catch (e) {
      // Fail gracefully.
    }

    let path;

    // Does the origin sending the message match the current host? If not dev/null the request.
    if (
      window.location.protocol !== 'file:' &&
      event.origin !== window.location.protocol + '//' + window.location.host
    ) {
      return;
    }

    // See if it got a path to replace.
    if (data.path) {
      if (window.patternPartial !== '') {
        // Handle patterns and the view all page.
        const re = /patterns\/(.*)$/;
        path =
          window.location.protocol + '//' + window.location.host +
          window.location.pathname.replace(re, '') + data.path + '?' + Date.now();

        window.location.replace(path);
      }
      else {
        // Handle the style guide.
        path =
          window.location.protocol + '//' + window.location.host +
          window.location.pathname.replace('node_modules\/fepper-ui\/styleguide.html', '') +
          data.path + '?' + Date.now();

        window.location.replace(path);
      }
    }
  }

  window.addEventListener('message', receiveIframeMessage, false);

  // If there are clicks on the iframe make sure the nav in the iframe parent closes.
  d.body.addEventListener(
    'click',
    function () {
      parent.postMessage({bodyclick: 'bodyclick'}, targetOrigin);
    },
    false
  );

  /**
   * Basic postMessage support.
   *
   * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   *
   * Handles the postMessage stuff in the pattern, view-all, and style guide templates.
   * Dependent on ui-functions.js so load after DOMContentLoaded.
   */

  // Alert the iframe parent that the pattern has loaded assuming this view was loaded in an iframe.
  if (self !== top) {

    // Handle the options that could be sent to the parent window.
    const path = window.location.toString();
    const parts = path.split('?');
    const options = {path: parts[0]};
    options.patternpartial = window.patternPartial || 'all';
    options.lineage = window.lineage;

    parent.postMessage(options, targetOrigin);

    // Find all links and add a click handler for replacing the iframe address so the history works.
    const aTags = d.getElementsByTagName('a');

    for (let i = 0; i < aTags.length; i++) {
      aTags[i].addEventListener(
        'click',
        function (e) {
          e.preventDefault();

          const href = this.getAttribute('href');

          if (href !== '#') {
            window.location.replace(href);
          }
        },
        false
      );
    }

    // Bind the keyboard shortcuts using ctrl+alt.
    const keysAlt = ['0', 'g', 'h', 'l', 'm', 'r', 'w'];

    for (let i = 0; i < keysAlt.length; i++) {
      Mousetrap.bind(
        'ctrl+alt+' + keysAlt[i],
        ((key) => {
          return function (e) {
            e.preventDefault();

            const obj = {event: 'patternLab.keyPress', keyPress: 'ctrl+alt+' + key};
            parent.postMessage(obj, targetOrigin);

            return false;
          };
        })(keysAlt[i])
      );
    }

    // Bind the keyboard shortcuts using ctrl+shift.
    const keysShift = ['0', 'a', 'c', 'd', 'f', 'l', 'm', 's', 'u', 'w', 'x', 'y'];

    for (let i = 0; i < keysShift.length; i++) {
      Mousetrap.bind(
        'ctrl+shift+' + keysShift[i],
        ((key) => {
          return function (e) {
            e.preventDefault();

            const obj = {event: 'patternLab.keyPress', keyPress: 'ctrl+shift+' + key};
            parent.postMessage(obj, targetOrigin);

            return false;
          };
        })(keysShift[i])
      );
    }

    Mousetrap.bind('esc', function () {
      const obj = {event: 'patternLab.keyPress', keyPress: 'esc'};
      parent.postMessage(obj, targetOrigin);
    });
  }
})(document);
