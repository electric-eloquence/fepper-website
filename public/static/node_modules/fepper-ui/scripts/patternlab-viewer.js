/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

  var pluses = /\+/g;
  
  function raw(s) {
    return s;
  }
  
  function decoded(s) {
    return decodeURIComponent(s.replace(pluses, ' '));
  }
  
  var config = $.cookie = function (key, value, options) {
    
    // write
    if (value !== undefined) {
      options = $.extend({}, config.defaults, options);
      
      if (value === null) {
        options.expires = -1;
      }
      
      if (typeof options.expires === 'number') {
        var days = options.expires, t = options.expires = new Date();
        t.setDate(t.getDate() + days);
      }
      
      value = config.json ? JSON.stringify(value) : String(value);
      
      return (document.cookie = [
        encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path    ? '; path=' + options.path : '',
        options.domain  ? '; domain=' + options.domain : '',
        options.secure  ? '; secure' : ''
      ].join(''));
    }
    
    // read
    var decode = config.raw ? raw : decoded;
    var cookies = document.cookie.split('; ');
    for (var i = 0, l = cookies.length; i < l; i++) {
      var parts = cookies[i].split('=');
      if (decode(parts.shift()) === key) {
        var cookie = decode(parts.join('='));
        return config.json ? JSON.parse(cookie) : cookie;
      }
    }
    
    return null;
  };
  
  config.defaults = {};
  
  $.removeCookie = function (key, options) {
    if ($.cookie(key) !== null) {
      $.cookie(key, null, options);
      return true;
    }
    return false;
  };

})(jQuery, document);

/*!
 * Data Saver
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 */

var DataSaver = {
  
  // the name of the cookie to store the data in
  cookieName: "patternlab",
  
  /**
  * Add a given value to the cookie
  * @param  {String}       the name of the key
  * @param  {String}       the value
  */
  addValue: function (name,val) {
    var cookieVal = $.cookie(this.cookieName);
    cookieVal = ((cookieVal === null) || (cookieVal === "")) ? name+"~"+val : cookieVal+"|"+name+"~"+val;
    $.cookie(this.cookieName,cookieVal);
  },
  
  /**
  * Update a value found in the cookie. If the key doesn't exist add the value
  * @param  {String}       the name of the key
  * @param  {String}       the value
  */
  updateValue: function (name,val) {
    if (this.findValue(name)) {
      var updateCookieVals = "";
      var cookieVals = $.cookie(this.cookieName).split("|");
      for (var i = 0; i < cookieVals.length; i++) {
        var fieldVals = cookieVals[i].split("~");
        if (fieldVals[0] == name) {
          fieldVals[1] = val;
        }
        updateCookieVals += (i > 0) ? "|"+fieldVals[0]+"~"+fieldVals[1] : fieldVals[0]+"~"+fieldVals[1];
      }
      $.cookie(this.cookieName,updateCookieVals);
    } else {
      this.addValue(name,val);
    }
  },
  
  /**
  * Remove the given key
  * @param  {String}       the name of the key
  */
  removeValue: function (name) {
    var updateCookieVals = "";
    var cookieVals = $.cookie(this.cookieName).split("|");
    var k = 0;
    for (var i = 0; i < cookieVals.length; i++) {
      var fieldVals = cookieVals[i].split("~");
      if (fieldVals[0] != name) {
        updateCookieVals += (k === 0) ? fieldVals[0]+"~"+fieldVals[1] : "|"+fieldVals[0]+"~"+fieldVals[1];
        k++;
      }
    }
    $.cookie(this.cookieName,updateCookieVals);
  },
  
  /**
  * Find the value using the given key
  * @param  {String}       the name of the key
  *
  * @return {String}       the value of the key or false if the value isn't found
  */
  findValue: function (name) {
    if ($.cookie(this.cookieName)) {
      var cookieVals = $.cookie(this.cookieName).split("|");
      for (var i = 0; i < cookieVals.length; i++) {
        var fieldVals = cookieVals[i].split("~");
        if (fieldVals[0] == name) {
          return fieldVals[1];
        }
      }
    }
    return false;
  }
  
};

/*!
 * Simple Layout Rendering for Pattern Lab. Load these here, and not with React, to avoid a render delay.
 *
 * Copyright (c) 2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 */

try {
  
  /* load pattern nav */
  var template         = document.getElementById("pl-pattern-nav-target");
  var templateCompiled = Hogan.compile(template.innerHTML);
  var templateRendered = templateCompiled.render(navItems);
  template.innerHTML = templateRendered;
  template.classList.remove('is-vishidden');
  
  /* load ish controls */
  var template         = document.getElementById("sg-controls");
  var templateCompiled = Hogan.compile(template.innerHTML);
  var templateRendered = templateCompiled.render(ishControls);
  template.innerHTML = templateRendered;
  template.classList.remove('is-vishidden');
  
} catch(e) {
  
  var message = "<h1>Nothing Here Yet</h1><p>Please generate your site before trying to view it.</p>";
  document.getElementById("pl-pattern-nav-target").innerHTML = message;
  
}

/*!
 * URL Handler
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Helps handle the initial iFrame source. Parses a string to see if it matches
 * an expected pattern in Pattern Lab. Supports Pattern Labs fuzzy pattern partial
 * matching style.
 *
 */

var urlHandler = {
  
  // set-up some default vars
  skipBack: false,
  targetOrigin: (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host,
  
  /**
  * get the real file name for a given pattern name
  * @param  {String}       the shorthand partials syntax for a given pattern
  * @param  {Boolean}      with the file name should be returned with the full rendered suffix or not
  *
  * @return {String}       the real file path
  */
  getFileName: function (name, withRenderedSuffix) {
    
    var baseDir     = "patterns";
    var fileName    = "";
    
    if (name === undefined) {
      return fileName;
    }
    
    if (withRenderedSuffix === undefined) {
      withRenderedSuffix = true;
    }
    
    if (name == "all") {
      return "node_modules/fepper-ui/styleguide.html";
    } else if (name == "snapshots") {
      return "snapshots/index.html";
    }
    
    var paths = (name.indexOf("viewall-") != -1) ? viewAllPaths : patternPaths;
    var nameClean = name.replace("viewall-","");
    
    // look at this as a regular pattern
    var bits        = this.getPatternInfo(nameClean, paths);
    var patternType = bits[0];
    var pattern     = bits[1];
    
    if ((paths[patternType] !== undefined) && (paths[patternType][pattern] !== undefined)) {
      
      fileName = paths[patternType][pattern];
      
    } else if (paths[patternType] !== undefined) {
      
      for (var patternMatchKey in paths[patternType]) {
        if (patternMatchKey.indexOf(pattern) != -1) {
          fileName = paths[patternType][patternMatchKey];
          break;
        }
      }
    
    }
    
    if (fileName === "") {
      return fileName;
    }
    
    var regex = /\//g;
    if ((name.indexOf("viewall-") !== -1) && (name.indexOf("viewall-") === 0) && (fileName !== "")) {
      fileName = baseDir+"/"+fileName.replace(regex,"-")+"/index.html";
    } else if (fileName !== "") {
      fileName = baseDir+"/"+fileName.replace(regex,"-")+"/"+fileName.replace(regex,"-");
      if (withRenderedSuffix) {
        var fileSuffixRendered = ((config.outputFileSuffixes !== undefined) && (config.outputFileSuffixes.rendered !== undefined)) ? config.outputFileSuffixes.rendered : '';
        fileName = fileName+fileSuffixRendered+".html";
      }
    }
    
    return fileName;
    
  },
  
  /**
  * break up a pattern into its parts, pattern type and pattern name
  * @param  {String}       the shorthand partials syntax for a given pattern
  * @param  {Object}       the paths to be compared
  *
  * @return {Array}        the pattern type and pattern name
  */
  getPatternInfo: function (name, paths) {
    
    var patternBits = name.split("-");
    
    var i = 1;
    var c = patternBits.length;
    
    var patternType = patternBits[0];
    while ((paths[patternType] === undefined) && (i < c)) {
      patternType += "-"+patternBits[i];
      i++;
    }
    
    var pattern = name.slice(patternType.length+1,name.length);
    
    return [patternType, pattern];
    
  },
  
  /**
  * search the request vars for a particular item
  *
  * @return {Object}       a search of the window.location.search vars
  */
  getRequestVars: function() {
    
    // the following is taken from https://developer.mozilla.org/en-US/docs/Web/API/window.location
    var oGetVars = new (function (sSearch) {
      if (sSearch.length > 1) {
        for (var aItKey, nKeyId = 0, aCouples = sSearch.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
          aItKey = aCouples[nKeyId].split("=");
          this[unescape(aItKey[0])] = aItKey.length > 1 ? unescape(aItKey[1]) : "";
        }
      }
    })(window.location.search);
    
    return oGetVars;
    
  },
  
  /**
  * push a pattern onto the current history based on a click
  * @param  {String}       the shorthand partials syntax for a given pattern
  * @param  {String}       the path given by the loaded iframe
  */
  pushPattern: function (pattern, givenPath) {
    var data         = { "pattern": pattern };
    var fileName     = urlHandler.getFileName(pattern);
    var path         = window.location.pathname;
    path             = (window.location.protocol === "file") ? path.replace("/public/index.html","public/") : path.replace(/\/index\.html/,"/");
    var expectedPath = window.location.protocol+"//"+window.location.host+path+fileName;
    if (givenPath != expectedPath) {
      // make sure to update the iframe because there was a click
      var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": fileName });
      document.getElementById("sg-viewport").contentWindow.postMessage(obj, urlHandler.targetOrigin);
    } else {
      // add to the history
      var addressReplacement = (window.location.protocol == "file:") ? null : window.location.protocol+"//"+window.location.host+window.location.pathname.replace("index.html","")+"?p="+pattern;
      if (history.pushState !== undefined) {
        history.pushState(data, null, addressReplacement);
      }
      document.getElementById("title").innerHTML = "Fepper - "+pattern;
      if (document.getElementById("sg-raw") !== undefined) {
        document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(pattern));
      }
    }
  },
  
  /**
  * based on a click forward or backward modify the url and iframe source
  * @param  {Object}      event info like state and properties set in pushState()
  */
  popPattern: function (e) {
    
    var patternName;
    var state = e.state;
    
    if (state === null) {
      this.skipBack = false;
      return;
    } else if (state !== null) {
      patternName = state.pattern;
    }
    
    var iFramePath = "";
    iFramePath = this.getFileName(patternName);
    if (iFramePath === "") {
      iFramePath = "node_modules/fepper-ui/styleguide.html";
    }
    
    var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": iFramePath });
    document.getElementById("sg-viewport").contentWindow.postMessage( obj, urlHandler.targetOrigin);
    document.getElementById("title").innerHTML = "Fepper - "+patternName;
    document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(patternName));
    
    /*
    if (wsnConnected !== undefined) {
      wsn.send( '{"url": "'+iFramePath+'", "patternpartial": "'+patternName+'" }' );
    }
    */
    
  }
  
};

/**
* handle the onpopstate event
*/
window.onpopstate = function (event) {
  urlHandler.skipBack = true;
  urlHandler.popPattern(event);
};

/*!
 * Modal for the Viewer Layer
 * For both annotations and code/info
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 * @requires data-saver.js
 *
 */

var modalViewer = {
  
  // set up some defaults
  active:        false,
  switchText:    true,
  template:      'info',
  patternData:   {},
  targetOrigin:  (window.location.protocol === 'file:') ? '*' : window.location.protocol+'//'+window.location.host,
  
  /**
  * initialize the modal window
  */
  onReady: function() {
    
    // make sure the listener for checkpanels is set-up
    Dispatcher.addListener('insertPanels', modalViewer.insert);
    
    // add the info/code panel onclick handler
    $('#sg-t-patterninfo').click(function(e) {
      e.preventDefault();
      $('#sg-tools-toggle').removeClass('active');
      $(this).parents('ul').removeClass('active');
      modalViewer.toggle();
    });
    
    // see if the modal is already active, if so update attributes as appropriate
    if (DataSaver.findValue('modalActive') === 'true') {
      modalViewer.active = true;
      $('#sg-t-patterninfo').html("Hide Pattern Info");
    }
    
    // review the query strings in case there is something the modal viewer is supposed to handle by default
    var queryStringVars = urlHandler.getRequestVars();
    
    // show the modal if code view is called via query string
    if ((queryStringVars.view !== undefined) && ((queryStringVars.view === 'code') || (queryStringVars.view === 'c'))) {
      modalViewer.queryPattern();
    }
    
    // show the modal if the old annotations view is called via query string
    if ((queryStringVars.view !== undefined) && ((queryStringVars.view === 'annotations') || (queryStringVars.view === 'a'))) {
      modalViewer.queryPattern();
    }
    
  },
  
  /**
  * toggle the modal window open and closed
  */
  toggle: function() {
    if (modalViewer.active === false) {
      modalViewer.queryPattern();
    } else {
      obj = JSON.stringify({ 'event': 'patternLab.annotationsHighlightHide' });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
      modalViewer.close();
    }
  },
  
  /**
  * open the modal window
  */
  open: function() {
    
    // make sure the modal viewer and other options are off just in case
    modalViewer.close();

    // note it's turned on in the viewer
    DataSaver.updateValue('modalActive', 'true');
    modalViewer.active = true;

    // add an active class to the button that matches this template
    $('#sg-t-'+modalViewer.template+' .sg-checkbox').addClass('active');

    // show the modal
    modalViewer.show();
    
  },
  
  /**
  * close the modal window
  */
  close: function() {
    
    var obj;
    
    // not that the modal viewer is no longer active
    DataSaver.updateValue('modalActive', 'false');
    modalViewer.active = false;
    
    // remove the active class from all of the checkbox items
    $('.sg-checkbox').removeClass('active');
    
    // hide the modal
    modalViewer.hide();
    
    // update the wording
    $('#sg-t-patterninfo').html("Show Pattern Info");
    
    // tell the styleguide to close
    obj = JSON.stringify({ 'event': 'patternLab.patternModalClose' });
    document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
    
  },
  
  /**
  * insert the copy for the modal window. if it's meant to be sent back to the iframe do do
  * @param  {String}       the rendered template that should be inserted
  * @param  {String}       the patternPartial that the rendered template is related to
  * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
  * @param  {Boolean}      if the text in the dropdown should be switched
  */
  insert: function(templateRendered, patternPartial, iframePassback, switchText) {
    
    if (iframePassback) {
      
      // send a message to the pattern
      var obj = JSON.stringify({ 'event': 'patternLab.patternModalInsert', 'patternPartial': patternPartial, 'modalContent': templateRendered.outerHTML });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
      
    }
      
    // update the wording unless this is a default viewall opening
    if (switchText === true) {
      $('#sg-t-patterninfo').html("Hide Pattern Info");
    }
    
  },
  
  /**
  * refresh the modal if a new pattern is loaded and the modal is active
  * @param  {Object}       the patternData sent back from the query
  * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
  * @param  {Boolean}      if the text in the dropdown should be switched
  */
  refresh: function(patternData, iframePassback, switchText) {
    
    // if this is a styleguide view close the modal
    if (iframePassback) {
      modalViewer.hide();
    }
    
    // gather the data that will fill the modal window
    panelsViewer.gatherPanels(patternData, iframePassback, switchText);
    
  },
  
  /**
  * alias for slide
  */
  show: function() {
    modalViewer.slide(0);
  },
  
  /**
  * ask the pattern for info so we can open the modal window and populate it
  * @param  {Boolean}      if the dropdown text should be changed
  */
  queryPattern: function(switchText) {
    
    // note that the modal is active and set switchText
    if ((switchText === undefined) || (switchText)) {
      switchText = true;
      DataSaver.updateValue('modalActive', 'true');
      modalViewer.active = true;
    }
    
    // send a message to the pattern
    var obj = JSON.stringify({ 'event': 'patternLab.patternQuery', 'switchText': switchText });
    document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
    
  },
  
  /**
  * toggle the comment pop-up based on a user clicking on the pattern
  * based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
  * @param  {Object}      event info
  */
  receiveIframeMessage: function(event) {
    
    var els, i;
    
    // does the origin sending the message match the current host? if not dev/null the request
    if ((window.location.protocol !== 'file:') && (event.origin !== window.location.protocol+'//'+window.location.host)) {
      return;
    }
    
    var data = {};
    try {
      data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
    } catch(e) {}
    
    if ((data.event !== undefined) && (data.event == "patternLab.pageLoad")) {
      
      if ((modalViewer.active === false) && (data.patternpartial !== undefined) && (data.patternpartial.indexOf('viewall-') === 0) && (config.defaultShowPatternInfo !== undefined) && (config.defaultShowPatternInfo)) {
        modalViewer.queryPattern(false);
      } else if (modalViewer.active === true) {
        modalViewer.queryPattern();
      }
      
    } else if ((data.event !== undefined) && (data.event == 'patternLab.patternQueryInfo')) {
      
      // refresh the modal if a new pattern is loaded and the modal is active
      modalViewer.refresh(data.patternData, data.iframePassback, data.switchText);
      
    } else if ((data.event !== undefined) && (data.event == 'patternLab.annotationNumberClicked')) {
      
      // slide to a given annoation
      modalViewer.slideToAnnotation(data.displayNumber);
      
    }
    
  }
  
};

// when the document is ready make sure the modal is ready
$(document).ready(function() { modalViewer.onReady(); });
window.addEventListener("message", modalViewer.receiveIframeMessage, false);

/*!
 * Panels Util
 * For both styleguide and viewer
 *
 * Copyright (c) 2013-16 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 *
 */

var panelsUtil = {
  
  /**
  * Add click events to the template that was rendered
  * @param  {String}      the rendered template for the modal
  * @param  {String}      the pattern partial for the modal
  */
  addClickEvents: function(templateRendered, patternPartial) {
    
    var els = templateRendered.querySelectorAll('#sg-'+patternPartial+'-tabs li');
    for (var i = 0; i < els.length; ++i) {
      els[i].onclick = function(e) {
        e.preventDefault();
        var patternPartial = this.getAttribute('data-patternpartial');
        var panelID = this.getAttribute('data-panelid');
        panelsUtil.show(patternPartial, panelID);
      };
    }
    
    return templateRendered;
    
  },
  
  /**
  * Show a specific modal
  * @param  {String}      the pattern partial for the modal
  * @param  {String}      the ID of the panel to be shown
  */
  show: function(patternPartial, panelID) {
    
    var els;
    
    // turn off all of the active tabs
    els = document.querySelectorAll('#sg-'+patternPartial+'-tabs li');
    for (i = 0; i < els.length; ++i) {
      els[i].classList.remove('sg-tab-title-active');
    }
    
    // add active tab class
    document.getElementById('sg-'+patternPartial+'-'+panelID+'-tab').classList.add('sg-tab-title-active');
    
    // show the panel
    document.getElementById('sg-'+patternPartial+'-'+panelID+'-panel').style.display = 'flex';
    
  }
  
};

/*!
 * Default languages for Prism to match rendering capability
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 */
var PrismLanguages = {
  
  languages: [],
  
  get: function(key) {
    
    var language;
    
    for (i = 0; i < this.languages.length; ++i) {
      language = this.languages[i];
      if (language[key] !== undefined) {
        return language[key];
      }
    }
    
    return 'markup';
    
  },
  
  add: function(language) {
    
    // see if the language already exists, overwrite if it does
    for (var key in language) {
      if (language.hasOwnProperty(key)) {
        for (i = 0; i < this.languages.length; ++i) {
          if (this.languages[i][key] !== undefined) {
            this.languages[i][key] = language[key];
            return;
          }
        }
      }
    }
    
    this.languages.push(language);
    
  }
  
};

// this shouldn't get hardcoded, also need to think about including Prism's real lang libraries (e.g. handlebars & twig)
PrismLanguages.add({'twig': 'markup'});
PrismLanguages.add({'mustache': 'markup'});

/*!
 * Default Panels for Pattern Lab plus Panel related events
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * config is coming from the default viewer and is passed through from PL's config
 *
 * @requires prism-languages.js
 */

var Panels = {
  
  panels: [],
  
  count: function() {
    return this.panels.length;
  },
  
  get: function() {
    return JSON.parse(JSON.stringify(this.panels));
  },
  
  add: function(panel) {
    
    // if ID already exists in panels array ignore the add()
    for (i = 0; i < this.panels.length; ++i) {
      if (panel.id === this.panels[i].id) {
        return;
      }
    }
    
    // it wasn't found so push the tab onto the tabs
    this.panels.push(panel);
    
  }
  
};

// set-up the base file extensions to fetch
var fileSuffixPattern = ((config.outputFileSuffixes !== undefined) && (config.outputFileSuffixes.rawTemplate !== undefined)) ? config.outputFileSuffixes.rawTemplate : '';
var fileSuffixMarkup  = ((config.outputFileSuffixes !== undefined) && (config.outputFileSuffixes.markupOnly !== undefined)) ? config.outputFileSuffixes.markupOnly : '.markup-only';

// add the default panels
Panels.add({ 'id': 'sg-panel-pattern', 'default': true, 'templateID': 'pl-panel-template-code', 'httpRequest': true, 'httpRequestReplace': fileSuffixPattern, 'httpRequestCompleted': false, 'prismHighlight': true, 'keyCombo': 'ctrl+shift+u' });
Panels.add({ 'id': 'sg-panel-html', 'name': 'HTML', 'default': false, 'templateID': 'pl-panel-template-code', 'httpRequest': true, 'httpRequestReplace': fileSuffixMarkup+'.html', 'httpRequestCompleted': false, 'prismHighlight': true, 'language': 'markup', 'keyCombo': 'ctrl+shift+y' });

// gather panels from plugins
Dispatcher.trigger('setupPanels');

/*!
 * Panel Builder. Supports building the panels to be included in the modal or styleguide
 *
 * Copyright (c) 2013-16 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires panels.js
 * @requires url-handler.js
 */

var panelsViewer = {

  // set up some defaults
  targetOrigin: (window.location.protocol === 'file:') ? '*' : window.location.protocol+'//'+window.location.host,
  initCopy:     false,
  initMoveTo:   0,

  /**
  * Check to see if all of the panels have been collected before rendering
  * @param  {String}      the collected panels
  * @param  {String}      the data from the pattern
  * @param  {Boolean}     if this is going to be passed back to the styleguide
  */
  checkPanels: function(panels, patternData, iframePassback, switchText) {

    // count how many panels have rendered content
    var panelContentCount = 0;
    for (var i = 0; i < panels.length; ++i) {
      if (panels[i].content !== undefined) {
        panelContentCount++;
      }
    }

    // see if the count of panels with content matches number of panels
    if (panelContentCount === Panels.count()) {
      panelsViewer.renderPanels(panels, patternData, iframePassback, switchText);
    }

  },

  /**
  * Gather the panels related to the modal
  * @param  {String}      the data from the pattern
  * @param  {Boolean}     if this is going to be passed back to the styleguide
  */
  gatherPanels: function(patternData, iframePassback, switchText) {

    Dispatcher.addListener('checkPanels', panelsViewer.checkPanels);

    // set-up defaults
    var template, templateCompiled, templateRendered, panel;

    // get the base panels
    var panels = Panels.get();

    // evaluate panels array and create content
    for (var i = 0; i < panels.length; ++i) {

      panel = panels[i];
      
      // catch pattern panel since it doesn't have a name defined by default
      if (panel.name === undefined) {
        panel.name = patternData.patternExtension;
        panel.httpRequestReplace = panel.httpRequestReplace+'.'+patternData.patternExtension;
        panel.language = patternData.patternExtension;
      }

      if ((panel.templateID !== undefined) && (panel.templateID)) {

        if ((panel.httpRequest !== undefined) && (panel.httpRequest)) {

          // need a file and then render
          var fileBase = urlHandler.getFileName(patternData.patternPartial, false);
          var e        = new XMLHttpRequest();
          e.onload     = (function(i, panels, patternData, iframeRequest) {
            return function() {
              prismedContent    = Prism.highlight(this.responseText, Prism.languages['html']);
              template          = document.getElementById(panels[i].templateID);
              templateCompiled  = Hogan.compile(template.innerHTML);
              templateRendered  = templateCompiled.render({ 'language': 'html', 'code': prismedContent });
              panels[i].content = templateRendered;
              Dispatcher.trigger('checkPanels', [panels, patternData, iframePassback, switchText]);
            };
          })(i, panels, patternData, iframePassback);
          
          e.open('GET', fileBase+panel.httpRequestReplace+'?'+(new Date()).getTime(), true);
          e.send();

        } else {

          // vanilla render of pattern data
          template          = document.getElementById(panel.templateID);
          templateCompiled  = Hogan.compile(template.innerHTML);
          templateRendered  = templateCompiled.render(patternData);
          panels[i].content = templateRendered;
          Dispatcher.trigger('checkPanels', [panels, patternData, iframePassback, switchText]);

        }

      }

    }

  },

  /**
  * Render the panels that have been collected
  * @param  {String}      the collected panels
  * @param  {String}      the data from the pattern
  * @param  {Boolean}     if this is going to be passed back to the styleguide
  */
  renderPanels: function(panels, patternData, iframePassback, switchText) {

    // set-up defaults
    var template, templateCompiled, templateRendered;
    var annotation, comment, count, div, els, item, markup, i;
    var patternPartial = patternData.patternPartial;
    patternData.panels = panels;
    
    // set a default pattern description for modal pop-up
    if (!iframePassback && (patternData.patternDesc.length === 0)) {
      patternData.patternDesc = "This pattern doesn't have a description.";
    }

    // capitilize the pattern name
    patternData.patternNameCaps = patternData.patternName.toUpperCase();

    // check for annotations in the given mark-up
    markup           = document.createElement('div');
    markup.innerHTML = patternData.patternMarkup;

    count = 1;
    patternData.annotations = [];
    delete patternData['patternMarkup'];

    for (i = 0; i < comments.comments.length; ++i) {

      item = comments.comments[i];
      els  = markup.querySelectorAll(item.el);

      if (els.length > 0) {
        annotation = { 'displayNumber': count, 'el': item.el, 'title': item.title, 'comment': item.comment };
        patternData.annotations.push(annotation);
        count++;
      }

    }

    // alert the pattern that annotations should be highlighted
    if (patternData.annotations.length > 0) {
      var obj = JSON.stringify({ 'event': 'patternLab.annotationsHighlightShow', 'annotations': patternData.annotations });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, panelsViewer.targetOrigin);
    }

    // add hasComma property to lineage
    if (patternData.lineage.length > 0) {
      for (i = 0; i < patternData.lineage.length; ++i) {
        if (i < (patternData.lineage.length - 1)) {
          patternData.lineage[i].hasComma = true;
        }
      }
    }

    // add hasComma property to lineageR
    if (patternData.lineageR.length > 0) {
      for (i = 0; i < patternData.lineageR.length; ++i) {
        if (i < (patternData.lineageR.length - 1)) {
          patternData.lineageR[i].hasComma = true;
        }
      }
    }

    // add *Exists attributes for Hogan templates
    // figure out if the description exists
    patternData.patternDescExists = ((patternData.patternDesc.length > 0) || ((patternData.patternDescAdditions !== undefined) && (patternData.patternDescAdditions.length > 0)));

    // figure out if lineage should be drawn
    patternData.lineageExists = (patternData.lineage.length !== 0);

    // figure out if reverse lineage should be drawn
    patternData.lineageRExists = (patternData.lineageR.length !== 0);

    // figure out if pattern state should be drawn
    patternData.patternStateExists = (patternData.patternState.length > 0);
    
    // figure if annotations should be drawn
    patternData.annotationExists = (patternData.annotations.length > 0);
    
    // figure if the entire desc block should be drawn
    patternData.descBlockExists = (patternData.patternDescExists || patternData.lineageExists || patternData.lineageRExists || patternData.patternStateExists || patternData.annotationExists);
    
    // set isPatternView based on if we have to pass it back to the styleguide level
    patternData.isPatternView = (iframePassback === false);

    // render all of the panels in the base panel template
    template         = document.getElementById('pl-panel-template-base');
    templateCompiled = Hogan.compile(template.innerHTML);
    templateRendered = templateCompiled.render(patternData);

    // make sure templateRendered is modified to be an HTML element
    div              = document.createElement('div');
    div.className    = 'sg-modal-content-inner';
    div.innerHTML    = templateRendered;
    templateRendered = div;

    // add click events
    templateRendered = panelsUtil.addClickEvents(templateRendered, patternPartial);

    // add onclick events to the tabs in the rendered content
    for (i = 0; i < panels.length; ++i) {

      panel = panels[i];

      // default IDs
      panelTab   = '#sg-'+patternPartial+'-'+panel.id+'-tab';
      panelBlock = '#sg-'+patternPartial+'-'+panel.id+'-panel';

      // show default options
      if ((templateRendered.querySelector(panelTab) !== null) && (panel.default)) {
        templateRendered.querySelector(panelTab).classList.add('sg-tab-title-active');
        templateRendered.querySelector(panelBlock).style.display = 'block';
      }

    }

    // find lineage links in the rendered content and add postmessage handlers in case it's in the modal
    $('#sg-code-lineage-fill a, #sg-code-lineager-fill a', templateRendered).on('click', function(e){
      e.preventDefault();
      var obj = JSON.stringify({ 'event': 'patternLab.updatePath', 'path': urlHandler.getFileName($(this).attr('data-patternpartial')) });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, panelsViewer.targetOrigin);
    });

    // gather panels from plugins
    Dispatcher.trigger('insertPanels', [templateRendered, patternPartial, iframePassback, switchText]);

  }

};

/*!
 * Basic postMessage Support
 *
 * Copyright (c) 2013-2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Handles the postMessage stuff in the pattern, view-all, and style guide templates.
 *
 */

// alert the iframe parent that the pattern has loaded assuming this view was loaded in an iframe
if (self != top) {
  
  // handle the options that could be sent to the parent window
  //   - all get path
  //   - pattern & view all get a pattern partial, styleguide gets all
  //   - pattern shares lineage
  var path = window.location.toString();
  var parts = path.split("?");
  var options = { "event": "patternLab.pageLoad", "path": parts[0] };
  
  patternData = document.getElementById('sg-pattern-data-footer').innerHTML;
  patternData = JSON.parse(patternData);
  options.patternpartial = (patternData.patternPartial !== undefined) ? patternData.patternPartial : "all";
  if (patternData.lineage !== "") {
    options.lineage = patternData.lineage;
  }
  
  var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
  parent.postMessage(options, targetOrigin);
  
  // find all links and add an onclick handler for replacing the iframe address so the history works
  var aTags = document.getElementsByTagName('a');
  for (var i = 0; i < aTags.length; i++) {
    aTags[i].onclick = function(e) {
      var href   = this.getAttribute("href");
      var target = this.getAttribute("target");
      if ((target !== undefined) && ((target == "_parent") || (target == "_blank"))) {
        // just do normal stuff
      } else if (href && href !== "#") {
        e.preventDefault();
        window.location.replace(href);
      } else {
        e.preventDefault();
        return false;
      }
    };
  }
  
}

// watch the iframe source so that it can be sent back to everyone else.
function receiveIframeMessage(event) {
  
  // does the origin sending the message match the current host? if not dev/null the request
  if ((window.location.protocol != "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
    return;
  }
  
  var path;
  var data = {};
  try {
    data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
  } catch(e) {}
  
  if ((data.event !== undefined) && (data.event == "patternLab.updatePath")) {
    
    if (patternData.patternPartial !== undefined) {
      
      // handle patterns and the view all page
      var re = /(patterns|snapshots)\/(.*)$/;
      path = window.location.protocol+"//"+window.location.host+window.location.pathname.replace(re,'')+data.path+'?'+Date.now();
      window.location.replace(path);
      
    } else {
      
      // handle the style guide
      path = window.location.protocol+"//"+window.location.host+window.location.pathname.replace("node_modules\/fepper-ui\/styleguide.html","")+data.path+'?'+Date.now();
      window.location.replace(path);
      
    }
    
  } else if ((data.event !== undefined) && (data.event == "patternLab.reload")) {
    
    // reload the location if there was a message to do so
    window.location.reload();
    
  }
  
}
window.addEventListener("message", receiveIframeMessage, false);

/**
 * @requires data-saver.js
 * @requires url-handler.js
 * @requires postmessage.js
 */

$(document).ready(function () {

  var uiFns = window.FEPPER_UI.uiFns,
    uiProps = window.FEPPER_UI.uiProps,
    sw = uiProps.sw,
    minViewportWidth = uiProps.minViewportWidth,
    maxViewportWidth = uiProps.maxViewportWidth,
    viewportResizeHandleWidth = uiProps.viewportResizeHandleWidth,
    $sgViewport = uiProps.$sgViewport,
    $bodySize = uiProps.$bodySize,
    discoMode = false,
    fullMode = uiProps.fullMode,
    hayMode = false;

  //Update dimensions on resize
  $(window).resize(function() {
    uiProps.sw = document.body.clientWidth;
    uiProps.sh = $(document).height();

    uiFns.setAccordionHeight();

    if(fullMode === true) {
      sizeiframe(sw, false);
    }
  });

  /* Disco Mode */
  function disco() {
    sizeiframe(getRandom(minViewportWidth,sw));
  }

  var killDisco = uiFns.killDisco;
  var startDisco = uiFns.startDisco;

  jwerty.key('ctrl+shift+d', function(e) {
    if (!discoMode) {
      startDisco();
    } else {
      killDisco();
    }
    return false;
  });

  var killHay = uiFns.killHay;
  var startHay = uiFns.startHay;

  // start hay from a keyboard shortcut
  jwerty.key('ctrl+shift+h', function(e) {
    if (!hayMode) {
      startHay();
    } else {
      killHay();
    }
  });

  //Size Trigger
  $('#sg-size-toggle').on("click", function(e){
    e.preventDefault();
    $(this).parents('ul').toggleClass('active');
  });

  //Phase View Events
  $('.sg-size[data-size]').on("click", function(e){
    e.preventDefault();
    killDisco();
    killHay();
    fullMode = false;

    var val = $(this).attr('data-size');

    if (val.indexOf('px') > -1) {
      $bodySize = 1;
    }

    val = val.replace(/[^\d.-]/g,'');
    sizeiframe(Math.floor(val*$bodySize));
  });

  //Size View Events

  // handle small button
  function goSmall() {
    killDisco();
    killHay();
    fullMode = false;
    sizeiframe(getRandom(minViewportWidth,500));
  }

  jwerty.key('ctrl+shift+s', function(e) {
    goSmall();
    return false;
  });

  // handle medium button
  function goMedium() {
    killDisco();
    killHay();
    fullMode = false;
    sizeiframe(getRandom(500,800));
  }

  jwerty.key('ctrl+shift+m', function(e) {
    goLarge();
    return false;
  });

  // handle large button
  function goLarge() {
    killDisco();
    killHay();
    fullMode = false;
    sizeiframe(getRandom(800,1200));
  }

  jwerty.key('ctrl+shift+l', function(e) {
    goLarge();
    return false;
  });

  // set 0 to 320px as a default
  jwerty.key('ctrl+shift+0', function(e) {
    e.preventDefault();
    sizeiframe(320,true);
    return false;
  });

  var sizeiframe = uiFns.sizeiframe;
  var saveSize = uiFns.saveSize;
  var updateSizeReading = uiFns.updateSizeReading;
  var getRandom = uiFns.getRandom;

  //Update The viewport size
  function updateViewportWidth(size) {
    $("#sg-viewport").width(size);
    $("#sg-gen-container").width(size*1 + 14);

    updateSizeReading(size);
  }

  // capture the viewport width that was loaded and modify it so it fits with the pull bar
  var origViewportWidth = $("#sg-viewport").width();
  $("#sg-gen-container").width(origViewportWidth);

  var testWidth = screen.width;
  if (window.orientation !== undefined) {
    testWidth = (window.orientation === 0) ? screen.width : screen.height;
  }
  if (($(window).width() == testWidth) && ('ontouchstart' in document.documentElement) && ($(window).width() <= 1024)) {
    $("#sg-rightpull-container").width(0);
  } else {
    $("#sg-viewport").width(origViewportWidth - 14);
  }
  updateSizeReading($("#sg-viewport").width());

  // get the request vars
  var oGetVars = urlHandler.getRequestVars();

  // pre-load the viewport width
  var vpWidth = 0;
  var trackViewportWidth = true; // can toggle this feature on & off

  if ((oGetVars.h !== undefined) || (oGetVars.hay !== undefined)) {
    startHay();
  } else if ((oGetVars.d !== undefined) || (oGetVars.disco !== undefined)) {
    startDisco();
  } else if ((oGetVars.w !== undefined) || (oGetVars.width !== undefined)) {
    vpWidth = (oGetVars.w !== undefined) ? oGetVars.w : oGetVars.width;
    vpWidth = (vpWidth.indexOf("em") !== -1) ? Math.floor(Math.floor(vpWidth.replace("em",""))*$bodySize) : Math.floor(vpWidth.replace("px",""));
    DataSaver.updateValue("vpWidth",vpWidth);
    updateViewportWidth(vpWidth);
  } else if (trackViewportWidth && (vpWidth = DataSaver.findValue("vpWidth"))) {
    updateViewportWidth(vpWidth);
  }

  // set up the defaults for the
  var baseIframePath = window.location.protocol+"//"+window.location.host+window.location.pathname.replace("index.html","");
  var patternName = ((config.defaultPattern !== undefined) && (typeof config.defaultPattern === 'string') && (config.defaultPattern.trim().length > 0)) ? config.defaultPattern : 'all';
  var iFramePath = baseIframePath+"node_modules/fepper-ui/styleguide.html?"+Date.now();
  if ((oGetVars.p !== undefined) || (oGetVars.pattern !== undefined)) {
    patternName = (oGetVars.p !== undefined) ? oGetVars.p : oGetVars.pattern;
  }

  if (patternName !== "all") {
    patternPath = urlHandler.getFileName(patternName);
    iFramePath = (patternPath !== "") ? baseIframePath+patternPath+"?"+Date.now() : iFramePath;
    document.getElementById("title").innerHTML = "Fepper - "+patternName;
    history.replaceState({ "pattern": patternName }, null, null);
  }

  if (document.getElementById("sg-raw") !== undefined) {
    document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(patternName));
  }

  urlHandler.skipBack = true;
  document.getElementById("sg-viewport").contentWindow.location.replace(iFramePath);

  // update the iframe with the source from clicked element in pull down menu. also close the menu
  // having it outside fixes an auto-close bug i ran into
  $('a[data-patternpartial]').on("click", function(e){
    e.preventDefault();
    // update the iframe via the history api handler
    var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": urlHandler.getFileName($(this).attr("data-patternpartial")) });
    document.getElementById("sg-viewport").contentWindow.postMessage(obj, urlHandler.targetOrigin);
    uiFns.closePanels();
  });

  // Listen for resize changes
  if (window.orientation !== undefined) {
    var origOrientation = window.orientation;
    window.addEventListener("orientationchange", function() {
      if (window.orientation != origOrientation) {
        $("#sg-gen-container").width($(window).width());
        $("#sg-viewport").width($(window).width());
        updateSizeReading($(window).width());
        origOrientation = window.orientation;
      }
    }, false);

  }

  // watch the iframe source so that it can be sent back to everyone else.
  // based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
  function receiveIframeMessage(event) {

    // does the origin sending the message match the current host? if not dev/null the request
    if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
      return;
    }

    var data = {};
    try {
      data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
    } catch(e) {}
    
    if (data.event !== undefined) {
      
      if (data.event == "patternLab.pageLoad") {

        if (!urlHandler.skipBack) {

          if ((history.state === undefined) || (history.state === null) || (history.state.pattern !== data.patternpartial)) {
            urlHandler.pushPattern(data.patternpartial, data.path);
          }

          /*
          if (wsnConnected) {
            var iFramePath = urlHandler.getFileName(data.patternpartial);
            wsn.send( '{"url": "'+iFramePath+'", "patternpartial": "'+event.data.patternpartial+'" }' );
          }
          */
        }

        // reset the defaults
        urlHandler.skipBack = false;

      } else if (data.event == "patternLab.keyPress") {
        if (data.keyPress == 'ctrl+shift+s') {
          goSmall();
        } else if (data.keyPress == 'ctrl+shift+m') {
          goMedium();
        } else if (data.keyPress == 'ctrl+shift+l') {
          goLarge();
        } else if (data.keyPress == 'ctrl+shift+d') {
          if (!discoMode) {
            startDisco();
          } else {
            killDisco();
          }
        } else if (data.keyPress == 'ctrl+shift+h') {
          if (!hayMode) {
            startHay();
          } else {
            killHay();
          }
        } else if (data.keyPress == 'ctrl+shift+0') {
          sizeiframe(320,true);
        } else if (found == data.keyPress.match(/ctrl\+shift\+([1-9])/)) {
          var val = mqs[(found[1]-1)];
          var type = (val.indexOf("px") !== -1) ? "px" : "em";
          val = val.replace(type,"");
          var width = (type === "px") ? val*1 : val*$bodySize;
          sizeiframe(width,true);
        }
        return false;
      }
      
    }
    
  }
  window.addEventListener("message", receiveIframeMessage, false);

});
