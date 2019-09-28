let isClient = false;
let isEdge = false;

if (typeof window === 'object') {
  isClient = true;
  isEdge = window.navigator.userAgent.indexOf('Edge') > -1;
}

export default function videoPromise(logicalImages, videoImgsOrg, timeout) {
  function cacheBust() {
    return `?${Date.now()}`;
  }

  function dispatch(memberIdxs) {
    videoImgsOrg.dispatchAction('css', {display: 'none'}, memberIdxs[0]);
    videoImgsOrg.dispatchAction('css', {display: 'none'}, memberIdxs[1]);
    videoImgsOrg.dispatchAction('css', {display: 'none'}, memberIdxs[2]);

    videoImgsOrg.dispatchAction('attr', {src: '#'}, memberIdxs[0]);
    videoImgsOrg.dispatchAction('attr', {src: '#'}, memberIdxs[1]);
    videoImgsOrg.dispatchAction('attr', {src: '#'}, memberIdxs[2]);

    videoImgsOrg.dispatchAction('attr', {src: logicalImages['06'].src}, memberIdxs[3]);
    videoImgsOrg.dispatchAction('attr', {src: logicalImages['07'].src}, memberIdxs[4]);
    videoImgsOrg.dispatchAction('attr', {src: logicalImages['08'].src}, memberIdxs[5]);

    videoImgsOrg.dispatchAction('attr', {src: logicalImages['03'].src}, memberIdxs[6]);
    videoImgsOrg.dispatchAction('attr', {src: logicalImages['04'].src}, memberIdxs[7]);
    videoImgsOrg.dispatchAction('attr', {src: logicalImages['05'].src}, memberIdxs[8]);
  }

  function generate(memberIdxs, resolve) {
    setTimeout(() => {
      if (isEdge) {
        logicalImages['03'].src = `../../_assets/src/video-03.gif${cacheBust()}`;
        logicalImages['04'].src = `../../_assets/src/video-04.gif${cacheBust()}`;
        logicalImages['05'].src = `../../_assets/src/video-05.gif${cacheBust()}`;
        logicalImages['06'].src = `../../_assets/src/video-06.gif${cacheBust()}`;
        logicalImages['07'].src = `../../_assets/src/video-07.gif${cacheBust()}`;
        logicalImages['08'].src = `../../_assets/src/video-08.gif${cacheBust()}`;
      }

      dispatch(memberIdxs);

      resolve();
    }, timeout);
  }

  return [
    // Iteration 0
    // Generation 0
    function () {
      return new Promise((resolve) => {
        logicalImages['03'].src = '../../_assets/src/video-03.gif';
        logicalImages['04'].src = '../../_assets/src/video-04.gif';
        logicalImages['05'].src = '../../_assets/src/video-05.gif';

        if (isClient) {
          logicalImages['03'].onload = function () {
            if (logicalImages['04'].complete && logicalImages['05'].complete) {
              resolve();
            }
          };

          logicalImages['04'].onload = () => {
            if (logicalImages['03'].complete && logicalImages['05'].complete) {
              resolve();
            }
          };

          logicalImages['05'].onload = () => {
            if (logicalImages['03'].complete && logicalImages['04'].complete) {
              resolve();
            }
          };
        }

        resolve();
      });
    },

    // Iteration 1
    // Generation 0
    function () {
      logicalImages['06'].src = '../../_assets/src/video-06.gif';
      logicalImages['07'].src = '../../_assets/src/video-07.gif';
      logicalImages['08'].src = '../../_assets/src/video-08.gif';

      videoImgsOrg.dispatchAction('attr', {src: logicalImages['03'].src}, 3);
      videoImgsOrg.dispatchAction('attr', {src: logicalImages['04'].src}, 4);
      videoImgsOrg.dispatchAction('attr', {src: logicalImages['05'].src}, 5);

      return Promise.resolve();
    },

    // Iteration 2
    // Generation 1
    function () {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (isEdge) {
            logicalImages['03'].src = `../../_assets/src/video-03.gif${cacheBust()}`;
            logicalImages['04'].src = `../../_assets/src/video-04.gif${cacheBust()}`;
            logicalImages['05'].src = `../../_assets/src/video-05.gif${cacheBust()}`;
          }

          dispatch([3, 4, 5, 6, 7, 8, 9, 10, 11]);

          resolve();
        }, timeout);
      });
    },

    // Iteration 3
    // Generation 2
    function () {
      return new Promise((resolve) => {
        generate([9, 10, 11, 12, 13, 14, 15, 16, 17], resolve);
      });
    },

    // Iteration 4
    // Generation 3
    function () {
      return new Promise((resolve) => {
        generate([15, 16, 17, 18, 19, 20, 21, 22, 23], resolve);
      });
    },

    // Iteration 5
    // Generation 4
    function () {
      return new Promise((resolve) => {
        generate([21, 22, 23, 24, 25, 26, 27, 28, 29], resolve);
      });
    },

    // Iteration 6
    // Generation 5
    function () {
      return new Promise((resolve) => {
        generate([27, 28, 29, 30, 31, 32, 33, 34, 35], resolve);
      });
    },

    // Iteration 7
    // Generation 6
    function () {
      return new Promise((resolve) => {
        generate([33, 34, 35, 36, 37, 38, 39, 40, 41], resolve);
      });
    },

    // Iteration 8
    // Generation 7
    function () {
      return new Promise((resolve) => {
        generate([39, 40, 41, 42, 43, 44, 45, 46, 47], resolve);
      });
    },

    // Iteration 9
    // Generation 8
    function () {
      return new Promise((resolve) => {
        generate([45, 46, 47, 48, 49, 50, 51, 52, 53], resolve);
      });
    }
  ];
}
