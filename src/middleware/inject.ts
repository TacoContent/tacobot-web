import { Request, Response, NextFunction } from 'express';
import config from '../config';
import SettingsMongoClient from '../libs/mongo/Settings';


const configs = async (req: Request, res: Response, next: NextFunction) =>  {
  console.log('Injecting config:', { debug: config.debug, hasConfig: !!config, keys: Object.keys(config) });
  res.locals.config = config;
  next();
};


const pagePath = async(req: Request, res: Response, next: NextFunction) => {
  res.locals.currentPath = req.path;
  next();
};

// const settingsGroups = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const settings: SettingsMongoClient = new SettingsMongoClient();
//     const groups = await settings.getGroups();
//     res.locals.settingsGroups = groups;
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

const settingsGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings: SettingsMongoClient = new SettingsMongoClient();
    const groups = await settings.getSections();
    res.locals.settingsGroups = groups;
    next();
  } catch (error) {
    next(error);
  }
};

const searchQuery = async (req: Request, res: Response, next: NextFunction) => {
  if (req.query.search) {
    console.log('Injecting search query:', req.query.search);
    res.locals.search = req.query.search || '';
  }
  next();
};

export default { config: configs, pagePath, settingsGroups, searchQuery };
export { configs as config, pagePath, settingsGroups, searchQuery };