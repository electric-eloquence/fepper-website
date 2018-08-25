((d, uiFns) => {
  'use strict';

  const targetOrigin =
    (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host;

  const patternDataStr = d.getElementById('sg-pattern-data-footer').innerHTML;
  let patternData = {};

  try {
    patternData = JSON.parse(patternDataStr);
  }
  catch (e) {
    // Fail gracefully.
  }

  /**
   * Watch the iframe source so that it can be sent back to everyone else.
   *
   * @param {object} event - Event object.
   */
  function receiveIframeMessage(event) {
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

    let path;

    if (data.event === 'patternLab.updatePath') {
      if (patternData.patternPartial) {
        // Handle patterns and the view all page.
        const re = /(patterns|snapshots)\/(.*)$/;
        path = window.location.protocol + '//' + window.location.host + window.location.pathname.replace(re, '') +
          data.path + '?' + Date.now();

        window.location.replace(path);
      }
      else {
        // Handle the style guide.
        path =
          window.location.protocol + '//' + window.location.host +
          window.location.pathname.replace('node_modules\/fepper-ui\/styleguide.html', '') + data.path + '?' +
          Date.now();

        window.location.replace(path);
      }
    }
    else if (data.event === 'patternLab.reload') {
      // Reload the location if there was a message to do so.
      window.location.reload();
    }
  }

  window.addEventListener('message', receiveIframeMessage, false);

  /**
   * Basic postMessage support.
   *
   * Copyright (c) 2013-2016 Dave Olsen, http://dmolsen.com
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
    const options = {event: 'patternLab.pageLoad', path: parts[0]};

    options.patternpartial = patternData.patternPartial || 'all';

    if (patternData.lineage) {
      options.lineage = patternData.lineage;
    }

    parent.postMessage(options, targetOrigin);

    // Find all links and add an click handler for replacing the iframe address so the history works.
    const aTags = d.getElementsByTagName('a');

    for (let i = 0; i < aTags.length; i++) {
      aTags[i].addEventListener(
        'click',
        function (e) {
          const href = this.getAttribute('href');
          const target = this.getAttribute('target');

          if (target !== '_parent' && target !== '_blank') {
            e.preventDefault();

            if (href && href !== '#') {
              window.location.replace(href);
            }
            else {
              return false;
            }
          }
        },
        false
      );
    }
  }

  /**
   * Handle the onpopstate event.
   *
   * @param {object} event - Event object.
   */
  window.onpopstate = function (event) {
    uiFns.urlHandler.skipBack = true;
    uiFns.urlHandler.popPattern(event);
  };

  /**
   * Modal for the Styleguide Layer.
   * For both annotations and code/info.
   *
   * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   */
  const modalStyleguide = {
    active: [],

    /**
     * Initialize the modal window.
     */
    onReady: () => {
      // Go through the panel toggles and add click event.
      const els = d.querySelectorAll('.sg-pattern-extra-toggle');

      for (let i = 0; i < els.length; i++) {
        els[i].addEventListener(
          'click',
          function (e) {
            e.preventDefault();

            const patternPartial = this.getAttribute('data-patternpartial');

            modalStyleguide.toggle(patternPartial);
          },
          false
        );
      }
    },

    /**
     * Toggle the modal window open and closed based on clicking the pip.
     *
     * @param {string} patternPartial - The patternPartial that identifies what needs to be toggled.
     */
    toggle: (patternPartial) => {
      if (!modalStyleguide.active || !modalStyleguide.active[patternPartial]) {
        const el = d.getElementById('sg-pattern-data-' + patternPartial);
        modalStyleguide.collectAndSend(el, true, false);
      }
      else {
        modalStyleguide.highlightsHide();
        modalStyleguide.close(patternPartial);
      }
    },

    /**
     * Open the modal window for a view-all entry.
     *
     * @param {string} patternPartial - The patternPartial that identifies what needs to be opened.
     * @param {string} content - The content that should be inserted.
     */
    open: (patternPartial, content) => {
      // Make sure templateRendered is modified to be an HTML element.
      const div = d.createElement('div');
      div.innerHTML = content;
      const contentEl = d.createElement('div').appendChild(div).querySelector('div');

      // Add click events.
      uiFns.panelsUtil.addClickEvents(contentEl, patternPartial);
      // Make sure the modal viewer and other options are off just in case.
      modalStyleguide.close(patternPartial);
      // Note it's turned on in the viewer.
      modalStyleguide.active[patternPartial] = true;

      // Make sure there's no content.
      const extra = d.getElementById('sg-pattern-extra-' + patternPartial);

      if (extra.childNodes.length > 0) {
        extra.removeChild(extra.childNodes[0]);
      }

      // Add the content.
      extra.appendChild(contentEl);
      // Show the modal.
      d.getElementById('sg-pattern-extra-toggle-' + patternPartial).classList.add('active');
      extra.classList.add('active');
    },

    /**
     * Close the modal window for a view-all entry.
     *
     * @param {string} patternPartial - The patternPartial that identifies what needs to be closed.
     */
    close: (patternPartial) => {
      // Note that the modal viewer is no longer active.
      modalStyleguide.active[patternPartial] = false;

      // Hide the modal. Look at info-panel.js.
      d.getElementById('sg-pattern-extra-toggle-' + patternPartial).classList.remove('active');
      d.getElementById('sg-pattern-extra-' + patternPartial).classList.remove('active');

    },

    /**
     * Get the data that needs to be send to the viewer for rendering.
     *
     * @param {object} el - The identifier for the element that needs to be collected.
     * @param {boolean} iframePassback - If the refresh is of a view-all view and the content should be sent back.
     * @param {boolean} switchText - If the text in the dropdown should be switched.
     */
    collectAndSend: (el, iframePassback, switchText) => {
      let patternData = {};

      try {
        patternData = JSON.parse(el.innerHTML);
      }
      catch (e) {
        // Fail gracefully.
      }

      if (patternData.patternName) {
        const patternMarkupEl = d.querySelector('#' + patternData.patternPartial + ' > .sg-pattern-example');

        if (patternMarkupEl) {
          patternData.patternMarkup = patternMarkupEl.innerHTM;
        }
        else {
          patternData.patternMarkup = d.querySelector('body').innerHTML;
        }

        modalStyleguide.patternQueryInfo(patternData, iframePassback, switchText);
      }
    },

    /**
     * Hide the highlights.
     *
     * @param {string} patternPartial - The patternPartial that identifies what needs to be hidden.
     */
    highlightsHide: (patternPartial) => {
      const patternPartialSelector = patternPartial ? '#' + patternPartial + ' > ' : '';
      const elsToHideFlag = d.querySelectorAll(patternPartialSelector + '.has-annotation');

      for (let i = 0; i < elsToHideFlag.length; i++) {
        elsToHideFlag[i].classList.remove('has-annotation');
      }

      const elsToHideTip = d.querySelectorAll(patternPartialSelector + '.annotation-tip');

      for (let i = 0; i < elsToHideTip.length; i++) {
        elsToHideTip[i].style.display = 'none';
      }
    },

    /**
     * Return the pattern info to the top level.
     *
     * @param {object} patternData - The content that will be sent to the viewer for rendering.
     * @param {boolean} iframePassback - If the refresh is of a view-all view and the content should be sent back.
     * @param {boolean} switchText - If the text in the dropdown should be switched.
     */
    patternQueryInfo: (patternData, iframePassback, switchText) => {
      // Send a message to the pattern.
      try {
        const obj = {
          event: 'patternLab.patternQueryInfo',
          patternData: patternData,
          iframePassback: iframePassback,
          switchText: switchText
        };

        parent.postMessage(obj, targetOrigin);
      }
      catch (e) {
        // Fail gracefully.
      }
    },

    /**
     * Toggle the comment pop-up based on a user clicking on the pattern.
     * Based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
     * This gets attached as event listener, so do not use arrow function notation.
     *
     * @param {object} event - Event object.
     */
    receiveIframeMessage: function (event) {
      // Does the origin sending the message match the current host? If not dev/null the request.
      if (
        window.location.protocol !== 'file:' &&
        event.origin !== window.location.protocol + '//' + window.location.host
      ) {
        return;
      }

      let data = {};

      try {
        data = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data;
      }
      catch (e) {
        // Fail gracefully.
      }

      // See if it got a path to replace.
      if (data.event === 'patternLab.patternQuery') {
        // Find all elements related to pattern info.
        const els = d.querySelectorAll('.sg-pattern-data');
        const iframePassback = (els.length > 1);

        // Send each up to the parent to be read and compiled into panels.
        for (let i = 0; i < els.length; i++) {
          modalStyleguide.collectAndSend(els[i], iframePassback, data.switchText);
        }
      }
      else if (data.event === 'patternLab.patternModalInsert') {
        // Insert the previously rendered content being passed from the iframe.
        modalStyleguide.open(data.patternPartial, data.modalContent);
      }
      else if (data.event === 'patternLab.annotationsHighlightShow') {
        // Go over the supplied annotations.
        for (let i = 0; i < data.annotations.length; i++) {
          const item = data.annotations[i];
          const elsToHighlight = d.querySelectorAll(item.el);

          if (elsToHighlight.length) {
            for (let j = 0; j < elsToHighlight.length; j++) {
              elsToHighlight[j].classList.add('has-annotation');

              const span = d.createElement('span');
              span.innerHTML = item.displayNumber;
              span.classList.add('annotation-tip');

              if (window.getComputedStyle(elsToHighlight[j], null).getPropertyValue('max-height') === '0px') {
                span.style.display = 'none';
              }

              const annotationTip = d.querySelector(item.el + ' > span.annotation-tip');

              if (annotationTip) {
                annotationTip.style.display = 'inline';
              }
              else {
                elsToHighlight[j].insertBefore(span, elsToHighlight[j].firstChild);
              }

              elsToHighlight[j].addEventListener(
                'click',
                ((item_) => {
                  return function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const obj = {
                      event: 'patternLab.annotationNumberClicked',
                      displayNumber: item_.displayNumber
                    };
                    parent.postMessage(obj, targetOrigin);
                  };
                })(item),
                false
              );
            }
          }
        }
      }
      else if (data.event === 'patternLab.annotationsHighlightHide') {
        modalStyleguide.highlightsHide();
      }
      else if (data.event === 'patternLab.patternModalClose') {
        const keys = [];

        for (let k in modalStyleguide.active) {
          if (!modalStyleguide.active.hasOwnPropert(k)) {
            continue;
          }

          keys.push(k);
        }
        for (let i = 0; i < keys.length; i++) {
          const patternPartial = keys[i];

          if (modalStyleguide.active[patternPartial]) {
            modalStyleguide.close(patternPartial);
          }
        }
      }
    }
  };

  // When the document is ready make sure the modal is ready.
  modalStyleguide.onReady();
  window.addEventListener('message', modalStyleguide.receiveIframeMessage, false);
})(document, window.FEPPER_UI.uiFns);
