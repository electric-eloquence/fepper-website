((d, uiProps, uiFns) => {
  'use strict';

  const $document = $(document);
  const $sgCodeContainer = $('#sg-code-container');
  const $sgCodeFill = $('#sg-code-fill');
  const $sgCodeLineage = $('#sg-code-lineage');
  const $sgCodeLineageR = $('#sg-code-lineager');
  const $sgCodeLoader = $('#sg-code-loader');
  const $sgCodePatternstate = $('#sg-code-patternstate');
  const $sgCodeTitleHtml = $('#sg-code-title-html');
  const $sgCodeTitleMustache = $('#sg-code-title-mustache');
  const $sgCodeTitles = $('.sg-code-title');
  const Mousetrap = window.Mousetrap;
  const urlHandler = uiFns.urlHandler;

  /**
   * Code view support for the viewer.
   *
   * Copyright (c) 2013 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   *
   * Not using arrow notation for member functions because some need "this" to refer to response objects.
   */
  const codeViewer = window.codeViewer = {
    // Set up some defaults.
    codeActive: false,
    tabActive: 'e',
    encoded: '',
    mustache: '',
    ids: {e: '#sg-code-title-html', m: '#sg-code-title-mustache'},
    copyOnInit: false,

    // Add the click handler to the code link in the main nav.
    onReady: function () {

      // Add the click handler.
      uiProps.sgTCode.addEventListener(
        'click',
        function (e) {
          e.preventDefault();

          // Remove the class from the 'eye' nav item.
          uiProps.sgTToggle.classList.remove('active');

          // If the code link in the main nav is active close the panel. Otherwise open.
          if ($(this).hasClass('active')) {
            codeViewer.closeCode();
          }
          else {
            codeViewer.openCode();
          }
        },
        false
      );

      // Initialize the code viewer.
      codeViewer.codeContainerInit();

      // Load the query strings in case code view has to show by default.
      const searchParams = uiProps.searchParams;

      if (searchParams.view === 'code' || searchParams.view === 'c') {
        codeViewer.copyOnInit = (searchParams.copy === 'true') ? true : false;
        codeViewer.openCode();
      }
    },

    /**
     * Decide on if the code panel should be open or closed.
     */
    toggleCode: function () {
      if (!codeViewer.codeActive) {
        codeViewer.openCode();
      }
      else {
        codeViewer.closeCode();
      }
    },

    /**
     * After clicking the code view link open the panel.
     */
    openCode: function () {
      // Make sure the annotations overlay is off before showing code view.
      const objCommentToggle = {commentToggle: 'off'};
      window.annotationsViewer.commentsActive = false;

      uiProps.sgTAnnotations.classList.remove('active');
      uiProps.sgViewport.contentWindow.postMessage(objCommentToggle, uiProps.targetOrigin);
      window.annotationsViewer.slideComment(999);

      // Tell the iframe code view has been turned on.
      const objCodeToggle = {codeToggle: 'on'};

      uiProps.sgViewport.contentWindow.postMessage(objCodeToggle, uiProps.targetOrigin);

      // Note it's turned on in the viewer.
      codeViewer.codeActive = true;

      uiProps.sgTCode.classList.add('active');
    },

    /**
     * After clicking the code view link close the panel.
     */
    closeCode: function () {
      const obj = {codeToggle: 'off'};
      codeViewer.codeActive = false;
      uiProps.sgVpWrap.style.paddingBottom = '0';

      uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
      codeViewer.slideCode($sgCodeContainer.outerHeight());
      uiProps.sgTCode.classList.remove('active');
    },

    /**
     * Add the basic mark-up and events for the code container.
     */
    codeContainerInit: function () {
      $sgCodeContainer // Has class sg-view-container.
        .css('bottom', -$document.outerHeight())
        .addClass('anim-ready');

      // Make sure the close button handles the click.
      $('body').delegate('#sg-code-close-btn', 'click', function () {
        codeViewer.closeCode();

        return false;
      });

      // Make sure the click events are handled on the HTML tab.
      $(codeViewer.ids['e']).click(function () {
        codeViewer.swapCode('e');
      });

      // Make sure the click events are handled on the Mustache tab.
      $(codeViewer.ids['m']).click(function () {
        codeViewer.swapCode('m');
      });
    },

    /**
     * Depending on what tab is clicked this swaps out the code container. makes sure prism highlight is added.
     *
     * @param {string} type - Single letter that refers to classes and types.
     */
    swapCode: function (type) {
      if (!codeViewer.codeActive) {
        return;
      }

      let fill = '';
      codeViewer.tabActive = type;

      $sgCodeTitles.removeClass('sg-code-title-active');

      switch (type) {
        case 'e':
          fill = codeViewer.encoded;

          $sgCodeTitleHtml.addClass('sg-code-title-active');

          break;

        case 'm':
          fill = codeViewer.mustache;

          $sgCodeTitleMustache.addClass('sg-code-title-active');

          break;
      }

      $sgCodeFill.removeClass().addClass('language-markup');
      $sgCodeFill.html(fill).text();
      window.Prism.highlightElement($sgCodeFill[0]);
      codeViewer.clearSelection();
    },

    /**
     * Select the code where using cmd+a/ctrl+a.
     */
    selectCode: function () {
      const range = d.createRange();
      const selection = window.getSelection();

      range.selectNodeContents($sgCodeFill[0]);
      selection.removeAllRanges();
      selection.addRange(range);
    },

    /**
     * Clear any selection of code when swapping tabs or opening a new pattern.
     */
    clearSelection: function () {
      if (!codeViewer.codeActive) {
        return;
      }

      if (window.getSelection().empty) {
        window.getSelection().empty();
      }
      else if (window.getSelection().removeAllRanges) {
        window.getSelection().removeAllRanges();
      }
    },

    /**
     * Slides the panel.
     *
     * @param {number} pos - The distance to slide.
     */
    slideCode: function (pos) {
      $sgCodeContainer.css('bottom', -pos);
    },

    /**
     * This runs once the AJAX request for the encoded mark-up is finished.
     * If the encoded tab is the current active tab, it adds the content to the default code container
     */
    saveEncoded: function () {
      let encoded = this.responseText;
      encoded = window.html_beautify(encoded, {indent_size: 2});
      encoded = window.he.encode(encoded);
      codeViewer.encoded = encoded;

      if (codeViewer.tabActive === 'e') {
        codeViewer.activateDefaultTab('e', encoded);
      }
    },

    /**
     * This runs once the AJAX request for the mustache mark-up is finished.
     * If the mustache tab is the current active tab, it adds the content to the default code container.
     */
    saveMustache: function () {
      let encoded = this.responseText;
      encoded = window.he.encode(encoded);
      codeViewer.mustache = encoded;

      if (codeViewer.tabActive === 'm') {
        codeViewer.activateDefaultTab('m', this.responseText);
      }
    },

    /**
     * When loading the code view make sure the active tab is highlighted and filled in appropriately.
     *
     * @param {string} type - Single letter that refers to classes and types.
     * @param {string} code - Code to appear in code view.
     */
    activateDefaultTab: function (type, code) {
      $sgCodeTitles.removeClass('sg-code-title-active');

      switch (type) {
        case 'e':
          $sgCodeTitleHtml.addClass('sg-code-title-active');

          break;

        case 'm':
          $sgCodeTitleMustache.addClass('sg-code-title-active');

          break;
      }

      $sgCodeFill.removeClass().addClass('language-markup');
      $sgCodeFill.html(code).text();
      window.Prism.highlightElement($sgCodeFill[0]);

      if (codeViewer.copyOnInit) {
        codeViewer.selectCode();
        codeViewer.copyOnInit = false;
      }
    },

    /**
     * When turning on or switching between patterns with code view on make sure we get the code from from the pattern
     * via post message.
     *
     * @param {array} lineage - Lineage array.
     * @param {array} lineageR - Reverse lineage array.
     * @param {string} patternPartial - The name of the pattern.
     * @param {string} patternState - "inprogress", "inreview", or "complete"
     */
    updateCode: function (lineage, lineageR, patternPartial, patternState) {

      // Clear any selections that might have been made.
      codeViewer.clearSelection();

      // Draw lineage.
      if (lineage.length) {
        let lineageList = '';

        for (let i = 0; i < lineage.length; i++) {
          let cssClass = '';

          if (lineage[i].lineageState) {
            cssClass = 'sg-pattern-state ' + lineage[i].lineageState;
          }

          lineageList += (i === 0) ? '' : ', ';
          lineageList += '<a href="' + lineage[i].lineagePath + '" class="' + cssClass + '" data-patternPartial="';
          lineageList += lineage[i].lineagePattern + '">' + lineage[i].lineagePattern + '</a>';
        }

        $sgCodeLineage.css('display', 'block');
        $('#sg-code-lineage-fill').html(lineageList);
      }
      else {
        $sgCodeLineage.css('display', 'none');
      }

      // Draw reverse lineage.
      if (lineageR.length) {
        let lineageRList = '';

        for (let i = 0; i < lineageR.length; i++) {
          let cssClass = '';

          if (lineageR[i].lineageState) {
            cssClass = 'sg-pattern-state ' + lineageR[i].lineageState;
          }

          lineageRList += (i === 0) ? '' : ', ';
          lineageRList += '<a href="' + lineageR[i].lineagePath + '" class="' + cssClass + '" data-patternPartial="';
          lineageRList += lineageR[i].lineagePattern + '">' + lineageR[i].lineagePattern + '</a>';
        }

        $sgCodeLineageR.css('display', 'block');
        $('#sg-code-lineager-fill').html(lineageRList);
      }
      else {
        $sgCodeLineageR.css('display', 'none');
      }

      // When clicking on a lineage item change the iframe source.
      $('#sg-code-lineage-fill a, #sg-code-lineager-fill a').click(function (e) {
        e.preventDefault();

        const obj = {path: urlHandler.getFilename($(this).attr('data-patternpartial'))};

        uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
        $sgCodeLoader.css('display', 'block');
      });

      // Show pattern state.
      if (patternState) {
        const patternStateItem = '<span class=\'sg-pattern-state ' + patternState + '\'>' + patternState + '</span>';

        $('#sg-code-patternstate-fill').html(patternStateItem);
        $sgCodePatternstate.css('display', 'block');
      }
      else {
        $sgCodePatternstate.css('display', 'none');
      }

      // Fill in the name of the pattern.
      $('#sg-code-lineage-patternname, #sg-code-lineager-patternname, #sg-code-patternstate-patternname')
        .html(patternPartial);

      // Get the file name of the pattern so we can get the various editions of the code that can show in code view.
      const filename = urlHandler.getFilename(patternPartial);
      const patternExtension = window.config.patternExtension || '.mustache';

      // Request the encoded markup version of the pattern.
      const e = new XMLHttpRequest();
      e.onload = codeViewer.saveEncoded;
      e.open('GET', filename.replace(/\.html/, '.markup-only.html') + '?' + (new Date()).getTime(), true);
      e.send();

      // Request the mustache markup version of the pattern.
      const m = new XMLHttpRequest();
      m.onload = codeViewer.saveMustache;
      m.open('GET', filename.replace(/\.html/, patternExtension) + '?' + (new Date()).getTime(), true);
      m.send();

      // Move the code into view.
      codeViewer.slideCode(0);

      // Add padding to bottom of viewport wrapper so pattern foot can be viewed.
      // Delay it so it gets added after animation completes.
      window.setTimeout(() => {
        uiProps.sgVpWrap.style.paddingBottom = $sgCodeContainer.outerHeight() + 'px';
      }, 300);

      $sgCodeLoader.css('display', 'none');
    },

    /**
     * Toggle the comment pop-up based on a user clicking on the pattern.
     * Based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
     * This gets attached as event listener, so do not use arrow function notation.
     *
     * @param {object} event - Event object.
     */
    receiveIframeMessage: function (event) {
      const data = uiFns.receiveIframeMessageBoilerplate(event);

      if (!data) {
        return;
      }

      if (data.codeOverlay === 'on') {
        codeViewer.updateCode(data.lineage, data.lineageR, data.patternPartial, data.patternState);
      }

      switch (data.event) {
        case 'patternLab.keyPress':
          switch (data.keyPress) {
            case 'ctrl+shift+c':
              codeViewer.toggleCode();

              break;

            case 'ctrl+alt+m':
            case 'ctrl+shift+u':
              codeViewer.swapCode('m');

              break;

            case 'ctrl+alt+h':
            case 'ctrl+shift+y':
              codeViewer.swapCode('e');

              break;

            case 'mod+a':
              codeViewer.selectCode();

              break;

            case 'esc':
              if (codeViewer.codeActive) {
                codeViewer.closeCode();
              }

              break;
          }

          break;
      }
    }
  };

  window.addEventListener('message', codeViewer.receiveIframeMessage, false);

  // When the document is ready, make the codeViewer ready.
  $document.ready(function () {

    // Make sure if a new pattern or view-all is loaded that comments are turned on as appropriate.
    uiProps.sgViewport.addEventListener(
      'load',
      function () {
        if (codeViewer.codeActive) {
          const obj = {codeToggle: 'on'};
          uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
        }
      },
      false
    );

    // On window resize, adjust the distance with which to hide the panel.
    $(window).resize(function () {
      const bottomDist = parseInt($sgCodeContainer.css('bottom'), 10);

      if (Number.isNaN(bottomDist) || bottomDist === 0) {
        return;
      }

      codeViewer.slideCode($sgCodeContainer.outerHeight());
    });

    // Toggle the code panel.
    Mousetrap.bind('ctrl+shift+c', function (e) {
      e.preventDefault();
      codeViewer.toggleCode();

      return false;
    });

    // When the code panel is open hijack, cmd+a/ctrl+a so that it only selects the code view.
    Mousetrap.bind('mod+a', function (e) {
      if (codeViewer.codeActive) {
        e.preventDefault();
        codeViewer.selectCode();

        return false;
      }
    });

    // Open the mustache panel.
    // ctrl+shift+u is a Pattern Lab convention.
    Mousetrap.bind(['ctrl+alt+m', 'ctrl+shift+u'], function (e) {
      e.preventDefault();

      codeViewer.swapCode('m');

      return false;
    });

    // Open the html panel.
    // ctrl+shift+y is a Pattern Lab convention.
    Mousetrap.bind(['ctrl+alt+h', 'ctrl+shift+y'], function (e) {
      e.preventDefault();

      codeViewer.swapCode('e');

      return false;
    });

    codeViewer.onReady();
  });
})(document, window.FEPPER_UI.uiProps, window.FEPPER_UI.uiFns);
