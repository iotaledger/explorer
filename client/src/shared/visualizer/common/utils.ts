import { THRESHOLD_PX_Y } from "./constants";
import { THRESHOLD_PX } from "../../../features/visualizer-webgl/layout";
import { THRESHOLD_PX_X } from "../../../features/visualizer-canvas/lib/constants";

/**
 * Generates a random number within a specified range.
 *
 * @param {number} min - The minimum value of the range (inclusive).
 * @param {number} max - The maximum value of the range (exclusive).
 * @throws {Error} If min is greater than or equal to max.
 * @returns {number} A random number within the specified range.
 */
function randomNumberFromInterval(min: number, max: number): number {
    if (min >= max) {
        throw new Error("Min value must be less than Max value.");
    }
    // Generate a random number between 0 (inclusive) and 1 (exclusive)
    const randomFraction = Math.random();
    // Scale the random fraction to fit within the desired range
    return min + (randomFraction * (max - min));
}

export const randomIntFromInterval = (min: number, max: number) => {
    const randomFraction = Math.random();
    const range = max - min + 1;
    const randomInRange = Math.floor(randomFraction * range);
    return randomInRange + min;
};

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

/**
 * Measure how much seconds passed from the start of the timer.
 * @returns - function that returns seconds from the start of the timer.
 */
export const timer = (msCounter: number = 1000) => {
    const start = new Date();

    return () => {
        const currentTime = new Date();
        const diff = currentTime.getTime() - start.getTime();
        return Math.floor(diff / msCounter);
    };
};

/**
 * Y coordinate generator from zero coordinate to top and bottom
 * @yields {number} - Y coordinate
 * @returns {Generator<number>} - Y coordinate generator
 */
export function* yCoordinateGenerator(): Generator<number> {
    let count = 0;
    let isPositive = true;

    yield 0; // Initial value

    while (true) {
        const reset = yield isPositive ? count : -count;

        if (reset) {
            count = 0;
            isPositive = true;
        } else {
            // Alternate between positive and negative
            isPositive = !isPositive;

            // Increase count after generating both a positive and negative pair
            if (!isPositive) {
                count++;
            }
        }
    }
}


/**
 * Create generator for Y coordinate
 * @param root0 - .
 * @param root0.withRandom - .
 * @returns - function that returns Y coordinate
 */
export const getGenerateY = ({ withRandom }: {withRandom?: boolean} = {}): (shift: number) => number => {
    let currentShift = 1;
    const generator = yCoordinateGenerator();

    return (shift: number) => {
        shift += 1; // This hack needs to avoid Y = 0 on the start of graph.
        let Y = generator.next().value as number;
        if (!currentShift || currentShift !== shift) {
            Y = generator.next(true).value as number;
            // update shift locally
            currentShift = shift;
        }

        if (withRandom) {
            const randomNumber = randomNumberFromInterval(0, THRESHOLD_PX_Y / 10);
            Y += randomNumber;
        }

        return Y * THRESHOLD_PX_Y;
    };
};

/**
 * Generator for coordinate X. It returns coordinate based on shift.
 * @param shift
 */
export const generateXbyShift = (shift: number) => {
    const randomNumber = Math.floor(Math.random() * THRESHOLD_PX) + 1;

    const shiftWithThreshold = (shift ?? 0) * THRESHOLD_PX_X;
    return shiftWithThreshold + randomNumber;
};


export const wiggleEffect = (max: number) => {
    const needToChange = Math.random() > 0.95;
    if (needToChange) {
        return randomNumberFromInterval(0 - max, max);
    }
    return 0;
};
