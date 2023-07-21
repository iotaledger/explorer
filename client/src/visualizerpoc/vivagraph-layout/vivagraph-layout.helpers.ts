/**
 * Find the closest coordinate
 * @param parentCoordinates - list of Y axis coordinates for parents
 * @param possibleCoordinates - list of possible coordinates
 * @returns closestCoordinate
 */
export function findClosestCoordinate(
    parentCoordinates: number[],
    possibleCoordinates: number[]
): number | undefined {
    let closestCoordinate: number | undefined;
    let minDifferenceSum = Number.POSITIVE_INFINITY;

    for (const possibleCoord of possibleCoordinates) {
        let differenceSum = 0;
        for (const parentCoord of parentCoordinates) {
            const difference = Math.abs(parentCoord - possibleCoord);
            differenceSum += difference;
        }

        if (differenceSum < minDifferenceSum) {
            minDifferenceSum = differenceSum;
            closestCoordinate = possibleCoord;
        }
    }

    return closestCoordinate;
}
