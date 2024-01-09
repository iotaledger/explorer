/**
 * Definition of service to handle storage.
 */
export interface IStorageService<T> {
    /**
     * Create the storage for the items.
     * @returns Log of the creation.
     */
    create(): Promise<string>;

    /**
     * Get the item.
     * @param id The id of the item to get.
     * @returns The object if it can be found or undefined.
     */
    get(id: string): Promise<T | undefined>;

    /**
     * Set the item.
     * @param item The item to set.
     */
    set(item: T): Promise<void>;

    /**
     * Delete the item.
     * @param itemKey The key of the item to remove.
     */
    remove(itemKey: string): Promise<void>;

    /**
     * Get all the items.
     * @returns All the items for the storage.
     */
    getAll(): Promise<T[]>;

    /**
     * Set the items in a batch.
     * @param items The items to set.
     */
    setAll(items: T[]): Promise<void>;
}
