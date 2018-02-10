import {Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags} from 'tsoa';
import {MongoError} from 'mongodb';
import {IErrorResponse} from '../models/responses/index.responses';
import {ICropRepository} from '../repositories/ICropRepository';
import {CropRepository} from '../repositories/CropRepository';
import {Crop, ICrop, ICropVm} from '../models/Crop';
import {INewCropParams} from '../models/requests/index.requests';
import moment = require('moment');

@Route('crops')
export class CropController extends Controller {
    private static resolveErrorResponse(error: MongoError | null, message: string): IErrorResponse {
        return {
            thrown: true,
            error,
            message
        };
    }

    private readonly _cropRepository: ICropRepository = new CropRepository(Crop);

    /**
     *
     * @param {INewCropParams} newCropParams
     * @returns {Promise<ICropVm>}
     */
    @Post('create')
    @Tags('Crop')
    public async registerCrop(@Body() newCropParams: INewCropParams): Promise<ICropVm> {

        const newCrop: ICrop = new Crop();
        newCrop.name = newCropParams.name;
        newCrop.variety = newCropParams.variety;
        newCrop.pricePerPound = newCropParams.pricePerPound;

        return await <ICropVm>this._cropRepository.createCrop(newCrop);
    }

    /**
     *
     * @param {string} username
     * @returns {Promise<ICropVm>}
     */
    @Get('getAll')
    @Tags('Crop')
    public async getAll(): Promise<ICropVm[]> {
        const result: ICrop[] = await this._cropRepository.findAll();
        return <ICropVm[]>result;
    }

    @Get('{id}')
    @Tags('Crop')
    public async getSingleCrop(@Path() id: string): Promise<ICropVm> {
        return await <ICropVm>this._cropRepository.getCropById(id);
    }

    @Put('{id}')
    @Tags('Crop')
    public async updateCrop(@Path() id: string, @Body() updateCropParams: INewCropParams): Promise<ICropVm> {
        const existedCrop: ICrop = await this._cropRepository.getCropById(id);

        const updatedCrop: ICrop = new Crop();
        updatedCrop._id = existedCrop._id;
        updatedCrop.updatedOn = moment().toDate();
        updatedCrop.name = updateCropParams.name;
        updatedCrop.pricePerPound = updateCropParams.pricePerPound;
        updatedCrop.variety = updateCropParams.variety;

        return await <ICropVm>this._cropRepository.update(id, updatedCrop);
    }

    @Delete('{id}')
    @Tags('Crop')
    @Security('JWT')
    public async deleteCrop(@Path() id: string): Promise<ICropVm> {
        return await <ICropVm>this._cropRepository.delete(id);
    }
}