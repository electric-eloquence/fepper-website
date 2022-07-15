'use strict';

const fetch = require('node-fetch');
const fs = require('fs-extra');
const html2json = require('html2json').html2json;
const json2html = require('html2json').json2html;
const marked = require('marked');

const conf = global.conf;
const gulp = global.gulp;
// Commonly used utility functions.
const utils = require('fepper-utils'); // https://www.npmjs.com/package/fepper-utils

class HtmlObj {
  constructor() {
    this.node = 'root';
    this.child = [];
  }
}

/**
 * Recurse through an html2json object to find a section of HTML.
 *
 * @param {string} sectionHeadingText - The section must be identified by heading text. There is no CSS id or class.
 * @param {object} html2jsonObj - The object returned by html2json.
 * @param {object|null} persistentObj_ - A mutating object persisting to return results. Not submitted at level 0.
 * @param {number} level - The level of recursion. Not submitted at level 0.
 * @returns {object} An html2json object containing the matched elements. Only returns at level 0.
 */
function sectionSelect(sectionHeadingText, html2jsonObj, persistentObj_ = null, level = 0) {
  if (!html2jsonObj || !(html2jsonObj instanceof Object) || !Array.isArray(html2jsonObj.child)) {
    return null;
  }

  const persistentObj = persistentObj_ || new HtmlObj();
  let matched = false;
  let endedSection = false;

  for (const child of html2jsonObj.child) {
    if (!child || !(child instanceof Object)) {
      continue;
    }

    if (child.node !== 'element') {
      continue;
    }

    // Look for an h3 tag with the sectionHeadingText. Select the elements between that and the next h3.
    if (!matched && child.tag && child.tag === 'h3') {
      if (Array.isArray(child.child) && child.child.length) {
        for (const childChild of child.child) {
          if (childChild.node === 'text' && childChild.text === sectionHeadingText) {
            persistentObj.child.push(child);

            matched = true;

            break;
          }
        }

        if (matched) {
          continue;
        }
      }
    }

    if (matched && !endedSection) {
      if (child.tag && child.tag === 'h3') {
        endedSection = true;

        break;
      }
      else {
        persistentObj.child.push(child);
      }
    }
    // Continue recursive search if match not found.
    else if (Array.isArray(child.child) && child.child.length) {
      sectionSelect(sectionHeadingText, child, persistentObj, level + 1);
    }

    if (endedSection) {
      break;
    }
  }

  if (level === 0) {
    return persistentObj;
  }
}

function scrapeAndWriteContent(sectionHeadingText) {
  let htmlFromMd;

  fetch('https://raw.githubusercontent.com/electric-eloquence/fepper/dev/README.md')
    .then((response) => {
      if (response.ok) {
        return response.text();
      }
      else {
        return Promise.reject(response);
      }
    })
    .then((output) => {
      try {
        htmlFromMd = marked.parse(output);
      }
      catch (err) /* istanbul ignore next */ {
        utils.error(err);

        return Promise.reject(err);
      }

      const html2jsonObj = html2json(htmlFromMd);
      const sectionObj = sectionSelect(sectionHeadingText, html2jsonObj);
      // eslint-disable-next-line no-useless-escape
      const filenameSuffix = sectionHeadingText.replace(/[ \.]/g, '-').toLowerCase();
      const html4file = json2html(sectionObj)
        .replace(/\{\{/g, '&lcub;&lcub;')
        .replace(/\}\}/g, '&rcub;&rcub;');

      fs.outputFileSync(
        `${conf.ui.paths.source.patterns}/02-components/content/content-docpage-${filenameSuffix}.mustache`, html4file);
    })
    .catch((err) => {
      if (err && err.status && err.statusText) {
        utils.error(`HTTP ${err.status}: ${err.statusText}`);
      }
      else {
        utils.error(err);
      }
    });
}

gulp.task('fetch-docpage-content', function (cb) {
  scrapeAndWriteContent('Install');
  scrapeAndWriteContent('Configure');
  scrapeAndWriteContent('Run');
  scrapeAndWriteContent('Update');
  scrapeAndWriteContent('Global Data');
  scrapeAndWriteContent('Partial Data');
  scrapeAndWriteContent('Markdown Content');
  scrapeAndWriteContent('Code Viewer');
  scrapeAndWriteContent('Requerio Inspector');
  scrapeAndWriteContent('Static Site Generator');
  scrapeAndWriteContent('The Backend');
  scrapeAndWriteContent('Templater');
  scrapeAndWriteContent('Webserved Directories');
  scrapeAndWriteContent('HTML Scraper');
  scrapeAndWriteContent('variables.styl');
  scrapeAndWriteContent('UI Customization');
  scrapeAndWriteContent('Extensions');
  scrapeAndWriteContent('Express App');
  scrapeAndWriteContent('Mobile Devices');
  scrapeAndWriteContent('I18N');
  scrapeAndWriteContent('Keyboard Shortcuts');

  cb();
});

gulp.task('fetch-docpage-content:help', function (cb) {
  let out = `
Fepper Website Docpage Content Fetcher

Use:
    <task> [<additional args>...]

Tasks:
    fp fetch-docpage-content         Retrieve content for the Fepper website's documentation pages.
                                     Fetched from README.md of Fepper's main distro as hosted on GitHub.com.
    fp fetch-docpage-content:help    Print help text for fp fetch-docpage-content.
`;

  utils.info(out);
  cb();
});
