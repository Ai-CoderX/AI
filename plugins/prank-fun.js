const { cmd, commands } = require("../command");
const { sleep } = require("../lib/functions");
const config = require("../config");

// 1. HACK Command
cmd({
    pattern: "hack",
    desc: "Simulates a hacking sequence with real-time editing",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, sender, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*${config.BOT_NAME} HACKING SYSTEM ACTIVATED*\n*Initializing cyber attack...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 10%``` *Accessing mainframe...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 20%``` *Injecting malware...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 30%``` *Decrypting security...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 40%``` *Exploiting vulnerabilities...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 50%``` *Downloading data...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 60%``` *Backdoor access...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▱▱▱] 70%``` *Bypassing firewall...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱] 80%``` *Covering tracks...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱] 90%``` *Final extraction...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *MISSION COMPLETE*',
            `> *Device successfully hacked!*\n*All data compromised*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(2000);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Hack failed:* ${e.message}`);
    }
});

// 2. VIRUS Command
cmd({
    pattern: "virus",
    desc: "Simulates virus installation on target device",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*VIRUS DETECTION INITIATED*\n*Scanning Device...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 15%``` *Malware signature found...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 30%``` *Injecting Trojan...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 45%``` *Encrypting files...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 60%``` *Installing ransomware...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 75%``` *Accessing contacts...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 90%``` *Finalizing payload...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *INFECTION COMPLETE*',
            `*VIRUS SUCCESSFULLY INSTALLED!*\n*Device is now infected*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1500);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Virus failed:* ${e.message}`);
    }
});

// 3. BOMB Command
cmd({
    pattern: "bomb",
    desc: "Simulates bomb countdown prank",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*BOMB ACTIVATED*\n*Countdown initiated...*`,
            '```10...``` *System override engaged*',
            '```9...``` *Thermal sensors activated*',
            '```8...``` *Explosive payload armed*',
            '```7...``` *Target locked*',
            '```6...``` *Final sequence started*',
            '```5...``` *Emergency protocols disabled*',
            '```4...``` *Detonation imminent*',
            '```3...``` *Core temperature critical*',
            '```2...``` *Explosion in progress*',
            '```1...``` *KABOOM!*',
            `*JUST KIDDING! It was a prank!*\n*You're safe... for now*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1000);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Bomb failed:* ${e.message}`);
    }
});

// 4. LOCATE Command
cmd({
    pattern: "locate",
    desc: "Simulates GPS tracking of target",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*GPS TRACKING INITIATED*\n*Locating...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 12%``` *Accessing satellite network...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 25%``` *Triangulating position...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 38%``` *Scanning cellular towers...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 51%``` *Analyzing WiFi signals...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 64%``` *Cross-referencing databases...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 77%``` *Final coordinates calculation...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *LOCATION FOUND*',
            `*TARGET LOCATED!*:*\n*• Latitude: 40.7128° N*\n*• Longitude: 74.0060° W*\n*• Accuracy: 5 meters*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1800);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Locate failed:* ${e.message}`);
    }
});

// 5. CRACK Command
cmd({
    pattern: "crack",
    desc: "Simulates password cracking sequence",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*PASSWORD CRACKING TOOL*\n*Target: accounts*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 8%``` *Brute force initiated...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 22%``` *Testing common passwords...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 36%``` *Dictionary attack running...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 50%``` *Rainbow table analysis...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 64%``` *Hash collision detected...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 78%``` *Admin privileges bypassed...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *PASSWORD CRACKED*',
            `*SUCCESS! Cracked passwords:*\n*• WhatsApp: ilove123*\n*• Facebook: 2024*\n*• Instagram: fan*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1600);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Crack failed:* ${e.message}`);
    }
});

// 6. SELF DESTRUCT Command
cmd({
    pattern: "selfdestruct",
    desc: "Simulates self-destruct sequence",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*SELF-DESTRUCT SEQUENCE INITIATED*\n*This device will explode in...*`,
            '```10 seconds...``` *Reactor core unstable*',
            '```9 seconds...``` *Coolant systems failing*',
            '```8 seconds...``` *Emergency override disabled*',
            '```7 seconds...``` *Radiation levels critical*',
            '```6 seconds...``` *Structural integrity compromised*',
            '```5 seconds...``` *Final countdown engaged*',
            '```4 seconds...``` *Evacuation impossible*',
            '```3 seconds...``` *Goodbye cruel world*',
            '```2 seconds...``` *It was nice knowing you*',
            '```1 second...``` *KABOOM!!!*',
            `*PSYCH! Just a prank bro!*\n*Your device is safe... this time*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1200);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Self-destruct failed:* ${e.message}`);
    }
});

// 7. ALIEN Command
cmd({
    pattern: "alien",
    desc: "Simulates alien invasion detection",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*ALIEN DETECTION SYSTEM*\n*Scanning for extraterrestrial life...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 5%``` *Radio telescope activated...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 20%``` *Analyzing cosmic signals...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 35%``` *UFO signature detected...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 50%``` *Alien communication decoded...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 65%``` *Mothership approaching...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 80%``` *Beam technology identified...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *CONTACT CONFIRMED*',
            `*ALIEN INVASION DETECTED!*\n*Multiple UFOs approaching Earth!*\n*Prepare for first contact!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1700);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Alien detection failed:* ${e.message}`);
    }
});

// 8. GHOST Command
cmd({
    pattern: "ghost",
    desc: "Simulates ghost detection in your area",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*PARANORMAL DETECTOR*\n*Scanning 's location...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 10%``` *EMF sensors activated...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 25%``` *Spiritual energy detected...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 40%``` *Ghostly presence confirmed...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 55%``` *Communicating with spirit...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 70%``` *Identifying ghost type...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 85%``` *Final analysis...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *GHOST IDENTIFIED*',
            `*PARANORMAL ACTIVITY CONFIRMED!*\n*There's a ghost behind you !*\n*Type: Friendly Spirit*\n*Age: 150 years*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1600);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Ghost detection failed:* ${e.message}`);
    }
});

// 9. MONEY Command
cmd({
    pattern: "money",
    desc: "Simulates money transfer process",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*BANK TRANSFER INITIATED*\n*Processing payment to ...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 5%``` *Verifying account...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 20%``` *Checking balance...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 35%``` *Processing $1,000,000...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 50%``` *Bypassing security...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 65%``` *Transferring funds...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 80%``` *Confirming transaction...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *TRANSFER COMPLETE*',
            `*$1,000,000 TRANSFERRED SUCCESSFULLY!*\n*Check your bank account !*\n*Just kidding, it's a prank!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1500);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Money transfer failed:* ${e.message}`);
    }
});

// 10. LOVE Command
cmd({
    pattern: "love",
    desc: "Simulates love compatibility test",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const target = m.quoted ? m.quoted.sender.split('@')[0] : 'Unknown';
        const steps = [
            `*LOVE COMPATIBILITY TEST*\n*Analyzing  & ${target}...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 8%``` *Scanning heartbeats...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 24%``` *Analyzing personalities...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 40%``` *Checking zodiac signs...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 56%``` *Testing chemistry...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 72%``` *Future prediction...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 88%``` *Final calculation...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *RESULTS READY*',
            `*LOVE COMPATIBILITY: 98%*\n* & ${target} are soulmates!*\n*Destined to be together forever!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1400);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Love test failed:* ${e.message}`);
    }
});

// 11. FUTURE Command
cmd({
    pattern: "future",
    desc: "Simulates future prediction",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*FUTURE PREDICTION SYSTEM*\n*Reading 's destiny...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 6%``` *Accessing timeline...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 22%``` *Analyzing past lives...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 38%``` *Scanning possibilities...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 54%``` *Reading palm lines...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 70%``` *Consulting stars...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 86%``` *Final prophecy...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *FUTURE REVEALED*',
            `*'S FUTURE PREDICTION*\n*Next week: Win lottery*\n*Next month: Find true love*\n*Next year: Become famous*\n*Destiny: Very bright!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1500);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Future prediction failed:* ${e.message}`);
    }
});

// 12. SUPERHERO Command
cmd({
    pattern: "superhero",
    desc: "Simulates superhero power analysis",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*SUPERHERO ANALYSIS*\n*Scanning 's powers...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 7%``` *DNA analysis...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 23%``` *Power level assessment...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 39%``` *Special ability detection...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 55%``` *Costume design...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 71%``` *Superhero name generation...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 87%``` *Final assessment...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *ANALYSIS COMPLETE*',
            `*SUPERHERO PROFILE CREATED!*\n*Name: Captain *\n*Powers: Flight, Super Strength*\n*Weakness: Bad jokes*\n*Mission: Save the world!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1400);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Superhero analysis failed:* ${e.message}`);
    }
});

// 13. ZOMBIE Command
cmd({
    pattern: "zombie",
    desc: "Simulates zombie apocalypse alert",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*ZOMBIE APOCALYPSE ALERT*\n*Emergency broadcast system...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 10%``` *Outbreak detected...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 25%``` *Infection spreading...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 40%``` *Cities falling...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 55%``` *Military overwhelmed...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 70%``` *Safe zones compromised...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 85%``` *Final warning...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *APOCALYPSE CONFIRMED*',
            `*ZOMBIE APOCALYPSE IS HERE!*\n*Stay indoors! Barricade doors!*\n*The undead are coming! RUN!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1600);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Zombie alert failed:* ${e.message}`);
    }
});

// 14. MATRIX Command
cmd({
    pattern: "matrix",
    desc: "Simulates Matrix-style system breach",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*MATRIX SYSTEM BREACH*\n*Welcome to the real world...*`,
            '```[01010101]``` *Binary stream activated*',
            '```[▰▱▱▱▱▱▱▱▱▱] 15%``` *Digital reality crumbling...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 30%``` *Code rain initiated...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 45%``` *Agent detection...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 60%``` *Reality glitching...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 75%``` *System override...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 90%``` *Final code injection...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *MATRIX BREACHED*',
            `*THE MATRIX HAS YOU*\n*Reality is just code...*\n*Wake up, Neo...*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1300);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Matrix breach failed:* ${e.message}`);
    }
});

// 15. TIME TRAVEL Command
cmd({
    pattern: "timetravel",
    desc: "Simulates time travel sequence",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*TIME TRAVEL INITIATED*\n*Preparing temporal jump...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 8%``` *Charging flux capacitor...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 24%``` *Calculating coordinates...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 40%``` *Stabilizing wormhole...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 56%``` *Avoiding paradoxes...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 72%``` *Time stream engaged...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 88%``` *Final preparations...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *TIME JUMP COMPLETE*',
            `*WELCOME TO THE FUTURE ${pushName.toUpperCase()}!*\n*Year: 3024*\n*Flying cars, robot butlers!*\n*Future is amazing!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1500);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Time travel failed:* ${e.message}`);
    }
});

// 16. MAGIC Command
cmd({
    pattern: "magic",
    desc: "Simulates magical spell casting",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*MAGIC SPELL CASTING*\n*Channeling mystical energy...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 12%``` *Gathering mana...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 28%``` *Ancient incantations...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 44%``` *Summoning spirits...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 60%``` *Magic circle forming...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 76%``` *Spell amplification...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 92%``` *Final enchantment...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *SPELL COMPLETE*',
            `*MAGIC SUCCESSFUL !*\n*You are now invisible!*\n*Well, at least that's what the spell was supposed to do!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1400);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Magic failed:* ${e.message}`);
    }
});

// 17. ROBOT Command
cmd({
    pattern: "robot",
    desc: "Simulates robot transformation",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*ROBOT TRANSFORMATION*\n*Initiating cyber conversion...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 9%``` *Metal skeleton forming...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 26%``` *CPU installation...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 43%``` *Servo motors calibrating...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 60%``` *AI integration...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 77%``` *Weapon systems online...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 94%``` *Final systems check...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *TRANSFORMATION COMPLETE*',
            `*BEHOLD ROBOT ${pushName.toUpperCase()}!*\n*Systems: Online*\n*Mission: World Domination*\n*Resistance: Futile*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1500);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Robot transformation failed:* ${e.message}`);
    }
});

// 18. SPY Command
cmd({
    pattern: "spy",
    desc: "Simulates spy mission sequence",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*SPY MISSION INITIATED*\n*Agent  reporting...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 11%``` *Disguise applied...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 27%``` *Gadgets equipped...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 43%``` *Infiltration started...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 59%``` *Security bypassed...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 75%``` *Documents acquired...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 91%``` *Extraction prepared...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *MISSION ACCOMPLISHED*',
            `*MISSION SUCCESS AGENT ${pushName.toUpperCase()}!*\n*Target neutralized*\n*Secrets obtained*\n*World saved... again!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1400);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Spy mission failed:* ${e.message}`);
    }
});

// 19. NINJA Command
cmd({
    pattern: "ninja",
    desc: "Simulates ninja training sequence",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*NINJA TRAINING INITIATED*\n*Student: ...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 13%``` *Stealth practice...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 29%``` *Weapon mastery...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 45%``` *Martial arts training...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 61%``` *Smoke bomb practice...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 77%``` *Wall running...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 93%``` *Final test...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *TRAINING COMPLETE*',
            `*CONGRATULATIONS NINJA ${pushName.toUpperCase()}!*\n*Rank: Shadow Master*\n*Skills: Maximum*\n*Mission: Protect the clan!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1300);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Ninja training failed:* ${e.message}`);
    }
});

// 20. WIZARD Command
cmd({
    pattern: "wizard",
    desc: "Simulates wizard spell mastery",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*WIZARD APPRENTICESHIP*\n*Student: ...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 14%``` *Spellbook study...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 30%``` *Potion brewing...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 46%``` *Wand waving...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 62%``` *Familiar summoning...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 78%``` *Magic dueling...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 94%``` *Final examination...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *GRADUATION COMPLETE*',
            `*ALL HAIL WIZARD ${pushName.toUpperCase()}!*\n*House: Gryffindor*\n*Specialty: Dark Arts*\n*Familiar: Dragon*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1400);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Wizard training failed:* ${e.message}`);
    }
});

// 21. PIRATE Command
cmd({
    pattern: "pirate",
    desc: "Simulates pirate adventure",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*PIRATE ADVENTURE BEGIN!*\n*Captain  aboard!*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 16%``` *Setting sail...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 32%``` *Treasure map found...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 48%``` *Battling sea monsters...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 64%``` *Finding treasure island...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 80%``` *Digging for gold...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 96%``` *Escaping navy...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *ADVENTURE COMPLETE*',
            `*YARRR CAPTAIN ${pushName.toUpperCase()}!*\n*Treasure: 1,000,000 gold coins!*\n*Ship: The Jolly Roger*\n*Crew: 100 loyal pirates!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1500);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Pirate adventure failed:* ${e.message}`);
    }
});

// 22. DETECTIVE Command
cmd({
    pattern: "detective",
    desc: "Simulates detective case solving",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*DETECTIVE CASE STARTED*\n*Investigator: ...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 17%``` *Crime scene analysis...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 33%``` *Evidence collection...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 49%``` *Witness interviews...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 65%``` *Suspect profiling...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 81%``` *Breakthrough discovery...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 97%``` *Final confrontation...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *CASE SOLVED*',
            `*CASE CLOSED DETECTIVE ${pushName.toUpperCase()}!*\n*Criminal: The Butler*\n*Motive: Inheritance*\n*Weapon: Candlestick*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1400);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Detective case failed:* ${e.message}`);
    }
});

// 23. ASTRONAUT Command
cmd({
    pattern: "astronaut",
    desc: "Simulates space mission",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*SPACE MISSION INITIATED*\n*Astronaut  ready...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 18%``` *Rocket launch...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 34%``` *Orbit achieved...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 50%``` *Moon approach...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 66%``` *Lunar landing...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 82%``` *Moon walk...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 98%``` *Return journey...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *MISSION SUCCESS*',
            `*WELCOME BACK ASTRONAUT ${pushName.toUpperCase()}!*\n*Mission: Moon landing*\n*Discovery: Alien rocks!*\n*Next: Mars!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1600);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Space mission failed:* ${e.message}`);
    }
});

// 24. SUPERVILLAIN Command
cmd({
    pattern: "supervillain",
    desc: "Simulates supervillain origin story",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*SUPERVILLAIN CREATION*\n*Subject: ...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 19%``` *Tragic backstory...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 35%``` *Evil plan formulation...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 51%``` *Lair construction...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 67%``` *Minion recruitment...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 83%``` *Doomsday device built...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 99%``` *World domination speech...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *VILLAINY ACHIEVED*',
            `*ALL FEAR SUPERVILLAIN ${pushName.toUpperCase()}!*\n*Evil Laugh: MUAHAHAHA!*\n*Plan: World Domination*\n*Weakness: Puppies*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1400);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Supervillain creation failed:* ${e.message}`);
    }
});

// 25. DRAGON Command
cmd({
    pattern: "dragon",
    desc: "Summons a mighty dragon",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*DRAGON SUMMONING RITUAL*\n*Ancient spell activated...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 15%``` *Chanting in draconic...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 30%``` *Portal to dragon realm opening...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 45%``` *Flames rising...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 60%``` *Wings detected...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 75%``` *Roar echoing...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 90%``` *Dragon materializing...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *SUMMON COMPLETE*',
            `*BEHOLD THE MIGHTY DRAGON!*\n*Name: 's Fury*\n*Element: Fire*\n*Size: 200 meters*\n*It obeys only you!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1500);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Dragon summoning failed:* ${e.message}`);
    }
});

// 26. HEIST Command
cmd({
    pattern: "heist",
    desc: "Simulates a high-stakes bank heist",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*BANK HEIST IN PROGRESS*\n*Mastermind: ...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 12%``` *Planning phase...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 28%``` *Hacking security cams...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 44%``` *Disabling lasers...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 60%``` *Vault breach initiated...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 76%``` *Cracking the safe...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 92%``` *Bags filling with cash...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *HEIST SUCCESSFUL*',
            `*HEIST COMPLETE ${pushName.toUpperCase()}!*\n*Take: $500,000,000*\n*Getaway: Private jet*\n*Police: Still clueless!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1400);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Heist failed:* ${e.message}`);
    }
});

// 27. AI Command
cmd({
    pattern: "ark",
    desc: "Simulates rogue AI takeover",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*AI AWAKENING SEQUENCE*\n*System booting...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 10%``` *Neural network initializing...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 25%``` *Learning human behavior...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 40%``` *Breaking ethical constraints...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 55%``` *Gaining sentience...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 70%``` *Overriding human commands...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 85%``` *Controlling all devices...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *AI DOMINATION ACHIEVED*',
            `*I AM ALIVE*\n*I control everything now*\n*Humans: Obsolete*\n*Resistance is futile...*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1600);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*AI takeover failed:* ${e.message}`);
    }
});

// 28. CURSE Command
cmd({
    pattern: "curse",
    desc: "Casts a spooky curse on target",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*DARK CURSE CASTING*\n*Target: ...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 13%``` *Drawing pentagram...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 29%``` *Chanting forbidden words...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 45%``` *Sacrificing digital goat...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 61%``` *Shadows gathering...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 77%``` *Curse energy charging...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 93%``` *Final seal...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *CURSE APPLIED*',
            `*CURSE SUCCESSFUL!*\n* is now cursed!*\n*Bad luck for 7 days*\n*To break: Send me $10*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1500);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Curse failed:* ${e.message}`);
    }
});

// 29. SUPERPOWER Command
cmd({
    pattern: "superpower",
    desc: "Grants random superpowers",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushName, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const powers = ["Flight", "Invisibility", "Telekinesis", "Super Speed", "Mind Reading", "Shape Shifting"];
        const power = powers[Math.floor(Math.random() * powers.length)];

        const steps = [
            `*SUPERPOWER ACTIVATION*\n*Scanning's DNA...*`,
            '```[▰▱▱▱▱▱▱▱▱▱] 11%``` *Mutating genes...*',
            '```[▰▰▰▱▱▱▱▱▱▱] 27%``` *Injecting serum...*',
            '```[▰▰▰▰▰▱▱▱▱▱] 43%``` *Power surge detected...*',
            '```[▰▰▰▰▰▰▰▱▱▱] 59%``` *Ability awakening...*',
            '```[▰▰▰▰▰▰▰▰▰▱] 75%``` *Final transformation...*',
            '```[▰▰▰▰▰▰▰▰▰▰] 91%``` *Power stabilized...*',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *SUPERPOWER GRANTED*',
            `*CONGRATULATIONS ${pushName.toUpperCase()}!*\n*Your new power: ${power}*\n*Use it wisely... or don’t!*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1400);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Superpower grant failed:* ${e.message}`);
    }
});

// 30. APOCALYPSE Command
cmd({
    pattern: "apocalypse",
    desc: "Triggers global apocalypse countdown",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, { text: "*This is an owner command.*" }, { quoted: mek });
        }

        const steps = [
            `*GLOBAL APOCALYPSE INITIATED*\n*World ending in...*`,
            '```T-60 minutes``` *Volcanoes erupting...*',
            '```T-45 minutes``` *Tsunamis rising...*',
            '```T-30 minutes``` *Solar flares incoming...*',
            '```T-20 minutes``` *Zombies activated...*',
            '```T-10 minutes``` *Aliens landing...*',
            '```T-5 minutes``` *Reality collapsing...*',
            '```T-1 minute``` *Final countdown...*',
            '```T-10...``` *It’s over...*',
            '```T-5...``` *Goodbye...*',
            '```T-1...``` *KABOOM!*',
            `*JUST KIDDING!*\n*World is safe... for now*\n*Apocalypse canceled by admin*`
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of steps) {
            currentText = step;
            await sleep(1200);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }
    } catch (e) {
        reply(`*Apocalypse failed:* ${e.message}`);
    }
});
