import {
  getCharacter,
  getPartyCharacters,
  characterData,
  tokenData
} from "./character.js";
import * as actions from "./actions.js";
import { setupHealthPointsTracker } from "./helpers.js";
import { registerSettings } from "./settings.js";
import { CharacterPanelApp } from "./apps/CharacterPanelApp.js";
import { PartyPanelApp } from "./apps/PartyPanelApp.js";

Hooks.once("init", async () => {
    registerSettings();
    $("section#ui-left").append('<div id="party"></div>');
  
    await loadTemplates([
      "modules/lights-out-theme-shadowdark/templates/character.hbs",
      "modules/lights-out-theme-shadowdark/templates/party.hbs",
    ]);
});

Hooks.once("ready", async () => {
    // Enable high contrast mode for icons
    // This changes a CSS variable to enable/disable the filter
    let highContrastModeSetting = game.settings.get("lights-out-theme-shadowdark", "icon-high-contrast-mode");
    if (highContrastModeSetting) document.documentElement.classList.add("high-contrast");

    // Create and render apps
    game.lightsOutTheme = game.lightsOutTheme || {};
    game.lightsOutTheme.characterPanel = new CharacterPanelApp();
    game.lightsOutTheme.characterPanel.render(true);

    game.lightsOutTheme.partyPanel = new PartyPanelApp();
    game.lightsOutTheme.partyPanel.render(true);

    //initial render of ui components
    await renderCharacter();
    await renderParty();

    //activatePartyListeners();

    console.log("Lights Out Theme | Ready");
});

Hooks.on("renderSettings", function (app, html) {
  $('<div class="lights-out-block"></div>').insertAfter(
    $(html).find('section[data-tab="modules"]')
  );
});

// Hide UI elements if current player permissions are below the global setting
Hooks.on("renderHotbar", async (app, html) => {
    const hotBarSetting = game.settings.get("lights-out-theme-shadowdark", "hotbar_visibility");
    (hotBarSetting < userPermission()) ? app.element.addClass("hidden") : app.element.removeClass("hidden");
});

Hooks.on("renderPlayerList", async (app, html) => {
    let playerListSetting = game.settings.get("lights-out-theme-shadowdark", "players_list_visibility");
    (playerListSetting < userPermission()) ? app.element.addClass("hidden") : app.element.removeClass("hidden");
});

Hooks.on("renderSceneNavigation", async (app, html) => {
    let navBarSetting = game.settings.get("lights-out-theme-shadowdark", "navbar_visibility");
    (navBarSetting < userPermission()) ? app.element.addClass("hidden") : app.element.removeClass("hidden");

    // Adjust #navigation top position based on hotbar visibility
    const hotBarSetting = game.settings.get("lights-out-theme-shadowdark", "hotbar_visibility");
    const navigationElement = document.getElementById("navigation");
    if (navigationElement) {
        navigationElement.classList.toggle("with-hotbar", hotBarSetting);
    }
});

Hooks.on("renderSceneControls", (controls, html) => {
    //create a control tools button and add a click handler to collapse the side bar
    let icon = (ui.sidebar._collapsed) ? "fa-caret-left" : "fa-caret-right";
    $("#controls ol.control-tools.main-controls").append(`
        <li class="scene-control sidebar-control" data-tooltip="${game.i18n.localize("LIGHTSOUTSD.sidebar_tooltip")}">
            <i class="fas ${icon}"></i>
        </li>`
    );
    $(".scene-control.sidebar-control").click(async function() {ui.sidebar._collapsed ? ui.sidebar.expand() : ui.sidebar.collapse();})

    $("#controls").css('right', uiEdges().right);

    //move controls and effects panel to match the sidebar's collapsed state
    if (ui.sidebar._collapsed) {
        $("#controls").addClass("collapsed");
        $("section.effect-panel").addClass("collapsed");
    }
    else {
        $("#controls").removeClass("collapsed");
        $("section.effect-panel").removeClass("collapsed");
    }
});

Hooks.on("collapseSidebar", (sidebar, collapsed) => {
    ui.controls.render();
    game.shadowdark.effectPanel.render();
});

// re-render scene controls when AV dock position changes.
Hooks.on("rtcSettingsChanged", async (settings, changes) => {
    if (changes.client) {
        if ("hideDock" in changes.client || "dockPosition" in changes.client) 
            ui.controls.render();
    }
});

Hooks.on("updateActor", async function (actor) {
  if (game.user.isGM || actor.id === getCharacter()?.id) {
    await renderCharacter();
  }
  
  await renderParty();
});

Hooks.on('controlToken', async function () {
  if (!game.user.isGM || game.settings.get("lights-out-theme-shadowdark", "disable-gm-selected-token")) return;
  await renderCharacter(true);
});

Hooks.on('userConnected', async function () {
  await renderCharacter();
  await renderParty();
});

Hooks.on('updateUser', async function () {
  await renderCharacter();
  await renderParty();
});

async function renderCharacter(selection = false) {
  const character = getCharacter();
  if (!character) {
    game.lightsOutTheme.characterPanel.hide();
    return;
  }

  let data;
  if (character.prototypeToken) {
    data = await characterData(character);
  }
  else {
    data = await tokenData(character);
  }

  if (!data) return;

  const settings = {
    hide_title: game.settings.get("lights-out-theme-shadowdark", "hide-pc-title"),
  }
  data.settings = settings;

  // Mark if the render was triggered by a selection
  data.selected = selection;

  game.lightsOutTheme.characterPanel.updateData(data);
}

async function renderParty() {
  const characters = await Promise.all(getPartyCharacters().map(characterData));
  const partyVisibility = game.settings.get("lights-out-theme-shadowdark", "party_details_config")
  const playerHealthVisibility = game.settings.get("lights-out-theme-shadowdark", "party_details_health_config")

  game.lightsOutTheme.partyPanel.updateData(characters);
}

function userPermission() {
    return game.user.isGM ? 1 : 2; // GMs = 1, Players = 2
}

function uiEdges() {
    const body = document.querySelector("body").getBoundingClientRect();
    const uiInterface = document.querySelector("#interface").getBoundingClientRect();
    return {
        top: uiInterface.top,
        left: uiInterface.left,
        right: body.width - uiInterface.right,
        bottom: body.height - uiInterface.bottom
    }
}