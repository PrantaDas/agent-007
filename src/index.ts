/**
* Entry point for the application.
* Loads environment variables from a .env file using dotenv,
* and starts the server and bot files.
*/
import { config } from "dotenv";
config();
import './server/server';
import './utils/bot';
