chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    (async () => {
        if (tab && tab.url && tab.url.includes("youtube.com/watch")){
          const queryParameters = tab.url.split("?")[1];
          const urlParameters = new URLSearchParams(queryParameters);
          const message = {
            type: "NEW",
            videoId: urlParameters.get("v"),
          }
          console.log(message.type + ' ' + message.videoId);
          await chrome.tabs.sendMessage(tabId, message);
        }
        else console.log("do nothing");
      })().catch(err => {
        console.log("sendMessage failed");
        console.log(err);
      }) ;
});
