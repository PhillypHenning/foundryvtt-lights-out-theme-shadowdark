const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class TestApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "player-character",
        position: {
            width: 640,
            height: "auto",
        },
        tag: "div",
        window: {
            frame: false
        },
    }

    static PARTS = {
        foo: {
            template: "modules/lights-out-theme-shadowdark/templates/character.hbs"
        }
    }

    get title() {
        return "player-character";
    }

    _prepareContext(options) {
        return {
            name: "Hello world",
            isPlayer: true
        };
    }

    _onRender(context, options) {

    }

}