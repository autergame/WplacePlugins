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

(async function() {
'use strict';

let mapTheme = localStorage.getItem("MapTheme");
if (mapTheme === null) {
    mapTheme = 'liberty';
}

const originalFetch = unsafeWindow.fetch;
unsafeWindow.fetch = async (...arg) => {
    if (arg[0]?.url === "https://tiles.openfreemap.org/styles/liberty") {
        let url;
        switch (mapTheme) {
            case "liberty":
                url = "https://tiles.openfreemap.org/styles/liberty";
                break;
            case "dark":
                url = "https://tiles.openfreemap.org/styles/dark";
                break;
            case "fiord":
                url = "https://tiles.openfreemap.org/styles/fiord";
                break;
            case "positron":
                url = "https://tiles.openfreemap.org/styles/positron";
                break;
            case "bright":
                url = "https://tiles.openfreemap.org/styles/bright";
                break;
            default:
                url = arg[0]?.url;
                break;
        }
        return originalFetch(url);
    } else {
        return originalFetch(...arg);
    }
};

const observer = new MutationObserver((changes, observer) => {
    const selector = document.querySelector("div.flex.flex-col.items-center.gap-3");
    if (selector) {
        observer.disconnect();

        let svgFill = "#000000";
        let btnBackgroundColor = null;
        switch (mapTheme) {
            case "bright":
            case "liberty":
                svgFill = "#000000";
                btnBackgroundColor = "#ffffff";
                break;
            case "dark":
                svgFill = "#ffffff";
                btnBackgroundColor = "#000000";
                break;
            case "positron":
                svgFill = "#000000";
                btnBackgroundColor = "#c3c8ca";
                break;
            case "fiord":
                svgFill = "#ffffff";
                btnBackgroundColor = "#000055";
                break;
        }

        const builtInThemes = [
            { id: 'liberty', name: 'Liberty' },
            { id: 'dark', name: 'Dark' },
            { id: 'bright', name: 'Bright' },
            { id: 'fiord', name: 'Fiord' },
            { id: 'positron', name: 'Positron' }
        ];

        let menuItemsHTML = builtInThemes.map(theme => {
            const activeClass = mapTheme === theme.id ? 'active' : '';
            return `<li><a class="${activeClass}" data-theme="${theme.id}">${theme.name}</a></li>`;
        }).join('');

        const element = document.createElement("div");
        selector.appendChild(element);
        element.outerHTML = `
        <div class="dropdown dropdown-end">
            <button id="map-theme-btn" class="btn btn-square relative shadow-md" tabindex="0" title="Map Theme" style="background-color: ${btnBackgroundColor}">
                <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="${svgFill}">
                    <path d="M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142 3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.003 9.003 0 0 1 12 11.807z"/>
                </svg>
            </button>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                ${menuItemsHTML}
            </ul>
        </div>
        `;

        document.querySelectorAll('[data-theme]').forEach(item => {
            item.addEventListener('click', function() {
                const theme = this.getAttribute('data-theme');
                localStorage.setItem("MapTheme", theme);
                window.location.reload();
            });
        });
    }
});
observer.observe(document, {childList: true, subtree: true});

})();
