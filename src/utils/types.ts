export interface Action {
    command: string;
    text?: string | undefined;
}

export interface UserData {
    name: string;
    department: string;
    title: string;
    userName?: string | undefined;
}