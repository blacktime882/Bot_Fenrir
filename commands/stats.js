const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function getCommand() {
    return new SlashCommandBuilder()
        .setName('статистика')
        .setDescription('Статистика бота и серверов');
}

async function handle(interaction) {
    const client = interaction.client;
    const uptime = client.uptime;
    
    // Конвертация uptime в часы, минуты, секунды
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);

    const embed = new EmbedBuilder()
        .setTitle('📊 Статистика Bot_Fenrir')
        .setColor('#4ECDC4')
        .setThumbnail('https://browse.wf/Lotus/Interface/Icons/Syndicates/FactionSigilJudge.png')
        .addFields(
            { name: '⏰ Время работы', value: `**${hours}ч ${minutes}м ${seconds}с**`, inline: true },
            { name: '📡 Пинг бота', value: `**${client.ws.ping}ms**`, inline: true },
            { name: '🖥️ Серверов', value: `**${client.guilds.cache.size}**`, inline: true },
            { name: '👥 Пользователей', value: `**${client.users.cache.size}**`, inline: true },
            { name: '💬 Каналов', value: `**${client.channels.cache.size}**`, inline: true },
            { name: '🎉 Событий', value: `**${client.listeners('messageCreate').length}**`, inline: true },
            { name: '🔔 Статус', value: `**${client.user.presence.status === 'online' ? '🟢 Online' : '🔴 Offline'}**`, inline: false },
            { name: '💻 Платформа', value: `**Node.js 20.20.2** | **Discord.js 14.14.0**`, inline: false },
        )
        .setFooter({ text: 'Статистика обновляется в реальном времени' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

module.exports = { getCommand, handle };
