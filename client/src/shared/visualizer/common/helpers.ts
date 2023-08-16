/**
 * Function for generating list of coordinates
 * @param start - start of coordinates. Example: -300
 * @param end - end of coordinates. Example - 300
 * @param numberOfPoints - how much points you need between start and end.
 * @returns list of coordinates
 */
export function generateCoordinateGrid(
    start: number,
    end: number,
    numberOfPoints: number
): number[] {
    const coordinates: number[] = [];

    const increment = (end - start) / (numberOfPoints - 1);

    for (let i = 0, y = start; i < numberOfPoints; i++, y += increment) {
        coordinates.push(y);
    }

    return coordinates;
}
