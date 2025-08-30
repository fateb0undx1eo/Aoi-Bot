const { Collection } = require('discord.js');
const bannedWordsRaw = `
2g1c, 2 girls 1 cup, acrotomophilia, alabama hot pocket, alaskan pipeline, anal, anilingus, anus, apeshit, arsehole, ass, asshole, assmunch, auto erotic, autoerotic, babeland, baby batter, baby juice, ball gag, ball gravy, ball kicking, ball licking, ball sack, ball sucking, bangbros, bangbus, bareback, barely legal, barenaked, bastard, bastardo, bastinado, bbw, bdsm, beaner, beaners, beaver cleaver, beaver lips, beastiality, bestiality, big breasts, big knockers, big tits, bimbos, birdlock, bitch, bitches, blonde action, blonde on blonde action, blowjob, blow job, blow your load, blue waffle, blumpkin, bollocks, bondage, boner, boob, boobs, booty call, brown showers, brunette action, bukkake, bulldyke, bullet vibe, bullshit, bung hole, bunghole, busty, butt, buttcheeks, butthole, camel toe, camgirl, camslut, camwhore, carpet muncher, carpetmuncher, chocolate rosebuds, cialis, circlejerk, cleveland steamer, clit, clitoris, clover clamps, clusterfuck, cock, cocks, coprolagnia, coprophilia, cornhole, coon, coons, creampie, cum, cumming, cumshot, cumshots, cunnilingus, cunt, darkie, date rape, daterape, deep throat, deepthroat, dendrophilia, dick, dildo, dingleberry, dingleberries, dirty pillows, dirty sanchez, doggie style, doggiestyle, doggy style, doggystyle, dog style, dolcett, domination, dominatrix, dommes, donkey punch, double dong, double penetration, dp action, dry hump, dvda, eat my ass, ecchi, ejaculation, erotic, erotism, escort, eunuch, fag, faggot, fecal, felch, fellatio, feltch, female squirting, femdom, figging, fingerbang, fingering, fisting, foot fetish, footjob, frotting, fuck, fuck buttons, fuckin, fucking, fucktards, fudge packer, fudgepacker, futanari, gangbang, gang bang, gay sex, genitals, giant cock, girl on, girl on top, girls gone wild, goatcx, goatse, god damn, gokkun, golden shower, goodpoop, goo girl, goregasm, grope, group sex, g-spot, guro, hand job, handjob, hard core, hardcore, hentai, homoerotic, honkey, hooker, horny, hot carl, hot chick, how to kill, how to murder, huge fat, humping, incest, intercourse, jack off, jail bait, jailbait, jelly donut, jerk off, jigaboo, jiggaboo, jiggerboo, jizz, juggs, kike, kinbaku, kinkster, kinky, knobbing, leather restraint, leather straight jacket, lemon party, livesex, lolita, lovemaking, make me come, male squirting, masturbate, masturbating, masturbation, menage a trois, milf, missionary position, mong, motherfucker, mound of venus, mr hands, muff diver, muffdiving, nambla, nawashi, negro, neonazi, nigga, nigger, nig nog, nimphomania, nipple, nipples, nsfw, nsfw images, nude, nudity, nutten, nympho, nymphomania, octopussy, omorashi, one cup two girls, one guy one jar, orgasm, orgy, paedophile, paki, panties, panty, pedobear, pedophile, pegging, penis, phone sex, piece of shit, pikey, pissing, piss pig, pisspig, playboy, pleasure chest, pole smoker, ponyplay, poof, poon, poontang, punany, poop chute, poopchute, porn, porno, pornography, prince albert piercing, pthc, pubes, pussy, queaf, queef, quim, raghead, raging boner, rape, raping, rapist, rectum, reverse cowgirl, rimjob, rimming, rosy palm, rosy palm and her 5 sisters, rusty trombone, sadism, santorum, scat, schlong, scissoring, semen, sex, sexcam, sexo, sexy, sexual, sexually, sexuality, shaved beaver, shaved pussy, shemale, shibari, shit, shitblimp, shitty, shota, shrimping, skeet, slanteye, slut, s&m, smut, snatch, snowballing, sodomize, sodomy, spastic, spic, splooge, splooge moose, spooge, spread legs, spunk, strap on, strapon, strappado, strip club, style doggy, suck, sucks, suicide girls, sultry women, swastika, swinger, tainted love, taste my, tea bagging, threesome, throating, thumbzilla, tied up, tight white, tit, tits, titties, titty, tongue in a, topless, tosser, towelhead, tranny, tribadism, tub girl, tubgirl, tushy, twat, twink, twinkie, two girls one cup, undressing, upskirt, urethra play, urophilia, vagina, venus mound, viagra, vibrator, violet wand, vorarephilia, voyeur, voyeurweb, voyuer, vulva, wank, wetback, wet dream, white power, whore, worldsex, wrapping men, wrinkled starfish, xxx, yaoi, yellow showers, yiffy, zoophilia
`.split(',')
  .map(w => w.trim().toLowerCase())
  .filter(w => w.length > 0 && w !== 'black');

const allowedUserIds = new Set(); // IDs exempt from moderation, mutable via commands

// Helper to remove diacritics and Zalgo chars (unicode marks)
function removeZalgo(text) {
  // Match combining diacritical marks and common Zalgo marks
  return text.normalize('NFKD').replace(/[\u0300-\u036f\u0483-\u0489\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g, '');
}

// Escape regex special chars
function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Create regex with \s+ matching and escape
const patternString = bannedWordsRaw
  .split(',')
  .map(word => escapeRegex(word.trim().replace(/\s+/g, '\\s+')))
  .filter(word => word.length > 0 && !word.includes('black')) // extra precaution
  .join('|');

const bannedRegex = new RegExp(`\\b(${patternString})\\b`, 'iu'); // Unicode case-insensitive with word boundaries

// Check function returns true if banned word found
function checkMessageContent(content, userId, guild) {
  // Owner immune always
  if (!guild) return false;
  if (guild.ownerId === userId) return false;
  // Allowlist override
  if (allowedUserIds.has(userId)) return false;

  // Normalize text: lowercase, remove zalgo/diacritics for obfuscation
  const normalized = removeZalgo(content.toLowerCase());

  // Test regex on normalized text
  return bannedRegex.test(normalized);
}

// Allowlist management (example command usage)
function addAllowedUser(userId) {
  allowedUserIds.add(userId);
}

function removeAllowedUser(userId) {
  allowedUserIds.delete(userId);
}

function listAllowedUsers() {
  return Array.from(allowedUserIds);
}

module.exports = {
  checkMessageContent,
  addAllowedUser,
  removeAllowedUser,
  listAllowedUsers,
};
