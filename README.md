<div align="center">

# Template Discord Bot

A template for creating a Discord bot using Discord.js. This template includes command and event handling, database connection, and command deployment.

![GitHub stars](https://img.shields.io/github/stars/yourusername/TemplateDiscordBot?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/TemplateDiscordBot?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/TemplateDiscordBot)
![GitHub license](https://img.shields.io/github/license/yourusername/TemplateDiscordBot)

</div>

## Features

- Command handling (slash and context commands)
- Event handling
- Command deployment
- Database connection

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/TemplateDiscordBot.git
    cd TemplateDiscordBot
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Configure the bot:
    - Rename `src/discord-config.example.json` to `src/discord-config.json`.
    - Fill in the required fields (`token`, `clientId`, `guildIds`).

4. Run the bot:
    ```sh
    node index.js
    ```

## Usage

- Add your commands in the `commands` directory.
- Add your events in the `events` directory.
- The bot will automatically deploy commands and connect to the database on startup.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request for any improvements or new features.

## FAQ

### How do I add a new command?

1. Create a new file in the `commands` directory (either `context` or `slash` subdirectory).
2. Define your command with `data` and `execute` properties.
3. The bot will automatically load and deploy the new command on the next startup.

### How do I add a new event?

1. Create a new file in the `events` directory.
2. Define your event with `name` and `execute` properties.
3. The bot will automatically load the new event on the next startup.

### How do I connect to a different database?

1. Modify the `connectDatabase` function in `modules/database-module.js` to connect to your desired database.
2. Ensure you have the necessary database configuration in place.

## License

This project is open-source and available under the [MIT License](LICENSE).

---

Feel free to modify and upgrade the project as needed. Any contributions are welcome!