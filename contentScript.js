(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const { type, value, videoId } = request;
        if (request.type === "NEW") {
            currentVideo = videoId;
            console.log(currentVideo);
            newVideoLoaded();
        }
        else if(type === "PLAY") {
            youtubePlayer.currentTime = value;
        }
        else if(type === "DELETE") {
            currentVideoBookmarks = currentVideoBookmarks.filter(b => b.time != value);
            console.log("delete", currentVideoBookmarks);
            chrome.storage.sync.set({
                [currentVideo]: JSON.stringify(currentVideoBookmarks)
            });
            sendResponse(currentVideoBookmarks);
        }
    });

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    }

    const newVideoLoaded = async() => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.setAttribute('id', "ytp-bookmark-btn");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            youtubeLeftControls.append(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }

        currentVideoBookmarks = await fetchBookmarks();
    }

    const addNewBookmarkEventHandler = async() => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };

        currentVideoBookmarks = await fetchBookmarks();

        console.log(newBookmark);
        console.log(currentVideo);


        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    }
})();

const getTime = t => {
    var date = new Date(null);
    date.setSeconds(t);
    return date.toISOString().substr(11, 8);
}