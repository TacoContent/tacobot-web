import { Document } from 'mongodb';

export interface AnnouncementMessage {
  content: string;
  embeds?: any[];
  attachments?: { id: string; url: string }[];
  reactions?: { emoji: string; count: number }[];
  nonce?: string | number;
  type?: string;
}

export default class AnnouncementEntry implements Document {
  _id?: string = undefined;
  guild_id: string = '';
  channel_id: string = '';
  message_id: string = '';
  author_id: string = '';
  created_at: number = 0;
  updated_at: number = 0;
  tracked_at: number = 0;
  message: AnnouncementMessage = { content: '' };

  constructor(data: Partial<AnnouncementEntry> = {}) {
    Object.assign(this, data);
  }
}