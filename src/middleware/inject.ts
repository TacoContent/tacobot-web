import { Request, Response, NextFunction } from 'express';
import config from '../config';
import SettingsMongoClient from '../libs/mongo/Settings';


const configs = async (req: Request, res: Response, next: NextFunction) =>  {
  res.locals.config = config;
  next();
};

const discordGuild = async (req: Request, res: Response, next: NextFunction) => {
  const guildId = req.params.guildId || req.query.guildId || req.query.guild_id || req.query.guild || config.tacobot.primaryGuildId;
  res.locals.discordGuild = guildId;
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

export default { config: configs, pagePath, settingsGroups, searchQuery, discordGuild };
export { configs as config, pagePath, settingsGroups, searchQuery, discordGuild };