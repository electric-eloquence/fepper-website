if (document.body) {
  var reloader = document.createElement('script');
  var l = window.location;

  reloader.setAttribute('src', l.protocol + '//' + l.hostname + ':' + window.portReloader + '/livereload.js');
  document.body.appendChild(reloader);
}
