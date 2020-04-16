/**
 * ConfigurationService Class.
 */
export class ConfigurationService<T> {
    /**
     * The configuration.
     */
    private _configuration!: T;

    /**
     * Load the configuration.
     * @param path The path to the configuration.
     * @returns Promise.
     */
    public async load(path: string): Promise<T> {
        try {
            const response = await fetch(path);
            if (response.ok) {
                this._configuration = await response.json();
                return this._configuration;
            } else {
                throw new Error(`Could not find file`);
            }
        } catch (err) {
            throw new Error(`Error loading configuration file\n${err.message}`);
        }
    }

    /**
     * Get the configuration.
     * @returns The configuration.
     */
    public get(): T {
        return this._configuration;
    }
}
