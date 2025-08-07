const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true,
    },
    ign: {
        type: String,
        required: true,
        unique: true,
    },
    guild: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Guild',
        default: null
    },
    guildHistory: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Guild',
        default: []
    },
    iron: {
        type: Number,
        default: 0
    },
    gold: {
        type: Number,
        default: 0
    },
    stats: {
        kill: {
            type: Number,
            default: 0
        },
        death: {
            type: Number,
            default: 0
        },
        kdr: {
            type: Number,
            default: 0
        },
        finalKills: {
            type: Number,
            default: 0
        },
        finalDeaths: {
            type: Number,
            default: 0
        },
        fkdr: {
            type: Number,
            default: 0
        },
        bed: {
            type: Number,
            default: 0
        },
        bedRatio: {
            type: Number,
            default: 0
        },
    },
    game: {
        play: {
            type: Number,
            default: 0
        },
        win: {
            type: Number,
            default: 0
        },
        loss: {
            type: Number,
            default: 0
        },
        wlr: {
            type: Number,
            default: 0
        },
        mvp: {
            type: Number,
            default: 0
        },
        mvpRatio: {
            type: Number,
            default: 0
        },
        streak: {
            type: Number,
            default: 0
        },
    },
    gvg: {
        play: {
            type: Number,
            default: 0
        },
        win: {
            type: Number,
            default: 0
        },
        loss: {
            type: Number,
            default: 0
        },
        wlr: {
            type: Number,
            default: 0
        },
        mvp: {
            type: Number,
            default: 0
        },
        mvpRatio: {
            type: Number,
            default: 0
        },
        streak: {
            type: Number,
            default: 0
        },
    }
});

module.exports = mongoose.model('User', userSchema);