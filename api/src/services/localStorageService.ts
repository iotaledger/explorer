import { promises } from "fs";
import { join } from "path";
import { IStorageService } from "../models/services/IStorageService";

/**
 * Service to handle local storage requests.
 */
export class LocalStorageService<T> implements IStorageService<T> {
    /**
     * The root folder path.
     */
    protected readonly _rootFolderPath: string;

    /**
     * The name of the folder path.
     */
    protected _fullFolderPath: string;

    /**
     * The id field name.
     */
    protected readonly _idName: string;

    /**
     * Create a new instance of LocalStorageService
     * @param rootFolderPath The root folder for storage.
     * @param storageName The name of the folder for the storage.
     * @param idName The item id field.
     */
    constructor(rootFolderPath: string, storageName: string, idName: string) {
        this._rootFolderPath = rootFolderPath;
        this._fullFolderPath = join(rootFolderPath, storageName);
        this._idName = idName;
    }

    /**
     * Create the storage for the items.
     * @returns Log of the table creation.
     */
    public async create(): Promise<string> {
        try {
            await promises.mkdir(this._fullFolderPath, { recursive: true });
            return `Success Creating Local Storage for ${this._fullFolderPath}\n`;
        } catch (err) {
            return `Failed Creating Local Storage for ${this._fullFolderPath}\n${err.message}\n`;
        }
    }

    /**
     * Get the item.
     * @param id The id of the item to get.
     * @returns The object if it can be found or undefined.
     */
    public async get(id: string): Promise<T | undefined> {
        try {
            const fullPath = join(this._fullFolderPath, `${id}.json`);

            const buffer = await promises.readFile(fullPath);

            return JSON.parse(buffer.toString()) as T;
        } catch {
        }
    }

    /**
     * Set the item.
     * @param item The item to set.
     */
    public async set(item: T): Promise<void> {
        try {
            const fullPath = join(this._fullFolderPath, `${item[this._idName]}.json`);

            await promises.mkdir(this._fullFolderPath, { recursive: true });

            await promises.writeFile(fullPath, Buffer.from(JSON.stringify(item, undefined, "\t")));
        } catch {
        }
    }

    /**
     * Delete the item.
     * @param itemKey The key of the item to remove.
     */
    public async remove(itemKey: string): Promise<void> {
        try {
            const fullPath = join(this._fullFolderPath, `${itemKey}.json`);

            await promises.unlink(fullPath);
        } catch {
        }
    }

    /**
     * Get all the items.
     * @returns All the items for the storage.
     */
    public async getAll(): Promise<T[]> {
        const items: T[] = [];

        try {
            const files = await promises.readdir(this._fullFolderPath);

            for (const file of files) {
                const fullPath = join(this._fullFolderPath, file);

                const buffer = await promises.readFile(fullPath);

                items.push(JSON.parse(buffer.toString()) as T);
            }
        } catch {
        }

        return items;
    }

    /**
     * Set the items in a batch.
     * @param items The items to set.
     */
    public async setAll(items: T[]): Promise<void> {
        for (const item of items) {
            await this.set(item);
        }
    }
}
