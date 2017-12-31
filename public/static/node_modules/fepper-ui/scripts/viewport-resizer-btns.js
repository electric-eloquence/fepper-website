(function (d, FEPPER) {
  'use strict';

  var idx;
  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

  // ///////////////////////////////////////////////////////////////////////////
  // BREAKPOINT VARS AND FUNCTIONS. NEED TO DEFINE THESE GLOBALLY TO THIS FILE.
  // ///////////////////////////////////////////////////////////////////////////

  // Respect breakpoint customations made to EITHER variables.styl or fepper-obj.js, with priority given to fepper-obj.js.
  var bpArr = [];
  var bpObj = {};
  var bpObjTmp = {};

  // Iterate through variables.styl and populate the tmp object for sorting.
  // Replace -1 (or any negative value) with MAX_SAFE_INTEGER.
  for (idx in window) {
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
    for (idx in FEPPER.breakpoints) {
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
  for (idx in bpObjTmp) {
    if (bpObjTmp.hasOwnProperty(idx)) {
      bpArr.push(bpObjTmp[idx]);
    }
  }

  // Sort array from highest to lowest.
  bpArr.sort(function (a, b) { return b - a; });

  // Replace MAX_SAFE_INTEGER with a point on the largest bp gapped from the 2nd largest bp.
  // This gap is the distance between the 2nd largest bp and the 3rd.
  var gap = 0;
  var iteration = 1;
  for (idx = 0; idx < bpArr.length; idx++) {
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
  bpArr.forEach(function (bp) {
    for (idx in bpObjTmp) {
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

  function saveSize(size) {
    if (!DataSaver.findValue('vpWidth')) {
      DataSaver.addValue("vpWidth", size);
    }
    else {
      DataSaver.updateValue("vpWidth", size);
    }
  }

  function updateSizeReading(size) {
    var bodyFontSize;
    var bodyFontSizeStr = d.getElementsByTagName('body')[0].style.fontSize;
    if (bodyFontSizeStr.indexOf('px') !== -1) {
      bodyFontSize = parseInt(bodyFontSize.replace('px', ''), 10);
    }
    else {
      bodyFontSize = 16;
    }

    // Px size input element in toolbar
    var sizePx = d.getElementsByClassName('sg-size-px')[0];
    if (sizePx) {
      var pxSize = size;
      sizePx.value = pxSize;
    }

    // Em size input element in toolbar
    var sizeEms = d.getElementsByClassName('sg-size-em')[0];
    if (sizeEms) {
      var emSize = size / bodyFontSize;
      sizeEms.value = emSize.toFixed(2);
    }
  }

  function sizeiframe(e) {
    e.preventDefault();
    var idx1;
    var sgSize = this.id.replace('sg-size-', '');

    for (idx1 in bpObj) {
      if (sgSize === idx1) {
        var maxViewportWidth = 2600; // Defined in public/styleguide/js/patternlab-viewer.js
        var minViewportWidth = 240; // Defined in public/styleguide/js/patternlab-viewer.js
        var size = bpObj[idx1];
        var theSize;
        var viewportResizeHandleWidth = 14; // Defined in public/styleguide/js/patternlab-viewer.js

        if (size > maxViewportWidth) {
          // If the entered size is larger than the max allowed viewport size, cap
          // value at max vp size.
          theSize = maxViewportWidth;
        }
        else if (size < minViewportWidth) {
          // If the entered size is less than the minimum allowed viewport size, cap
          // value at min vp size.
          theSize = minViewportWidth;
        }
        else {
          theSize = size;
        }

        // Resize viewport wrapper to desired size + size of drag resize handler.
        var sgGenContainer = d.getElementById('sg-gen-container');
        if (sgGenContainer) {
          sgGenContainer.className = 'vp-animate';
          sgGenContainer.style.width = theSize + viewportResizeHandleWidth + 'px';
        }
        // Resize viewport to desired size.
        var sgViewport = d.getElementById('sg-viewport');
        if (sgViewport) {
          sgViewport.className = 'vp-animate';
          sgViewport.style.width = theSize + 'px';

          var targetOrigin = (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host;
          var obj = JSON.stringify({resize: 'true'});
          sgViewport.contentWindow.postMessage(obj, targetOrigin);
        }

        // Update values in toolbar
        updateSizeReading(theSize);
        // Save current viewport to cookie
        saveSize(theSize);
      }
    }
  }

  // ///////////////////////////////////////////////////////////////////////////
  // MAIN EXECUTION
  // Add breakpoints to viewport resizer.
  // ///////////////////////////////////////////////////////////////////////////

  var a;
  var bpBtn;
  var idx1;
  var li;
  var optionsPanel = d.querySelector('.sg-size-options');

  if (optionsPanel) {
    for (idx1 in bpObj) {
      if (bpObj.hasOwnProperty(idx1)) {
        a = d.createElement('a');
        a.setAttribute('href', '#');
        a.setAttribute('id', 'sg-size-' + idx1);
        a.innerHTML = idx1.toUpperCase();
        li = d.createElement('li');
        li.appendChild(a);
        optionsPanel.insertBefore(li, optionsPanel.firstChild);
      }
    }
  }

  // Dynamically add breakpoints to resizer based on confs in variables.styl or fepper-obj.js.
  for (idx1 in bpObj) {
    if (bpObj.hasOwnProperty(idx1)) {
    }
  }

  // Iterate through breakpoints in order to create event listeners that resize
  // the viewport.
  for (idx1 in bpObj) {
    if (bpObj.hasOwnProperty(idx1)) {
      bpBtn = d.getElementById('sg-size-' + idx1);
      if (bpBtn) {
        bpBtn.addEventListener('click', sizeiframe);
      }
    }
  }
})(document, window.FEPPER);
