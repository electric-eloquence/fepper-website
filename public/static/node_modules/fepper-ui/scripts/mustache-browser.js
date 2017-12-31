// Mustache code browser.
(function () {
  'use strict';

  const pd = parent.document;
  const codeFill = pd.getElementById('sg-code-fill');
  const codeTitle = pd.getElementById('sg-code-title-mustache');

  if (codeFill) {
    // Give the PL Mustache code viewer the appearance of being linked.
    codeFill.addEventListener('mouseover', () => {
      if (codeTitle.className.indexOf('sg-code-title-active') > -1) {
        codeFill.style.cursor = 'pointer';
      }
      else {
        codeFill.style.cursor = 'default';
      }
    });

    // Send to Fepper's Mustache browser when clicking the viewer's Mustache code.
    codeFill.addEventListener('click', () => {
      if (codeTitle.className.indexOf('sg-code-title-active') > -1) {
        // Remove padding from viewport bottom.
        pd.getElementById('sg-vp-wrap').style.paddingBottom = 0;

        // Close nav item.
        const sgView = pd.getElementById('sg-view');
        sgView.style.height = 'auto';
        sgView.classList.remove('active');

        let code = encodeURIComponent(codeFill.innerHTML);
        // HTML entities for mustacheBrowser.spanTokensStrip() to work.
        code = code.replace(/><</g, '>&lt;<');
        code = code.replace(/><\/</g, '>&lt;/<');
        code = code.replace(/><!--/g, '>&lt;!--');
        const title = pd.getElementById('title').innerHTML.replace('Pattern Lab - ', '');

        // Load Mustache Browser
        window.location = window.location.origin + '/mustache-browser/?title=' + title + '&code=' + code;
      }
    });
  }
})();
