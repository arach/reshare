import 'webextension-polyfill';

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('background message', request);
  if (request.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab({ format: 'png' }).then(dataUrl => {
      console.log('dataUrl', dataUrl);
      sendResponse(dataUrl);
    });
    return true;
  }
  return false;
});
console.log('background loaded');
