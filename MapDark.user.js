// ==UserScript==
// @name         Map Dark
// @namespace    https://github.com/autergame/
// @version      2.2.0
// @description  Modify wplace.live map with theme selection
// @author       Auter
// @license      MIT
// @match        *://*.wplace.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wplace.live
// @homepageURL  https://github.com/autergame/WplacePlugins
// @updateURL    https://raw.githubusercontent.com/autergame/WplacePlugins/main/MapDark.user.js
// @downloadURL  https://raw.githubusercontent.com/autergame/WplacePlugins/main/MapDark.user.js
// @run-at       document-start
// ==/UserScript==

(async function() {
    "use strict";

    let mapTheme = localStorage.getItem("MapTheme");
    if (!["liberty-wplace", "bright-wplace", "dark-black-wplace", "dark-blue-wplace", "bright-maptiler", "dark-black-maptiler", "dark-blue-maptiler", "satellite-maptiler"].includes(mapTheme)) {
        mapTheme = "liberty-wplace";
    }

    let mapKey = localStorage.getItem("MapKey");
    if (!mapKey) {
        mapKey = window.prompt("Map Dark by Auter\nDeseja fornecer a chave de API do maptiler.com?\nÉ grátis, cancele se não quiser\nDo you want to provide the maptiler.com API key?\nIt's free, cancel if you don't want it");
        if (mapKey) {
            localStorage.setItem("MapKey", mapKey);
        } else {
            const useDefaultKey = window.confirm("Map Dark by Auter\nDeseja usar a chave de API padrão?\nDo you want to use the default API key?");
            if (useDefaultKey) {
                const keys = ["2PNMJQXawA9SeEOVz6xF", "NoiqJ3rVMUuTXIW6xGJN", "RVv9BDpBq2DgLoRCO8lA"];
                localStorage.setItem("MapKey", keys[Math.floor(Math.random() * keys.length)]);
            } else {
                    localStorage.setItem("MapKey", "nope");
            }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.reload();
    }

    const windowFetch = window.fetch;
    const unsafeWindowFetch = unsafeWindow.fetch;

    unsafeWindow.fetch = async function(...args) {
        if (args[0]?.url && args[0]?.url === "https://maps.wplace.live/styles/liberty") {
            let url;
            switch (mapTheme) {
                case "dark-black-maptiler":
                    url = "https://api.maptiler.com/maps/backdrop-dark/style.json?key=" + mapKey;
                    break;
                case "dark-blue-maptiler":
                    url = "https://api.maptiler.com/maps/streets-v2-dark/style.json?key=" + mapKey;
                    break;
                case "satellite-maptiler":
                    url = "https://api.maptiler.com/maps/hybrid/style.json?key=" + mapKey;
                    break;
                case "bright-maptiler":
                    url = "https://api.maptiler.com/maps/bright-v2/style.json?key=" + mapKey;
                    break;
                case "dark-black-wplace":
                    url = "https://maps.wplace.live/styles/dark";
                    break;
                case "dark-blue-wplace":
                    url = "https://maps.wplace.live/styles/fiord";
                    break;
                case "bright-wplace":
                    url = "https://maps.wplace.live/styles/bright";
                    break;
                case "liberty-wplace":
                default:
                    // url = args[0]?.url;
                    url = "https://maps.wplace.live/styles/liberty";
                    break;
            }
            return unsafeWindowFetch(url);
        } else if (args[0]?.url && args[0]?.url.includes("api.maptiler.com")) {
            return windowFetch(...args);
        } else {
            return unsafeWindowFetch(...args);
        }
    };

    unsafeWindow.changeMapTheme = function(event) {
        const theme = event.target.getAttribute("data-theme");
        localStorage.setItem("MapTheme", theme);
        window.location.reload();
    }

    const observer = new MutationObserver((changes, observer) => {
        const selector = document.querySelector("div.flex.flex-col.items-center.gap-3");
        if (selector) {
            observer.disconnect();

            let svgFill = "#000000";
            let btnBackgroundColor = null;
            switch (mapTheme) {
                case "liberty-wplace":
                    svgFill = "#000000";
                    btnBackgroundColor = "#ffffff";
                    break;
                case "bright-wplace":
                    svgFill = "#000000";
                    btnBackgroundColor = "#cccccc";
                    break;
                case "dark-black-wplace":
                    svgFill = "#ffffff";
                    btnBackgroundColor = "#000000";
                    break;
                case "dark-blue-wplace":
                    svgFill = "#ffffff";
                    btnBackgroundColor = "#000055";
                    break;
                case "bright-maptiler":
                    svgFill = "#000000";
                    btnBackgroundColor = "#555555";
                    break;
                case "dark-black-maptiler":
                    svgFill = "#ffffff";
                    btnBackgroundColor = "#000000";
                    break;
                case "dark-blue-maptiler":
                    svgFill = "#ffffff";
                    btnBackgroundColor = "#000055";
                    break;
                case "satellite-maptiler":
                    svgFill = "#000000";
                    btnBackgroundColor = "#0a7346";
                    break;
            }

            const builtInThemesWplace = [
                { id: 'liberty-wplace', name: 'Liberty Wplace' },
                { id: 'bright-wplace', name: 'Bright Wplace' },
                { id: "dark-black-wplace", name: "Dark Black Wplace" },
                { id: "dark-blue-wplace", name: "Dark Blue Wplace" },
            ];
            const builtInThemesMaptiler = [
                { id: 'bright-maptiler', name: 'Bright Maptiler' },
                { id: "dark-black-maptiler", name: "Dark Black Maptiler" },
                { id: "dark-blue-maptiler", name: "Dark Blue Maptiler" },
                { id: "satellite-maptiler", name: "Satellite Maptiler" },
            ];
            let builtInThemes = builtInThemesWplace;
            if (mapKey && mapKey !== "nope") {
                builtInThemes = builtInThemes.concat(builtInThemesMaptiler);
            }

            let menuItemsHTML = builtInThemes.map(theme => {
                const activeClass = mapTheme === theme.id ? "active" : "";
                return `<li><a class="${activeClass}" data-theme="${theme.id}" onclick="window.changeMapTheme(event);">${theme.name}</a></li>`;
            }).join("");

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
        }
    });
    observer.observe(document, {childList: true, subtree: true});
})();
