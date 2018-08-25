((d, uiProps, uiFns) => {
  'use strict';

  const config = window.config;
  const Hogan = window.Hogan;
  const Mousetrap = window.Mousetrap;
  const Prism = window.Prism;

  const $window = $(window);
  const $document = $(document);

  const panelsUtil = uiFns.panelsUtil;
  const sizeiframe = uiFns.sizeiframe;
  const startDisco = uiFns.startDisco;
  const startGrow = uiFns.startGrow;
  const stopDisco = uiFns.stopDisco;
  const stopGrow = uiFns.stopGrow;
  const urlHandler = uiFns.urlHandler;

  const warnCtrlShiftLEdge = '"ctrl+shift+l" is unpredictable on Microsoft Edge.\nTry "ctrl+alt+l" instead.';

  let bpObj;

  function goResize(abbrev) {
    const $sgSizeButton = $(`#sg-size-${abbrev}`);

    stopDisco();
    stopGrow();
    sizeiframe(bpObj[abbrev]);

    if ($sgSizeButton) {
      $sgSizeButton.focus();
    }
  }

  // Handle extra extra small button.
  function goXXSmall() {
    goResize('xx');
  }

  // Handle extra small button.
  function goXSmall() {
    goResize('xs');
  }

  // Handle small button.
  function goSmall() {
    goResize('sm');
  }

  // Handle medium button.
  function goMedium() {
    goResize('md');
  }

  // Handle large button.
  function goLarge() {
    goResize('lg');
  }

  /**
   * Data Saver.
   *
   * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   */
  class DataSaver {

    /**
     * @param {string} cookieName - The name of the cookie to store the data in.
     */
    constructor(cookieName) {
      this.cookieName = cookieName;
    }

    /**
     * Add a given value to the cookie.
     *
     * @param {string} name - The name of the key.
     * @param {string} val - The value.
     */
    addValue(name, val) {
      const cookieValOrig = $.cookie(this.cookieName);
      let cookieValNew = name + '~' + val;

      if (cookieValOrig) {
        cookieValNew = cookieValOrig + '|' + cookieValNew;
      }

      $.cookie(this.cookieName, cookieValNew);
    }

    /**
     * Update a value found in the cookie. If the key doesn't exist add the value.
     *
     * @param {string} name - The name of the key.
     * @param {string} val - The value.
     */
    updateValue(name, val) {
      if (this.findValue(name)) {
        const cookieVals = $.cookie(this.cookieName).split('|');
        let cookieValNew = '';

        for (let i = 0; i < cookieVals.length; i++) {
          const fieldVals = cookieVals[i].split('~');

          if (fieldVals[0] === name) {
            fieldVals[1] = val;
          }

          if (i) {
            cookieValNew += '|';
          }

          cookieValNew += fieldVals[0] + '~' + fieldVals[1];
        }

        $.cookie(this.cookieName, cookieValNew);
      }
      else {
        this.addValue(name, val);
      }
    }

    /**
     * Remove the given key.
     *
     * @param {string} name - The name of the key.
     */
    removeValue(name) {
      const cookieVals = $.cookie(this.cookieName).split('|');
      let k = 0;
      let cookieValNew = '';

      for (let i = 0; i < cookieVals.length; i++) {
        const fieldVals = cookieVals[i].split('~');

        if (fieldVals[0] !== name) {
          if (k) {
            cookieValNew += '|';
          }

          cookieValNew += fieldVals[0] + '~' + fieldVals[1];
          k++;
        }
      }

      $.cookie(this.cookieName, cookieValNew);
    }

    /**
     * Find the value using the given key.
     *
     * @param {string} name - The name of the key.
     * @return {string} The value of the key or false if the value isn't found.
     */
    findValue(name) {
      if ($.cookie(this.cookieName)) {
        const cookieVals = $.cookie(this.cookieName).split('|');

        for (let i = 0; i < cookieVals.length; i++) {
          const fieldVals = cookieVals[i].split('~');

          if (fieldVals[0] === name) {
            return fieldVals[1];
          }
        }
      }

      return '';
    }
  }

  const dataSaver = window.dataSaver = new DataSaver('patternlab');
  const dispatcher = new window.EventEmitter();

  /**
   * Default panels for Pattern Lab plus panel related events.
   *
   * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   *
   * Config is coming from the default viewer and is passed through from PL's config.
   */
  const panelCollection = {
    panels: [],

    count: () => {
      return panelCollection.panels.length;
    },

    get: () => {
      // Return a clone.
      return JSON.parse(JSON.stringify(panelCollection.panels));
    },

    add: (panel) => {
      // If ID already exists in panels array ignore the add().
      for (let i = 0; i < panelCollection.panels.length; ++i) {
        if (panel.id === panelCollection.panels[i].id) {
          return;
        }
      }

      // It wasn't found so push the tab onto the tabs.
      panelCollection.panels.push(panel);
    }
  };

  // Set up the base file extensions to fetch.
  let fileSuffixPattern;

  if (config.outputFileSuffixes && config.outputFileSuffixes.rawTemplate) {
    fileSuffixPattern = config.outputFileSuffixes.rawTemplate;
  }
  else {
    fileSuffixPattern = '';
  }

  let fileSuffixMarkup;

  if (config.outputFileSuffixes && config.outputFileSuffixes.markupOnly) {
    fileSuffixMarkup = config.outputFileSuffixes.markupOnly;
  }
  else {
    fileSuffixMarkup = '.markup-only';
  }

  // Add the default panels.
  panelCollection.add({
    id: 'sg-panel-pattern',
    default: true,
    templateId: 'pl-panel-template-code',
    httpRequest: true,
    httpRequestReplace: fileSuffixPattern,
    httpRequestCompleted: false,
    prismHighlight: true,
    keyCombo: 'ctrl+shift+u'
  });
  panelCollection.add({
    id: 'sg-panel-html',
    name: 'HTML',
    default: false,
    templateId: 'pl-panel-template-code',
    httpRequest: true,
    httpRequestReplace: fileSuffixMarkup + '.html',
    httpRequestCompleted: false,
    prismHighlight: true,
    language: 'markup',
    keyCombo: 'ctrl+shift+y'
  });

  // Gather panels from plugins.
  dispatcher.trigger('setupPanels');

  /**
   * Supports building the panels to be included in the modal or styleguide.
   *
   * Copyright (c) 2013-16 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   */
  const panelsViewer = {
    // Set up some defaults.
    initCopy: false,
    initMoveTo: 0,

    /**
     * Check to see if all of the panels have been collected before rendering
     *
     * @param {string} panels - The collected panels.
     * @param {string} patternData - The data from the pattern.
     * @param {boolean} iframePassback - If this is going to be passed back to the styleguide.
     * @param {boolean} switchText - If the text in the dropdown should be switched.
     */
    checkPanels: (panels, patternData, iframePassback, switchText) => {
      // Count how many panels have rendered content.
      let panelContentCount = 0;

      for (let i = 0; i < panels.length; i++) {
        if (panels[i].content) {
          panelContentCount++;
        }
      }

      // See if the count of panels with content matches number of panels.
      if (panelContentCount === panels.count()) {
        panelsViewer.renderPanels(panels, patternData, iframePassback, switchText);
      }
    },

    /**
     * Gather the panels related to the modal.
     *
     * @param {string} patternData - The data from the pattern.
     * @param {boolean} iframePassback - If this is going to be passed back to the styleguide.
     * @param {boolean} switchText - If the text in the dropdown should be switched.
     */
    gatherPanels: (patternData, iframePassback, switchText) => {
      dispatcher.addListener('checkPanels', panelsViewer.checkPanels);

      let template;
      let templateCompiled;
      let templateRendered;

      // Get the base panels.
      const panels = panelCollection.get();

      // Evaluate panels array and create content.
      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];

        // Catch pattern panel since it doesn't have a name defined by default.
        if (panel.name) {
          panel.name = patternData.patternExtension.replace(/^\./, '');
          panel.httpRequestReplace = panel.httpRequestReplace + patternData.patternExtension;
          panel.language = panel.name;
        }

        if (panel.templateId) {
          if (panel.httpRequest) {
            // Need a file and then render.
            const fileBase = urlHandler.getFilename(patternData.patternPartial, false);
            const e = new XMLHttpRequest();

            e.onload = ((i_) => {
              const panels_ = JSON.parse(JSON.stringify(panels)); // Clone. Don't mutate.

              return function () {
                const contentPrism = Prism.highlight(this.responseText, Prism.languages['html']);
                const templatePrism = d.getElementById(panels_[i_].templateId);
                const templateCompiledPrism = Hogan.compile(templatePrism.innerHTML);
                const templateRenderedPrism = templateCompiledPrism.render({language: 'html', code: contentPrism});
                panels_[i_].content = templateRenderedPrism;

                dispatcher.trigger('checkPanels', [panels_, patternData, iframePassback, switchText]);
              };
            })(i);

            e.open('GET', fileBase + panel.httpRequestReplace + '?' + (new Date()).getTime(), true);
            e.send();
          }
          else {
            // Vanilla render of pattern data.
            template = d.getElementById(panel.templateId);
            templateCompiled = Hogan.compile(template.innerHTML);
            templateRendered = templateCompiled.render(patternData);
            panels[i].content = templateRendered;

            dispatcher.trigger('checkPanels', [panels, patternData, iframePassback, switchText]);
          }
        }
      }
    },

    /**
     * Render the panels that have been collected.
     *
     * @param {string} panels - The collected panels.
     * @param {string} patternData - The data from the pattern.
     * @param {boolean} iframePassback - If this is going to be passed back to the styleguide.
     * @param {boolean} switchText - If the text in the dropdown should be switched.
     */
    renderPanels: (panels, patternData, iframePassback, switchText) => {
      const patternPartial = patternData.patternPartial;
      patternData.panels = panels;

      // set a default pattern description for modal pop-up
      if (!iframePassback && (patternData.patternDesc.length === 0)) {
        patternData.patternDesc = 'This pattern doesn\'t have a description.';
      }

      // capitilize the pattern name
      patternData.patternNameCaps = patternData.patternName.toUpperCase();

      // check for annotations in the given mark-up
      const markup = d.createElement('div');
      markup.innerHTML = patternData.patternMarkup;

      let count = 1;
      patternData.annotations = [];
      delete patternData['patternMarkup'];

      const comments = window.comments;

      for (let i = 0; i < comments.length; ++i) {
        const item = comments[i];
        const els = markup.querySelectorAll(item.el);

        if (els.length) {
          const annotation = {
            displayNumber: count,
            el: item.el,
            title: item.title,
            comment: item.comment
          };

          patternData.annotations.push(annotation);

          count++;
        }

      }

      // Alert the pattern that annotations should be highlighted.
      if (patternData.annotations.length) {
        const obj = {
          event: 'patternLab.annotationsHighlightShow',
          annotations: patternData.annotations
        };
        uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
      }

      // Add hasComma property to lineage.
      if (patternData.lineage.length) {
        for (let i = 0; i < patternData.lineage.length; ++i) {
          if (i < (patternData.lineage.length - 1)) {
            patternData.lineage[i].hasComma = true;
          }
        }
      }

      // Add hasComma property to lineageR.
      if (patternData.lineageR.length) {
        for (let i = 0; i < patternData.lineageR.length; ++i) {
          if (i < (patternData.lineageR.length - 1)) {
            patternData.lineageR[i].hasComma = true;
          }
        }
      }

      // Add *Exists attributes for Hogan templates.
      // Figure out if the description exists.
      patternData.patternDescExists = (
        patternData.patternDesc.length ||
        (patternData.patternDescAdditions && patternData.patternDescAdditions.length)
      );

      // figure out if lineage should be drawn
      patternData.lineageExists = (patternData.lineage.length > 0);

      // figure out if reverse lineage should be drawn
      patternData.lineageRExists = (patternData.lineageR.length > 0);

      // figure out if pattern state should be drawn
      patternData.patternStateExists = (patternData.patternState.length > 0);

      // Figure if annotations should be drawn.
      patternData.annotationExists = (patternData.annotations.length > 0);

      // Figure if the entire desc block should be drawn.
      patternData.descBlockExists = (
        patternData.patternDescExists ||
        patternData.lineageExists ||
        patternData.lineageRExists ||
        patternData.patternStateExists ||
        patternData.annotationExists
      );

      // Set isPatternView based on if we have to pass it back to the styleguide level.
      patternData.isPatternView = (iframePassback === false);

      // Render all of the panels in the base panel template.
      const template = d.getElementById('pl-panel-template-base');
      const templateCompiled = Hogan.compile(template.innerHTML);
      let templateRendered = templateCompiled.render(patternData);

      // Make sure templateRendered is modified to be an HTML element.
      const div = d.createElement('div');
      div.className = 'sg-modal-content-inner';
      div.innerHTML = templateRendered;
      templateRendered = div;

      // Add click events.
      templateRendered = panelsUtil.addClickEvents(templateRendered, patternPartial);

      // Add click events to the tabs in the rendered content.
      for (let i = 0; i < panels.length; ++i) {
        const panel = panels[i];

        // Default ids.
        const panelTabId = '#sg-' + patternPartial + '-' + panel.id + '-tab';
        const panelBlockId = '#sg-' + patternPartial + '-' + panel.id + '-panel';
        const panelTab = templateRendered.querySelector(panelTabId);
        const panelBlock = templateRendered.querySelector(panelBlockId);

        // Show default options.
        if (panelTab && panelBlock && panel.default) {
          panelTab.classList.add('sg-tab-title-active');
          panelBlock.style.display = 'block';
        }

      }

      // Find lineage links in the rendered content and add postmessage handlers in case it's in the modal.
      $('#sg-code-lineage-fill a, #sg-code-lineager-fill a', templateRendered).click(
        function (e) {
          e.preventDefault();

          const obj = {
            event: 'patternLab.updatePath',
            path: urlHandler.getFilename($(this).attr('data-patternpartial'))
          };

          uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
        }
      );

      // Gather panels from plugins.
      dispatcher.trigger('insertPanels', [templateRendered, patternPartial, iframePassback, switchText]);
    }
  };

  /**
   * Modal for the Viewer Layer.
   * For both annotations and code/info.
   *
   * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   */
  const modalViewer = {
    // Set up some defaults.
    active: false,
    switchText: true,
    template: 'info',
    patternData: {},

    /**
     * Initialize the modal window.
     */
    onReady: () => {
      // Make sure the listener for insertPanels is set-up.
      dispatcher.addListener('insertPanels', modalViewer.insert);

      // See if the modal is already active. If so update attributes as appropriate.
      if (dataSaver.findValue('modalActive') === 'true') {
        modalViewer.active = true;
      }

      const searchParams = uiProps.searchParams;

      // Show the modal if code view is called via query string.
      if (searchParams.view === 'code' || searchParams.view === 'c') {
        modalViewer.queryPattern();
      }

      // Show the modal if the old annotations view is called via query string.
      if (searchParams.view === 'annotations' || searchParams.view === 'a') {
        modalViewer.queryPattern();
      }
    },

    /**
     * Toggle the modal window open and closed.
     */
    toggle: () => {
      if (modalViewer.active) {
        const obj = {event: 'patternLab.annotationsHighlightHide'};

        uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
        modalViewer.close();
      }
      else {
        modalViewer.queryPattern();
      }
    },

    /**
     * Open the modal window.
     */
    open: () => {
      modalViewer.active = true;

      // Make sure the modal viewer and other options are off just in case.
      modalViewer.close();
      // Note it's turned on in the viewer.
      dataSaver.updateValue('modalActive', 'true');
      // Add an active class to the button that matches this template.
      $('#sg-t-' + modalViewer.template + ' .sg-checkbox').addClass('active');
      // Show the modal.
      modalViewer.show();
    },

    /**
     * Close the modal window.
     */
    close: () => {
      const obj = {event: 'patternLab.patternModalClose'};
      modalViewer.active = false;

      // Note that the modal viewer is no longer active.
      dataSaver.updateValue('modalActive', 'false');
      // Remove the active class from all of the checkbox items.
      $('.sg-checkbox').removeClass('active');
      // Hide the modal.
      modalViewer.hide();
      // Tell the styleguide to close.
      uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
    },

    /**
     * Insert the copy for the modal window. if it's meant to be sent back to the iframe do do.
     *
     * @param {string} templateRendered - The rendered template that should be inserted.
     * @param {string} patternPartial - The patternPartial that the rendered template is related to.
     * @param {boolean} iframePassback - If the refresh is of a view-all view and the content should be sent back.
     */
    insert: (templateRendered, patternPartial, iframePassback) => {
      if (iframePassback) {
        // Send a message to the pattern.
        const obj = {
          event: 'patternLab.patternModalInsert',
          patternPartial: patternPartial,
          modalContent: templateRendered.outerHTML
        };

        uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
      }
    },

    /**
     * Refresh the modal if a new pattern is loaded and the modal is active.
     *
     * @param {object} patternData - The patternData sent back from the query.
     * @param {boolean} iframePassback - If the refresh is of a view-all view and the content should be sent back.
     * @param {boolean} switchText - If the text in the dropdown should be switched.
     */
    refresh: (patternData, iframePassback, switchText) => {
      // If this is a styleguide view, close the modal.
      if (iframePassback) {
        modalViewer.hide();
      }

      // Gather the data that will fill the modal window.
      panelsViewer.gatherPanels(patternData, iframePassback, switchText);
    },

    /**
     * Alias for slide.
     */
    show: () => {
      modalViewer.slide(0);
    },

    /**
     * Ask the pattern for info so we can open the modal window and populate it.
     *
     * @param {boolean} switchText - If the text in the dropdown should be switched.
     */
    queryPattern: (switchText) => {
      // Note that the modal is active.
      if (switchText) {
        dataSaver.updateValue('modalActive', 'true');
        modalViewer.active = true;
      }

      // Send a message to the pattern.
      const obj = {event: 'patternLab.patternQuery', switchText: switchText};

      uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
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

      switch (data.event) {
        case 'patternLab.annotationNumberClicked':
          // Slide to a given annoation.
          modalViewer.slideToAnnotation(data.displayNumber);

          break;

        case 'patternLab.keyPress':
          switch (data.keyPress) {
            case 'ctrl+alt+0':
            case 'ctrl+shift+0':
              goXXSmall();

              break;

            case 'ctrl+shift+x':
              goXSmall();

              break;

            case 'ctrl+shift+s':
              goSmall();

              break;

            case 'ctrl+shift+m':
              goMedium();

              break;

            case 'ctrl+shift+l':
              goLarge();

              if (navigator.userAgent.indexOf('Edge') > -1) {
                alert(warnCtrlShiftLEdge);
              }

              break;

            case 'ctrl+alt+l':
              goLarge();

              break;

            case 'ctrl+alt+w':
            case 'ctrl+shift+w':
              uiFns.goWhole();

              break;

            case 'ctrl+alt+r':
              uiFns.goRandom();

              break;

            case 'ctrl+alt+g':
              uiFns.toggleGrow();

              break;

            case 'ctrl+shift+d':
              uiFns.toggleDisco();

              break;
          }

          break;

        case 'patternLab.pageLoad':
          if (!modalViewer.active) {
            if (
              typeof data.patternpartial === 'string' &&
              data.patternpartial.indexOf('viewall-') === 0 &&
              config.defaultShowPatternInfo
            ) {
              modalViewer.queryPattern(false);
            }
          }
          else {
            modalViewer.queryPattern();
          }

          break;

        case 'patternLab.patternQueryInfo':
          // Refresh the modal if a new pattern is loaded and the modal is active.
          modalViewer.refresh(data.patternData, data.iframePassback, data.switchText);

          break;
      }
    }
  };

  window.addEventListener('message', modalViewer.receiveIframeMessage, false);
  // When the document is ready make sure the modal is ready.
  $document.ready(function () {modalViewer.onReady();});

  /**
   * Default languages for Prism to match rendering capability.
   *
   * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   */
  const prismLanguages = {
    languages: [],

    get: (key) => {
      for (let i = 0; i < prismLanguages.languages.length; i++) {
        const language = prismLanguages.languages[i];

        if (language[key]) {
          return language[key];
        }
      }

      return 'markup';
    },

    add: (language) => {
      // See if the language already exists. Overwrite if it does.
      for (let key in language) {
        if (language.hasOwnProperty(key)) {
          for (let i = 0; i < prismLanguages.languages.length; i++) {
            if (prismLanguages.languages[i][key]) {
              prismLanguages.languages[i][key] = language[key];

              return;
            }
          }
        }
      }
      prismLanguages.languages.push(language);
    }
  };

  prismLanguages.add({mustache: 'markup'});

  // Watch the iframe source so that it can be sent back to everyone else.
  // Based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
  function receiveIframeMessage(event) {

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

    switch (data.event) {
      case 'patternLab.pageLoad':
        if (!urlHandler.skipBack) {
          if (
            !history.state ||
            history.state.pattern !== data.patternpartial
          ) {
            urlHandler.pushPattern(data.patternpartial, data.path);
          }
        }

        // Reset the defaults.
        urlHandler.skipBack = false;

        break;

      case 'patternLab.reload':
        // Reload the location if there was a message to do so.
        window.location.reload();

        break;

      case 'patternLab.updatePath':
        if (window.patternData.patternPartial) {
          // Handle patterns and the view all page.
          const re = /(patterns|snapshots)\/(.*)$/;
          const path =
            window.location.protocol + '//' + window.location.host + window.location.pathname.replace(re, '') +
            data.path + '?' + Date.now();

          window.location.replace(path);
        }
        else {
          // Handle the style guide.
          const path =
            window.location.protocol + '//' + window.location.host +
            window.location.pathname.replace('node_modules\/fepper-ui\/styleguide.html', '') + data.path + '?' +
            Date.now();

          window.location.replace(path);
        }

        break;
    }
  }

  window.addEventListener('message', receiveIframeMessage, false);

  /**
   * Handle the onpopstate event.
   *
   * @param {object} event - Event object.
   */
  window.onpopstate = function (event) {
    urlHandler.skipBack = true;
    urlHandler.popPattern(event);
  };

  /**
   * Simple Layout Rendering for Pattern Lab.
   * Load these here, and not with React, to avoid a render delay.
   *
   * Copyright (c) 2014 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   */
  try {
    // Load pattern nav.
    const templateNav = d.getElementById('pl-pattern-nav-target');
    const templateCompiledNav = Hogan.compile(templateNav.innerHTML);
    const templateRenderedNav = templateCompiledNav.render(window.navItems);
    templateNav.innerHTML = templateRenderedNav;
    templateNav.classList.remove('is-vishidden');

    // Load ish controls.
    const templateIsh = d.getElementById('sg-controls');
    const templateCompiledIsh = Hogan.compile(templateIsh.innerHTML);
    const templateRenderedIsh = templateCompiledIsh.render(window.ishControls);
    templateIsh.innerHTML = templateRenderedIsh;
    templateIsh.classList.remove('is-vishidden');
  }
  catch (e) {
    const message = '<h1>Nothing Here Yet</h1><p>Please generate your site before trying to view it.</p>';
    d.getElementById('pl-pattern-nav-target').innerHTML = message;
  }

  /**
   * Basic postMessage support.
   *
   * Copyright (c) 2013-2016 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   *
   * Handles the postMessage stuff in the pattern, view-all, and style guide templates.
   */

  // Alert the iframe parent that the pattern has loaded assuming this view was loaded in an iframe.
  if (self !== top) {

    // Handle the options that could be sent to the parent window.
    const path = window.location.toString();
    const parts = path.split('?');
    const options = {event: 'patternLab.pageLoad', path: parts[0]};
    const patternDataStr = d.getElementById('sg-pattern-data-footer').innerHTML;
    let patternData = {};

    try {
      patternData = JSON.parse(patternDataStr);
    }
    catch (e) {
      // Fail gracefully.
    }

    options.patternpartial = patternData.patternPartial || 'all';

    if (patternData.lineage !== '') {
      options.lineage = patternData.lineage;
    }

    parent.postMessage(options, uiProps.targetOrigin);

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

  $document.ready(function () {
    const bodyFontSize = uiProps.bodyFontSize;
    const sgGenContainer = uiProps.sgGenContainer;
    const sgViewport = uiProps.sgViewport;
    const updateSizeReading = uiFns.updateSizeReading;
    bpObj = uiFns.getBreakpointsSorted(window.FEPPER);

    // Update the viewport size.
    function updateViewportWidth(size) {
      sgViewport.style.width = size + 'px';
      sgGenContainer.style.width = (size * 1 + 14) + 'px';

      updateSizeReading(size);
    }

    // Update dimensions on resize.
    $window.resize(function () {
      uiProps.sw = d.body.clientWidth;
      uiProps.sh = $document.height();

      uiFns.setAccordionHeight();

      if (uiProps.wholeMode === true) {
        sizeiframe(uiProps.sw, false, true);
      }
    });

    // Publicly documenting ctrl+alt+0 because ctrl+shift+0 does not work in Windows.
    // However, allowing ctrl+shift+0 because it is publicly documented by Pattern Lab.
    Mousetrap.bind(['ctrl+alt+0', 'ctrl+shift+0'], function (e) {
      e.preventDefault();
      goXXSmall();

      return false;
    });

    // Extra small.
    Mousetrap.bind('ctrl+shift+x', function (e) {
      e.preventDefault();
      goXSmall();

      return false;
    });

    // Small.
    Mousetrap.bind('ctrl+shift+s', function (e) {
      e.preventDefault();
      goSmall();

      return false;
    });

    // Medium.
    Mousetrap.bind('ctrl+shift+m', function (e) {
      e.preventDefault();
      goMedium();

      return false;
    });

    // Large.
    Mousetrap.bind('ctrl+shift+l', function (e) {
      e.preventDefault();
      goLarge();

      if (navigator.userAgent.indexOf('Edge') > -1) {
        alert(warnCtrlShiftLEdge);
      }

      return false;
    });

    // Large for Microsoft Edge.
    Mousetrap.bind('ctrl+alt+l', function (e) {
      e.preventDefault();
      goLarge();

      return false;
    });

    // Allowing ctrl+shift+w to go whole viewport on MacOS and Microsoft Edge since this shortcut can be easily intuited
    // from the other shortcuts. However, ctrl+shift+w cannot be publicly documented since browser behavior may change
    // without warning in the future.
    Mousetrap.bind(['ctrl+alt+w', 'ctrl+shift+w'], function (e) {
      e.preventDefault();
      uiFns.goWhole();

      return false;
    });

    // Random width.
    Mousetrap.bind('ctrl+alt+r', function (e) {
      e.preventDefault();
      uiFns.goRandom();

      return false;
    });

    // Grow animation.
    Mousetrap.bind('ctrl+alt+g', function (e) {
      e.preventDefault();
      uiFns.toggleGrow();

      return false;
    });

    // Disco mode.
    Mousetrap.bind('ctrl+shift+d', function (e) {
      e.preventDefault();
      uiFns.toggleDisco();

      return false;
    });

    // All escape key behavior.
    Mousetrap.bind('esc', function () {
      if (window.annotationsViewer.commentsActive) {
        window.annotationsViewer.closeComments();
      }

      if (window.codeViewer.codeActive) {
        window.codeViewer.closeCode();
      }

      window.patternFinder.closeFinder();
    });

    // Capture the viewport width that was loaded and modify it so it fits with the pull bar.
    const viewportWidthOrig = sgViewport.clientWidth;
    sgGenContainer.style.width = viewportWidthOrig + 'px';

    if (
      'ontouchstart' in d.documentElement &&
      $window.width() <= 1024
    ) {
      $('#sg-rightpull-container').width(0);
    }
    else {
      sgViewport.style.width = (viewportWidthOrig - 14) + 'px';
    }

    updateSizeReading(sgViewport.clientWidth);

    // Pre-load the viewport width.
    const trackViewportWidth = true; // Can toggle this feature on & off.
    const searchParams = uiProps.searchParams;
    let vpWidth = 0;

    if (searchParams.g || searchParams.grow) {
      startGrow();
    }
    else if (searchParams.d || searchParams.disco) {
      startDisco();
    }
    else if (searchParams.w || searchParams.width) {
      vpWidth = searchParams.w || searchParams.width;

      if (vpWidth.indexOf('em') > -1) {
        vpWidth = Math.round(vpWidth.replace('em', '') * bodyFontSize);
      }
      else {
        vpWidth = vpWidth.replace('px', '');
      }

      dataSaver.updateValue('vpWidth', vpWidth);
      updateViewportWidth(vpWidth);
    }
    else if (trackViewportWidth && (vpWidth = dataSaver.findValue('vpWidth'))) {
      updateViewportWidth(vpWidth);
    }

    // set up the defaults for the
    const baseIframePath =
      window.location.protocol + '//' + window.location.host + window.location.pathname.replace('index.html', '');
    let iframePath = baseIframePath + 'node_modules/fepper-ui/styleguide.html?' + Date.now();
    let patternName;

    if (searchParams.p || searchParams.pattern) {
      patternName = searchParams.p || searchParams.pattern;
    }
    else if (
      typeof config.defaultPattern === 'string' &&
      config.defaultPattern.trim().length
    ) {
      patternName = config.defaultPattern;
    }
    else {
      patternName = 'all';
    }

    if (patternName !== 'all') {
      const patternPath = urlHandler.getFilename(patternName);
      iframePath = patternPath ? baseIframePath + patternPath + '?' + Date.now() : iframePath;
      d.getElementById('title').innerHTML = 'Fepper - ' + patternName;

      history.replaceState({pattern: patternName}, null, null);
    }

    if (uiProps.sgRaw) {
      uiProps.sgRaw.setAttribute('href', urlHandler.getFilename(patternName));
    }

    urlHandler.skipBack = true;
    sgViewport.contentWindow.location.replace(iframePath);

    // Update the iframe with the source from clicked element in pull down menu. Also close the menu.
    // Having it outside fixes an auto-close bug.
    $('a[data-patternpartial]').click(function (e) {
      e.preventDefault();

      // update the iframe via the history api handler
      const obj = {
        event: 'patternLab.updatePath',
        path: urlHandler.getFilename($(this).attr('data-patternpartial'))
      };

      sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
      uiFns.closePanels();
    });
  });
})(document, window.FEPPER_UI.uiProps, window.FEPPER_UI.uiFns);
