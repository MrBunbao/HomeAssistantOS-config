// We need a 'locationchange' event
(function () {
  const pushState = history.pushState;
  history.pushState = function () {
    pushState.apply(history, arguments);
    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationchange"));
  };
})();

function checkShouldRestart() {
  const urlSearchParams = new URLSearchParams(location.search);
  if (urlSearchParams.get("shouldRestart") !== "1") {
    return;
  }
  console.warn(
    "Found ?shouldRestart=1 in URL, restarting Home Assistant Core..."
  );
  // Clear shouldRestart parameter from URL
  const newUrl = new URL(document.location.href);
  newUrl.search = "";
  history.pushState({}, "", newUrl);

  hassConnection.then(({ conn }) => {
    console.warn("Sending restart command...");
    conn.socket.send(
      JSON.stringify({
        type: "execute_script",
        sequence: [
          {
            service: "homeassistant.restart",
            data: {},
          },
        ],
        id: ++conn.commandId,
      })
    );
  });
}

window.addEventListener("locationchange", checkShouldRestart);
checkShouldRestart();

// Persistent settings across multiple devices / sessions
// ------------------------------------------------------
(function () {
  // Visit /profile?edit=1 to change your settings, then update them here.
  const settings = {
    // defaultPanel: '"lovelace"',
    // dockedSidebar: '"docked"',
    // enableShortcuts: "true",
    // hiddenTabs: "{}",
    // selectedLanguage: "null",
    // selectedTheme: '{"dark":true}',
    // sidebarHiddenPanels: '[]',
    // sidebarPanelOrder:
    //   '["lovelace","hacs","logbook", "..."]',
    // suspendWhenHidden: "true",
    // vibrate: "true",
    defaultPanel: '"lovelace"',
    dockedSidebar: '"docked"',
    enableShortcuts: "true",
    hiddenTabs: "{}",
    selectedLanguage: "null",
    selectedTheme: '{"dark":true}',
    sidebarHiddenPanels:
      '["logbook","energy","map","history","cebe7a76_hassio_google_drive_backup"]',
    sidebarPanelOrder:
      '["hacs","lovelace","core_configurator","a0d7b954_vscode","a0d7b954_ssh","media-browser","browser-mod","developer-tools/yaml?shouldRestart=1"]',
    suspendWhenHidden: "true",
    vibrate: "true",
  };
  let settingsUpdated = false;
  const currentSettings = {};
  Object.keys(settings).forEach((key) => {
    currentSettings[key] = localStorage.getItem(key);
    if (currentSettings[key] !== settings[key]) {
      localStorage.setItem(key, settings[key]);
      settingsUpdated = true;
    }
  });
  const urlSearchParams = new URLSearchParams(location.search);
  if (!settingsUpdated) {
    console.log("Settings are up to date.");
    return;
  }
  if (urlSearchParams.get("edit") === "1") {
    console.warn(
      "Settings updated:\n",
      JSON.stringify(currentSettings, null, 2)
    );
  } else {
    console.warn("Settings updated, reloading page...");
    location.reload();
  }
})();