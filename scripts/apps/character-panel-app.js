const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class CharacterPanelApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "player-character",
        position: {
            width: 640,
            height: "auto",
        },
        tag: "div",
        window: {
            frame: false,
            positioned: false,
        },
    }

    static PARTS = {
        foo: {
            template: "modules/lights-out-theme-shadowdark/templates/character.hbs"
        }
    }

    constructor(data = {}, options = {}) {
        super(options);
        this.characterData = data;
    }

    updateData(data) {
        this.characterData = data;
        this.show();
        this.render();
    }

    show() {
        const elem = document.querySelector("#player-character");
        if (elem) {
            elem.classList.remove("fade-out");
            elem.classList.add("fade-in-up");
        }
    }

    hide() {
        const elem = document.querySelector("#player-character");
        if (elem) {
            elem.classList.remove("fade-in-up");
            elem.classList.add("fade-out");
        }
    }

    _prepareContext(options) {
        return {
            id: this.characterData.id,
            isPlayer: this.characterData.isPlayer,
            isToken: this.characterData.isToken,
            name: this.characterData.name,
            level: this.characterData.level,
            ancestry: this.characterData.ancestry,
            class: this.characterData.class,
            title: this.characterData.title,
            armor: this.characterData.armor,
            luck: this.characterData.luck,
            picture: this.characterData.picture,
            hp: this.characterData.hp,
            settings: this.characterData.settings,
            selected: this.characterData.selected,
        };
    }

    _insertElement(element) {
        console.log("Inserting element", element);
        const existing = document.getElementById(element.id);
        console.log("Existing element", existing);
        
        const container = document.querySelector("#ui-bottom");
        
        if (!container) {
            console.warn("Target container #ui-bottom not found");
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

    }

}