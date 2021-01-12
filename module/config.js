// namespace yzecoriolis configuration values
export const YZECORIOLIS = {};

YZECORIOLIS.ASCII = `_______________________________
 ______   ______   ______   __   ______   __       __   ______
/\\  ___\\ /\\  __ \\ /\\  == \\ /\\ \\ /\\  __ \\ /\\ \\     /\\ \\ /\\  ___\\
\\ \\ \\____\\ \\ \\/\\ \\\\ \\  __< \\ \\ \\\\ \\ \\/\\ \\\\ \\ \\____\\ \\ \\\\ \\___  \\
 \\ \\_____\\\\ \\_____\\\\ \\_\\ \\_\\\\ \\_\\\\ \\_____\\\\ \\_____\\\\ \\_\\\\/\\_____\\
  \\/_____/ \\/_____/ \\/_/ /_/ \\/_/ \\/_____/ \\/_____/ \\/_/ \\/_____/
_______________________________`;

YZECORIOLIS.maxRoll = 6;

YZECORIOLIS.DEFAULT_PLAYER_KEY_ART =
  "systems/yzecoriolis/css/images/unknown_player.png";

YZECORIOLIS.attributes = {
  strength: "YZECORIOLIS.AttrStrength",
  agility: "YZECORIOLIS.AttrAgility",
  wits: "YZECORIOLIS.AttrWits",
  empathy: "YZECORIOLIS.AttrEmpathy",
};

YZECORIOLIS.attributeRolls = {
  strength: "YZECORIOLIS.AttrStrengthRoll",
  agility: "YZECORIOLIS.AttrAgilityRoll",
  wits: "YZECORIOLIS.AttrWitsRoll",
  empathy: "YZECORIOLIS.AttrEmpathyRoll",
};

YZECORIOLIS.crewPositions = {
  captain: "YZECORIOLIS.CrewSpotCaptain",
  engineer: "YZECORIOLIS.CrewSpotEngineer",
  pilot: "YZECORIOLIS.CrewSpotPilot",
  sensorOperator: "YZECORIOLIS.CrewSpotSensorOperator",
  gunner: "YZECORIOLIS.CrewSpotGunner",
};

YZECORIOLIS.skillCategories = {
  general: "YZECORIOLIS.SkillCatGeneral",
  advanced: "YZECORIOLIS.SkillCatAdvanced",
};

// The set of skills that can be trained in coriolis
YZECORIOLIS.skills = {
  dexterity: "YZECORIOLIS.SkillDexterity",
  force: "YZECORIOLIS.SkillForce",
  infiltration: "YZECORIOLIS.SkillInfiltration",
  manipulation: "YZECORIOLIS.SkillManipulation",
  meleecombat: "YZECORIOLIS.SkillMeleeCombat",
  observation: "YZECORIOLIS.SkillObservation",
  rangedcombat: "YZECORIOLIS.SkillRangedCombat",
  survival: "YZECORIOLIS.SkillSurvival",
  command: "YZECORIOLIS.SkillCommand",
  culture: "YZECORIOLIS.SkillCulture",
  datadjinn: "YZECORIOLIS.SkillDataDjinn",
  medicurgy: "YZECORIOLIS.SkillMedicurgy",
  mysticpowers: "YZECORIOLIS.SkillMysticPowers",
  pilot: "YZECORIOLIS.SkillPilot",
  science: "YZECORIOLIS.SkillScience",
  technology: "YZECORIOLIS.SkillTechnology",
};

// The the statement that is used when rolling for that skill.
YZECORIOLIS.skillRolls = {
  dexterity: "YZECORIOLIS.SkillDexterityRoll",
  force: "YZECORIOLIS.SkillForceRoll",
  infiltration: "YZECORIOLIS.SkillInfiltrationRoll",
  manipulation: "YZECORIOLIS.SkillManipulationRoll",
  meleecombat: "YZECORIOLIS.SkillMeleeCombatRoll",
  observation: "YZECORIOLIS.SkillObservationRoll",
  rangedcombat: "YZECORIOLIS.SkillRangedCombatRoll",
  survival: "YZECORIOLIS.SkillSurvivalRoll",
  command: "YZECORIOLIS.SkillCommandRoll",
  culture: "YZECORIOLIS.SkillCultureRoll",
  datadjinn: "YZECORIOLIS.SkillDataDjinnRoll",
  medicurgy: "YZECORIOLIS.SkillMedicurgyRoll",
  mysticpowers: "YZECORIOLIS.SkillMysticPowersRoll",
  pilot: "YZECORIOLIS.SkillPilotRoll",
  science: "YZECORIOLIS.SkillScienceRoll",
  technology: "YZECORIOLIS.SkillTechnologyRoll",
};

// Talents

YZECORIOLIS.talentCategories = {
  group: "YZECORIOLIS.TalentCatGroup",
  icon: "YZECORIOLIS.TalentCatIcon",
  general: "YZECORIOLIS.TalentCatGeneral",
  humanite: "YZECORIOLIS.TalentCatHumanite",
  cybernetic: "YZECORIOLIS.TalentCatCybernetic",
  bionicsculpt: "YZECORIOLIS.TalentCatBionicSculpt",
  mysticalpowers: "YZECORIOLIS.TalentCatMysticalPowers",
};

YZECORIOLIS.talentGroupConceptCategories = {
  freeTraders: "YZECORIOLIS.GroupTalentCatFreeTraders",
  mercenaries: "YZECORIOLIS.GroupTalentCatMercenaries",
  agents: "YZECORIOLIS.GroupTalentCatAgents",
  explorers: "YZECORIOLIS.GroupTalentCatExplorers",
  pilgrims: "YZECORIOLIS.GroupTalentCatPilgrims",
};

YZECORIOLIS.talents = {
  // free traders
  anoseforbirr: "YZECORIOLIS.TalentANoseForBirr",
  everythingisforsale: "YZECORIOLIS.TalentEverythingIsForSale",
  quickestroute: "YZECORIOLIS.TalentQuickestRoute",
  // mercenaries
  assault: "YZECORIOLIS.TalentAssault",
  charge: "YZECORIOLIS.TalentCharge",
  situationalawareness: "YZECORIOLIS.TalentSituationalAwareness",
  //agents
  afriendineveryport: "YZECORIOLIS.TalentAFriendInEveryPort",
  assassinsguild: "YZECORIOLIS.TalentAssassinsGuild",
  dancersofahlam: "YZECORIOLIS.TalentDancersOfAhlam",
  //explorers
  seasonedtravelers: "YZECORIOLIS.TalentSeasonedTravelers",
  survivors: "YZECORIOLIS.TalentSurvivors",
  truthseekers: "YZECORIOLIS.TalentTruthSeekers",
  //pilgrims
  lastlaugh: "YZECORIOLIS.TalentLastLaugh",
  mercyoftheicons: "YZECORIOLIS.TalentMercyOfTheIcons",
  onelastbirr: "YZECORIOLIS.TalentOneLastBirr",

  //icon talents
  iconladyoftears: "YZECORIOLIS.TalentIconLadyOfTears",
  icondancer: "YZECORIOLIS.TalentIconDancer",
  icongambler: "YZECORIOLIS.TalentIconGambler",
  iconmerchant: "YZECORIOLIS.TalentIconMerchant",
  icondeckhand: "YZECORIOLIS.TalentIconDeckhand",
  icontraveler: "YZECORIOLIS.TalentIconTraveler",
  iconmessenger: "YZECORIOLIS.TalentIconMessenger",
  iconjudge: "YZECORIOLIS.TalentIconJudge",
  iconfacelessone: "YZECORIOLIS.TalentIconFacelessOne",

  //general talents
  blessing: "YZECORIOLIS.TalentBlessing",
  combatveteran: "YZECORIOLIS.TalentCombatVeteran",
  defensive: "YZECORIOLIS.TalentDefensive",
  executioner: "YZECORIOLIS.TalentExecutioner",
  exospecialist: "YZECORIOLIS.TalentExoSpecialist",
  factionstanding: "YZECORIOLIS.TalentFactionStanding",
  fieldmedicurg: "YZECORIOLIS.TalentFieldMedicurg",
  gearhead: "YZECORIOLIS.TalentGearhead",
  intimidating: "YZECORIOLIS.TalentIntimidating",
  judgeofcharacter: "YZECORIOLIS.TalentJudgeOfCharacter",
  licensed: "YZECORIOLIS.TalentLicensed",
  machinegunner: "YZECORIOLIS.TalentMachinegunner",
  malicious: "YZECORIOLIS.TalentMalicious",
  ninelives: "YZECORIOLIS.TalentNineLives",
  pointblank: "YZECORIOLIS.TalentPointBlank",
  rapidreload: "YZECORIOLIS.TalentRapidReload",
  rugged: "YZECORIOLIS.TalentRugged",
  seductive: "YZECORIOLIS.TalentSeductive",
  sprinter: "YZECORIOLIS.TalentSprinter",
  soothing: "YZECORIOLIS.TalentSoothing",
  talismanmaker: "YZECORIOLIS.TalentTalismanMaker",
  thehassassinsthrust: "YZECORIOLIS.TalentTheHassassinsThrust",
  thirdeye: "YZECORIOLIS.TalentThirdEye",
  tough: "YZECORIOLIS.TalentTough",
  wealthyfamily: "YZECORIOLIS.TalentWealthyFamily",
  zerogtraining: "YZECORIOLIS.TalentZeroGTraining",

  //humanite talents
  humanitepheromones: "YZECORIOLIS.TalentHumanitePheromones",
  humaniteresistant: "YZECORIOLIS.TalentHumaniteResistant",
  humanitewaterbreathing: "YZECORIOLIS.TalentHumaniteWaterBreathing",

  //cybernetic implants
  cyberneticacceleratedreflexes:
    "YZECORIOLIS.TalentCyberneticAcceleratedReflexes",
  cyberneticactivesensors: "YZECORIOLIS.TalentCyberneticActiveSensors",
  cyberneticbodyarmor: "YZECORIOLIS.TalentCyberneticBodyArmor",
  cyberneticbuiltinweapon: "YZECORIOLIS.TalentCyberneticBuiltInWeapon",
  cyberneticcomlink: "YZECORIOLIS.TalentCyberneticComLink",
  cyberneticcyberneticmuscles: "YZECORIOLIS.TalentCyberneticCyberneticMuscles",
  cyberneticendoskeleton: "YZECORIOLIS.TalentCyberneticEndoSkeleton",
  cyberneticlanguagemodulator: "YZECORIOLIS.TalentCyberneticLanguageModulator",
  cyberneticliedetector: "YZECORIOLIS.TalentCyberneticLieDetector",
  cyberneticpassivesensors: "YZECORIOLIS.TalentCyberneticPassiveSensors",
  cyberneticservolocks: "YZECORIOLIS.TalentCyberneticServoLocks",
  cyberneticskinelectrodes: "YZECORIOLIS.TalentCyberneticSkinElectrodes",
  cybernetictargetingscope: "YZECORIOLIS.TalentCyberneticTargetingScope",
  cyberneticvoiceamplifier: "YZECORIOLIS.TalentCyberneticVoiceAmplifier",
  cyberneticwaterbreathing: "YZECORIOLIS.TalentCyberneticWaterBreathing",
  cyberneticweatherproof: "YZECORIOLIS.TalentCyberneticWeatherproof",

  //bionic sculpts
  bionicbeautiful: "YZECORIOLIS.TalentBionicBeautiful",
  bionicbuiltinweapon: "YZECORIOLIS.TalentBionicBuiltInWeapon",
  bionicintelligent: "YZECORIOLIS.TalentBionicIntelligent",
  bionicmorph: "YZECORIOLIS.TalentBionicMorph",
  bionicnimble: "YZECORIOLIS.TalentBionicNimble",
  bionicquick: "YZECORIOLIS.TalentBionicQuick",
  bionicregenerate: "YZECORIOLIS.TalentBionicRegenerate",

  //mystical powers
  mysticalartificer: "YZECORIOLIS.TalentMysticalArtificer",
  mysticalclairvoyant: "YZECORIOLIS.TalentMysticalClairvoyant",
  mysticalexorcist: "YZECORIOLIS.TalentMysticalExorcist",
  mysticalintuition: "YZECORIOLIS.TalentMysticalIntuition",
  mysticalmindreader: "YZECORIOLIS.TalentMysticalMindReader",
  mysticalmindwalker: "YZECORIOLIS.TalentMysticalMindWalker",
  mysticalprediction: "YZECORIOLIS.TalentMysticalPrediction",
  mysticalpremonition: "YZECORIOLIS.TalentMysticalPremonition",
  mysticalstop: "YZECORIOLIS.TalentMysticalStop",
  mysticaltelekinesis: "YZECORIOLIS.TalentMysticalTelekinesis",
};

YZECORIOLIS.techTiers = {
  P: "YZECORIOLIS.TechTierPrimitive",
  O: "YZECORIOLIS.TechTierOrdinary",
  A: "YZECORIOLIS.TechTierAdvanced",
  F: "YZECORIOLIS.TechTierFaction",
  R: "YZECORIOLIS.TechTierPortalBuilderRelic",
};

YZECORIOLIS.gearWeights = {
  L: "YZECORIOLIS.GearWeightLight",
  N: "YZECORIOLIS.GearWeightNormal",
  H: "YZECORIOLIS.GearWeightHeavy",
  T: "YZECORIOLIS.GearWeightTiny",
  Z: "YZECORIOLIS.GearWeightZero",
};

// We are normalizing the weight distribution so light objects aren't .5 but just 1.
YZECORIOLIS.gearWeightPoints = {
  L: 1,
  N: 2,
  H: 4,
  T: 0,
  Z: 0,
};

// numeric crit types are just the flat dice successes needed to crit.
// custom typically have some custom property name that would apply to this weapon.
YZECORIOLIS.critTypes = {
  numeric: "YZECORIOLIS.CritTypeNumeric",
  custom: "YZECORIOLIS.CritTypeCustom",
};

YZECORIOLIS.ranges = {
  close: "YZECORIOLIS.CloseRange",
  short: "YZECORIOLIS.ShortRange",
  long: "YZECORIOLIS.LongRange",
  extreme: "YZECORIOLIS.ExtremeRange",
};

YZECORIOLIS.icons = {
  ladyOfTears: "YZECORIOLIS.IconLadyOfTears",
  dancer: "YZECORIOLIS.IconDancer",
  gambler: "YZECORIOLIS.IconGambler",
  merchant: "YZECORIOLIS.IconMerchant",
  deckhand: "YZECORIOLIS.IconDeckhand",
  traveler: "YZECORIOLIS.IconTraveler",
  messenger: "YZECORIOLIS.IconMessenger",
  judge: "YZECORIOLIS.IconJudge",
  faceless: "YZECORIOLIS.IconFaceless",
};
