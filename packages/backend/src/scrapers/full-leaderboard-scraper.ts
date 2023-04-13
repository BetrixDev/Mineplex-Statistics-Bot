import { load } from "cheerio";
import axios from "axios";

const NAME_MAP: Record<string, string> = {
  "block-hunt": "Block%20Hunt",
  bridge: "The%20Bridges",
  cakewars: "Cake%20Wars%20Standard",
  champions: "Champions%20Domination",
  "draw-my-thing": "Draw%20My%20Thing",
  "master-builder": "Master%20Builders",
  minestrike: "Minestrike",
  skywars: "Skywars",
  "speed-builders": "speed-builders",
  ssm: "Super%20Smash%20Mobs",
  "survival-games": "Survival%20Games",
};

export const fullLeaderboardScraper = async (
  gameName: string,
  start: number,
  count: number
) => {
  if (!NAME_MAP[gameName]) {
    throw Error("Invalid argument: gameName");
  }

  const response = await axios<string>(
    `https://www.mineplex.com/assets/www-mp/webtest/testy.php?game=${NAME_MAP[gameName]}`
  );

  const $ = load(response.data);

  let tableRows = $("tr:not(.LeaderboardsHead)");
  const totalRows = tableRows.length;

  tableRows = tableRows.slice(start, start + count);

  const data: { name: string; wins: number }[] = [];

  tableRows.each((i, el) => {
    const $row = load(el);

    const name = $row("a").first().text();
    const wins = $row("*:nth-child(4)").first().text();

    data.push({ name, wins: Number(wins.replaceAll(",", "")) });
  });

  return { data, totalRows };
};
