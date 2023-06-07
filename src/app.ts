import express from 'express';
import bodyParser from 'body-parser';

import routes from './routes';

const app = express();

app.set('port', process.env.PORT || 3000);

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', routes);

export default app;
