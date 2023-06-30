import { getCurrentTab } from "./utils.js";
// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newbookmarkElement = document.createElement("div");
    const controlsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    controlsElement.className = "bookmark-controls";

    newbookmarkElement.id = "bookmark-" + bookmark.time;
    newbookmarkElement.className = "bookmark";
    newbookmarkElement.setAttribute("timestamp", bookmark.time);

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newbookmarkElement.appendChild(bookmarkTitleElement);
    newbookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newbookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";

    if(currentBookmarks.length > 0) {
        for(let i=0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            if(bookmark && !bookmark.time) {
                console.log(bookmark);
                console.log(currentBookmarks);
            }
            if(bookmark.time) addNewBookmark(bookmarksElement, bookmark)
        }
    }
    else {
        bookmarksElement.innerHTML = `<i class="row">No bookmarks to show</i>`;
    }
};

const onPlay = e => {
    (async()=> {
        const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
        const activeTab = await getCurrentTab();
        if(activeTab) await chrome.tabs.sendMessage(activeTab.id, {
            type: "PLAY",
            value: bookmarkTime
        });
    })().catch(err => {
        console.log(err);
    });
};

const onDelete = e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    (async() => {
        const activeTab = await getCurrentTab();
        const currentVideoBookmarks = await chrome.tabs.sendMessage(activeTab.id, {
            type: "DELETE",
            value: bookmarkTime
        });
        console.log(currentVideoBookmarks);
        return currentVideoBookmarks;
    })()
    .then((currentVideoBookmarks) => {
        console.log(currentVideoBookmarks);
        const bookmarksElementToDelete = document.getElementById("bookmark-"+bookmarkTime);
        bookmarksElementToDelete.parentNode.removeChild(bookmarksElementToDelete);
    })
    .catch(err => {
        console.log(err);
    });
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");

    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getCurrentTab();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    if(activeTab.url.includes("youtube.com/watch") && currentVideo) {
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            viewBookmarks(currentVideoBookmarks);
            // console.log(currentVideoBookmarks);
        });
    }
    else {
        const container = document.getElementsByClassName("container")[0];

        container.innerHTML = '<div class="title">This is not a youtube video page</div>';
    }
});
