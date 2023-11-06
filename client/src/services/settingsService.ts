import { LocalStorageService } from "./localStorageService";
import { ServiceFactory } from "../factories/serviceFactory";
import { ISettings, SettingsKeys } from "../models/services/ISettings";

/**
 * Settings manager.
 */
export class SettingsService {
    /**
     * The storage service to load/save the settings.
     */
    private readonly _localStorageService: LocalStorageService;

    /**
     * The settings.
     */
    private _settings!: ISettings;

    /**
     * Create a new instance of SettingsService.
     */
    constructor() {
        this._localStorageService = ServiceFactory.get<LocalStorageService>("local-storage");
    }

    /**
     * Load the settings.
     */
    public load(): void {
        this._settings = this._localStorageService.load("settings");
        if (!this._settings) {
            this._settings = {
                fiatCode: "USD"
            };
        }
    }

    /**
     * Save the settings.
     */
    public save(): void {
        this._localStorageService.save("settings", this._settings);
    }

    /**
     * Save the single setting.
     * @param propertyName The name of the setting to set.
     * @param value The value to store.
     */
    public saveSingle(propertyName: SettingsKeys, value: unknown): void {
        const settings = this.get();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (settings as any)[propertyName] = value;
        this.save();
    }

    /**
     * Get all the settings.
     * @returns The settings.
     */
    public get(): ISettings {
        if (!this._settings) {
            this.load();
        }
        return this._settings;
    }
}
