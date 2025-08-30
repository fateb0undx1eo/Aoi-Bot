const bannedWordsRaw = [
  // Your extensive banned words and slurs list (no "black" or safe words)
  "2g1c", "2 girls 1 cup", "acrotomophilia", "alabama hot pocket", "alaskan pipeline", "anal",
  "anilingus", "anus", "apeshit", "arsehole", "ass", "asshole", "assmunch", "auto erotic", "autoerotic",
  "babeland", "baby batter", "baby juice", "ball gag", "ball gravy", "ball kicking", "ball licking", "ball sack", "ball sucking",
  "bangbros", "bangbus", "bareback", "barely legal", "barenaked", "bastard", "bastardo", "bastinado", "bbw", "bdsm",
  "beaner", "beaver cleaver", "beaver lips", "bestiality", "bimbos", "birdlock", "bitch", "bitches", "blowjob",
  "blow job", "blow your load", "blue waffle", "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs", "booty call",
  "brown showers", "bukkake", "bulldyke", "bullshit", "bung hole", "bunghole", "busty", "butt", "buttcheeks", "butthole",
  "camel toe", "camgirl", "camslut", "camwhore", "carpet muncher", "chocolate rosebuds", "cialis", "circlejerk",
  "cleveland steamer", "clit", "clitoris", "clusterfuck", "cock", "cocks", "coprolagnia", "coprophilia", "cornhole", "coon",
  "coons", "creampie", "cum", "cumming", "cumshot", "cumshots", "cunnilingus", "cunt", "date rape", "daterape", "deep throat",
  "deepthroat", "dendrophilia", "dick", "dildo", "dingleberry", "dingleberries", "dirty pillows", "dirty sanchez",
  "doggie style", "doggy style", "dolcett", "domination", "dominatrix", "dommes", "donkey punch", "double dong",
  "double penetration", "dry hump", "dvda", "eat my ass", "ecchi", "ejaculation", "erotic", "erotism", "escort", "eunuch",
  "fag", "faggot", "fecal", "felch", "fellatio", "feltch", "female squirting", "femdom", "fingerbang", "fingering", "fisting",
  "foot fetish", "footjob", "frotting", "fuck", "fuck buttons", "fuckin", "fucking", "fucktards", "fudge packer", "fudgepacker",
  "futanari", "gang bang", "gangbang", "gay sex", "genitals", "giant cock", "girl on", "girl on top", "girls gone wild",
  "goatse", "god damn", "gokkun", "golden shower", "goodpoop", "goo girl", "goregasm", "grope", "group sex", "g-spot",
  "guro", "hand job", "handjob", "hard core", "hardcore", "hentai", "homoerotic", "honkey", "hooker", "horny", "hot carl",
  "hot chick", "how to kill", "how to murder", "huge fat", "humping", "incest", "intercourse", "jack off", "jail bait",
  "jailbait", "jelly donut", "jerk off", "jigaboo", "jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster",
  "kinky", "knobbing", "leather restraint", "leather straight jacket", "lemon party", "livesex", "lolita", "lovemaking",
  "make me come", "male squirting", "masturbate", "masturbating", "masturbation", "menage a trois", "milf", "missionary position",
  "mong", "motherfucker", "mound of venus", "mr hands", "muff diver", "muffdiving", "nambla", "nawashi", "neonazi", "nigger",
  "nimphomania", "nipple", "nipples", "nsfw", "nsfw images", "nude", "nudity", "nutten", "nympho", "nymphomania",
  "octopussy", "omorashi", "one cup two girls", "one guy one jar", "orgasm", "orgy", "paedophile", "paki", "panties",
  "pedobear", "pedophile", "pegging", "penis", "phone sex", "piece of shit", "pikey", "pissing", "pig pig", "playboy",
  "pleasure chest", "pole smoker", "ponyplay", "poof", "poon", "poontang", "punany", "poop chute", "porn", "porno",
  "pornography", "prince albert piercing", "pthc", "pubes", "pussy", "queaf", "queef", "quim", "raghead", "raging boner",
  "rape", "raping", "rapist", "rectum", "reverse cowgirl", "rimjob", "rimming", "rosy palm", "rusty trombone", "sadism",
  "santorum", "scat", "schlong", "scissoring", "semen", "sex", "sexcam", "sexo", "sexy", "sexual", "sexually", "sexuality",
  "shaved pussy", "shemale", "shibari", "shit", "shitty", "shota", "shrimping", "skeet", "slanteye", "slut", "s&m",
  "smut", "snatch", "snowballing", "sodomize", "sodomy", "spastic", "spic", "splooge", "spooge", "spread legs", "spunk",
  "strap on", "strapon", "strappado", "strip club", "suck", "sucks", "suicide girls", "sultry women", "swastika",
  "swinger", "tainted love", "tea bagging", "threesome", "throating", "thumbzilla", "tied up", "tight white", "tit",
  "tits", "titties", "titty", "topless", "tosser", "towelhead", "tranny", "tribadism", "tubgirl", "twat", "twink",
  "twinkie", "two girls one cup", "undressing", "upskirt", "urethra play", "urophilia", "vagina", "viagra", "vibrator",
  "violet wand", "vorarephilia", "voyeur", "voyeurweb", "vulva", "wank", "wetback", "wet dream", "white power", "whore",
  "worldsex", "wrinkled starfish", "xxx", "yaoi", "yellow showers", "yiffy", "zoophilia",
  // Racial and hateful slurs
  "coon", "coonass", "cracker", "chink", "gook", "spic", "beaner", "kike", "nip", "raghead",
  "jigaboo", "wetback", "honky", "negro", "redskin", "sand nigger", "gypsy",
  "hooker", "nigger", "nigga", "ching chong", "chink", "dumbass", "fatass", "faggot",
  "dyke", "slut", "whore", "cunt", "bitch", "bastard", "motherfucker",
  // Additional offensive phrases
  "fat fuck", "dickhead", "pussylicker", "cockhead", "tits", "dildo", "fisting"
];

const allowedUserIds = new Set();

function removeZalgo(text) {
  return text.normalize('NFKD').replace(/[\u0300-\u036f\u0483-\u0489\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g, '');
}

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

const patternString = bannedWordsRaw
  .map(word => escapeRegex(word).replace(/\s+/g, '\\s+'))
  .join('|');

const bannedRegex = new RegExp(`\\b(${patternString})\\b`, 'iu');

function checkMessageContent(content, userId, guild) {
  if (!guild) return false;
  if (guild.ownerId === userId) return false;
  if (allowedUserIds.has(userId)) return false;

  const normalized = removeZalgo(content.toLowerCase());
  return bannedRegex.test(normalized);
}

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
