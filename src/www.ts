import * as dotenv from 'dotenv';
dotenv.config();
import Handlebars from 'handlebars';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import { engine as hbsEngine } from 'express-handlebars';
import LogsMongoClient from './libs/mongo/Logs';
import config from './config';
import routes from './routes';
import * as middleware from './middleware';
import * as FileNotFoundHandler from './libs/express/handlers/FileNotFoundHandler';
import * as ErrorHandler from './libs/express/handlers/ErrorHandler';
import MigrationRunner from './libs/migrations';
import helpers from './libs/hbs/helpers';


const app = express();
const logger = new LogsMongoClient();

const partialsDir = path.join(__dirname, 'views/partials');
for (const file of fs.readdirSync(partialsDir)) {
  if (file.endsWith('.hbs')) {
    const partialName = path.basename(file, '.hbs');
    const partialPath = path.join(partialsDir, file);
    const partialContent = fs.readFileSync(partialPath, 'utf8');
    Handlebars.registerPartial(partialName, partialContent);
  }
}

app.engine(
  'hbs',
  hbsEngine({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: partialsDir,
    helpers: {
      ...helpers
    },
  })
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
console.log('View engine set to hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(middleware.inject.config());
app.use(middleware.inject.pagePath());
app.use(middleware.inject.settingsGroups);
app.use((req, res, next) => {
  res.locals.sitemap = helpers.getSitemap();
  next();
});


app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', middleware.ui.allow, (req: Request, res: Response) => {
  return res.render('index', { title: 'TacoBot' });
});

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  //return res.sendStatus(404);
  return next();
});

app.use('/', routes);

// setup the MigrationRunner
const migrationRunner = new MigrationRunner();
migrationRunner.initialize();

// app.use(FileNotFoundHandler('Page Not Found', 404));

// 500 error handler
// app.use(ErrorHandler());

function normalizePort(value: string): number | string | false {
  const port = parseInt(value, 10);
  if (isNaN(port)) {
    return value;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

const port = normalizePort(process.env.PORT || '3000') || 3000;
console.log("begin listen action");
app.listen(port, async () => {
  console.log("Attempting to log server start");
  try {
    await logger.info('tacobot.www', `tacobot listening → ':${port}'`);
  } catch(error) {
    console.error('Error logging server start:', error);
  }
  console.log(`Server is running on port: ${port}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  try {
    await logger.info('tacobot.www', 'Server shutting down, closing DB connections');
    await logger.close(); // Close MongoDB connection
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('uncaughtException', async (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      await logger.error('tacobot.bin.www', `${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      await logger.error('tacobot.bin.www', `${bind} is already in use`);
      process.exit(1);
      break;
    case 'ECONNREFUSED':
      await logger.error('tacobot.bin.www', `${bind} connection refused`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default app;
