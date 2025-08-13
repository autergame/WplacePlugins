// ==UserScript==
// @name         Map Dark
// @namespace    https://github.com/autergame/
// @version      2.3.0
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
	satellite_maptiler: {
		url: "https://api.maptiler.com/maps/hybrid/style.json?key=",
		iconColor: "#000000",
		buttonBackground: "#0a7346",
		name: "Satellite Maptiler",
		mapTiler: true,
	},
};

const defaultTheme = "liberty_wplace";
const originalThemeUrl = "https://maps.wplace.live/styles/liberty";

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

	unsafeWindow.fetch = async function (configArg, ...restArg) {
		if (configArg?.url && configArg?.url === originalThemeUrl) {
			const url = selectedTheme.mapTiler ? selectedTheme.url + mapKey : selectedTheme.url;
			return unsafeWindowFetch(url);
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

	const observer = new MutationObserver((changes, observer) => {
		const selector = document.querySelector("div.flex.flex-col.items-center.gap-3");
		if (selector) {
			observer.disconnect();

			const menuItemsHTML = Object.entries(themesMap).map(([id, theme]) => {
				if (theme.mapTiler && !mapKey) return "";
				const activeClass = mapTheme === id ? "active" : "";
				return `<li><a class="${activeClass}" data-theme="${id}" onclick="window.changeMapTheme(event);">${theme.name}</a></li>`;
			}).join("");

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

            document.querySelector("#map canvas").style.backgroundColor = "black"
		}
	});
	observer.observe(document, { childList: true, subtree: true });
})();
