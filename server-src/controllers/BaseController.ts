import {MongoError} from 'mongodb';
import {IErrorResponse} from '../models/responses/IErrorResponse';
import {Controller} from 'tsoa';

export class BaseController extends Controller {
    public static resolveErrorResponse(error: MongoError | null, message: string): IErrorResponse {
        return {
            thrown: true,
            error,
            message
        };
    }
}