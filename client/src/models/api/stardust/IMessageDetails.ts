/**
 * The Message details.
 */
 export default interface IMessageDetails {
     /**
      * The Index value.
      */
     index: string;

     /**
      * The max number of results.
      */
     maxResults: number;

     /**
      * The number of results.
      */
     count: number;

     /**
      * The message Ids.
      */
     messageIds: string[];
}

