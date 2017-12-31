const uiFns = window.FEPPER_UI.uiFns = window.FEPPER_UI.uiFns || {};
const uiProps = window.FEPPER_UI.uiProps = window.FEPPER_UI.uiProps || {};

let discoID = false;

uiFns.killDisco = () => {
  discoMode = false;
  clearInterval(discoID);
  discoID = false;
};

uiFns.startDisco = () => {
  discoMode = true;
  discoID = setInterval(disco, 800);
};

let hayMode;

//Stop Hay! Mode
uiFns.killHay = () => {
  const $sgViewport = uiProps.$sgViewport;
  const currentWidth = $sgViewport.width();
  hayMode = false;
  $sgViewport.removeClass('hay-mode');
  $('#sg-gen-container').removeClass('hay-mode');
  uiFns.sizeiframe(Math.floor(currentWidth));
};

// start Hay! mode
uiFns.startHay = () => {
  const $sgViewport = uiProps.$sgViewport;
  const minViewportWidth = uiProps.minViewportWidth;
  const viewportResizeHandleWidth = uiProps.viewportResizeHandleWidth;
  hayMode = true;
  $('#sg-gen-container').removeClass('vp-animate').width(minViewportWidth + viewportResizeHandleWidth);
  $sgViewport.removeClass('vp-animate').width(minViewportWidth);

  const timeoutID = window.setTimeout(() => {
    $('#sg-gen-container').addClass('hay-mode').width(maxViewportWidth + viewportResizeHandleWidth);
    $sgViewport.addClass('hay-mode').width(maxViewportWidth);

    setInterval(() => {
      const vpSize = $sgViewport.width();
      uiFns.updateSizeReading(vpSize);
    }, 100);
  }, 200);
};

/* Returns a random number between min and max */
uiFns.getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

uiFns.saveSize = size => {
  if (!window.DataSaver.findValue('vpWidth')) {
    window.DataSaver.addValue('vpWidth', size);
  } else {
    window.DataSaver.updateValue('vpWidth', size);
  }
};

// Accordion Height
uiFns.setAccordionHeight = () => {
  const $activeAccordion = $('.sg-acc-panel.active').first();
  // Screen height minus the height of the header
  const availableHeight = uiProps.sh - uiProps.$headerHeight;

  $activeAccordion.height(availableHeight); // Set height of accordion to the available height
};

//Update Pixel and Em inputs
//'size' is the input number
//'unit' is the type of unit: either px or em. Default is px. Accepted values are 'px' and 'em'
//'target' is what inputs to update. Defaults to both
uiFns.updateSizeReading = (size, unit, target) => {
  const $bodySize = uiProps.$bodySize;
  const $sizeEms = $('.sg-size-em'); //Em size input element in toolbar
  const $sizePx = $('.sg-size-px'); //Px size input element in toolbar

  let emSize;
  let pxSize;

  if (unit === 'em') { //If size value is in em units
    emSize = size;
    pxSize = Math.floor(size * $bodySize);
  } else { //If value is px or absent
    pxSize = size;
    emSize = size / $bodySize;
  }

  if (target === 'updatePxInput') {
    $sizePx.val(pxSize);
  } else if (target === 'updateEmInput') {
    $sizeEms.val(emSize.toFixed(2));
  } else {
    $sizeEms.val(emSize.toFixed(2));
    $sizePx.val(pxSize);
  }
};

//Resize the viewport
//'size' is the target size of the viewport
//'animate' is a boolean for switching the CSS animation on or off. 'animate' is true by default, but can be set to false for things like nudging and dragging
uiFns.sizeiframe = (size, animate) => {
  const maxViewportWidth = uiProps.maxViewportWidth;
  const minViewportWidth = uiProps.minViewportWidth;
  let theSize;

  if (size > maxViewportWidth) { //If the entered size is larger than the max allowed viewport size, cap value at max vp size
    theSize = maxViewportWidth;
  } else if (size < minViewportWidth) { //If the entered size is less than the minimum allowed viewport size, cap value at min vp size
    theSize = minViewportWidth;
  } else {
    theSize = size;
  }

  //Conditionally remove CSS animation class from viewport
  if (animate === false) {
    $('#sg-gen-container,#sg-viewport').removeClass('vp-animate'); //If aninate is set to false, remove animate class from viewport
  } else {
    $('#sg-gen-container,#sg-viewport').addClass('vp-animate');
  }

  $('#sg-gen-container').width(theSize + uiProps.viewportResizeHandleWidth); //Resize viewport wrapper to desired size + size of drag resize handler
  uiProps.$sgViewport.width(theSize); //Resize viewport to desired size

  let targetOrigin;
  if (window.location.protocol === 'file:') {
    targetOrigin = '*';
  } else {
    targetOrigin = window.location.protocol + '//' + window.location.host;
  }
  const obj = JSON.stringify({event: 'patternLab.resize', resize: 'true'});
  document.getElementById('sg-viewport').contentWindow.postMessage(obj, targetOrigin);

  uiFns.updateSizeReading(theSize); //Update values in toolbar
  uiFns.saveSize(theSize); //Save current viewport to cookie
};

$(document).ready(() => {
  'use strict';

  uiProps.$bodySize = parseInt($('body').css('font-size'));
  uiProps.$headerHeight = $('.sg-header').height();
  uiProps.$sgViewport = $('#sg-viewport'); //Viewport element

  uiProps.fullMode = true,
  uiProps.maxViewportWidth = parseInt(window.config.ishMaximum); //Maxiumum Size for Viewport
  uiProps.minViewportWidth = parseInt(window.config.ishMinimum); //Minimum Size for Viewport
  uiProps.sh = $(document).height();
  uiProps.sw = document.body.clientWidth; //Viewport Widthsw = document.body.clientWidth, //Viewport Width
  uiProps.viewportResizeHandleWidth = 14; //Width of the viewport drag-to-resize handle

  const patternFinder = uiProps.patternFinder = {
    data: [],
    active: false,

    init: function () {
      for (let patternType in patternPaths) {
        if (patternPaths.hasOwnProperty(patternType)) {
          for (let pattern in patternPaths[patternType]) {
            const obj = {};
            obj.patternPartial = patternType + '-' + pattern;
            obj.patternPath = patternPaths[patternType][pattern];
            this.data.push(obj);
          }
        }
      }

      // instantiate the bloodhound suggestion engine
      const patterns = new Bloodhound({
        datumTokenizer: function (d) {
          return Bloodhound.tokenizers.nonword(d.patternPartial);
        },
        queryTokenizer: Bloodhound.tokenizers.nonword,
        limit: 10,
        local: this.data
      });

      // initialize the bloodhound suggestion engine
      patterns.initialize();

      $('#sg-find .typeahead').typeahead(
        {highlight: true},
        {displayKey: 'patternPartial', source: patterns.ttAdapter()}
      ).on(
        'typeahead:selected',
        patternFinder.onSelected
      ).on(
        'typeahead:autocompleted',
        patternFinder.onAutocompleted
      );
    },

    passPath: function (item) {
      // update the iframe via the history api handler
      patternFinder.closeFinder();
      const obj = JSON.stringify({
        event: 'patternLab.updatePath',
        path: urlHandler.getFileName(item.patternPartial)
      });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, urlHandler.targetOrigin);
    },

    onSelected: function (e, item) {
      patternFinder.passPath(item);
    },

    onAutocompleted: function (e, item) {
      patternFinder.passPath(item);
    },

    toggleFinder: function () {
      if (!patternFinder.active) {
        patternFinder.openFinder();
      } else {
        patternFinder.closeFinder();
      }
    },

    openFinder: function () {
      patternFinder.active = true;
      $('#sg-find .typeahead').val('');
      $("#sg-find").addClass('show-overflow');
    },

    closeFinder: function () {
      patternFinder.active = false;
      document.activeElement.blur();
      $('#sg-find').removeClass('show-overflow');
      $('#sg-find .typeahead').val('');
    },

    receiveIframeMessage: function(event) {
      // does the origin sending the message match the current host? if not dev/null the request
      if (
        window.location.protocol !== 'file:' &&
        event.origin !== window.location.protocol + '//' + window.location.host
      ) {
        return;
      }

      let data = {};
      try {
        data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
      } catch(e) {}

      if (data.event !== undefined && data.event === 'patternLab.keyPress') {
        if (data.keyPress === 'ctrl+shift+f') {
          patternFinder.toggleFinder();
          return false;
        }
      }
    }
  };
});
