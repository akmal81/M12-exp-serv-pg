import dotenv from "dotenv";
import path from "path";


dotenv.config({path:path.join(process.cwd(), ".env")});

const config = {
    connectionStr : process.env.CONNECTION_STRING,
    port: process.env.PORT
};

export default config