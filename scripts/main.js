import {
  getCharacter,
  getPartyCharacters,
  characterData,
  tokenData
} from "./character.js";
import * as actions from "./actions.js";
import { isGm } from "./utils.js";
import { registerSettings } from "./settings.js";

let init = false;

Hooks.on("renderApplication", async function () {
  // Get visibility settings for UI elements
  let hotBarSetting = game.settings.get("lights-out-theme-shadowdark", "hotbar_visibility");
  let playerListSetting = game.settings.get("lights-out-theme-shadowdark", "players_list_visibility");
  let navBarSetting = game.settings.get("lights-out-theme-shadowdark", "navbar_visibility");
  let userPermission = isGm() ? 1 : 2; // GMs = 1, Players = 2

  // Hide UI elements if current player permissions are below the global setting
  (hotBarSetting < userPermission) ? $("#hotbar").addClass("hidden") : $("#hotbar").removeClass("hidden");
  (playerListSetting < userPermission) ? $("#players").addClass("hidden") : $("#players").removeClass("hidden");
  (navBarSetting < userPermission) ? $("#navigation").addClass("hidden") : $("#navigation").removeClass("hidden");

  // Enable high contrast mode for icons
  // This changes a CSS variable to enable/disable the filter
  let highContrastModeSetting = game.settings.get("lights-out-theme-shadowdark", "icon-high-contrast-mode");
  document.documentElement.classList.toggle("no-filter", !highContrastModeSetting);

  // NOTE: Shadowdark system's light tracking calls renderApplication
  // repeatedly. To avoid unnecessary re-renders of the UI, we will only
  // call these on the first time around. 
  if (!init) {
    await renderCharacter();
    await renderParty();

    init = true;
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
});

Hooks.on("updateActor", async function (actor) {
  if (isGm() || actor.id === getCharacter()?.id) {
    await renderCharacter();
  }
  
  await renderParty();
});

Hooks.on('controlToken', async function () {
  if (!isGm() || game.settings.get("lights-out-theme-shadowdark", "disable-gm-selected-token")) return;
  await renderCharacter(true);
});

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
    $("body.game").append('<div id="player-character"></div>');
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

  const tpl = await renderTemplate("modules/lights-out-theme-shadowdark/templates/party.hbs", {
    characters
  });

  elem.innerHTML = tpl;

  elem.style.top = `${window.innerHeight / 2 - elem.clientHeight / 2}px`;
}
