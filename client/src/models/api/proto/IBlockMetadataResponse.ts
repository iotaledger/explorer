import { IResponse } from "../IResponse";

export interface IBlockMetadataResponse extends IResponse {
    id: string;
    solid: boolean;
    invalid: boolean;
    orphaned: boolean;
    orphanedBlocksInPastCone: string[];
    strongChildren: string[];
    weakChildren: string[];
    likedInsteadChildren: string[];
    solidTime: number;

    booked: boolean;
    structureDetails: StructureDetails;
    addedConflictIDs: string[];
    subtractedConflictIDs: string[];
    conflictIDs: string[];
    bookedTime: number;

    tracked: boolean;
    subjectivelyInvalid: boolean;
    trackedTime: number;

    scheduled: boolean;
    skipped: boolean;
    dropped: boolean;
    schedulerTime: number;

    accepted: boolean;
    acceptedTime: number;

    confirmed: boolean;
    confirmedTime: boolean;
    confirmedByEpoch: boolean;
}

interface StructureDetails {
    rank: number;
    pastMarkerCap: number;
    isPastMarker: boolean;
}
