import { Request, Response, NextFunction } from 'express';
import siteConfig from '../config';
import SettingsMongoClient from '../libs/mongo/Settings';


const config = () => {
  return (req: Request, res: Response, next: NextFunction) =>  {
    res.locals.config = siteConfig;
    next();
  };
};

const pagePath = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.currentPath = req.path;
    next();
  };
};

const settingsGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings: SettingsMongoClient = new SettingsMongoClient();
    const groups = await settings.getGroups();
    res.locals.settingsGroups = groups;
    next();
  } catch (error) {
    next(error);
  }
};

export default { config, pagePath, settingsGroups };
export { config, pagePath, settingsGroups };