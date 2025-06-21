/*

Made By Elite Code :)
vist us at : https://github.com/elitecodestudio

*/
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const fetch = require('node-fetch');
const crypto = require('crypto');
const pipelineAsync = promisify(pipeline);
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages], partials: ['CHANNEL'] });

const baseDir = 'C:/EliteCDN/files'; // Website /files path to add there the files uploaded
const Token = '';
const BotId = '';

if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

const commands = [
    new SlashCommandBuilder()
        .setName('upload')
        .setDescription('Upload a file')
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('The file to upload')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('myfiles')
        .setDescription('List your uploaded files'),
    new SlashCommandBuilder()
        .setName('clearfiles')
        .setDescription('Clear all your uploaded files')
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(Token);
(async () => {
    try {
        console.log('Started refreshing application (/) commands globally.');

        await rest.put(
            Routes.applicationCommands(BotId),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands globally.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    client.user.setActivity('Elite Code', { type: 'STREAMING', url: 'https://elitecode.xyz' });
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

if (interaction.isCommand()) {
        if (interaction.commandName === 'upload') {
            const attachment = interaction.options.getAttachment('file');
            const username = interaction.user.username;
            const userDir = path.join(baseDir, username);

            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir);
            }

            const fileExtension = path.extname(attachment.name);
            const randomFileName = 'EliteCode-' + crypto.randomBytes(6).toString('base64url') + fileExtension;
            const filePath = path.join(userDir, randomFileName);
            const fileStream = fs.createWriteStream(filePath);

            try {
                const response = await fetch(attachment.url);
                if (!response.ok) throw new Error(`Failed to fetch the file: ${response.statusText}`);

                await pipelineAsync(response.body, fileStream);

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('File Uploaded')
                    .setDescription(`Your upload link: [${randomFileName}](https://amxtigerapi.rest/files/${username}/${randomFileName})`)
					.setFooter({ text: 'EliteCode', iconURL: 'https://amxtigerapi.rest/files/elitecode/logoanimatedbyabod.gif' })
                    .setTimestamp();

                interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching or saving file:', error);
                interaction.reply('There was an error processing your file.');
            }
        } else if (interaction.commandName === 'myfiles') {
            const username = interaction.user.username;
            const userDir = path.join(baseDir, username);

            if (fs.existsSync(userDir) && fs.readdirSync(userDir).length > 0) {
                const files = fs.readdirSync(userDir);
                const fileLinks = files.map(file => `[${file}](https://amxtigerapi.rest/files/${username}/${file})`).join('\n');

                const embed = new EmbedBuilder()
                    .setColor('#e59008')
					.setThumbnail('https://amxtigerapi.rest/files/elitecode/logoanimatedbyabod.gif')
                    .setTitle('Your Files')
                    .setDescription(fileLinks)
					.setFooter({ text: 'EliteCode', iconURL: 'https://amxtigerapi.rest/files/elitecode/logoanimatedbyabod.gif' })
                    .setTimestamp();

                interaction.reply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
					.setThumbnail('https://cdn-icons-png.flaticon.com/512/2889/2889314.png')
                    .setTitle('No Files Found')
                    .setDescription('You don\'t have any uploaded files.')
					.setFooter({ text: 'EliteCode', iconURL: 'https://amxtigerapi.rest/files/elitecode/logoanimatedbyabod.gif' })
                    .setTimestamp();

                interaction.reply({ embeds: [embed] });
            }
        } else if (interaction.commandName === 'clearfiles') {
            const username = interaction.user.username;
            const userDir = path.join(baseDir, username);

            if (fs.existsSync(userDir) && fs.readdirSync(userDir).length > 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ffcc00')
					.setThumbnail('https://cdn-icons-png.flaticon.com/512/6861/6861362.png')
                    .setTitle('Confirm Deletion')
                    .setDescription('Are you sure you want to delete all your files? You Cant Recover Files !')
					.setFooter({ text: 'EliteCode', iconURL: 'https://amxtigerapi.rest/files/elitecode/logoanimatedbyabod.gif' })
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm_delete')
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('cancel_delete')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Secondary)
                    );

                interaction.reply({ embeds: [embed], components: [row] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
					.setThumbnail('https://cdn-icons-png.flaticon.com/512/2889/2889314.png')
                    .setTitle('No Files Found')
                    .setDescription('You don\'t have any files to delete.')
					.setFooter({ text: 'EliteCode', iconURL: 'https://amxtigerapi.rest/files/elitecode/logoanimatedbyabod.gif' })
                    .setTimestamp();

                interaction.reply({ embeds: [embed] });
            }
        }
    } else if (interaction.isButton()) {
        const username = interaction.user.username;
        const userDir = path.join(baseDir, username);

        if (interaction.customId === 'confirm_delete') {
            if (fs.existsSync(userDir)) {
                fs.readdirSync(userDir).forEach(file => fs.unlinkSync(path.join(userDir, file)));
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Files Deleted')
                .setDescription('All your files have been successfully deleted.')
				.setFooter({ text: 'EliteCode', iconURL: 'https://amxtigerapi.rest/files/elitecode/logoanimatedbyabod.gif' })
                .setTimestamp();

            interaction.update({ embeds: [embed], components: [] });
        } else if (interaction.customId === 'cancel_delete') {
            const embed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('Process Cancelled')
                .setDescription('Your files have not been deleted.')
				.setFooter({ text: 'EliteCode', iconURL: 'https://amxtigerapi.rest/files/elitecode/logoanimatedbyabod.gif' })
                .setTimestamp();

            interaction.update({ embeds: [embed], components: [] });
        }
    }
});

client.login(Token);
