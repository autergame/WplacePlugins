// ==UserScript==
// @name         Map Dark
// @namespace    https://github.com/autergame/
// @version      1.0.1
// @description  Modify wplace.live map with theme selection
// @author       Auter
// @license      MIT
// @match        *://wplace.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wplace.live
// @homepageURL  https://github.com/autergame/WplacePlugins
// @updateURL    https://raw.githubusercontent.com/autergame/WplacePlugins/main/MapDark.user.js
// @downloadURL  https://raw.githubusercontent.com/autergame/WplacePlugins/main/MapDark.user.js
// @run-at       document-start
// ==/UserScript==

const themesMap = {
    liberty: {
        url: "https://maps.wplace.live/styles/liberty",
        iconColor: "#000000",
        buttonBackground: "#ffffff",
        name: "Liberty",
    },
    dark: {
        url: "https://maps.wplace.live/styles/dark",
        iconColor: "#ffffff",
        buttonBackground: "#000000",
        name: "Dark",
    },
    bright: {
        url: "https://maps.wplace.live/styles/bright",
        iconColor: "#000000",
        buttonBackground: "#ffffff",
        name: "Bright",
    },
};

const defaultTheme = "liberty";
const originalThemeUrlRe = /^https:\/\/maps\.wplace\.live\/styles\/\w+$/;

(async function() {
    'use strict';

    const storedMapTheme = localStorage.getItem("MapTheme");

    const mapTheme = storedMapTheme in themesMap ? storedMapTheme : defaultTheme

    const selectedTheme = themesMap[mapTheme]

    const originalFetch = unsafeWindow.fetch;
    unsafeWindow.fetch = async (configArg, ...restArg) => {
        if (originalThemeUrlRe.test(configArg?.url)) {
            return originalFetch(selectedTheme.url);
        } else {
            return originalFetch(configArg, ...restArg);
        }
    };

    unsafeWindow.changeMapTheme = function(event) {
        const theme = event.target.getAttribute('data-theme');
        localStorage.setItem("MapTheme", theme);
        window.location.reload();
    }

    const observer = new MutationObserver((_, observer) => {
        const selector = document.querySelector("div.flex.flex-col.items-center.gap-3");
        if (selector) {
            observer.disconnect();

            let menuItemsHTML = Object.entries(themesMap).map(([id, theme]) => {
                const activeClass = mapTheme === id ? 'active' : '';
                return `<li><a class="${activeClass}" data-theme="${id}" onclick="window.changeMapTheme(event);">${theme.name}</a></li>`;
            }).join('');

            const element = document.createElement("div");
            selector.appendChild(element);
            element.outerHTML = `
        <div class="dropdown dropdown-end">
            <button id="map-theme-btn" class="btn btn-square relative shadow-md" tabindex="0" title="Map Theme" style="background-color: ${selectedTheme.buttonBackground}">
                <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="${selectedTheme.iconColor}">
                    <path d="M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142 3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.003 9.003 0 0 1 12 11.807z"/>
                </svg>
            </button>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                ${menuItemsHTML}
            </ul>
        </div>
        `;
        }
    });
    observer.observe(document, {childList: true, subtree: true});
})();
