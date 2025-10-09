import GameKeyEntry from "./GameKeyEntry";
import GameKeyOfferEntry from "./GameKeyOfferEntry";

export interface GameKeyOfferData extends Partial<GameKeyOfferEntry> {
  _id?: string;
}

export default class GameKeyOffer extends GameKeyEntry implements Partial<GameKeyOfferEntry> {
  constructor(data: Partial<GameKeyOffer> = {}) {
    super(data);
    Object.assign(this, data);
  }

}