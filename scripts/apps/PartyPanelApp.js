import { openSheet, selectToken } from "../actions.js";
import { setupLuckTracker, setupHealthPointsTracker } from "../helpers.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class PartyPanelApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "party",
        tag: "div",
        window: {
            frame: false,
            positioned: false,
        },
    }

    static PARTS = {
        main: {
            template: "modules/lights-out-theme-shadowdark/templates/party.hbs"
        }
    }

    constructor(data = {}, options = {}) {
        super(options);
        this.partyData = data;
    }

    updateData(data) {
        this.partyData = data;
        this.render();
    }

    _prepareContext(options) {
        return {
            characters: this.partyData
        };
    }

    _insertElement(element) {
        const existing = document.getElementById(element.id);
        
        const container = document.querySelector("#ui-left");
        
        if (!container) {
            console.warn("Target container #ui-left not found");
            return;
        }
        
        if (existing) {
            if (existing.parentElement !== container) {
                existing.remove();
                container.appendChild(element);
            } else {
                existing.replaceWith(element);
            }
        } else {
            container.appendChild(element);
        }
    }

    _onRender(context, options) {
        // Event listener for opening the character sheet
        const character = document.querySelectorAll("#party .character-picture");
        if (character.length > 0) {
            character.forEach(el => {
                el.addEventListener("click", selectToken);
                el.addEventListener("dblclick", openSheet);
            });
        }
   
        /*
        setupHealthPointsTracker("#current-health");
        */
    }
}