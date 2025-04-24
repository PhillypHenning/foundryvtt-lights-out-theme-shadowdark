import {
  getCharacter,
  getPartyCharacters,
  characterData,
  tokenData
} from "./character.js";
import * as actions from "./actions.js";
import { registerSettings } from "./settings.js";

Hooks.once("init", async () => {
    registerSettings();
    $("body.game").append('<div id="player-character"></div>');
    $("section#ui-left").append('<div id="party"></div>');
  
    await loadTemplates([
      "modules/lights-out-theme-shadowdark/templates/character.hbs",
      "modules/lights-out-theme-shadowdark/templates/party.hbs",
    ]);
  
    activatePlayerListeners();
    activatePartyListeners();
  });

Hooks.on("ready", async () => {
    // Enable high contrast mode for icons
    // This changes a CSS variable to enable/disable the filter
    let highContrastModeSetting = game.settings.get("lights-out-theme-shadowdark", "icon-high-contrast-mode");
    if (highContrastModeSetting) document.documentElement.classList.add("high-contrast");

    //initial render of ui components
    await renderCharacter();
    await renderParty();
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

function activatePlayerListeners() {
  $(document).on("click", "#player-character .sheet", actions.openSheet);

  setupLuckTracker(".attr#luck-attr");
  setupHealthPointsTracker("#current-health");
}

function activatePartyListeners() {
  $(document).on("dblclick", "#party .character-picture", actions.openSheet);
  $(document).on("click", "#party .character-picture", actions.selectToken);
  setupHealthPointsTracker("#party .current-health");
}

function setupLuckTracker(element) {
  const pulpMode = game.settings.get("shadowdark", "usePulpMode");

  $(document).on("click contextmenu", element, function(e) {
    if (pulpMode) {
      if (e.button === 0) { // left click
        actions.changePulpLuck.call(this, e, 1);
      } else if (e.button === 2) { // right click
        actions.changePulpLuck.call(this, e, -1);
      }
    }
    else {
      actions.changeLuck.call(this, e);
    }
  });
}

function setupHealthPointsTracker(element) {
  $(document).on("focus", element, function () {
    this.value = "";
  });

  $(document).on("blur", element, function () {
    this.value = this.dataset.value;
  });

  $(document).on("keyup", element, function (e) {
    if (e.keyCode !== 13) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    let actor;
    if (this.dataset.token === "true") {
      let scene = game.canvas.scene;
      actor = scene.tokens.find(item => item.delta.id === this.dataset.id).actor;
    }
    else {
      actor = game.actors.get(this.dataset.id);
    }

    if (!actor) {
      return;
    }

    const currentHP = this.dataset.value;
    const inputValue = this.value.trim();

    let damageAmount;
    let multiplier;

    if (inputValue.startsWith('+')) {
      damageAmount = parseInt(inputValue.slice(1), 10);
      multiplier = -1;
    } else if (inputValue.startsWith('-')) {
      damageAmount = parseInt(inputValue.slice(1), 10);
      multiplier = 1;
    } else {
      const newHP = parseInt(inputValue, 10);
      damageAmount = currentHP - newHP;
      multiplier = 1; 
    }

    if (!isNaN(damageAmount)) {
      actor.applyDamage(damageAmount, multiplier);
    }
  });
}

async function renderCharacter(s = false) {
  const elem = document.getElementById("player-character");
  if (!elem) return;

  const character = getCharacter();
  if (!character) {
    elem.parentNode.removeChild(elem);
    $("body.game").append(`<div id="player-character" style="bottom: ${uiEdges().bottom}px"></div>`);
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
  data.selected = s;

  const tpl = await renderTemplate(
    "modules/lights-out-theme-shadowdark/templates/character.hbs",
    data
  );

  elem.innerHTML = tpl;
}

async function renderParty() {
  const elem = document.getElementById("party");
  if (!elem) return;

  const characters = await Promise.all(getPartyCharacters().map(characterData));
  const partyVisibility = game.settings.get("lights-out-theme-shadowdark", "party_details_config")
  const playerHealthVisibility = game.settings.get("lights-out-theme-shadowdark", "party_details_health_config")

  const tpl = await renderTemplate("modules/lights-out-theme-shadowdark/templates/party.hbs", {
    characters,
    partyVisibility,
    playerHealthVisibility
  });

  elem.innerHTML = tpl;

  elem.style.top = `${window.innerHeight / 2 - elem.clientHeight / 2}px`;
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