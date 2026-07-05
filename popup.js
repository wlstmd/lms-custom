const lightBtn = document.getElementById("lightBtn");
const darkBtn = document.getElementById("darkBtn");
const slider = document.getElementById("slider");
const profCard = document.getElementById("profCard");

function setMode(isDark) {
  chrome.storage.local.set({ darkMode: isDark });
  updateToggleUI(isDark);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "setDarkMode",
        value: isDark,
      });
    }
  });
}

function updateToggleUI(isDark) {
  if (isDark) {
    darkBtn.classList.add("active");
    lightBtn.classList.remove("active");
    slider.classList.add("right");
  } else {
    lightBtn.classList.add("active");
    darkBtn.classList.remove("active");
    slider.classList.remove("right");
  }
}

chrome.storage.local.get(["darkMode"], (result) => {
  updateToggleUI(!!result.darkMode);
});

lightBtn.addEventListener("click", () => setMode(false));
darkBtn.addEventListener("click", () => setMode(true));

function renderProfessorInfo(data) {
  if (!data) {
    profCard.innerHTML = `<div class="prof-empty">이 페이지에서는<br>교수 정보를 찾을 수 없어요</div>`;
    return;
  }

  profCard.innerHTML = `
    ${data.courseName ? `<div class="prof-course">${data.courseName}</div>` : ""}
    <div class="prof-row">
      <span class="prof-icon">👨‍🏫</span>
      <span class="prof-label">교수</span>
      <span class="prof-value">${data.name || "-"}</span>
    </div>
    <div class="prof-row">
      <span class="prof-icon">📞</span>
      <span class="prof-label">연구실</span>
      <span class="prof-value">${data.phone || "-"}</span>
    </div>
    <div class="prof-row">
      <span class="prof-icon">✉️</span>
      <span class="prof-label">이메일</span>
      <span class="prof-value">
        ${
          data.email
            ? `<a href="mailto:${data.email}" title="메일 보내기">${data.email}</a>`
            : "-"
        }
      </span>
    </div>
  `;
}

function extractProfessorInfo() {
  const table = document.querySelector("table.headerListPro");
  if (!table) return null;

  const row = table.querySelector("tbody tr");
  if (!row) return null;

  const cells = row.querySelectorAll("td");
  if (cells.length < 3) return null;

  const titleEl = document.querySelector("#headerContent h1");
  const courseName = titleEl
    ? titleEl.textContent.replace(/\s+/g, " ").trim()
    : "";

  return {
    courseName,
    name: cells[0].textContent.trim(),
    phone: cells[1].textContent.trim(),
    email: cells[2].textContent.trim(),
  };
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tabId = tabs[0]?.id;
  if (!tabId) {
    renderProfessorInfo(null);
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId, allFrames: true },
      func: extractProfessorInfo,
    },
    (results) => {
      if (chrome.runtime.lastError || !results) {
        renderProfessorInfo(null);
        return;
      }
      const found = results.map((r) => r.result).find((r) => r);
      renderProfessorInfo(found || null);
    }
  );
});