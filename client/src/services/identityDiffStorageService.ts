import { IIdentityMessageWrapper } from "~models/identity/IIdentityMessageWrapper";

/**
 * Singleton for storing diff messages.
 */
export class IdentityDiffStorageService {
  private static _instance: IdentityDiffStorageService;

  private readonly diffMap: Map<string, IIdentityMessageWrapper[]>;

  private constructor() {
    this.diffMap = new Map();
  }

  public static get instance() {
    return (this._instance ||= new this());
  }

  /**
   * Retrieves stored diff messages.
   * @param integrationMessageId MessageId of the parent integration message.
   * @returns list of diff messages OR undefined if none exist.
   */
  public getDiffMessages(integrationMessageId: string): IIdentityMessageWrapper[] | undefined {
    return this.diffMap.get(integrationMessageId);
  }

  /**
   * Stores Diff messages.
   * @param integrationMessageId MessageId of the parent integration message.
   * @param diffMessages list of the diff messages to store.
   */
  public setDiffMessages(integrationMessageId: string, diffMessages: IIdentityMessageWrapper[]) {
    this.diffMap.set(integrationMessageId, diffMessages);
  }

  /**
   * clears all saved entries.
   */
  public clearAll() {
    this.diffMap.clear();
  }
}
