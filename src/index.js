// @ts-check
import Discord from "discord.js";
import got from "got";
import parseDuration from "parse-duration";
import { CookieJar } from "tough-cookie";

/** @type {() => Promise<string>} */
const getAuthenticationCookie = async () => {
  const cookieJar = new CookieJar();
  await got.post("https://www.geoguessr.com/api/v3/accounts/signin", {
    cookieJar,
    json: {
      email: process.env.GEOGUESSR_EMAIL,
      password: process.env.GEOGUESSR_PASSWORD,
    },
  });

  const cookie = await cookieJar.getCookieString("https://www.geoguessr.com/");
  return cookie;
};

/**
 * @typedef GameConfiguration
 * @property {string} map - e.g.: "59a1514f17631e74145b6f47"
 * @property {boolean} [forbidMoving] - e.g.: true
 * @property {boolean} [forbidRotating] - e.g.: false
 * @property {boolean} [forbidZooming] - e.g.: false
 * @property {number} [timeLimit] - e.g.: 100
 */

/**
 * Create a new GeoGuessr game with the given configuration and return its URL.
 * @type {(gameConfiguration: GameConfiguration) => Promise<string>}
 */
export const createGame = async (gameConfiguration) => {
  const cookie = await getAuthenticationCookie();

  /** @type {{ token: string }} */
  const response = await got
    .post("https://www.geoguessr.com/api/v3/challenges", {
      headers: {
        cookie,
      },
      json: gameConfiguration,
    })
    .json();

  return `https://www.geoguessr.com/challenge/${response.token}`;
};

const prefix = "!";

/** @type {(message: Discord.Message) => Promise<void>} */
const onCreateGame = async (message) => {
  // Ignore all bots
  if (message.author.bot) return;
  // Ignore messages not starting with the command prefix
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Only match `!geoguessr` commands
  if (command !== "geoguessr") return;

  // Send usage if the command is called without arguments
  if (args.length < 1) {
    message.channel.send(
      `> **Usage:** ${prefix}geoguessr __map__ [__no-move__] [__no-pan__] [__no-zoom__] [__time-limit__]
> **Examples:**
> - ${prefix}geoguessr france
> - ${prefix}geoguessr world no-move no-pan no-zoom
> - ${prefix}geoguessr 59a1514f17631e74145b6f47 no-move no-pan no-zoom 2m30s
`
    );
    return;
  }

  const [map, ...options] = args;

  // Parse movement options
  const forbidMoving = options.includes("no-move");
  const forbidRotating = options.includes("no-pan");
  const forbidZooming = options.includes("no-zoom");

  // Parse time limit option
  const [timeLimitExpression] = options.filter(
    (option) => !["no-move", "no-pan", "no-zoom"].includes(option)
  );
  const timeLimit = timeLimitExpression ? parseDuration(timeLimitExpression, "s") : 0;

  // Create game and send URL
  const url = await createGame({
    map,
    forbidMoving,
    forbidRotating,
    forbidZooming,
    timeLimit,
  });
  message.channel.send(`🌍 ${url}`);
};

const client = new Discord.Client();
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.on("message", onCreateGame);
});
client.login(process.env.DISCORD_BOT_TOKEN);
