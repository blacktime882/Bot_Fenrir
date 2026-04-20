const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function getCommand() {
    return new SlashCommandBuilder()
        .setName('информация')
        .setDescription('Информация о Bot_Fenrir');
}

async function handle(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('📊 Bot_Fenrir v2.0')
        .setColor('#FF6B6B')
        .setThumbnail('https://browse.wf/Lotus/Interface/Icons/Syndicates/FactionSigilJudge.png')
        .setDescription('Полная информация об арбитражах Warframe в реальном времени')
        .addFields(
            { name: '🎮 О боте', value: 'Bot_Fenrir отслеживает расписание арбитражей в Warframe и предоставляет актуальную информацию о врагах, миссиях и локациях.', inline: false },
            { name: '📡 Источник данных', value: '[browse.wf](https://browse.wf/) - официальная API', inline: false },
            { name: '✨ Основные команды', value: '`/арбитраж` - текущий и следующий арбитраж\n`/арбитраж-список` - список ближайших арбитражей\n`/пинг` - проверка пинга\n`/помощь` - полный список команд', inline: false },
            { name: '🔧 Версия', value: '**2.0** | Node.js 20+', inline: true },
            { name: '💾 Хранилище', value: '[GitHub](https://github.com/blacktime882/Bot_Fenrir)', inline: true },
            { name: '🌍 Хостинг', value: 'HeavenCloud Pterodactyl', inline: true },
        )
        .setFooter({ text: 'Разработано для Warframe сообщества' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

module.exports = { getCommand, handle };
