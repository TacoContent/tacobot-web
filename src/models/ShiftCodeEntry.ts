import { Document } from 'mongodb';


export interface ShiftCodeGame {
	id: string;
	name: string;
}

export interface ShiftCodeTrackedIn {
	guild_id: string;
	channel_id: string;
	message_id: string;
}

export default class ShiftCodeEntry implements Document {
	_id?: string = undefined;
	games: ShiftCodeGame[] = [];
	code: string = '';
	platforms: string[] = [];
	expiry: number | null = null;
	reward: string = '';
	notes: string = '';
	source: string = '';
	source_id: string = '';
	created_at: number = Date.now();
	tracked_in: ShiftCodeTrackedIn[] = [];

	constructor(data: Partial<ShiftCodeEntry> = {}) {
		Object.assign(this, data);
	}
}