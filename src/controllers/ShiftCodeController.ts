import config from '../config';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment-timezone';
import LogsMongoClient from '../libs/mongo/Logs';
import ShiftCodeMongoClient from '../libs/mongo/ShiftCodes';


export default class ShiftCodeController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;
  private shiftcodeClient = new ShiftCodeMongoClient();


};