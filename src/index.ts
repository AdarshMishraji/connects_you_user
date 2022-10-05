import { createOrReturnDBConnection, redisConnection, upgradeResponse } from '@adarsh-mishra/node-utils';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import httpContext from 'express-http-context';
import rateLimit from 'express-rate-limit';

import { RateLimitConfig } from './configs/rateLimit';
import { v1Router } from './routes';

dotenv.config();

const port = process.env.PORT || 1000;

void createOrReturnDBConnection({
	dbUri: process.env.ENV === 'dev' ? process.env.PROD_MONGO_URL : process.env.DEV_MONGO_URL,
});

const app = express();

const redisClient = redisConnection({
	redisHost: process.env.ENV === 'dev' ? process.env.DEV_REDIS_HOST : process.env.PROD_REDIS_HOST,
	redisPort: process.env.ENV === 'dev' ? process.env.DEV_REDIS_PORT : process.env.PROD_REDIS_PORT,
	redisDB: process.env.ENV === 'dev' ? process.env.DEV_REDIS_DB : process.env.PROD_REDIS_DB,
});

app.set('trust proxy', true);
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(rateLimit(RateLimitConfig));
app.use(httpContext.middleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use((req, res, next) => {
	req.redisClient = redisClient;
	next();
});

upgradeResponse(app).use(v1Router);

app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log('Server running at: ' + port + ' ' + new Date());
});
