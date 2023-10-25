import { STEP_X_PX, STEP_Y_PX, ZOOM_DEFAULT, TIME_DIFF_COUNTER, SECOND } from "./constants";


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
 * Measure how much seconds passed from the start of the timer.
 * @param msCounter
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
    let count = 0.25;
    const increaseTo = 0.25;
    let isPositive = true;

    yield 0; // Initial value

    while (true) {
        const reset = yield isPositive ? count : -count;

        if (reset) {
            count = 0.25;
            isPositive = true;
        } else {
            // Alternate between positive and negative
            isPositive = !isPositive;

            // Increase count after generating both a positive and negative pair
            if (!isPositive) {
                count += increaseTo;
            }
        }
    }
}

const getMaxYPosition = (bps: number) => {
    const blocksPerTick = bps / (SECOND / TIME_DIFF_COUNTER);
    const maxYPerTick = blocksPerTick / 2; // divide 2 because we have values more than 0 and less

    return {
        blocksPerTick,
        maxYPerTick: maxYPerTick > 0 ? maxYPerTick : 1
    };
};
/**
 * Create generator for Y coordinate
 * @param root0 - .
 * @param root0.withRandom - .
 * @returns - function that returns Y coordinate
 */
export const getGenerateY = ({ withRandom }: {withRandom?: boolean} = {}): (shift: number, bps: number) => number => {
    let currentShift = 1;
    const generator = yCoordinateGenerator();
    // const LOW_BPS_LIMIT_BOTTOM = -7 * STEP_Y_PX;
    const LIMIT_BPS = 48;
    const { maxYPerTick: defaultMaxYPerTick } = getMaxYPosition(LIMIT_BPS);

    return (shift: number, bps: number) => {
        shift += 1; // This hack needs to avoid Y = 0 on the start of graph.
        let Y = generator.next().value as number;
        let lowBpsMultiplier = 1;
        if (!currentShift || currentShift !== shift) {
            Y = generator.next(true).value as number;
            // update shift locally
            currentShift = shift;
        }


        if (bps < LIMIT_BPS) {
            const { maxYPerTick: currentMaxYPerTick } = getMaxYPosition(bps);
            const coefficient = defaultMaxYPerTick / currentMaxYPerTick;

            // console.log("---", bps);
            lowBpsMultiplier = coefficient;
        }

        if (withRandom) {
            const randomNumber = randomNumberFromInterval(0, STEP_Y_PX / 20);
            // Y += randomNumber;
        }

        console.log("--- Y", Y);

        return Y * STEP_Y_PX * lowBpsMultiplier;
    };
};

/**
 * Generator for coordinate X. It returns coordinate based on shift.
 * @param shift
 */
export const generateXbyShift = (shift: number) => {
    const randomNumber = Math.floor(Math.random() * STEP_X_PX) + 1;

    const shiftWithThreshold = (shift ?? 0) * STEP_X_PX;
    return shiftWithThreshold + randomNumber;
};


export const wiggleEffect = (max: number) => {
    const needToChange = Math.random() > 0.95;
    if (needToChange) {
        return randomNumberFromInterval(0 - max, max);
    }
    return 0;
};


export const getScaleMultiplier = (yCoordinates: number[], canvasHeight: number) => {
    const MAGIC_MULTIPLIER = 1.5;
    const PADDING_MULTIPLIER = 0.8;
    const MIN_Y_COORDINATE = 60; // This value need to prevent dragging on init
    const maxYCoordinate = Math.max(...yCoordinates);
    const yCoordinate = maxYCoordinate > MIN_Y_COORDINATE ? maxYCoordinate : MIN_Y_COORDINATE;
    const nodesHeight = yCoordinate * ZOOM_DEFAULT * MAGIC_MULTIPLIER;
    const multiplier = canvasHeight / nodesHeight;

    return multiplier * PADDING_MULTIPLIER;
};
