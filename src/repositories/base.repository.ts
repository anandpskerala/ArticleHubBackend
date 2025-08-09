import { Model } from "mongoose";

export abstract class BaseRepository<T> {
    constructor(protected readonly _model: Model<T>) { }

    async create(data: Partial<T>): Promise<T> {
        const doc = await this._model.create(data); 
        return doc.toJSON() as T;
    }

    async findById(id: string): Promise<T | undefined> {
        const doc = await this._model.findById(id);
        return doc?.toJSON() as T;
    }

    async updateOne(filter: object, update: object): Promise<void> {
        await this._model.updateOne(filter, update);
    }

    async countDocuments(filter: object): Promise<number> {
        const count = await this._model.countDocuments(filter);
        return count;
    }

    async findOne(filter: object): Promise<T | undefined> {
        const doc = await this._model.findOne(filter);
        return doc?.toJSON() as T;
    }

    async deleteOne(filter: object): Promise<void> {
        await this._model.deleteOne(filter);
    }
}