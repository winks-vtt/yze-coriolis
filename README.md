# Coriolis The Third Horizon
A Foundry VTT system for [Free League's Coriolis RPG](https://frialigan.se/en/games/coriolis-2/).

## System Status
The system is now in a playable state, with mainly the character sheet being complete. Stylings for rolls, item sheets, are incomplete but functional. As more mileage is accumlated I'd like to add automations to various systems to help with running a game of Coriolis.

## Installation
1. Inside Foundry's Configuration and Setup screen, go to **Game Systems**
2. Click "Install System"
3. In the Manifest URL field paste: `https://raw.githubusercontent.com/winks-vtt/yze-coriolis/master/system.json`

## Features
![Character Sheet](https://github.com/winks-vtt/yze-coriolis/raw/master/images/char_sheet_preview.png)

- Basic Character sheets for PCs
- Ability to roll Skills and Attributes
- Can create Talents, Weapons, Gear, Armor and drag-n-drop onto character sheets.
- Can click on weapons to roll with bonus modifiers
- Can push rolls in chat
- Can do armor rating rolls
- Be able to track Darkness Points
- Track encumbrance in the inventory tab
- Support for [Dice So Nice]( https://gitlab.com/riccisi/foundryvtt-dice-so-nice) with custom Dice skins

## How-Tos

### Modifying Rolls
![Modifying Rolls](https://github.com/winks-vtt/yze-coriolis/raw/master/images/ht_modifier_rolls.gif)

When selecting an attribute or skill, a pop up will request a modifier to any roll coming from the character sheet.

### Pushing Rolls
![Pushing Rolls](https://github.com/winks-vtt/yze-coriolis/raw/master/images/ht_push_rolls.gif)

To push a roll, click on the "pray to the Icons" button under the roll in the chat window

### Using Weapons and Armor
![Using Items](https://github.com/winks-vtt/yze-coriolis/raw/master/images/ht_use_items.gif)

Weapons, Explosives, and Armor can be rolled in the items tab. You can click on the name of the item to unfold further details, or click on the icon of the item to roll. Rollable items will fade to a dice icon.

### Handling Darkness Points
![Darkness Points Tools](https://github.com/winks-vtt/yze-coriolis/raw/master/images/dp_bar.png)
- You can increment or decrement darkness points via the tool bar on the left.
- Whenever a player pushes a roll, 1 DP is added to the DB pool of the GM

### Updating Character Art
The system comes with placeholder art-work. To change it, click on the upper 3rd of the art-work to upload a new one. For reference, the placeholder artwork is 604x1488 pixels. The slot is designed for easily dropping in character art from the core rulebook.

## Recommended Modules
- [Dice So Nice]( https://gitlab.com/riccisi/foundryvtt-dice-so-nice)

## Todos
* Create a ship character sheet
* Update styling of dice rolls in chat log
* Update styling of supporting item/weapon sheets

## Support
For questions, feature requests, or bug reports, feel free to contact me on the Foundry Discord (Winks#1731) or open an issue here directly.

## Art Credits
- Placeholder character key art: By [Alex Okafor](http://www.paradeofrain.com/) under [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/).
- Character sheet icons: by [LORC](https://lorcblog.blogspot.com/) under [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/).
- Character Sheet background: NASA Hubble under [Public Domain](https://hubblesite.org/about_us/copyright.php).

## License
![Year Zero Engine](https://github.com/winks-vtt/yze-coriolis/raw/master/images/YZ_engine_logo.png)

This Foundry VTT system is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/)

This work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).




