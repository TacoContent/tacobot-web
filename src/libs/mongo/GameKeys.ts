import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult, ObjectId } from 'mongodb';
import moment from 'moment-timezone';
import GameKeyEntry from '../../models/GameKeyEntry';
import PagedResults from '../../models/PagedResults';
import DiscordUsersMongoClient from './Users';
import GameKeyOfferEntry from '../../models/GameKeyOfferEntry';
import GameKeyOffer from '../../models/GameKeyOffer';

class GameKeysMongoClient extends DatabaseMongoClient<GameKeyEntry> {
  constructor() {
    super();
    this.collectionName = 'game_keys';
    console.log("GameKeysMongoClient initialized");
  }

  async getOffers(): Promise<GameKeyOffer[]> {
    const collection = await this.getCollectionOf<GameKeyOfferEntry>('game_key_offers');
    const gameKeysCollection = await this.getCollectionOf<GameKeyEntry>();
    const offers = await collection.find({}).toArray();
    const result: GameKeyOffer[] = [];

    for (const offer of offers) {
      // Convert game_key_id to ObjectId when possible; fallback as-is otherwise
      const rawId: any = (offer as any).game_key_id;
      let lookupId: any = rawId;
      try {
        if (typeof rawId === 'string' && ObjectId.isValid(rawId)) {
          lookupId = new ObjectId(rawId);
        } else if (rawId && typeof rawId === 'object') {
          // Likely already an ObjectId
          lookupId = rawId;
        }
      } catch (e) {
        console.warn('Unable to normalize game_key_id for lookup, using raw value', rawId, e);
      }
      let gameKey = await gameKeysCollection.findOne({ _id: lookupId });
      // Fallback: if ObjectId lookup failed, try raw string _id (in case stored as string)
      if (!gameKey && typeof rawId === 'string') {
        try {
          gameKey = await gameKeysCollection.findOne({ _id: rawId });
        } catch (e) {
          console.warn('Fallback string lookup failed for game_key_id', rawId, e);
        }
      }
      const mappedKey: GameKeyEntry | null = gameKey ? { ...gameKey } : null;
      if (mappedKey) {
        // use offer.game_key_id as _id
        // remove the id from gameKey to avoid conflict
        delete mappedKey._id;
        result.push(new GameKeyOffer({ ...offer, ...mappedKey, _id: String(rawId) }));
      }
    }

    return result;

  }

  async get(skip: number = 0, take: number = 100, search?: string, additionalFilters?: any): Promise<PagedResults<GameKeyEntry>> {
    const collection = await this.getCollection();
    const users = new DiscordUsersMongoClient();
    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    // need to join with users collection to get the usernames
    const filteredUsers = await users.get(search);
    const filteredUserMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));
    // Start with additionalFilters if provided
    let filter: any = {};
    if (additionalFilters && Object.keys(additionalFilters).length > 0) {
      // shallow copy so we don't mutate the caller's object
      filter = { ...additionalFilters };
    }

    if (search) {
      search = search.trim();
      if (search.length > 0) {
        const orClauses: any[] = [
          { title: { $regex: search, $options: 'i' } },
          { key: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } },
          { user_owner: { $in: Array.from(filteredUserMap.keys()) } },
          { redeemed_by: { $in: Array.from(filteredUserMap.keys()) } },
        ];

        const andClauses: any[] = [];
        
        // If caller provided additionalFilters, include them as an AND clause
        if (additionalFilters && Object.keys(additionalFilters).length > 0) {
          andClauses.push(additionalFilters);
        }
        andClauses.push({ $or: orClauses });

        filter = { $and: andClauses };
      }
    }
    const items = await collection.find(filter).skip(skip).limit(take).sort({ redeemed_timestamp: 1, title: 1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async add(entry: GameKeyEntry): Promise<GameKeyEntry | null> {
    const collection = await this.getCollection();
    // entry.created_timestamp = moment().tz(config.timezone).toDate();
    const result = await collection.insertOne(entry);
    if (result.insertedId) {
      return entry;
    } else {
      return null;
    }
  }
}

export default GameKeysMongoClient;
