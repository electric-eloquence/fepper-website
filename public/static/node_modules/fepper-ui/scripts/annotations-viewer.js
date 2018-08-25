/**
 * Annotations Support for the Viewer - v0.3
 *
 * Copyright (c) 2013 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license.
 */
((d, uiProps, uiFns) => {
  'use strict';

  const $document = $(document);
  const $sgAnnotationContainer = $('#sg-annotation-container');
  const Mousetrap = window.Mousetrap;

  const annotationsViewer = window.annotationsViewer = {
    // Set-up default sections.
    commentsActive: false,
    commentsViewAllActive: false,
    moveToOnInit: 0,

    // Add the onclick handler to the annotations link in the main nav.
    onReady: () => {
      $(window).resize(function () {
        if (!annotationsViewer.commentsActive) {
          annotationsViewer.slideComment($sgAnnotationContainer.outerHeight());
        }
      });

      uiProps.sgTAnnotations.addEventListener(
        'click',
        function (e) {
          e.preventDefault();

          // Remove the class from the "eye" nav item.
          uiProps.sgTToggle.classList.remove('active');

          // Turn the annotations section on and off.
          annotationsViewer.toggleComments();
        },
        false
      );

      // Initialize the annotations viewer.
      annotationsViewer.commentContainerInit();

      // Load the query strings in case code view has to show by default.
      const searchParams = uiProps.searchParams;

      if (searchParams.view && (searchParams.view === 'annotations' || searchParams.view === 'a')) {
        annotationsViewer.openComments();

        if (typeof searchParams.number !== 'undefined') {
          annotationsViewer.moveToOnInit = searchParams.number;
        }
      }
    },

    /**
     * Decide on if the annotations panel should be open or closed.
     */
    toggleComments: () => {
      if (!annotationsViewer.commentsActive) {
        annotationsViewer.openComments();
      }
      else {
        annotationsViewer.closeComments();
      }
    },

    /**
     * Open the annotations panel.
     */
    openComments: () => {
      // Make sure the code view overlay is off before showing the annotations view.
      const codeToggle = {codeToggle: 'off'};
      const codeViewer = window.codeViewer;
      codeViewer.codeActive = false;

      uiProps.sgTCode.classList.remove('active');
      uiProps.sgViewport.contentWindow.postMessage(codeToggle, uiProps.targetOrigin);
      codeViewer.slideCode(999);

      // Tell the iframe annotation view has been turned on.
      const commentToggle = {commentToggle: 'on'};

      uiProps.sgViewport.contentWindow.postMessage(commentToggle, uiProps.targetOrigin);

      // Note that it's turned on in the viewer.
      annotationsViewer.commentsActive = true;

      uiProps.sgTAnnotations.classList.add('active');
    },

    /**
     * Close the annotations panel.
     */
    closeComments: () => {
      const commentToggle = {commentToggle: 'off'};
      annotationsViewer.commentsActive = false;
      uiProps.sgVpWrap.style.paddingBottom = '0';

      uiProps.sgViewport.contentWindow.postMessage(commentToggle, uiProps.targetOrigin);
      annotationsViewer.slideComment($sgAnnotationContainer.outerHeight());
      uiProps.sgTAnnotations.classList.remove('active');
    },

    /**
     * Add the basic mark-up and events for the annotations container.
     */
    commentContainerInit: () => {
      $sgAnnotationContainer // Has class sg-view-container.
        .css('bottom', -$document.outerHeight())
        .addClass('anim-ready');

      // Make sure the close button handles the click.
      $('body').delegate('#sg-annotation-close-btn', 'click', function () {
        const commentToggle = {commentToggle: 'off'};
        annotationsViewer.commentsActive = false;
        uiProps.sgVpWrap.style.paddingBottom = '0';

        annotationsViewer.slideComment($sgAnnotationContainer.outerHeight());
        uiProps.sgTAnnotations.classList.remove('active');
        uiProps.sgViewport.contentWindow.postMessage(commentToggle, uiProps.targetOrigin);

        return false;
      });
    },

    /**
     * Slides the panel.
     *
     * @param {number} pos - Annotation container position from bottom.
     */
    slideComment: (pos) => {
      $sgAnnotationContainer.css('bottom', -pos);
    },

    /**
     * Moves to a particular item in the viewer.
     *
     * @param {number} number - Annotation element identifier.
     */
    moveTo: (number) => {
      const annotationEl = d.getElementById('annotation-' + number);

      if (annotationEl) {
        const top = annotationEl.offsetTop;

        $sgAnnotationContainer.animate({scrollTop: top - 10}, 600);
      }
    },

    /**
     * When turning on or switching between patterns with annotations view on make sure we get the annotations from the
     * pattern via post message.
     *
     * @param {object} comments - Comments object.
     */
    updateComments: (comments) => {
      const commentsContainer = d.getElementById('sg-comments-container');

      // Clear out the comments container.
      if (commentsContainer.innerHTML !== '') {
        commentsContainer.innerHTML = '';
      }

      // See how many comments this pattern might have.
      // If more than zero, write them out.
      // If not, alert the user to the fact there aren't any.
      const count = Object.keys(comments).length;

      if (count) {
        for (let i = 1; i <= count; i++) {
          const displayNum = comments[i].number;
          const span = d.createElement('span');
          span.id = 'annotation-state-' + displayNum;
          span.style.fontSize = '0.8em';
          span.style.color = '#666';

          if (comments[i].state === false) {
            span.innerHTML = ' hidden';
          }

          const h2 = d.createElement('h2');
          h2.innerHTML = displayNum + '. ' + comments[i].title;
          h2.appendChild(span);

          const div = d.createElement('div');
          div.innerHTML = comments[i].comment;

          const commentDiv = d.createElement('div');
          commentDiv.id = 'annotation-' + displayNum;
          commentDiv.appendChild(h2);
          commentDiv.appendChild(div);
          commentDiv.classList.add('sg-comment-container');

          commentsContainer.appendChild(commentDiv);
        }
      }
      else {
        const h2 = d.createElement('h2');
        h2.innerHTML = 'No Annotations';

        const div = d.createElement('div');
        div.innerHTML = 'There are no annotations for this pattern.';

        const commentDiv = d.createElement('div');
        commentDiv.appendChild(h2);
        commentDiv.appendChild(div);
        commentDiv.classList.add('sg-comment-container');

        commentsContainer.appendChild(commentDiv);
      }

      // Slide the comment section into view.
      annotationsViewer.slideComment(0);

      // Add padding to bottom of viewport wrapper so pattern foot can be viewed delay it so it gets added after
      // animation completes.
      window.setTimeout(() => {
        uiProps.sgVpWrap.style.paddingBottom = $sgAnnotationContainer.outerHeight() + 'px';
      }, 300);

      if (annotationsViewer.moveToOnInit !== '0') {
        annotationsViewer.moveToOnInit = '0';

        annotationsViewer.moveTo(annotationsViewer.moveToOnInit);
      }
    },

    /**
     * Toggle the comment pop-up based on a user clicking on the pattern.
     * Based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
     * This gets attached as event listener, so do not use arrow function notation.
     *
     * @param {object} event - Event info.
     */
    receiveIframeMessage: function (event) {
      const data = uiFns.receiveIframeMessageBoilerplate(event);

      if (!data) {
        return;
      }

      if (data.commentOverlay) {
        if (data.commentOverlay === 'on') {
          annotationsViewer.updateComments(data.comments);
        }
        else {
          annotationsViewer.slideComment($sgAnnotationContainer.outerHeight());
        }
      }
      else if (data.annotationState) {
        const annotationStateId = 'annotation-state-' + data.displayNumber;
        d.getElementById(annotationStateId).innerHTML = data.annotationState ? '' : ' hidden';
      }
      else if (typeof data.displaynumber !== 'undefined') {
        annotationsViewer.moveTo(data.displaynumber);
      }
      else if (data.patternpartial) {
        if (annotationsViewer.commentsViewAllActive && data.patternpartial.indexOf('viewall-') !== -1) {
          const commentToggle = {commentToggle: 'on'};

          uiProps.sgViewport.contentWindow.postMessage(commentToggle, uiProps.targetOrigin);
        }
      }

      switch (data.event) {
        case 'patternLab.keyPress':
          switch (data.keyPress) {
            case 'ctrl+shift+a':
              annotationsViewer.toggleComments();

              break;

            case 'esc':
              if (annotationsViewer.commentsActive) {
                annotationsViewer.closeComments();
              }

              break;
          }

          break;
      }
    }
  };

  window.addEventListener('message', annotationsViewer.receiveIframeMessage, false);

  $document.ready(function () {
    // Make sure if a new pattern or view-all is loaded that comments are turned on as appropriate.
    uiProps.sgViewport.addEventListener(
      'load',
      function () {
        if (annotationsViewer.commentsActive) {
          const commentToggle = {commentToggle: 'on'};

          uiProps.sgViewport.contentWindow.postMessage(commentToggle, uiProps.targetOrigin);
        }
      },
      false
    );

    // On window resize, adjust the distance with which to hide the panel.
    $(window).resize(function () {
      const bottomDist = parseInt($sgAnnotationContainer.css('bottom'), 10);

      if (Number.isNaN(bottomDist) || bottomDist === 0) {
        return;
      }

      annotationsViewer.slideComment($sgAnnotationContainer.outerHeight());
    });

    $('#sg-view li a').click(function () {
      const $thisParentParent = $(this).parent().parent();

      $thisParentParent.removeClass('active');
      $thisParentParent.parent().parent().removeClass('active');
    });

    // Toggle the annotations panel.
    Mousetrap.bind('ctrl+shift+a', function (e) {
      e.preventDefault();
      annotationsViewer.toggleComments();

      return false;
    });

    annotationsViewer.onReady();
  });
})(document, window.FEPPER_UI.uiProps, window.FEPPER_UI.uiFns);
