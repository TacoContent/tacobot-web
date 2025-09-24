import DatabaseMongoClient from './Database'
import DiscordGuildEntry from '../../models/DiscordGuildEntry';

class DiscordGuildsMongoClient extends DatabaseMongoClient<DiscordGuildEntry> {
  constructor() {
    super();
    this.collectionName = 'guilds';
    console.log("DiscordGuildsMongoClient initialized");
  }

  async getAll(): Promise<DiscordGuildEntry[]> {
    const collection = await this.getCollection();
    return await collection.find({}).sort({ created_at: -1 }).toArray();
  }

  async findById(id: string): Promise<DiscordGuildEntry | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ guild_id: id });
  }

  async findByIds(ids: string[]): Promise<DiscordGuildEntry[]> {
    const collection = await this.getCollection();
    return await collection.find({ guild_id: { $in: ids } }).toArray();
  }
}

export default DiscordGuildsMongoClient;
