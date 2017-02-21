var isClear = false;

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    "title": "保存到github",
    "contexts": ["all"],
    "id": "context_bookmark"
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab){
  if (info.menuItemId === 'context_bookmark') {
    getTabInfo();
  }
});

chrome.tabs.onActivated.addListener(function(info){
  console.log('window: ' + info.tabId + ':' + info.windowId + ' actived');
  resetBadge();
});

chrome.browserAction.onClicked.addListener(function(e) {
  getTabInfo();
});

function getTabInfo() {
  chrome.tabs.query({active: true}, function(tabs) {
    var tab = tabs[0];
    renderStatus('current is : ' + tab.title + "&&" + tab.url);
    isStored(tab.title, function() {
      sendData(tab.url, tab.title);
      renderStatus('send request');
    });
  });
}

function renderStatus(statusText) {
  console.log(statusText);
}

function sendData(url, title) {
  var sendUrl = 'http://localhost:3117?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title);
  var httpRequest = new XMLHttpRequest();

  if (!httpRequest) {
    renderStatus('Giving up :( Cannot create an XMLHTTP instance');
    return false;
  }
  httpRequest.responseType = 'json';
  httpRequest.onreadystatechange = function(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        if (httpRequest.response.code === 0) {
          renderStatus('success');
          saveToStorage(title)
          setBadge('S');
        }
        else {
          renderStatus('Server response error');
          setBadge('F');
        }
      } else {
        renderStatus('There was a problem with the request.');
        setBadge('F');
      }
    }
  };
  httpRequest.open('GET', sendUrl, true);

  httpRequest.send(null);
}

function saveToStorage(title) {
  var dataToSave = {};
  dataToSave[title] = new Date().getDate();
  chrome.storage.local.set(dataToSave);

  !isClear && clearStorage();
}

function isStored(title, callback) {
  chrome.storage.local.get(title, function(items) {
    //console.dir(items);
    if(items[title]) {
      setBadge('S')
    }
    else {
      callback();
    }
  });
}

function clearStorage() {
  chrome.storage.local.get('t', function(items) {
    //console.dir(items);
    if(items['t']) {
      if (new Date().getTime() - items['t'] < 1000*60*60*24*30){
        chrome.storage.local.clear();
        chrome.storage.local.set({'t': new Date()});
      }
    }
    else {
      chrome.storage.local.set({'t': new Date().getTime()});
    }
    isClear = true;
  });
}

function setBadge(text) {
  chrome.browserAction.setBadgeText({
    text: text
  });
}

function resetBadge() {
  chrome.browserAction.setBadgeText({
    text: ''
  });
}