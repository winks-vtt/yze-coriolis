# 2.0.0

Note: This version is not backwards compatible with 0.7.x, so please create a backup in the event you may need to go back to a previous FVTT version.

- Updated compatibility for Foundry VTT 0.8.6
- Fixed animations involving removal of items from character and ship sheets
- Fixed bug with darkness points displaying twice upon decrement
- Renamed system to 'Coriolis'

# 1.4.7

- Fixed migration system incorrectly detecting a need for migrations due to version number schema changes

# 1.4.6

- Added contact and medium range settings for ship weapon modules
- Fixed manifest URLs so the systems would auto-update

# 1.4.5

- Fixed CSS styling bug with entity links

# 1.4.4

- Updated styling of compendium links in character sheets (Thanks to @jomblr)

# 1.4.3

- Added Brazilian Portuguese translations (Thanks to @EstolanoBeu)!

# 1.4.2

- Fixed scaling issues with ship images

# 1.4.1

- Added french translation (Thanks to @Cougy-6185)!
- Fixed scroll positions being reset when editing character or ship sheets

# 1.4

- Ship sheet functionality is now implemented!
- Fixed Darkness Points displaying locally to non-GM players after a pushed roll. It is up to the descretion of the GM to display DP to their players if they wish.

# 1.3

- Fixed Armor rolls from macro hotbars.

# 1.2

- Added defaults to new characters. When creating a character the token will automatically link the actor data and setup vision.
- Fixed macro hotbar support for rollable items.

# 0.105

- Added Swedish localization (Thanks to @Jomblr)

# 0.104

- Updated compatibility boundaries

# 0.103

- Fixed bug with TinyMCE styling that caused character sheets to not allow editing of notes.

# 0.102

- Fixed compatbility with 0.7.4 dice rolling API.
- Fixed missing dice images in chat window when making rolls or pushing rolls

# 0.101

- Updated versioning to fix updating as well as prepare for Foundry 0.7.x

# 0.100

- Updated Spanish localization to fix word wrapping in skills section of character sheets. (Thanks to @krakenSummoner)

# 0.99

- Added support for NPC sheets. These sheets are identical to proper character
  sheets except the caps are lifted for attributes and skills, allowing you to
  have NPCs with attributes and skills that are higher than 5.

# 0.98

- Custom icons for gear using pngs are now sized correctly
- Added a 'Zero' weight category to gear. You can now select '-' instead of Tiny to ignore any encumbrance calculations.
- Encumbrance values are now scaled correctly to reflect current ruleset. (ie, Heavy = 2, Normal = 1, Light = 0.5)

# 0.97

- Added Spanish localization (thanks to @krakenSummoner)
- Updated German localization (thanks to @SesuUisu)
- Fixed actor browser icon not updating when updating the token art.
- Fixed issue with group concept dropdown not saving when modifying Group Talents

# 0.96

- Fixed a templating bug with HP Bonuses in talents that would cause the HP Bar to become too large.

# 0.95

- Added support for HP bonuses in Talents. Talent items now have an HP Bonus field.
- Added proper support for Melee weapons. Weapon items now have a melee checkbox. It will now roll the correct skill+attributes for melee combat.

# 0.94

- German localization updated (thanks to @SesuUisu)

# 0.93

- Bug fixed with pushing rolls where darkness points would not be added to if a non-GM player pushed the roll.
- Fixed Localization issues with item & gear sheets.

- Added localization entries for default names of new items, talents, and injuries
- Added localization support for the GM's darkness point messages
- Added ability to display current Darkness points for the GM
- Added more modifier options to roll modifier modal temporarily as automated rules come online.

# 0.92

- German localization added (thanks to @SesuUisu)

# 0.91

- Updating readme

# 0.9

- Updating licensing

# 0.8

- Updating licensing

# 0.7

- Initial Release
