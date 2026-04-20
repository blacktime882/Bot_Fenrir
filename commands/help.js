const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function getCommand() {
    return new SlashCommandBuilder()
        .setName("помощь")
        .setDescription("Список команд");
}

async function handle(interaction) {
    const embed = new EmbedBuilder()
        .setTitle("📚 Помощь - Команды Bot_Fenrir")
        .setColor(0x5865F2)
        .setThumbnail('https://browse.wf/Lotus/Interface/Icons/Syndicates/FactionSigilJudge.png')
        .setDescription("Полный список доступных команд")
        .addFields(
            { name: "⚔️ Основные команды", value: "Информация об арбитражах", inline: false },
            { name: "/арбитраж", value: "Текущий и следующий арбитраж с полной информацией", inline: false },
            { name: "/арбитраж-список", value: "Список ближайших арбитражей (до 25 штук)", inline: false },
            
            { name: "🔧 Служебные команды", value: "Управление и информация", inline: false },
            { name: "/пинг", value: "Проверить пинг бота и время ответа", inline: false },
            { name: "/информация", value: "Информация о боте и ссылки", inline: false },
            { name: "/статистика", value: "Статистика работы бота", inline: false },
            
            { name: "🛠️ Администраторские команды", value: "Только для администраторов", inline: false },
            { name: "/обновить", value: "Обновить код бота с GitHub (только админы)", inline: false },
            { name: "/помощь", value: "Показать это сообщение", inline: false },
        )
        .setFooter({ text: "Используй /арбитраж для актуальной информации о миссиях" })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}

module.exports = { getCommand, handle };