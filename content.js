(function initDarkMode() {
  chrome.storage.local.get(["darkMode"], (result) => {
    if (result.darkMode) {
      document.documentElement.classList.add("kmu-dark-mode");
    }
  });
})();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setDarkMode") {
    if (message.value) {
      document.documentElement.classList.add("kmu-dark-mode");
    } else {
      document.documentElement.classList.remove("kmu-dark-mode");
    }
    sendResponse({ status: "ok" });
  }
});