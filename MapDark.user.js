// ==UserScript==
// @name         Map Dark
// @namespace    https://github.com/autergame/
// @version      1.0.0
// @description  Modify wplace.live map to dark mode
// @author       Auter
// @license      MIT
// @match        *://wplace.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wplace.live
// @homepageURL  https://github.com/autergame/WplacePlugins
// @updateURL    https://raw.githubusercontent.com/autergame/WplacePlugins/main/MapDark.user.js
// @downloadURL  https://raw.githubusercontent.com/autergame/WplacePlugins/main/MapDark.user.js
// @run-at       document-start
// ==/UserScript==

(async function() {
    'use strict';

    let mapTheme = localStorage.getItem("MapTheme");

    const originalFetch = unsafeWindow.fetch;
    unsafeWindow.fetch = async (...arg) => {
        if (arg[0]?.url === "https://tiles.openfreemap.org/styles/liberty") {
            let url = "";
            switch (mapTheme) {
                case "dark":
                    url = "https://tiles.openfreemap.org/styles/dark";
                    break;
                case "fiord":
                    url = "https://tiles.openfreemap.org/styles/fiord";
                    break;
                default:
                    url = arg[0]?.url;
                    break;
            }
            return originalFetch(url);
        } else {
            return originalFetch(...arg);
        }
    }

    unsafeWindow.mapThemeLabels = ["liberty", "dark", "fiord"];
    unsafeWindow.mapThemeIndex = unsafeWindow.mapThemeLabels.findIndex((val) => { return val === mapTheme; });
    if (unsafeWindow.mapThemeIndex === -1) {
        unsafeWindow.mapThemeIndex = 0;
    }

    unsafeWindow.changeMapTheme = function() {
        unsafeWindow.mapThemeIndex++;
        if (unsafeWindow.mapThemeIndex === unsafeWindow.mapThemeLabels.length) {
            unsafeWindow.mapThemeIndex = 0;
        }
        const label = unsafeWindow.mapThemeLabels[unsafeWindow.mapThemeIndex];
        localStorage.setItem("MapTheme", label);
        window.location.reload();
    }

    const observer = new MutationObserver((changes, observer) => {
        const selector = document.querySelector("div.flex.flex-col.items-center.gap-3");
        if (selector) {
            observer.disconnect();

            let svgFill = "#000000";
            let btnBackgroundColor = null;
            switch (mapTheme) {
                case "dark":
                    svgFill = "#ffffff";
                    btnBackgroundColor = "#000000";
                    break;
                case "fiord":
                    svgFill = "#ffffff";
                    btnBackgroundColor = "#000055";
                    break;
            }

            const element = document.createElement("div");
            selector.appendChild(element);
            element.outerHTML =
            `<div class="indicator">
            <button id="map-theme-btn" class="btn btn-square relative shadow-md" onclick="window.changeMapTheme();" title="Map Dark Mode" style="background-color: ${btnBackgroundColor}">
            <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="${svgFill}">
            <path d="M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142 3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.003 9.003 0 0 1 12 11.807z"/>
            </svg>
            </button>
            </div>`;
        }
    });
    observer.observe(document, {childList: true, subtree: true});
})();
