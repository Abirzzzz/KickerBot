const { Client, Intents, Permissions } = require('discord.js-selfbot-v13');
const { token, prefix, language } = require('./config.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: ['CHANNEL']
});

// languages
const messages = {
    en: {
        ready: "logged ass",
        waiting: "dm shi working only",
        invalidID: "wrong serverid nigga",
        notInGuild: "youre on your owns on ts folk😭😭😭😭",
        noPermission: (name) =>  `no permission in **${name}** nigga`,
        starting: (name) => `kicking niggers off**${name}**...`,
        done: (name, kicked, failed, time) => `done,\nserver: **${name}**\nkicked: **${kicked}**\nfailed to kick: **${failed}**(its okay jarvis, youre not a nigger)\ntime taken: **${time}ms** (**${(time/1000).toFixed(2)}s**)`,
        error: "fucking ERRROO",
        fridayStats: (kicked, time) => `jarvis counterpart arhh stats:\nkicked: **${kicked}** members\ntime: **${time}ms** (**${(time/1000).toFixed(2)}s**)`,
        channelDeleteStart: (name) => `deleting all channels in **${name}** except the specified one...`,
        channelDeleteDone: (name, deleted, kept) => `channels deleted from **${name}**\ndeleted: **${deleted}**\nkept channel: **${kept}**`,
        channelNotFound: "channel not found bro",
        channelDeleteError: "error deleting channels",
        invalidChannelID: "wrong channel id nigga"
    }
};

const msg = messages[language] || messages.en;

let jarvisActive = false;
let fridayStats = {
    kicked: 0,
    totalTime: 0
};

client.once('ready', () => {
    console.log(`${msg.ready} ${client.user.tag}`);
    console.log(msg.waiting);
});

client.on('messageCreate', async message => {
    if (message.guild) return;
    if (message.author.id === client.user.id) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Jarvis command
    if (command === 'jarvis') {
        if (args.length === 0) {
            return message.reply('yes sire, run or stop');
        }

        const action = args[0].toLowerCase();

        if (action === 'run') {
            jarvisActive = true;
            return message.reply('mr tony stark, suit enabled.');
        } else if (action === 'stop') {
            jarvisActive = false;
            return message.reply('mr stark, suit has been disabled.');
        } else if (action === 'more') {
            if (args[1] && args[1].toLowerCase() === 'alcohol') {
                return message.reply('https://cdn.discordapp.com/attachments/1487905309946019920/1487911625171406888/jarvis-more-alcohol.png?ex=69cadd2f&is=69c98baf&hm=886d74a63a7eaab042f97095cac26a4b0fe3c1ce0fe37dac6fe7e7197295fa47&');
            } else {
                return message.reply('https://cdn.discordapp.com/attachments/1487905309946019920/1487911810244939796/200w.gif?ex=69cadd5b&is=69c98bdb&hm=80373f6e0ded407fc82fb6720092248c50980248db383fa4ccc092ee2dec2f81&');
            }
        } else {
            return message.reply('mr stark WHAT do you mean');
        }
    }

    // Friday stat command
    if (command === 'friday,' && args[0] && args[0].toLowerCase() === 'stat') {
        return message.reply(msg.fridayStats(fridayStats.kicked, fridayStats.totalTime));
    }

    if (command === `${prefix}kickle`) {
        if (!jarvisActive) {
            return message.reply('mr stark, the suit is uh disabled');
        }

        const serverID = args[0];
        const channelID = args[1];

        // Check if this is a channel delete operation (2 args provided)
        if (channelID && /^\d{17,19}$/.test(channelID)) {
            if (!serverID || !/^\d{17,19}$/.test(serverID)) {
                return message.reply(msg.invalidID);
            }

            try {
                const guild = await client.guilds.fetch(serverID).catch(() => null);
                if (!guild) {
                    return message.reply(msg.notInGuild);
                }

                const botMember = await guild.members.fetch(client.user.id);
                if (!botMember.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                    return message.reply(msg.noPermission(guild.name));
                }

                const channelToKeep = guild.channels.cache.get(channelID);
                if (!channelToKeep) {
                    return message.reply(msg.channelNotFound);
                }

                await message.reply(msg.channelDeleteStart(guild.name));

                let deletedCount = 0;
                const allChannels = await guild.channels.fetch();

                for (const channel of allChannels.values()) {
                    if (channel.id !== channelID) {
                        await channel.delete().catch(() => {});
                        deletedCount++;
                    }
                }

                await message.reply(msg.channelDeleteDone(guild.name, deletedCount, channelToKeep.name));

            } catch (error) {
                console.error('channel deletion error:', error);
                await message.reply(msg.channelDeleteError);
            }
            return;
        }

        // Original kick members operation
        if (!serverID || !/^\d{17,19}$/.test(serverID)) {
            return message.reply(msg.invalidID);
        }

        try {
            const guild = await client.guilds.fetch(serverID).catch(() => null);
            if (!guild) {
                return message.reply(msg.notInGuild);
            }

            const botMember = await guild.members.fetch(client.user.id);
            if (!botMember.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
                return message.reply(msg.noPermission(guild.name));
            }

            await message.reply(msg.starting(guild.name));

            const startTime = Date.now();
            const allMembers = await guild.members.fetch();
            let kickedCount = 0;
            let failedCount = 0;

            for (const member of allMembers.values()) {
                if (member.id === client.user.id || member.id === guild.ownerId) {
                    failedCount++;
                    continue;
                }

                if (member.kickable) {
                    await member.kick(`begged via dms`).catch(() => failedCount++);
                    kickedCount++;
                } else {
                    failedCount++;
                }
            }

            const timeTaken = Date.now() - startTime;
            fridayStats.kicked += kickedCount;
            fridayStats.totalTime += timeTaken;

            await message.reply(msg.done(guild.name, kickedCount, failedCount, timeTaken));

        } catch (error) {
            console.error('malfunction type shi nga:', error);
            await message.reply(msg.error);
        }
    }
});

client.login(token);