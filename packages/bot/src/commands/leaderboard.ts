import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  InteractionReplyOptions,
  InteractionUpdateOptions,
} from "discord.js";
import {
  ButtonComponent,
  Discord,
  Slash,
  SlashChoice,
  SlashOption,
} from "discordx";
import { table } from "table";
import { trpc } from "../trpc.js";

const LEADERBOARDS: { name: string; value: string }[] = [
  {
    name: "All Time",
    value: "leaderboards1",
  },
  {
    name: "Daily",
    value: "leaderboards2",
  },
  {
    name: "Weekly",
    value: "leaderboards3",
  },
  {
    name: "Monthly",
    value: "leaderboards4",
  },
];

const GAME_MODES: { name: string; pageId: string; image: string }[] = [
  {
    name: "Block Hunt",
    pageId: "block-hunt",
    image: "BlockHunt",
  },
  {
    name: "Bridges",
    pageId: "bridge",
    image: "Bridges",
  },
  {
    name: "Cake Wars",
    pageId: "cakewars",
    image: "CakeWars",
  },
  {
    name: "Champions",
    pageId: "champions",
    image: "Champions",
  },
  {
    name: "Draw My Thing",
    pageId: "draw-my-thing",
    image: "DrawMyThing",
  },
  {
    name: "Master Builder",
    pageId: "master-builder",
    image: "MasterBuilder",
  },
  {
    name: "Mine Strike",
    pageId: "minestrike",
    image: "Minestrike",
  },
  {
    name: "Skywars",
    pageId: "skywars",
    image: "Skywars",
  },
  {
    name: "Speed Builders",
    pageId: "speed-builders",
    image: "SpeedBuilders",
  },
  {
    name: "Super Smash Mobs",
    pageId: "ssm",
    image: "SSM",
  },
  {
    name: "Survival Games",
    pageId: "survival-games",
    image: "SurvivalGame",
  },
];

const formatNumber = new Intl.NumberFormat("en-US").format;

@Discord()
export class LeaderboardCommand {
  @Slash({
    name: "leaderboard",
    description: "View the leaderboard for any gamemode",
  })
  async command(
    @SlashChoice(
      ...GAME_MODES.map((mode) => ({ name: mode.name, value: mode.pageId }))
    )
    @SlashOption({
      name: "gamemode",
      description: "Gamemode to fetch the leaderboard for",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    gameName: string,
    @SlashChoice(...LEADERBOARDS)
    @SlashOption({
      name: "leaderboard",
      description:
        "Show either All Time, Daily, Weekly or Monthly leaderboards",
      type: ApplicationCommandOptionType.String,
      required: false,
    })
    type: string | null,
    @SlashOption({
      name: "page",
      description:
        "What page of the leaderboard to view (max: 10 or 100 for all time)",
      type: ApplicationCommandOptionType.Integer,
      minValue: 1,
      maxValue: 100,
      required: false,
    })
    pageNumber: number | null,
    interaction: CommandInteraction
  ) {
    const mode = GAME_MODES.find((g) => g.pageId === gameName)!;

    const initalResponse = await interaction.reply(
      `Fetching data for ${mode.name}, one moment!`
    );

    try {
      await interaction.editReply(
        await this.message(gameName, type, pageNumber)
      );
    } catch (e) {
      await initalResponse.delete();
      if (typeof e === "string") {
        await interaction.followUp({
          ephemeral: true,
          content: e,
        });
      } else {
        console.error(e);

        await interaction.followUp({
          ephemeral: true,
          content:
            "An unknown error occured when processing your request. Please try again later!",
        });
      }
    }
  }

  @ButtonComponent({ id: /^lb.*/ })
  async button(interaction: ButtonInteraction) {
    const [, action, gameName, type, page] = interaction.customId.split("=");

    if (action === "f") {
      interaction.update(
        (await this.message(
          gameName,
          type,
          Number(page) + 1
        )) as InteractionUpdateOptions
      );
    } else {
      interaction.update(
        (await this.message(
          gameName,
          type,
          Number(page) - 1
        )) as InteractionUpdateOptions
      );
    }
  }

  async message(
    gameName: string,
    type: string | null,
    pageNumber: number | null
  ): Promise<InteractionReplyOptions> {
    const leaderboardType =
      LEADERBOARDS.find((l) => l.value === type) ?? LEADERBOARDS[0];
    const mode = GAME_MODES.find((g) => g.pageId === gameName)!;

    let maxPages = leaderboardType.value === "leaderboards1" ? 100 : 10;
    let page = pageNumber ?? 1;

    // Clamp page to 10 if not all time leaderboard
    if (leaderboardType.value !== "leaderboards1" && page > 10) {
      page = 10;
    }

    const response = await trpc.leaderboard
      .query({
        gameName,
        type: leaderboardType.value,
        start: (page - 1) * 10,
        count: 10,
      })
      .catch((e) => {
        console.log(e);
      });

    if (!response) {
      throw Error(
        "There was an error with processing your request. Please try again later!"
      );
    }

    maxPages = Math.ceil(response.totalRows / 10);

    const data = [["Position", "Name", "Wins"]];

    data.push(
      ...response.data.map((player, i) => {
        return [
          `${i + (page - 1) * 10 + 1}`,
          player.name,
          formatNumber(player.wins),
        ];
      })
    );

    let description = "```" + table(data) + "```";

    if (response.data.length === 0) {
      description = "```" + "No data for this leaderboard at this time" + "```";
    }

    const embed = new EmbedBuilder()
      .setTitle(`${mode.name} ${leaderboardType?.name} Leaderboard`)
      .setURL(`https://www.mineplex.com/leaderboards/pc/${mode.pageId}/`)
      .setColor("Gold")
      .setDescription(description)
      .setThumbnail(
        `https://www.mineplex.com/assets/www-mp/img/games/${mode.image}.png`
      );

    const backButton = new ButtonBuilder()
      .setCustomId(`lb=b=${gameName}=${leaderboardType.value}=${page}`)
      .setStyle(ButtonStyle.Primary)
      .setLabel("Previous Page")
      .setDisabled(page === 1);

    const pageDisplay = new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setCustomId("blank")
      .setLabel(`${page} / ${maxPages}`)
      .setDisabled(true);

    const forwardButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`lb=f=${gameName}=${leaderboardType.value}=${page}`)
      .setLabel("Next Page")
      .setDisabled(page === maxPages);

    const actionRow = new ActionRowBuilder<ButtonBuilder>();
    actionRow.addComponents(backButton, pageDisplay, forwardButton);

    return {
      content: "",
      embeds: [embed],
      components: maxPages !== 0 ? [actionRow] : undefined,
    };
  }
}
