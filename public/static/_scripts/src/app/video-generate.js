let isClient = false;

if (typeof window === 'object') {
  isClient = true;
}

export default async function*(logicalImages, $orgs, timeout) {
  const videoImgsOrg = $orgs['.video__img'];

  function dispatch(indices) {
    videoImgsOrg.dispatchAction('css', {display: 'none'}, indices[0]);
    videoImgsOrg.dispatchAction('css', {display: 'none'}, indices[1]);
    videoImgsOrg.dispatchAction('css', {display: 'none'}, indices[2]);

    videoImgsOrg.dispatchAction('attr', {src: '#'}, indices[0]);
    videoImgsOrg.dispatchAction('attr', {src: '#'}, indices[1]);
    videoImgsOrg.dispatchAction('attr', {src: '#'}, indices[2]);

    videoImgsOrg.dispatchAction('attr', {src: logicalImages['06'].src}, indices[3]);
    videoImgsOrg.dispatchAction('attr', {src: logicalImages['07'].src}, indices[4]);
    videoImgsOrg.dispatchAction('attr', {src: logicalImages['08'].src}, indices[5]);

    videoImgsOrg.dispatchAction('attr', {src: logicalImages['03'].src}, indices[6]);
    videoImgsOrg.dispatchAction('attr', {src: logicalImages['04'].src}, indices[7]);
    videoImgsOrg.dispatchAction('attr', {src: logicalImages['05'].src}, indices[8]);
  }

  function generate(indices, resolve) {
    setTimeout(() => {
      dispatch(indices);

      resolve();
    }, timeout);
  }

  // Generation 0
  await new Promise((resolve) => {
    function loadDeferredImages() {
      logicalImages['06'].src = '../../_assets/src/video-06.gif';
      logicalImages['07'].src = '../../_assets/src/video-07.gif';
      logicalImages['08'].src = '../../_assets/src/video-08.gif';

      videoImgsOrg.dispatchAction('attr', {src: logicalImages['03'].src}, 3);
      videoImgsOrg.dispatchAction('attr', {src: logicalImages['04'].src}, 4);
      videoImgsOrg.dispatchAction('attr', {src: logicalImages['05'].src}, 5);
    }

    // If the browser supports async generators, add the class to hide the browser advice to use an up-to-date browser.
    // Do this in conjunction with fully removing it.
    $orgs['#html'].dispatchAction('addClass', 'es2018');

    logicalImages['03'].src = '../../_assets/src/video-03.gif';
    logicalImages['04'].src = '../../_assets/src/video-04.gif';
    logicalImages['05'].src = '../../_assets/src/video-05.gif';

    if (isClient) {
      logicalImages['03'].onload = function () {
        if (logicalImages['04'].complete && logicalImages['05'].complete) {
          loadDeferredImages();
          resolve();
        }

        // Remove browser advice here, after all content has loaded, since browser advice was added by JavaScript.
        $orgs['#browser-advice'].remove();
      };

      logicalImages['04'].onload = () => {
        if (logicalImages['03'].complete && logicalImages['05'].complete) {
          loadDeferredImages();
          resolve();
        }
      };

      logicalImages['05'].onload = () => {
        if (logicalImages['03'].complete && logicalImages['04'].complete) {
          loadDeferredImages();
          resolve();
        }
      };
    }
    else {
      loadDeferredImages();
      resolve();
    }
  });

  yield 0;

  // Generation 1
  await new Promise((resolve) => {
    generate([3, 4, 5, 6, 7, 8, 9, 10, 11], resolve);
  });

  yield 1;

  // Generation 2
  await new Promise((resolve) => {
    generate([9, 10, 11, 12, 13, 14, 15, 16, 17], resolve);
  });

  yield 2;

  // Generation 3
  await new Promise((resolve) => {
    generate([15, 16, 17, 18, 19, 20, 21, 22, 23], resolve);
  });

  yield 3;

  // Generation 4
  await new Promise((resolve) => {
    generate([21, 22, 23, 24, 25, 26, 27, 28, 29], resolve);
  });

  yield 4;

  // Generation 5
  await new Promise((resolve) => {
    generate([27, 28, 29, 30, 31, 32, 33, 34, 35], resolve);
  });

  yield 5;

  // Generation 6
  await new Promise((resolve) => {
    generate([33, 34, 35, 36, 37, 38, 39, 40, 41], resolve);
  });

  yield 6;

  // Generation 7
  await new Promise((resolve) => {
    generate([39, 40, 41, 42, 43, 44, 45, 46, 47], resolve);
  });

  yield 7;

  // Generation 8
  await new Promise((resolve) => {
    generate([45, 46, 47, 48, 49, 50, 51, 52, 53], resolve);
  });

  yield 8;
}
