import DatabaseMongoClient from './Database';
import config from '../../config';
import LogsMongoClient from './Logs';
import SettingEntry from '../../models/SettingEntry';
import Reflection from '../Reflection';

const logger = new LogsMongoClient();
const MODULE = 'SettingsMongoClient';

interface Setting {
  name: string;
  value: any;
}

export default class SettingsMongoClient extends DatabaseMongoClient<Setting> {

  constructor() {
    super();
    this.collectionName = 'settings';
  }

  async getByName(guildId: string, name: string): Promise<SettingEntry | null> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      await this.connect();
      const collection = await this.getCollectionOf<SettingEntry>();
      const result = await collection.findOne({ guild_id: guildId, name });
      return result || null;
    } catch (err: any) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return new SettingEntry();
    }
  }

  async getSections(): Promise<any[]> {
    const method = Reflection.getCallingMethodName();
    try {
      await this.connect();
      const collection = await this.getCollection();
      /*
      {
        name: 'general',
        guild_id: 'guild id',
      }
      */
     // return as:
     /*
      [
        {
          name: 'general',
          guilds: [
            { guild_id: 'guild id'},
            { guild_id: 'guild id'},
          ]
        },
        {
          name: 'another section',
          guilds: [
            { guild_id: 'guild id'},
            { guild_id: 'guild id'},
          ]
        }
      ]
     */
      // filter out any that have metadata.hidden = true
      // we can do this by looking up one of the entries with this name and checking its metadata.hidden
      // if multiple entries have different metadata.hidden, just pick one arbitrarily
      // if none have metadata.hidden, include it

      // aggregate by name, and get a list of guilds for each name
      // also get the displayName from metadata.label if it exists
      // if multiple entries have different metadata.label, just pick one arbitrarily
      // if none have metadata.label, use the name as displayName
      const results = await collection.aggregate([
        // Only include documents that are NOT hidden
        {
          $match: {
            $or: [
              { 'metadata.hidden': { $exists: false } },
              { 'metadata.hidden': { $ne: true } }
            ]
          }
        },
        {
          $group: {
            _id: '$name',
            // Prefer the first label seen; can be null/undefined
            displayName: { $first: '$metadata.label' },
            guilds: { $addToSet: '$guild_id' },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            // Fallback to the section name when there is no label
            displayName: { $ifNull: ['$displayName', '$_id'] },
            guilds: 1,
          },
        },
        {
          $sort: { displayName: 1, name: 1 }
        }
      ]).toArray();

      // create a map that includes the name, and the guild, with guilds sorted
      return results.map(r => {
        const sortedGuilds: string[] = (r.guilds || [])
          .map((g: any) => g?.toString?.() ?? String(g))
          .sort((a: string, b: string) => a.localeCompare(b));
        return {
          name: r.name,
          displayName: r.displayName,
          guilds: sortedGuilds.map((g: string) => ({ guild_id: g })),
        };
      });
    } catch (err: any) {
      await logger.error(`${MODULE}.${method}`, err.message, { stack: err.stack });
      return [];
    }
  }

  async getGroups(): Promise<string[]> {
    const method = 'getGroups';
    try {
      await this.connect();
      const collection = await this.getCollection();
      const results = await collection.distinct('name');
      // create a map that includes the name, and the guild.
      return results;
    } catch (err: any) {
      await logger.error(`${MODULE}.${method}`, err.message, { stack: err.stack });
      return [];
    }
  }

  async list(): Promise<Setting[]> {
    const method = 'list';
    try {
      await this.connect();
      const collection = await this.getCollection();
      const result = await collection.find().toArray();
      return result;
    } catch (err: any) {
      await logger.error(`${MODULE}.${method}`, err.message, { stack: err.stack });
      return [];
    }
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    const METHOD = 'get';
    try {
      await this.connect();
      if (!this.db) throw new Error('Database connection is not initialized.');
      this.collection = this.db.collection<Setting>(this.collectionName);
      const result = await this.collection.findOne({ name: key });
      return result ? (result.value as T) : defaultValue;
    } catch (err: any) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return defaultValue;
    }
  }

  async set(key: string, value: any): Promise<boolean> {
    const METHOD = 'set';
    try {
      await this.connect();
      if (!this.db) throw new Error('Database connection is not initialized.');
      this.collection = this.db.collection<Setting>(this.collectionName);
      const result = await this.collection.updateOne(
        { name: key },
        { $set: { value } },
        { upsert: true }
      );
      return result.acknowledged;
    } catch (err: any) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return false;
    }
  }

  async save(): Promise<void> {
    throw new Error('Not implemented');
  }
}