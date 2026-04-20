const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { exec } = require('child_process');

function getCommand() {
    return new SlashCommandBuilder()
        .setName("обновить")
        .setDescription("Обновить код бота (только для администраторов)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function handle(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ У вас нет прав администратора для выполнения этой команды.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Выполнить git pull origin main
    exec('git pull origin main', (error, stdout, stderr) => {
        let message = '';
        if (error) {
            console.log(`[Update Error] ${error.message}`);
            message = `❌ Ошибка обновления: ${error.code || 'Неизвестная ошибка'}`;
        } else {
            console.log(`[Update Success] ${stdout}`);
            message = `✅ Обновление выполнено!\n\`\`\`\n${stdout}\`\`\``;
        }

        interaction.editReply(message);
    });
}

module.exports = { getCommand, handle };