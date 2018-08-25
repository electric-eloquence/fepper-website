((d) => {
  'use strict';

  const Mousetrap = window.Mousetrap;
  const targetOrigin =
    (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host;

  /**
   * Code view support for patterns.
   *
   * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   */
  const codePattern = {
    codeActive: false,
    codeOverlayActive: false,
    codeEmbeddedActive: false,

    /**
     * Toggle the annotation feature on/off.
     * Based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
     * This gets attached as event listener, so do not use arrow function notation.
     *
     * @param {object} event - Event object.
     */
    receiveIframeMessage: function (event) {
      let data = {};

      try {
        data = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data;
      }
      catch (e) {
        // Fail gracefully.
      }

      // Does the origin sending the message match the current host? If not dev/null the request.
      if (
        window.location.protocol !== 'file:' &&
        event.origin !== window.location.protocol + '//' + window.location.host
      ) {
        return;
      }

      if (data.codeToggle) {
        const els = d.getElementsByClassName('sg-code');
        const sgPatterns = d.getElementById('sg-patterns');

        // if this is an overlay make sure it's active for the click event
        codePattern.codeOverlayActive = false;
        codePattern.codeEmbeddedActive = false;

        // see which flag to toggle based on if this is a styleguide or view-all page
        if (data.codeToggle === 'on') {
          codePattern.codeActive = true;
          if (sgPatterns) {
            codePattern.codeEmbeddedActive = true;
          }
          else {
            codePattern.codeOverlayActive = true;
          }
        }
        else {
          codePattern.codeActive = false;
        }

        // If comments embedding is turned off, make sure to hide the annotations div.
        if (!codePattern.codeEmbeddedActive && sgPatterns) {
          for (let i = 0; i < els.length; i++) {
            els[i].style.display = 'none';
          }
        }

        // If comments overlay is turned on, add the has-comment class and pointer.
        if (codePattern.codeOverlayActive) {
          const obj = {
            codeOverlay: 'on',
            lineage: window.lineage,
            lineageR: window.lineageR,
            patternPartial: window.patternPartial,
            patternState: window.patternState
          };

          parent.postMessage(obj, targetOrigin);
        }
        // If code embedding is turned on, simply display them.
        else if (codePattern.codeEmbeddedActive) {
          for (let i = 0; i < els.length; i++) {
            els[i].style.display = 'block';
          }
        }
      }
    }
  };

  // Add the click handlers to the elements that have an annotations.
  window.addEventListener('message', codePattern.receiveIframeMessage, false);

  // Before unloading the iframe, make sure any active overlay is turned off/closed.
  window.onbeforeunload = function () {
    const obj = {codeOverlay: 'off'};

    parent.postMessage(obj, targetOrigin);
  };

  // Tell the parent iframe that keys were pressed.

  // Toggle the code panel.
  Mousetrap.bind('ctrl+shift+c', function (e) {
    e.preventDefault();

    const obj = {event: 'patternLab.keyPress', keyPress: 'ctrl+shift+c'};

    parent.postMessage(obj, targetOrigin);

    return false;
  });

  // Open the mustache panel.
  Mousetrap.bind('ctrl+alt+m', function (e) {
    e.preventDefault();

    const obj = {event: 'patternLab.keyPress', keyPress: 'ctrl+alt+m'};

    parent.postMessage(obj, targetOrigin);

    return false;
  });

  Mousetrap.bind('ctrl+shift+u', function (e) {
    e.preventDefault();

    const obj = {event: 'patternLab.keyPress', keyPress: 'ctrl+shift+u'};

    parent.postMessage(obj, targetOrigin);

    return false;
  });

  // Open the html panel.
  Mousetrap.bind('ctrl+alt+h', function (e) {
    e.preventDefault();

    const obj = {event: 'patternLab.keyPress', keyPress: 'ctrl+alt+h'};

    parent.postMessage(obj, targetOrigin);

    return false;
  });

  Mousetrap.bind('ctrl+shift+y', function (e) {
    e.preventDefault();

    const obj = {event: 'patternLab.keyPress', keyPress: 'ctrl+shift+y'};

    parent.postMessage(obj, targetOrigin);

    return false;
  });

  // When the code panel is open, hijack cmd+a/ctrl+a so that it only selects the code view.
  Mousetrap.bind('mod+a', function (e) {
    if (codePattern.codeActive) {
      e.preventDefault();

      const obj = {event: 'patternLab.keyPress', keyPress: 'mod+a'};

      parent.postMessage(obj, targetOrigin);

      return false;
    }
  });

  // Close the code panel if using escape.
  Mousetrap.bind('esc', function () {
    const obj = {event: 'patternLab.keyPress', keyPress: 'esc'};

    parent.postMessage(obj, targetOrigin);
  });
})(document);
