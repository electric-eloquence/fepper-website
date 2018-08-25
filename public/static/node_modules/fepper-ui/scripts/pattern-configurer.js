if (document.body) {
  const reloader = document.createElement('script');
  const l = window.location;

  reloader.setAttribute('src', l.protocol + '//' + l.hostname + ':' + window.portReloader + '/livereload.js');
  document.body.appendChild(reloader);
}
