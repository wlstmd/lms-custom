const lightBtn = document.getElementById("lightBtn");
const darkBtn = document.getElementById("darkBtn");

function setMode(isDark) {
  chrome.storage.local.set({ darkMode: isDark });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "setDarkMode",
        value: isDark,
      });
    }
  });
}

lightBtn.addEventListener("click", () => setMode(false));
darkBtn.addEventListener("click", () => setMode(true));