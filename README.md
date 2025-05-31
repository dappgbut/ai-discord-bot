# ai-discord-bot
A discord bot equipped with AI with that makes user able to talk with them like a person. The bot equipped with a *maid persona* that acts like a literal *maid* in your discord server (～￣▽￣)～

## Requirements

- [Node.js](https://nodejs.org/en) 22.12.0 or newer is required
- [Chutes](https://chutes.ai/) api key to run their llm services
## ✔ Installation (Windows Only)

Clone the repository using git

```bash
  git clone https://github.com/dappgbut/ai-discord-bot.git
  cd ai-discord-bot
```

Install all the dependencies

```bash
  npm install
```

Edit the .env file, and put everything needed

```env
  BOTTOKEN=YOUR_BOT_TOKEN_HERE
  AIAPIKEY=CHUTES_AI_API_KEY
  CLIENTID=BOT_CLIENT_ID
  TGUILDID=YOUR_TEST_GUILD_ID
  PREFIX=<@YOUR_BOT_ID>
```

Run the discord bot

```bash
  node .
```
    