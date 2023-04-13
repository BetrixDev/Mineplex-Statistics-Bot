# Mineplex Statistics Discord Bot

*Currently only supports leaderboards*

This project is a [Turborepo](https://turbo.build/repo) monorepo which consists of two packages:

- **Backend** is an [express](https://expressjs.com) server using [trpc](https://trpc.io) which gathers data by scraping [mineplex.com](https://www.mineplex.com/home/) and [https://mcsrvstat.us](https://mcsrvstat.us)

- **Bot** is a [discordx](https://discordx.js.org) Discord bot which consumes the backend API and displays paginated leaderboards with the `/leaderboar` command