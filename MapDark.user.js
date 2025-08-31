// ==UserScript==
// @name         Map Dark
// @namespace    https://github.com/autergame/
// @version      3.1.0
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

const themesMap = {
    liberty_wplace: {
        url: "https://maps.wplace.live/styles/liberty",
        iconColor: "#000000",
        buttonBackground: "#ffffff",
        name: "Liberty Wplace",
        mapTiler: false,
    },
    bright_wplace: {
        url: "https://maps.wplace.live/styles/bright",
        iconColor: "#000000",
        buttonBackground: "#ffffff",
        name: "Bright Wplace",
        mapTiler: false,
    },
    dark_black_wplace: {
        url: "https://maps.wplace.live/styles/dark",
        iconColor: "#ffffff",
        buttonBackground: "#000000",
        name: "Dark Black Wplace",
        mapTiler: false,
    },
    dark_blue_wplace: {
        url: "https://maps.wplace.live/styles/fiord",
        iconColor: "#ffffff",
        buttonBackground: "#000055",
        name: "Dark Blue Wplace",
        mapTiler: false,
    },
    bright_maptiler: {
        url: "https://api.maptiler.com/maps/bright-v2/style.json?key=",
        iconColor: "#000000",
        buttonBackground: "#555555",
        name: "Bright Maptiler",
        mapTiler: true,
    },
    dark_black_maptiler: {
        url: "https://api.maptiler.com/maps/backdrop-dark/style.json?key=",
        iconColor: "#ffffff",
        buttonBackground: "#000000",
        name: "Dark Black Maptiler",
        mapTiler: true,
    },
    dark_blue_maptiler: {
        url: "https://api.maptiler.com/maps/streets-v2-dark/style.json?key=",
        iconColor: "#ffffff",
        buttonBackground: "#000055",
        name: "Dark Blue Maptiler",
        mapTiler: true,
    },
    //     satellite_maptiler: {
    //         url: "https://api.maptiler.com/maps/hybrid/style.json?key=",
    //         iconColor: "#000000",
    //         buttonBackground: "#0a7346",
    //         name: "Satellite Maptiler",
    //         mapTiler: true,
    //     },
};

const defaultTheme = "dark_black_wplace";
const originalThemeUrl = "https://maps.wplace.live/styles/liberty";

function waitForElement(selector) {
    return new Promise(resolve => {
        const observer = new MutationObserver(mutations => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

(async function () {
    "use strict";

    const storedMapTheme = localStorage.getItem("MapTheme");
    const mapTheme = storedMapTheme in themesMap ? storedMapTheme : defaultTheme;
    const selectedTheme = themesMap[mapTheme];

    let mapKey = localStorage.getItem("MapKey");
    if (!mapKey) {
        mapKey = window.prompt("Map Dark by Auter\nDeseja fornecer a chave de API do maptiler.com?\nÉ grátis, cancele se não quiser\nDo you want to provide the maptiler.com API key?\nIt's free, cancel if you don't want it");

        if (mapKey) {
            localStorage.setItem("MapKey", mapKey);
        } else {
            const useDefaultKey = window.confirm("Map Dark by Auter\nDeseja usar a chave de API padrão?\nDo you want to use the default API key?");

            if (useDefaultKey) {
                const keys = [
                    "2PNMJQXawA9SeEOVz6xF",
                    "NoiqJ3rVMUuTXIW6xGJN",
                    "RVv9BDpBq2DgLoRCO8lA"
                ];
                const key = keys[Math.floor(Math.random() * keys.length)];
                localStorage.setItem("MapKey", key);
            } else {
                localStorage.setItem("MapKey", "nope");
                localStorage.setItem("MapTheme", defaultTheme);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.reload();
    }

    const customNoLabel = localStorage.getItem("Custom-NoLabel") === "true";

    const customColor = {
        background: localStorage.getItem("Custom-Color-Background"),
        water: localStorage.getItem("Custom-Color-Water"),
    };

    const windowFetch = window.fetch;
    const unsafeWindowFetch = unsafeWindow.fetch;

    unsafeWindow.fetch = async function (configArg, ...restArg) {
        if (configArg?.url && configArg?.url === originalThemeUrl) {
            let response;

            if (selectedTheme.mapTiler) {
                const url = selectedTheme.url + mapKey;
                response = await unsafeWindowFetch(url);

                if (!response.ok) {
                    window.alert("Map Dark by Auter\nAlgo de errado aconteceu com o Maptiler, desativando\nSomething wrong happened with Maptiler, disabling");
                    localStorage.removeItem("MapKey");
                    window.location.reload();
                }
            } else {
                response = await unsafeWindowFetch(selectedTheme.url);
            }

            const style = await response.json();

            let layersMod;
            if (customNoLabel) {
                layersMod = style.layers.filter((layer) => {
                    return !(layer.layout && (layer.layout["text-field"] !== undefined));
                });
            } else {
                layersMod = style.layers;
            }

            if (selectedTheme.mapTiler) {
                if (customColor.background) {
                    const backgroundIndex = layersMod.findIndex((layer) => layer.id === "Background");
                    layersMod[backgroundIndex].paint["background-color"] = customColor.background;
                }
                if (customColor.water) {
                    const waterIndex = layersMod.findIndex((layer) => layer.id === "Water");
                    layersMod[waterIndex].paint["fill-color"] = customColor.water;
                }
            } else {
                if (customColor.background) {
                    const backgroundIndex = layersMod.findIndex((layer) => layer.id === "background");
                    layersMod[backgroundIndex].paint["background-color"] = customColor.background;
                }
                if (customColor.water) {
                    const waterIndex = layersMod.findIndex((layer) => layer.id === "water");
                    layersMod[waterIndex].paint["fill-color"] = customColor.water;
                }
            }

            const styleMod = {
                ...style,
                layers: layersMod
            };

            const modifiedResponse = new Response(JSON.stringify(styleMod), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });

            return modifiedResponse;
        } else if (configArg?.url && configArg?.url.includes("api.maptiler.com")) {
            return windowFetch(configArg, ...restArg);
        } else {
            return unsafeWindowFetch(configArg, ...restArg);
        }
    };

    unsafeWindow.changeMapTheme = function (event) {
        const theme = event.target.getAttribute("data-theme");
        localStorage.setItem("MapTheme", theme);
        window.location.reload();
    }

    unsafeWindow.resetPlugin = function () {
        localStorage.removeItem("MapKey");
        localStorage.removeItem("MapTheme");
        localStorage.removeItem("Custom-NoLabel");
        localStorage.removeItem("Custom-Color-Background");
        localStorage.removeItem("Custom-Color-Water");
        window.location.reload();
    }

    unsafeWindow.changeNoLabel = function (event) {
        localStorage.setItem("Custom-NoLabel", event.currentTarget.checked);
        window.location.reload();
    }

    unsafeWindow.changeColor = function (type, event) {
        localStorage.setItem(`Custom-Color-${type}`, event.currentTarget.value);
        window.location.reload();
    }

    const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
            if (mutation.target.className !== "flex flex-col gap-4 items-center") {
                return;
            }
            const selector = mutation.target.querySelector("div.flex.flex-col.items-center.gap-3");
            if (selector.querySelector("#map-theme-btn")) {
                return;
            }

            let menuItemsHTML = Object.entries(themesMap).map(([id, theme]) => {
                if (theme.mapTiler && mapKey === "nope") {
                    return "";
                }
                const activeClass = mapTheme === id ? "active" : "";
                return `
                    <li>
                        <a class="${activeClass}" data-theme="${id}" onclick="window.changeMapTheme(event);">${theme.name}</a>
                    </li>
                `;
            }).join("");

            menuItemsHTML += `
                <div class="flex items-center justify-between" style="padding-block: .375rem; padding-inline: .75rem;">
                    <span>No Label / Text</span><div class="flex items-center gap-2">
                        <div class="tooltip">
                            <input id="no_label" type="checkbox" ${customNoLabel ? "checked" : ""} class="btn btn-sm btn-circle" onchange="window.changeNoLabel(event);">
                        </div>
                    </div>
                </div>
            `;
            menuItemsHTML += `
                <div class="flex items-center justify-between" style="padding-block: .375rem; padding-inline: .75rem;">
                    <span>Backgroud Color</span><div class="flex items-center gap-2">
                        <div class="tooltip">
                            <input id="backgroud_color" type="color" value="${customColor.background || '#000000'}" class="btn btn-sm btn-circle" onchange="window.changeColor('Background', event);">
                        </div>
                    </div>
                </div>
            `;
            menuItemsHTML += `
                <div class="flex items-center justify-between" style="padding-block: .375rem; padding-inline: .75rem;">
                    <span>Water Color</span><div class="flex items-center gap-2">
                        <div class="tooltip">
                            <input id="water_color" type="color" value="${customColor.water || '#000000'}" class="btn btn-sm btn-circle" onchange="window.changeColor('Water', event);">
                        </div>
                    </div>
                </div>
            `;
            menuItemsHTML += `
                <li>
                    <a onclick="window.resetPlugin();">Reset Plugin Settings</a>
                </li>
            `;

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

            document.querySelector("html").style.backgroundColor = "black";
            document.querySelector("body").style.backgroundColor = "black";
            document.querySelector("#map canvas").style.backgroundColor = "black";
        }
    });

    const leftButtons = await waitForElement("body div.absolute.right-2.top-2.z-30");
    observer.observe(leftButtons, {
        childList: true,
        subtree: true
    });
})();
