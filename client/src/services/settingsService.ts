import { ServiceFactory } from "../factories/serviceFactory";
import { ISettings } from "../models/services/ISettings";
import { LocalStorageService } from "./localStorageService";

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
