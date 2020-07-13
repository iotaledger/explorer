import { IStorageService } from "../models/services/IStorageService";
import { join } from "path";
import { promises } from "fs";

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
        return "Success";
    }

    /**
     * Get the item.
     * @param id The id of the item to get.
     * @returns The object if it can be found or undefined.
     */
    public async get(id: string): Promise<T> {
        try {
            const fullPath = join(this._fullFolderPath, `${id}.json`);

            const buffer = await promises.readFile(fullPath);

            return JSON.parse(buffer.toString()) as T;
        } catch (err) {
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
        } catch (err) {
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
        } catch (err) {
        }
    }
}
