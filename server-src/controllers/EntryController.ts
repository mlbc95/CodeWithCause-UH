import {Body, Delete, Get, Path, Post, Put, Query, Route, Tags} from 'tsoa';
import {IEntryRepository} from '../repositories/interfaces/IEntryRepository';
import {EntryRepository} from '../repositories/EntryRepository';
import {Entry, EntryVm, IEntry} from '../models/Entry';
import {NewEntryParams} from '../models/requests/index.requests';
import {Farm} from '../models/Farm';
import {IFarmRepository} from '../repositories/interfaces/IFarmRepository';
import {FarmRepository} from '../repositories/FarmRepository';
import {IOrganizationRepository} from '../repositories/interfaces/IOrganizationRepository';
import {OrganizationRepository} from '../repositories/OrganizationRepository';
import {IOrganization, Organization} from '../models/Organization';
import {BaseController} from './BaseController';
import {Crop, ICrop} from '../models/Crop';
import {ICropRepository} from '../repositories/interfaces/ICropRepository';
import {CropRepository} from '../repositories/CropRepository';
import {Harvester, IHarvester} from '../models/Harvester';
import {IHarvesterRepository} from '../repositories/interfaces/IHarvesterRepository';
import {HarvesterRepository} from '../repositories/HarvesterRepository';
import {Harvest, HarvestVm, IHarvest} from '../models/Harvest';
import {IHarvestRepository} from '../repositories/interfaces/IHarvestRepository';
import {HarvestRepository} from '../repositories/HarvestRepository';

@Route('entries')
export class EntryController extends BaseController {
    private readonly _entryRepository: IEntryRepository = new EntryRepository(Entry);
    private readonly _farmRepository: IFarmRepository = new FarmRepository(Farm);
    private readonly _harvestRepository: IHarvestRepository = new HarvestRepository(Harvest);
    private readonly _organizationRepository: IOrganizationRepository = new OrganizationRepository(Organization);
    private readonly _cropRepository: ICropRepository = new CropRepository(Crop);
    private readonly _harvesterRepository: IHarvesterRepository = new HarvesterRepository(Harvester);

    /**
     *
     * @param {NewEntryParams} newEntryParams
     * @returns {Promise<EntryVm>}
     */
    @Post('create')
    @Tags('Entry')
    public async registerEntry(@Body() newEntryParams: NewEntryParams): Promise<EntryVm> {
        if (!newEntryParams.cropId || !newEntryParams.harvesterId || !newEntryParams.recipientId) {
            throw EntryController.resolveErrorResponse(null, 'CropID, HarvesterID and RecipientID are REQUIRED');
        }

        const newEntry: IEntry = new Entry();
        const crop: ICrop = await this._cropRepository.getResourceById(newEntryParams.cropId);
        const harvester: IHarvester = await this._harvesterRepository.getResourceById(newEntryParams.harvesterId);
        const recipient: IOrganization = await this._organizationRepository.getResourceById(newEntryParams.recipientId);

        newEntry.crop = crop;
        newEntry.harvester = harvester;
        newEntry.recipient = recipient;
        newEntry.pounds = newEntryParams.pounds;
        newEntry.priceTotal = crop.pricePerPound * newEntryParams.pounds;
        newEntry.comments = newEntryParams.comments;
        newEntry.selectedVariety = newEntryParams.selectedVariety;

        return await this._entryRepository.create(newEntry) as EntryVm;
    }

    /**
     *
     * @param {string} username
     * @returns {Promise<EntryVm[]>}
     */
    @Get('getAll')
    @Tags('Entry')
    public async getAll(): Promise<EntryVm[]> {
        return await this._entryRepository.getAll() as EntryVm[];
    }

    /**
     *
     * @param id
     */
    @Get('{id}')
    @Tags('Entry')
    public async getSingleEntry(@Path() id: string): Promise<EntryVm> {
        return await this._entryRepository.getResourceById(id) as EntryVm;
    }

    /**
     *
     * @param {string} harvestId
     * @param {NewEntryParams} updatedEntryParams
     * @param {number} entryIndex
     * @returns {Promise<HarvestVm>}
     */
    @Put('{harvestId}')
    @Tags('Entry')
    public async updateEntry(@Path() harvestId: string, @Body() updatedEntryParams: NewEntryParams, @Query() entryIndex: number): Promise<HarvestVm> {
        const harvest: IHarvest = await this._harvestRepository.getResourceById(harvestId);

        if (!harvest)
            throw EntryController.resolveErrorResponse(null, `Harvest with ${harvestId} not found`);

        const existed: IEntry = await this._entryRepository.getResourceById(harvest.entries[entryIndex]._id);

        if (!existed)
            throw EntryController.resolveErrorResponse(null, 'Entry not found');

        const updatedEntry: IEntry = new Entry();
        const crop: ICrop = await this._cropRepository.getResourceById(updatedEntryParams.cropId);
        if (!crop) {
            throw EntryController.resolveErrorResponse(null, 'Crop not found');
        }

        const harvester: IHarvester = await this._harvesterRepository.getResourceById(updatedEntryParams.harvesterId);
        if (!harvester) {
            throw EntryController.resolveErrorResponse(null, 'Harvester not found');
        }

        const recipient: IOrganization = await this._organizationRepository.getResourceById(updatedEntryParams.recipientId);
        if (!recipient) {
            throw EntryController.resolveErrorResponse(null, 'Recipient not found');
        }

        updatedEntry._id = existed._id;
        updatedEntry.createdOn = existed.createdOn;
        updatedEntry.updatedOn = new Date(Date.now());
        updatedEntry.crop = crop;
        updatedEntry.harvester = harvester;
        updatedEntry.recipient = recipient;
        updatedEntry.pounds = updatedEntryParams.pounds;
        updatedEntry.comments = updatedEntryParams.comments;
        updatedEntry.selectedVariety = updatedEntryParams.selectedVariety;
        updatedEntry.priceTotal = crop.pricePerPound * updatedEntryParams.pounds;

        harvest.entries.splice(entryIndex, 1, updatedEntry);
        const updatedHarvest: IHarvest = await harvest.save();
        await this._entryRepository.update(updatedEntry._id, updatedEntry);
        return this._harvestRepository.getResourceById(updatedHarvest._id) as HarvestVm;
    }

    /**
     *
     * @param id
     */
    @Delete('{id}')
    @Tags('Entry')
    public async deleteEntry(@Path() id: string): Promise<EntryVm> {
        return await this._entryRepository.delete(id) as EntryVm;
    }
}
