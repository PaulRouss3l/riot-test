import dotenv from 'dotenv';

dotenv.config();

import app from './app';

app.listen(app.get('port'), (): void => {
  // eslint-disable-next-line
  console.log('\x1b[36m%s\x1b[0m', `🌏 Express server started at http://localhost:${app.get('port')}`);
});

process.on('SIGINT', () => {
  process.exit(0);
});
