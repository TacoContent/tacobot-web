import { Request, Response, NextFunction } from 'express';
import siteConfig from '../config';
import SettingsMongoClient from '../libs/mongo/Settings';


const config = async (req: Request, res: Response, next: NextFunction) =>  {
  res.locals.config = siteConfig;
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

export default { config, pagePath, settingsGroups, searchQuery };
export { config, pagePath, settingsGroups, searchQuery };