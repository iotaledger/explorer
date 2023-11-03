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
 * @param msCounter The interval
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

const getMaxYPosition = (bps: number) => {
    const blocksPerTick = bps / (SECOND / TIME_DIFF_COUNTER);
    const maxYPerTick = blocksPerTick * STEP_Y_PX / 2; // divide 2 because we have values more than 0 and less

    return {
        blocksPerTick,
        maxYPerTick: maxYPerTick > 0 ? maxYPerTick : 1
    };
};
const checkRules = (y: number, prev: number[]) => {
    let passAllChecks = true;
    if (prev.length === 0) {
        return true;
    }

    const nearRadius = 10;
    const near = prev.some(prevY => {
        const top = prevY + nearRadius;
        const bottom = prevY - nearRadius;
        return y < top && y > bottom;
    });

    if (near) {
        passAllChecks = false;
    }

    return passAllChecks;
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
    const prevY: number[] = [];
    const limitPrevY = 5;
    const LIMIT_BPS = 48;
    const { maxYPerTick: defaultMaxYPerTick } = getMaxYPosition(LIMIT_BPS);

    return (shift: number, bps: number) => {
        shift += 1; // This hack needs to avoid Y = 0 on the start of graph.
        let Y = generator.next().value as number;
        if (!currentShift || currentShift !== shift) {
            Y = generator.next(true).value as number;
            // update shift locally
            currentShift = shift;
        }

        if (bps < LIMIT_BPS) {
            let randomY = randomNumberFromInterval(-defaultMaxYPerTick, defaultMaxYPerTick);

            // check if not match with last value (and not near);
            let passAllChecks = checkRules(randomY, prevY);
            while (!passAllChecks) {
                randomY = randomNumberFromInterval(-defaultMaxYPerTick, defaultMaxYPerTick);
                passAllChecks = checkRules(randomY, prevY);
            }

            prevY.push(randomY);
            if (prevY.length > limitPrevY) {
                prevY.shift();
            }
            return randomY;
        }

        if (withRandom) {
            const randomNumber = randomNumberFromInterval(0, STEP_Y_PX / 20);
            Y += randomNumber;
        }

        return Y * STEP_Y_PX;
    };
};

/**
 * Generator for coordinate X. It returns coordinate based on shift.
 * @param shift The shift value
 * @returns The X axis value
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
