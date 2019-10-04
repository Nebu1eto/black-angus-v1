# black-angus-bot

![logo](https://raw.githubusercontent.com/Hazealign/black-angus-bot/master/docs/black-cow.jpg)

This project is Multi-purposed Bot for Discord. Highly inspired in [yui](https://github.com/item4/yui).

## Requirements

- Git
- node.js v10.x or Higher
- Discord Bot Token & Client ID
- MongoDB Server (For Emoticon Database)

## Installation

```shell 
# clone project
git clone https://github.com/Hazealign/black-angus-bot.git && cd black-angus-bot

# install dependencies
npm install # (or yarn)

# write configuration file
mkdir env; vi env/config.json

# start black-angus-bot
CONFIG_FILE=./env/config.json npm start
```

## Configuration

[`IConfiguration.ts`](https://github.com/Hazealign/black-angus-bot/blob/master/src/configs/IConfigurations.ts)'s Interface is Configuration file's scheme. Here's the description of each configs.

#### DEBUG_HISTORY_TO_CHANNEL

**Type**: Boolean

Send Debug Message to `DEBUG_HISTORY_OR_ERROR_CHANNEL` Discord Channel. Bot still emit debug log to console if this flag is `false`.

#### DEBUG_ERROR_TO_CHANNEL

Send Error(Title, Stacktrace) Message to `DEBUG_HISTORY_OR_ERROR_CHANNEL` Discord Channel. Bot still emit error log to console if this flag is `false`.

#### DEBUG_HISTORY_OR_ERROR_CHANNEL

**Type**: String

Discord Channel Name to save logs(Error / Debug). Text Channel Only.
**Caution: Do not put '#' in prefix.**

#### DISCORD_TOKEN

**Type**: String

Put your Discord bot's Token.

#### DISCORD_CLIENT_ID

**Type**: String

Put your Discord bot Application's Client ID.

#### MONGODB_ADDRESS

**Type**: String

Put your MongoDB Database Server's Address.

#### EMOTICON_ENABLED

**Type**: Boolean

If this config is false, Emotion-related features will not work.

#### EMOTICON_FILE_PATH

**Type**: String

Folder Path where emoticon images will saved. It must be an absolute path. If this directory not exists, Bot will try to create folder.

## Create new Commands

When bot starts, bot tries to imports every JavaScript / TypeScript files in `src/commands` folders.

1. Make a Class which implements `ICommand` interface.
2. Put a Decorator `@CommandDefinition()` in 1's class. It'll be registered in command list.

```typescript
// example
import { CommandDefinition } from '../core/CommandFactory'
import { ICommand, CommandType } from '../core/ICommand'
import { Message } from 'discord.js'
import { BOT_CONFIG } from '../configs/IConfigurations'

@CommandDefinition()
export class Invitation implements ICommand {
  type: CommandType = CommandType.ADMIN_COMMANDS
  prefix: string = '!'

  async action (context: Message) {
    const { content, channel } = context
    if (content.indexOf('초대') === -1) {
      return
    }

    await channel.send(
      'https://discordapp.com/oauth2/authorize?' +
        `client_id=${BOT_CONFIG.DISCORD_CLIENT_ID}` +
        '&scope=bot&permissions=201444416'
    )
  }
}
```

## License

`black-angus-bot` project follows MIT License.