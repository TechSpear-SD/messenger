import fs from 'fs';
import morgan from 'morgan';
import { config } from '../../../config';
import path from 'path';

export const morganConfig = morgan('common', {
    stream: fs.createWriteStream(
        path.join(`${config.logsPath}`, 'access.log'),
        { flags: 'a' },
    ),
});
