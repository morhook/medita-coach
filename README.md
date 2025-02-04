# Medita Coach Bot

If you want to meditate, please use our bot. 

## Index:
* [Setup](#setup)
* [Run terminal client](#run-terminal-cli)
* [Start Telegram bot](#start-telegram-bot)
* [Troubleshooting](#troubleshooting)

------

## <a name="setup"></a> Setup

Generate .env file using .env.example as template.

Install dependencies
```
npm i
```

------

## <a name="run-terminal-cli"></a> Run terminal client

The third parameter is the telegram id, the fourth one is the message.

```
node medita 123456 /start
```

------

## <a name="start-telegram-bot"></a> Start telegram bot

```
npm start
```

------

## <a name="troubleshooting"></a> Troubleshooting

* if you have problems registering on the BOT FATHER of telegram our bot, try expanding the timeout on node level, or sending messages back into telegram API (like the pong after the ping, etc)

```
export NODE_OPTIONS="--network-family-autoselection-attempt-timeout=500"
```

