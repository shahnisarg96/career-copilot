import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 8089;
export const DATABASE_URL = process.env.DATABASE_URL;
