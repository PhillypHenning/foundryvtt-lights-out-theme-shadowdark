<h1 align="center">Lights Out - Shadowdark theme for FoundryVTT</h1>
<p align="center"><sup><i>Let There Be Darkness...</i></sup></p>
<p align="center">
  <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fronijaakkola%2Ffoundryvtt-lights-out-theme-shadowdark%2Fmain%2Fmodule.json&query=%24.compatibility.verified&logo=foundryvirtualtabletop&logoColor=white&label=Foundry%20version&labelColor=%23FE6A1F&color=black" />
  <a href="https://foundryvtt.com/packages/shadowdark"><img src="https://img.shields.io/badge/system-shadowdark-black?labelColor=white" /></a>
  <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fronijaakkola%2Ffoundryvtt-lights-out-theme-shadowdark%2Fmain%2Fmodule.json&query=%24.version&logoColor=white&label=version&labelColor=white&color=black" />
  <img src="https://img.shields.io/github/downloads/ronijaakkola/foundryvtt-lights-out-theme-shadowdark/module.zip?style=flat&labelColor=white&color=black" />
  <a href="https://crowdin.com/project/shadowdark-lights-out-theme"><img src="https://badges.crowdin.net/shadowdark-lights-out-theme/localized.svg" /></a>
</p>

<p align="center"><a href="https://ko-fi.com/ronihelppi"><img src="https://github.com/user-attachments/assets/0a7e973f-15af-40ce-803c-1734f5bc7d7c" width="161" alt="Buy Me a Torch Button" /></a></p>

<p align="center"><i>This module adds a darker and more fitting user interface theme for the Shadowdark system in the FoundryVTT platform. It simplifies the player view by providing character and party panels. These panels can be used for quick access to token hit points and other information.</i></p>

![theme-screenshot-player-view](https://github.com/user-attachments/assets/6805e871-f0f6-483a-a5df-518e6fd3a03f)

<div align="center"><sup><i>Token art owned by <a href="https://www.thearcanelibrary.com/">The Arcane Library</a>. Background art generated using Midjourney. No art assets are provided with this module.</i></sup></div>

<hr />

## Features
- **Player character panel**
  - Showing general character info (HP, AC, luck, name, title, and class)
  - Quick access to the character sheet
  - Quickly changing hit points
  - An option to show GM's selected token in the character panel
- **Party panel**
  - Showing all party members and their hit points
  - Quickly changing hit points of a certain party member
- Both panels even work when there are no tokens on the scene. Perfect for TotM scenes and party tokens!  
- Hiding unnecessary UI elements from players (navigation, player list, hotbar)
- Improved dark mode UI for Shadowdark's chat messages

## Screenshots
![player-view-totm](https://github.com/user-attachments/assets/6805e871-f0f6-483a-a5df-518e6fd3a03f)
*Player view in a TotM scene. Players can always see their character in the middle panel as well as their party.*

![player-view-battle](https://github.com/user-attachments/assets/26270613-2877-48a0-b304-11bb49c1fb71)
*Player view in a tactical battle scene.*

![gm-view-battle](https://github.com/user-attachments/assets/12ec27db-38bb-4ad0-b588-254478f2dd8f)
*Game Master view in a tactical battle scene. The token that the Game Master selects will show in the middle panel.*

## Recommended modules
Some features have already been well implemented and tested in other modules. Some recommended modules to finish the look are:

- [Chat Portraits](https://foundryvtt.com/packages/chat-portrait) to show token art in chat messages
  - _Portait size 36px, border color #e8e8e8, border width 2px_
- [Hide Player UI](https://foundryvtt.com/packages/hide-player-ui) to hide unnecessary sidebar tabs
  - _I generally hide Combat Tracker, Scenes, Rollable Tables, Card Stacks, and Compendium tabs_
- [Carousel Combat Tracker](https://foundryvtt.com/packages/combat-tracker-dock) for a sleek combat tracker
- [Lock View](https://foundryvtt.com/packages/LockView/) for TotM scenes
  
### Supported modules
Since this module heavily alters Foundry's look and elements, some other modules may not work properly with it. If you are using a module that does not work, consider opening a pull request or opening an issue to add support for it.

Currently, _officially_ supported modules are:
- [ConversationHUD](https://foundryvtt.com/packages/conversation-hud)
- [Dice Tray](https://foundryvtt.com/packages/dice-calculator)
- [Dungeon Draw](https://foundryvtt.com/packages/dungeon-draw)

## Translations
Making translations is a great way to contribute. The aim is to get this module to fully translated to all languages the Shadowdark system supports.

Crowdin is used to make translation work as simple as possible, and requires no development experience. 

You can join the translation effort by visiting the following link: https://crowdin.com/project/shadowdark-lights-out-theme

## Acknowledgments
- [erizocosmico](https://github.com/erizocosmico) for their [Fancy UI 5e module](https://github.com/erizocosmico/foundryvtt-fancy-ui-5e). This module uses it as a base and the style and logic has been modified to support the Shadowdark system.
- [The Arcane Library](https://www.thearcanelibrary.com) for the art assets that are seen in the screenshots
- Evounnamed from the The Arcane Library Discord for testing the module
