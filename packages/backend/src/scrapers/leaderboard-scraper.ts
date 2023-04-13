import { load } from "cheerio";
import axios from "axios";

export const leaderboardScraper = async (
  gameName: string,
  leaderboard: string,
  start: number,
  count: number
) => {
  const response = await axios<string>(
    `https://www.mineplex.com/leaderboards/pc/${gameName}/`
  );

  const $ = load(response.data);
  let tableRows = $(
    `#${leaderboard} > div.LeaderPage1.activeLeaderPage > table > tbody > tr:not(.LeaderboardsHead)`
  );

  const totalRows = tableRows.length;

  tableRows = tableRows.slice(
    Math.min(start, tableRows.length - count),
    start + count
  );

  const data: { name: string; wins: number }[] = [];

  tableRows.each((i, el) => {
    const $row = load(el);

    const name = $row("a").first().text();
    const wins = $row("*:nth-child(4)").first().text();

    data.push({ name, wins: Number(wins.replaceAll(",", "")) });
  });

  return { data, totalRows };
};
