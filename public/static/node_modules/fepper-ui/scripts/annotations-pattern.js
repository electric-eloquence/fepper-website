((d) => {
  'use strict';

  const comments = window.comments;
  const Mousetrap = window.Mousetrap;
  const sgPatterns = d.getElementById('sg-patterns');
  const targetOrigin =
    (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host;

  /**
   * Annotations support for patterns.
   *
   * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   */
  const annotationsPattern = {
    commentsOverlayActive: false,
    commentsOverlay: false,
    commentsEmbeddedActive: false,
    commentsEmbedded: false,
    commentsGathered: {commentOverlay: 'on', comments: {}},
    trackedElements: [],

    /**
     * Record which annotations are related to this pattern so they can be sent to the viewer when called.
     */
    gatherComments: () => {
      // Make sure this only added when we're on a pattern specific view.
      if (!sgPatterns) {
        let count = 0;

        for (let comment in comments) {
          if (!comments.hasOwnProperty(comment)) {
            continue;
          }

          const item = comments[comment];
          const els = d.querySelectorAll(item.el);

          if (els.length) {
            count++;
            item.displaynumber = count;

            for (let i = 0; i < els.length; i++) {
              els[i].addEventListener(
                'click',
                ((item_) => {
                  return function (e) {
                    if (annotationsPattern.commentsOverlayActive) {
                      e.preventDefault();
                      e.stopPropagation();

                      // if an element was clicked on while the overlay was already on swap it
                      const obj = {
                        displaynumber: item_.displaynumber,
                        el: item_.el,
                        title: item_.title,
                        comment: item_.comment
                      };

                      parent.postMessage(obj, targetOrigin);
                    }
                  };
                })(item),
                false
              );
            }
          }
        }
      }
      else {
        const obj = {commentOverlay: 'off'};

        parent.postMessage(obj, targetOrigin);
      }
    },

    /**
     * Embed a comment by building the sg-annotations div (if necessary) and building an sg-annotation div.
     *
     * @param {object} el - Element to check the parent node of.
     * @param {string} title - The title of the comment.
     * @param {string} comment - The comment HTML.
     */
    embedComments: (el, title, comment) => {
      // Build the annotation div and add the content to it.
      const annotationDiv = d.createElement('div');
      const h3 = d.createElement('h3');
      const p = d.createElement('p');
      h3.innerHTML = title;
      p.innerHTML = comment;

      annotationDiv.appendChild(h3);
      annotationDiv.appendChild(p);
      annotationDiv.classList.add('sg-annotation');

      // Find the parent element to attach things to.
      const parentEl = annotationsPattern.findParent(el);
      // See if a child with the class annotations exists.
      const els = parentEl.getElementsByClassName('sg-annotations');

      if (els.length) {
        els[0].appendChild(annotationDiv);
      }
      else {
        const annotationsDiv = d.createElement('div');

        annotationsDiv.appendChild(annotationDiv);
        annotationsDiv.classList.add('sg-annotations');
        parentEl.appendChild(annotationsDiv);
      }
    },

    /**
     * Recursively find the parent of an element to see if it contains the sg-pattern class.
     *
     * @param {object} el - Element to check the parent node of.
     * @return {object} Parent element.
     */
    findParent: (el) => {
      if (el.classList.contains('sg-pattern')) {
        return el;
      }
      else if (el.parentNode.classList.contains('sg-pattern')) {
        return el.parentNode;
      }
      else {
        return annotationsPattern.findParent(el.parentNode);
      }
    },

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

      if (data.resize && annotationsPattern.commentsOverlayActive) {
        for (let i = 0; i < annotationsPattern.trackedElements.length; i++) {
          const el = annotationsPattern.trackedElements[i];

          if (window.getComputedStyle(el.element, null).getPropertyValue('max-height') === '0px') {
            el.element.firstChild.style.display = 'none';
            const obj = {annotationState: false, displayNumber: el.displayNumber};

            parent.postMessage(obj, targetOrigin);
          }
          else {
            el.element.firstChild.style.display = 'block';
            const obj = {annotationState: true, displayNumber: el.displayNumber};

            parent.postMessage(obj, targetOrigin);
          }
        }

      }
      else if (data.commentToggle) {
        const sgAnnotations = d.getElementsByClassName('sg-annotations');

        // If this is an overlay, make sure it's active for the click event.
        annotationsPattern.commentsOverlayActive = false;
        annotationsPattern.commentsEmbeddedActive = false;

        // See which flag to toggle based on if this is a styleguide or view-all page.
        if (data.commentToggle === 'on') {
          if (sgPatterns) {
            annotationsPattern.commentsEmbeddedActive = true;
          }
          else if (data.commentToggle === 'on') {
            annotationsPattern.commentsOverlayActive = true;
          }
        }

        // If comments overlay is turned off, make sure to remove the has-annotation class and pointer.
        if (!annotationsPattern.commentsOverlayActive) {
          const elsToHideFlag = d.querySelectorAll('.has-annotation');

          for (let i = 0; i < elsToHideFlag.length; i++) {
            elsToHideFlag[i].classList.remove('has-annotation');
          }

          const elsToHideTip = d.querySelectorAll('.annotation-tip');

          for (let i = 0; i < elsToHideTip.length; i++) {
            elsToHideTip[i].style.display = 'none';
          }
        }

        // If comments embedding is turned off, make sure to hide the annotations div.
        if (!annotationsPattern.commentsEmbeddedActive) {
          for (let i = 0; i < sgAnnotations.length; i++) {
            sgAnnotations[i].style.display = 'none';
          }
        }

        // If comments overlay is turned on, add the has-annotation class and pointer.
        if (annotationsPattern.commentsOverlayActive) {
          let count = 0;

          for (let i = 0; i < comments.length; i++) {
            const item = comments[i];
            const els = d.querySelectorAll(item.el);
            let state = true;

            if (els.length) {
              count++;

              // Loop through all items with annotations.
              for (let k = 0; k < els.length; k++) {
                const span = d.createElement('span');
                span.innerHTML = count;

                span.classList.add('annotation-tip');

                if (window.getComputedStyle(els[k], null).getPropertyValue('max-height') === '0px') {
                  span.style.display = 'none';
                  state = false;
                }

                annotationsPattern.trackedElements.push({
                  itemel: item.el,
                  element: els[k],
                  displayNumber: count,
                  state: state
                });

                els[k].classList.add('has-annotation');
                els[k].insertBefore(span, els[k].firstChild);
              }
            }
          }

          // Count elements so it can be used when displaying the results in the viewer.
          count = 0;

          // Iterate over the comments in annotations.js.
          for (let i = 0; i < comments.length; i++) {
            const item = comments[i];
            const els = d.querySelectorAll(item.el);
            let state = true;

            // If an element is found in the given pattern, add it to the overall object so it can be passed when
            // the overlay is turned on.
            if (els.length) {
              for (let k = 0; k < els.length; k++) {
                if (window.getComputedStyle(els[k], null).getPropertyValue('max-height') === '0px') {
                  state = false;
                }
              }

              count++;
              annotationsPattern.commentsGathered.comments[count] = {
                el: item.el,
                title: item.title,
                comment: item.comment,
                number: count,
                state: state
              };
            }
          }

          // Send the list of annotations for the page back to the parent.
          parent.postMessage(annotationsPattern.commentsGathered, targetOrigin);
        }
        // If comment embedding is turned on and comments haven't been embedded yet, do it.
        else if (annotationsPattern.commentsEmbeddedActive && !annotationsPattern.commentsEmbedded) {
          for (let i = 0; i < comments.length; i++) {
            const item = comments[i];
            const els = d.querySelectorAll(item.el);

            // Embed the comment.
            if (els.length) {
              annotationsPattern.embedComments(els[0], item.title, item.comment);
            }

            annotationsPattern.commentsEmbedded = true;
          }
        }
        // If comment embedding is turned on and comments have been embedded, simply display them.
        else if (annotationsPattern.commentsEmbeddedActive && annotationsPattern.commentsEmbedded) {
          for (let i = 0; i < sgAnnotations.length; ++i) {
            sgAnnotations[i].style.display = 'block';
          }
        }
      }
    }
  };

  // Add the click handlers to the elements that have an annotations.
  annotationsPattern.gatherComments();
  window.addEventListener('message', annotationsPattern.receiveIframeMessage, false);

  // Before unloading the iframe make sure any active overlay is turned off/closed.
  window.onbeforeunload = function () {
    const obj = {commentOverlay: 'off'};

    parent.postMessage(obj, targetOrigin);
  };

  // Tell the parent iframe that keys were pressed.

  // Toggle the annotations panel.
  Mousetrap.bind('ctrl+shift+a', function (e) {
    e.preventDefault();

    const obj = {event: 'patternLab.keyPress', keyPress: 'ctrl+shift+a'};

    parent.postMessage(obj, targetOrigin);

    return false;
  });

  // Close the annotations panel if using escape.
  Mousetrap.bind('esc', function () {
    const obj = {event: 'patternLab.keyPress', keyPress: 'esc'};

    parent.postMessage(obj, targetOrigin);
  });
})(document);
