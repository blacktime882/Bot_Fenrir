const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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

    // Проверка что это git репозиторий
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) {
        console.log(`[Update Error] Not a git repository at ${process.cwd()}`);
        return interaction.editReply({
            content: `❌ Ошибка: Это не git репозиторий!\n\n**Решение:**\nКод нужно залить используя:\n\`\`\`bash\ngit clone https://github.com/blacktime882/Bot_Fenrir.git\ncd Bot_Fenrir\nnpm install\n\`\`\`\n\nИли инициализировать git на сервере:\n\`\`\`bash\ngit init\ngit remote add origin https://github.com/blacktime882/Bot_Fenrir.git\ngit fetch origin main\ngit checkout main\n\`\`\``
        });
    }

    // Выполнить git pull origin main
    exec('git pull origin main', { timeout: 30000 }, (error, stdout, stderr) => {
        let message = '';
        if (error) {
            console.log(`[Update Error] ${error.message}`);
            
            // Более подробные сообщения об ошибках
            if (stderr.includes('not a git repository')) {
                message = `❌ Ошибка: Это не git репозиторий\n\nПожалуйста, залейте код используя git clone`;
            } else if (stderr.includes('Could not resolve host')) {
                message = `❌ Ошибка: Нет доступа к интернету или GitHub недоступен`;
            } else if (stderr.includes('Permission denied')) {
                message = `❌ Ошибка: Недостаточно прав для обновления`;
            } else {
                message = `❌ Ошибка обновления:\n\`\`\`\n${stderr.substring(0, 200)}\n\`\`\``;
            }
        } else if (stdout.includes('Already up to date')) {
            console.log(`[Update] Already up to date`);
            message = `✅ Код уже актуален (no changes)`;
        } else {
            console.log(`[Update Success] ${stdout}`);
            message = `✅ Обновление выполнено!\n\`\`\`\n${stdout.substring(0, 200)}\n\`\`\``;
        }

        interaction.editReply(message);
    });
}

module.exports = { getCommand, handle };