/**
 * Function for generating list of coordinates
 * @param start - start of coordinates. Example: -300
 * @param end - end of coordinates. Example - 300
 * @param numberOfPoints - how much points you need between start and end.
 */
export function getYCoordinates(start: number, end: number, numberOfPoints: number): number[] {
    const coordinates: number[] = [];

    const increment = (end - start) / (numberOfPoints - 1);

    for (let i = 0, y = start; i < numberOfPoints; i++, y += increment) {
        coordinates.push(y);
    }

    return coordinates;
}


/**
 * Find the closest coordinate
 * @param parentCoordinates - list of Y axis coordinates for parents
 * @param possibleCoordinates - list of possible coordinates
 * @returns closestCoordinate
 */
export function findClosestCoordinate(parentCoordinates: number[], possibleCoordinates: number[]): number | undefined {
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
