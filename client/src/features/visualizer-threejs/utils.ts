import { STEP_Y_PX, TIME_DIFF_COUNTER, SECOND, MAX_BLOCKS_PER_SECOND, MAX_BLOCK_INSTANCES, EMITTER_SPEED_MULTIPLIER, MIN_BLOCKS_PER_SECOND, CAMERA_X_AXIS_MOVEMENT, CAMERA_Y_AXIS_MOVEMENT, CAMERA_X_OFFSET, CAMERA_Y_OFFSET, VISUALIZER_SAFE_ZONE } from "./constants";
import { ICameraAngles } from './interfaces';

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
    const { maxYPerTick: defaultMaxYPerTick } = getMaxYPosition(MAX_BLOCKS_PER_SECOND);

    return (shift: number, bps: number) => {
        shift += 1; // This hack needs to avoid Y = 0 on the start of graph.
        let Y = generator.next().value as number;
        if (!currentShift || currentShift !== shift) {
            Y = generator.next(true).value as number;
            // update shift locally
            currentShift = shift;
        }

        if (bps < MAX_BLOCKS_PER_SECOND) {
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
 * Calculate the tangles distances
 * @returns The axis distances
 */
export function getTangleDistances({ sinusoidal = 0 } : { sinusoidal?: number }): {
    xDistance: number;
    yDistance: number;
} {
    /* We assume MAX BPS to get the max possible Y */
    const { maxYPerTick } = getMaxYPosition(MAX_BLOCKS_PER_SECOND);

    const MAX_TANGLE_DISTANCE_SECONDS = MAX_BLOCK_INSTANCES / MIN_BLOCKS_PER_SECOND;

    const MAX_BLOCK_DISTANCE = EMITTER_SPEED_MULTIPLIER * MAX_TANGLE_DISTANCE_SECONDS;

    const maxXDistance = MAX_BLOCK_DISTANCE + (VISUALIZER_SAFE_ZONE * 2)

    /* Max Y Distance will be multiplied by 2 to position blocks in the negative and positive Y axis  */
    const maxYDistance = (maxYPerTick * 2) + (sinusoidal * 2) + (VISUALIZER_SAFE_ZONE * 2)

    /* TODO: add sinusoidal distances */
  
    return {
        xDistance: maxXDistance,
        yDistance: maxYDistance
    }
  }

export function getCameraAngles(): ICameraAngles {
    const xAngle = Math.PI * CAMERA_X_AXIS_MOVEMENT
    const yAngle = Math.PI * CAMERA_Y_AXIS_MOVEMENT

    const startingXAngle = Math.PI * CAMERA_X_OFFSET
    const startingYAngle = Math.PI * CAMERA_Y_OFFSET

    // Divided by the two directions, positive and negative
    const X_MOVEMENT = xAngle / 2
    const Y_MOVEMENT = yAngle / 2

    const MIN_HORIZONTAL_ANGLE = startingXAngle - X_MOVEMENT
    const MIN_VERTICAL_ANGLE = startingYAngle - Y_MOVEMENT

    const MAX_HORIZONTAL_ANGLE = startingXAngle + X_MOVEMENT
    const MAX_VENTICAL_ANGLE = startingYAngle + Y_MOVEMENT

    return {
        minAzimuthAngle: MIN_HORIZONTAL_ANGLE,
        minPolarAngle: MIN_VERTICAL_ANGLE,
        maxPolarAngle: MAX_VENTICAL_ANGLE,
        maxAzimuthAngle: MAX_HORIZONTAL_ANGLE
    }
}
