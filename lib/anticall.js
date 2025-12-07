const config = require('../config');

const AntiCall = async (conn, calls) => {
    try {
        for (const call of calls) {
            if (call.status !== "offer") continue;

            const id = call.id;
            const from = call.from;

            await conn.rejectCall(id, from);
            await conn.sendMessage(from, {
                text: config.REJECT_MSG || "*📞 ᴄαℓℓ ɴσт αℓℓσωє∂ ιɴ тнιѕ ɴᴜмвєʀ уσυ ∂σɴт нανє ᴘєʀмιѕѕισɴ 📵*",
            });
        }
    } catch (err) {
        // Silent error handling
    }
};

module.exports = AntiCall;
