((d) => {
  'use strict';

  window.FEPPER_UI = {};
  const config = window.config;
  const uiFns = window.FEPPER_UI.uiFns = {};
  const uiProps = window.FEPPER_UI.uiProps = {};

  uiFns.getBreakpointsSorted = (FEPPER) => {
    // Get breakpoint customations made to EITHER variables.styl or fepper-obj.js, with priority given to fepper-obj.js.
    const bpArr = [];
    const bpObj = {};
    const bpObjTmp = {};
    const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

    // Iterate through variables.styl and populate the tmp object for sorting.
    // Replace -1 (or any negative value) with MAX_SAFE_INTEGER.
    for (let idx in window) {
      if (idx.indexOf('bp_') === 0 && idx.indexOf('_max') === idx.length - 4) {
        if (window[idx] < 0) {
          bpObjTmp[idx.slice(3, idx.length - 4)] = MAX_SAFE_INTEGER;
        }
        else {
          bpObjTmp[idx.slice(3, idx.length - 4)] = window[idx];
        }
      }
    }

    // Do same thing with fepper-obj.js, overriding any values conflicting with those in variables.styl.
    if (FEPPER.breakpoints && typeof FEPPER.breakpoints === 'object') {
      for (let idx in FEPPER.breakpoints) {
        if (idx.hasOwnProperty('maxWidth')) {
          if (FEPPER.breakpoints[idx].maxWidth < 0) {
            bpObjTmp[idx] = MAX_SAFE_INTEGER;
          }
          else {
            bpObjTmp[idx] = FEPPER.breakpoints[idx].maxWidth;
          }
        }
      }
    }

    // Populate sorting array.
    for (let idx in bpObjTmp) {
      if (bpObjTmp.hasOwnProperty(idx)) {
        bpArr.push(bpObjTmp[idx]);
      }
    }

    // Sort array from highest to lowest.
    bpArr.sort((a, b) => b - a);

    // This gap is the distance between the 2nd largest bp and the 3rd.
    let gap = 0;
    let iteration = 1;

    for (let idx = 0; idx < bpArr.length; idx++) {
      if (iteration === 3) {
        gap = bpArr[idx - 1] - bpArr[idx];

        break;
      }
      else {
        iteration++;
      }
    }

    // Construct bpObj with sorted breakpoints.
    iteration = 0;

    bpArr.forEach((bp) => {
      for (let idx in bpObjTmp) {
        if (bpObjTmp.hasOwnProperty(idx)) {
          if (bp === bpObjTmp[idx]) {
            if (!iteration && gap) {
              bpObj[idx] = bpArr[1] + gap;
              iteration++;

              break;
            }
            else {
              bpObj[idx] = bp;
              iteration++;

              break;
            }
          }
        }
      }
    });

    return bpObj;
  };

  /**
   * Returns a random number between min and max.
   *
   * @param {number} min - Start of range.
   * @param {number} max - End of range.
   * @return {number} Random number.
   */
  uiFns.getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  };

  /**
   * Handle whole button. Needed in this file because fepper-npm depends on it.
   */
  uiFns.goWhole = () => {
    uiFns.stopDisco();
    uiFns.stopGrow();
    uiFns.sizeiframe(uiProps.sw, true, true);

    if (uiProps.sgSizeW) {
      uiProps.sgSizeW.focus();
    }
  };

  /**
   * Handle random button. Needed in this file because fepper-npm depends on it.
   */
  uiFns.goRandom = () => {
    uiFns.stopDisco();
    uiFns.stopGrow();
    uiFns.sizeiframe(uiFns.getRandom(uiProps.minViewportWidth, uiProps.sw));

    if (uiProps.sgSizeRandom) {
      uiProps.sgSizeRandom.focus();
    }
  };

  /**
   * Panels Util.
   * For both styleguide and viewer.
   *
   * Copyright (c) 2013-16 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   */
  uiFns.panelsUtil = {

    /**
     * Add click events to the template that was rendered.
     *
     * @param {string} templateRendered - The rendered template for the modal.
     * @param {string} patternPartial - The pattern partial for the modal.
     * @return {object} The rendered template for the modal.
     */
    addClickEvents: (templateRendered, patternPartial) => {
      const els = templateRendered.querySelectorAll('#sg-' + patternPartial + '-tabs li');

      for (let i = 0; i < els.length; ++i) {
        els[i].addEventListener(
          'click',
          function (e) {
            e.preventDefault();

            const patternPartial = this.getAttribute('data-patternpartial');
            const panelId = this.getAttribute('data-panelid');

            uiFns.panelsUtil.show(patternPartial, panelId);
          },
          false
        );
      }

      return templateRendered;
    },

    /**
     * Show a specific modal.
     *
     * @param {string} patternPartial - The pattern partial for the modal.
     * @param {string} panelId - The id of the panel to be shown.
     */
    show: (patternPartial, panelId) => {
      // Turn off all of the active tabs.
      const els = d.querySelectorAll('#sg-' + patternPartial + '-tabs li');

      for (let i = 0, l = els.length; i < l; i++) {
        els[i].classList.remove('sg-tab-title-active');
      }

      // Add active tab class.
      d.getElementById('sg-' + patternPartial + '-' + panelId + '-tab').classList.add('sg-tab-title-active');
      // Show the panel.
      d.getElementById('sg-' + patternPartial + '-' + panelId + '-panel').style.display = 'flex';
    }
  };

  /*
   * Boilerplate for receiveIframeMessage functions.
   *
   * @param {object} event - Event object.
   * @return {object|undefined} Event data.
   */
  uiFns.receiveIframeMessageBoilerplate = (event) => {
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
    else {
      return data;
    }
  };

  uiFns.saveSize = (size) => {
    const dataSaver = window.dataSaver;

    if (!dataSaver.findValue('vpWidth')) {
      dataSaver.addValue('vpWidth', size);
    }
    else {
      dataSaver.updateValue('vpWidth', size);
    }
  };

  // Accordion Height
  uiFns.setAccordionHeight = () => {
    const activeAccordion = d.querySelector('.sg-acc-panel.active');

    if (activeAccordion) {
      // Screen height minus the height of the header
      const availableHeight = uiProps.sh - uiProps.headerHeight;

      activeAccordion.style.height = availableHeight + 'px'; // Set height of accordion to the available height
    }
  };

  /**
   * Resize the viewport.
   *
   * @param {number} size - The target size of the viewport.
   * @param {boolean} animate - For switching the CSS animation on or off.
   * @param {boolean} wholeMode - Whether to take up whole sceen.
   */
  uiFns.sizeiframe = (size, animate = true, wholeMode = false) => {
    if (!size) {
      return;
    }

    const sgViewport = uiProps.sgViewport;
    const sgGenContainer = uiProps.sgGenContainer;
    const maxViewportWidth = uiProps.maxViewportWidth;
    const minViewportWidth = uiProps.minViewportWidth;

    uiProps.wholeMode = wholeMode;

    let theSize;

    // If the entered size is larger than the max allowed viewport size, cap value at max vp size.
    if (size > maxViewportWidth) {
      theSize = maxViewportWidth;
    }
    // If the entered size is less than the minimum allowed viewport size, cap value at min vp size.
    else if (size < minViewportWidth) {
      theSize = minViewportWidth;
    }
    else {
      theSize = size;
    }

    // Conditionally remove CSS animation class from viewport.
    if (animate === false) {
      uiProps.sgGenContainer.classList.remove('vp-animate');
      uiProps.sgViewport.classList.remove('vp-animate');
    }
    else {
      uiProps.sgGenContainer.classList.add('vp-animate');
      uiProps.sgViewport.classList.add('vp-animate');
    }

    // Resize viewport wrapper to desired size + size of drag resize handler.
    sgGenContainer.style.width = (theSize + uiProps.viewportResizeHandleWidth) + 'px';
    // Resize viewport to desired size.
    sgViewport.style.width = theSize + 'px';

    const obj = {event: 'patternLab.resize', resize: 'true'};
    uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);

    uiFns.updateSizeReading(theSize); // Update values in toolbar.
    uiFns.saveSize(theSize); // Save current viewport to cookie.
  };

  uiFns.startDisco = () => {
    uiProps.discoMode = true;
    uiProps.discoId = setInterval(() => {
      uiFns.sizeiframe(uiFns.getRandom(uiProps.minViewportWidth, uiProps.sw));
    }, 800);

    if (uiProps.sgSizeDisco) {
      uiProps.sgSizeDisco.focus();
    }
  };

  uiFns.startGrow = () => {
    let viewportWidth = uiProps.minViewportWidth;
    uiProps.growMode = true;

    uiProps.sgGenContainer.classList.remove('vp-animate');
    uiProps.sgViewport.classList.remove('vp-animate');
    uiFns.sizeiframe(viewportWidth, false);

    if (uiProps.sgSizeGrow) {
      uiProps.sgSizeGrow.focus();
    }

    setTimeout(() => {
      uiProps.growId = setInterval(() => {
        if (viewportWidth < uiProps.sw) {
          viewportWidth++;

          uiFns.sizeiframe(viewportWidth, false);
        }
        else {
          uiFns.stopGrow();
        }
      }, 20);
    }, 200);
  };

  uiFns.stopDisco = () => {
    uiProps.discoMode = false;

    clearInterval(uiProps.discoId);

    if (uiProps.sgSizeDisco) {
      uiProps.sgSizeDisco.blur();
    }
  };

  uiFns.stopGrow = () => {
    const sgViewport = uiProps.sgViewport;
    const sgGenContainer = uiProps.sgGenContainer;
    uiProps.growMode = false;

    sgViewport.classList.remove('grow-mode');
    sgGenContainer.classList.remove('grow-mode');
    clearInterval(uiProps.growId);

    if (uiProps.sgSizeGrow) {
      uiProps.sgSizeGrow.blur();
    }
  };

  uiFns.toggleDisco = () => {
    if (!uiProps.discoMode) {
      uiFns.startDisco();
    }
    else {
      uiFns.stopDisco();
    }
  };

  uiFns.toggleGrow = () => {
    if (!uiProps.growMode) {
      uiFns.startGrow();
    }
    else {
      uiFns.stopGrow();
    }
  };

  /**
   * Update Pixel and Em inputs.
   *
   * @param {number} size - The input number.
   * @param {string} unit - The type of unit: either px or em. Default is px. Accepted values are "px" and "em".
   * @param {string} target - What input to update.
   */
  uiFns.updateSizeReading = (size, unit, target) => {
    const bodyFontSize = uiProps.bodyFontSize;
    const sgSizeEm = uiProps.sgSizeEm; // Em size input element in toolbar.
    const sgSizePx = uiProps.sgSizePx; // Px size input element in toolbar.

    let emSize;
    let pxSize;

    if (unit === 'em') { // If size value is in em units.
      emSize = size;
      pxSize = Math.round(size * bodyFontSize);
    }
    else { // If value is px or absent.
      pxSize = size;
      emSize = size / bodyFontSize;
    }

    if (target === 'updatePxInput') {
      sgSizePx.value = pxSize;
    }
    else if (target === 'updateEmInput') {
      sgSizeEm.value = emSize.toFixed(2);
    }
    else {
      sgSizeEm.value = emSize.toFixed(2);
      sgSizePx.value = pxSize;
    }
  };

  /**
   * URL Handler.
   *
   * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
   * Licensed under the MIT license.
   *
   * Helps handle the initial iframe source. Parses a string to see if it matches
   * an expected pattern in Pattern Lab. Supports Pattern Labs fuzzy pattern partial
   * matching style.
   */
  uiFns.urlHandler = {
    // set-up some default vars
    skipBack: false,

    /**
     * Get the real file name for a given pattern name.
     *
     * @param {string} name - The shorthand partials syntax for a given pattern.
     * @param {boolean} withRenderedSuffix - Whether filename should be returned with the full rendered suffix or not.
     * @return {string} The real file path.
     */
    getFilename: (name, withRenderedSuffix = true) => {
      const baseDir = 'patterns';
      let filename = '';

      if (!name) {
        return filename;
      }

      if (name === 'all') {
        return 'node_modules/fepper-ui/styleguide.html';
      }
      else if (name === 'snapshots') {
        return 'snapshots/index.html';
      }

      const paths = (name.indexOf('viewall-') !== -1) ? window.viewAllPaths : window.patternPaths;
      const nameClean = name.replace('viewall-', '');

      // Look at this as a regular pattern.
      const bits = uiFns.urlHandler.getPatternInfo(nameClean, paths);
      const patternType = bits[0];
      const pattern = bits[1];

      if (paths[patternType] && paths[patternType][pattern]) {
        filename = paths[patternType][pattern];
      }
      else if (paths[patternType]) {
        for (let patternMatchKey in paths[patternType]) {
          if (patternMatchKey.indexOf(pattern) !== -1) {
            filename = paths[patternType][patternMatchKey];

            break;
          }
        }
      }

      if (filename === '') {
        return filename;
      }

      const regex = /\//g;
      if ((name.indexOf('viewall-') !== -1) && (name.indexOf('viewall-') === 0) && (filename !== '')) {
        filename = baseDir + '/' + filename.replace(regex, '-') + '/index.html';
      }
      else if (filename !== '') {
        filename = baseDir + '/' + filename.replace(regex, '-') + '/' + filename.replace(regex, '-');

        if (withRenderedSuffix) {
          let fileSuffixRendered;

          if (config.outputFileSuffixes && config.outputFileSuffixes.rendered) {
            fileSuffixRendered = config.outputFileSuffixes.rendered;
          }
          else {
            fileSuffixRendered = '';
          }

          filename = filename + fileSuffixRendered + '.html';
        }
      }

      return filename;
    },

    /**
     * Break up a pattern into its parts, pattern type and pattern name.
     *
     * @param {string} name - The shorthand partials syntax for a given pattern.
     * @param {object} paths - The paths to be compared.
     * @return {array} The pattern type and pattern name.
     */
    getPatternInfo: (name, paths) => {
      const patternBits = name.split('-');
      const c = patternBits.length;
      let patternType = patternBits[0];
      let i = 1;

      while (typeof paths[patternType] === 'undefined' && i < c) {
        patternType += '-' + patternBits[i];
        i++;
      }

      const pattern = name.slice(patternType.length + 1, name.length);

      return [patternType, pattern];
    },

    /**
     * Get query string search params for a particular item.
     *
     * @return {object} An object containing to keys and values of window.location.search.
     */
    getSearchParams: () => {
      const paramsObj = {};
      const paramsItr = new URLSearchParams(window.location.search);

      for (let param of paramsItr) {
        paramsObj[param[0]] = param[1];
      }

      return paramsObj;
    },

    /**
     * Push a pattern onto the current history based on a click.
     * @param {string} pattern - The shorthand partials syntax for a given pattern.
     * @param {string} givenPath - The path given by the loaded iframe.
     */
    pushPattern: (pattern, givenPath) => {
      const data = {pattern};
      const filename = uiFns.urlHandler.getFilename(pattern);
      let path = window.location.pathname;
      const expectedPath = window.location.protocol + '//' + window.location.host + path + filename;

      if (window.location.protocol === 'file') {
        path = path.replace('/public/index.html', 'public/');
      }
      else {
        path = path.replace(/\/index\.html/, '/');
      }

      if (givenPath !== expectedPath) {
        // Make sure to update the iframe because there was a click.
        const obj = {event: 'patternLab.updatePath', path: filename};

        uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);
      }
      else {
        // Add to the history.
        let addressReplacement;

        if (window.location.protocol === 'file:') {
          addressReplacement = null;
        }
        else {
          addressReplacement = window.location.protocol + '//' + window.location.host +
            window.location.pathname.replace('index.html', '') + '?p=' + pattern;
        }

        if (history.pushState) {
          history.pushState(data, null, addressReplacement);
        }

        uiProps.title.innerHTML = 'Fepper - ' + pattern;

        if (uiProps.sgRaw) {
          uiProps.sgRaw.setAttribute('href', uiFns.urlHandler.getFilename(pattern));
        }
      }
    },

    /**
     * Based on a click forward or backward modify the url and iframe source.
     *
     * @param {object} e - Event info like state and properties set in pushState().
     */
    popPattern: (e) => {
      const state = e.state;
      let patternName = '';

      if (state && state.pattern) {
        patternName = state.pattern;
      }
      else {
        uiFns.urlHandler.skipBack = false;

        return;
      }

      let iframePath = uiFns.urlHandler.getFilename(patternName);

      if (iframePath === '') {
        iframePath = 'node_modules/fepper-ui/styleguide.html';
      }

      const obj = {event: 'patternLab.updatePath', path: iframePath};
      uiProps.title.innerHTML = 'Fepper - ' + patternName;

      uiProps.sgViewport.contentWindow.postMessage(obj, uiProps.targetOrigin);

      if (uiProps.sgRaw) {
        uiProps.sgRaw.setAttribute('href', uiFns.urlHandler.getFilename(patternName));
      }
    }
  };

  /**
   * Dependents of uiProps will need to listen for DOMContentLoaded as well.
   */
  d.addEventListener(
    'DOMContentLoaded',
    function () {
      // Saved elements.
      uiProps.sgGenContainer = d.getElementById('sg-gen-container');
      uiProps.sgHeader = d.querySelector('.sg-header');
      uiProps.sgPatterns = d.getElementById('sg-patterns');
      uiProps.sgRaw = d.getElementById('sg-raw');
      uiProps.sgSizeDisco = d.getElementById('sg-size-disco');
      uiProps.sgSizeEm = d.getElementById('sg-size-em');
      uiProps.sgSizeGrow = d.getElementById('sg-size-grow');
      uiProps.sgSizePx = d.getElementById('sg-size-px');
      uiProps.sgSizeRandom = d.getElementById('sg-size-random');
      uiProps.sgSizeW = d.getElementById('sg-size-w');
      uiProps.sgTAnnotations = d.getElementById('sg-t-annotations');
      uiProps.sgTCode = d.getElementById('sg-t-code');
      uiProps.sgTToggle = d.getElementById('sg-t-toggle');
      uiProps.sgViewport = d.getElementById('sg-viewport');
      uiProps.sgVpWrap = d.getElementById('sg-vp-wrap');
      uiProps.title = d.getElementById('title');

      // Measurements.
      uiProps.bodyFontSize = parseInt(window.getComputedStyle(d.body).getPropertyValue('font-size'), 10);
      uiProps.headerHeight = uiProps.sgHeader ? uiProps.sgHeader.clientHeight : null;
      uiProps.maxViewportWidth = config ? parseInt(config.ishMaximum) : null; // Maxiumum Size for Viewport.
      uiProps.minViewportWidth = config ? parseInt(config.ishMinimum) : null; // Minimum Size for Viewport.
      uiProps.sh = window.innerHeight;
      uiProps.sw = d.body.clientWidth;
      uiProps.viewportResizeHandleWidth = 14; // Width of the viewport drag-to-resize handle.

      const savedVpWidth = window.dataSaver ? parseInt(window.dataSaver.findValue('vpWidth'), 10) : null;

      // Modes.
      uiProps.discoMode = false;
      uiProps.growMode = false;
      uiProps.wholeMode = (savedVpWidth === uiProps.sw);

      // Other.
      uiProps.discoId = 0;
      uiProps.growId = 0;
      uiProps.searchParams = uiFns.urlHandler.getSearchParams();
      uiProps.targetOrigin =
        (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host;
    },
    false
  );
})(document);
