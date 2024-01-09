import { BLOCK_STEP_PX, MIN_BLOCKS_PER_SECOND, MAX_BLOCKS_PER_SECOND, MIN_RADIUS, MAX_RADIUS, MIN_BLOCK_NEAR_RADIUS, MAX_PREV_POINTS, MAX_POINT_RETRIES, HALF_WAVE_PERIOD_SECONDS } from "./constants";
import { Vector3 } from 'three';

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

interface IBlockTanglePosition {
    y: number;
    z: number;
}

/**
 * Calculates the distance between two points.
 * @returns the distance between two points.
 */
function distanceBetweenPoints(point1: IBlockTanglePosition , point2: IBlockTanglePosition): number {
    const { z: z1, y: y1 } = point1;
    const { z: z2, y: y2 }  = point2;
    return Math.sqrt((y2 - y1) ** 2 + (z2 - z1) ** 2);
}

/**
 * Calculates the radius of the circle based on the blocks per second.
 * @returns the radius of the circle.
 */
function getLinearRadius(bps: number): number {
    if (bps < MIN_BLOCKS_PER_SECOND) bps = MIN_BLOCKS_PER_SECOND;
    if (bps > MAX_BLOCKS_PER_SECOND) bps = MAX_BLOCKS_PER_SECOND;

    // Linear interpolation formula to find the radius
    const radius = MIN_RADIUS + ((MAX_RADIUS - MIN_RADIUS) * (bps - MIN_BLOCKS_PER_SECOND) / (MAX_BLOCKS_PER_SECOND - MIN_BLOCKS_PER_SECOND));
    return radius;
}

/**
 * Generates a random point on a circle.
 * @returns the random point on a circle.
 */
function getDynamicRandomYZPoints(bps: number, initialPosition: Vector3 = new Vector3(0, 0, 0)): IBlockTanglePosition {
    const theta = Math.random() * (2 * Math.PI);

    const maxRadius = getLinearRadius(bps);
    const randomFactor = Math.random();
    const radius = randomFactor * maxRadius;


    const y = radius * Math.cos(theta) + initialPosition.y;
    const z = radius * Math.sin(theta) + initialPosition.z;

    return { y, z };
}

/**
 * Checks if the point is far enough from the prevPoints.
 * @returns true if the point is far enough from the prevPoints.
 */
function pointPassesAllChecks(point: IBlockTanglePosition, prevPoints: IBlockTanglePosition[]): boolean {
    if (prevPoints.length === 0) {
        return true;
    }

    return prevPoints.some(prevPoint => distanceBetweenPoints(point, prevPoint) > MIN_BLOCK_NEAR_RADIUS);
}

/**
 * Retries to generate a point until it passes all the checks.
 * @returns the point that passes all the checks.
 */
function generateAValidRandomPoint(bps: number, initialPosition: Vector3, prevPoints: IBlockTanglePosition[]): IBlockTanglePosition {
    let trialPoint: IBlockTanglePosition;
    let passAllChecks = false;
    let retries = 0;

    do {
        trialPoint = getDynamicRandomYZPoints(bps, initialPosition);
        passAllChecks = pointPassesAllChecks(trialPoint, prevPoints);
        retries++;
    } while (!passAllChecks && retries < MAX_POINT_RETRIES);

    prevPoints.push(trialPoint);
    if (prevPoints.length > MAX_PREV_POINTS) {
        prevPoints.shift();
    }

    return trialPoint;
}


/**
 * Gets a function to generate a random point on a circle.
 * @returns the function to generate the random point on a circle.
 */
export function getGenerateDynamicYZPosition(): typeof getDynamicRandomYZPoints {
    const prevPoints: IBlockTanglePosition[] = [];
    
    return (bps: number, initialPosition: Vector3 = new Vector3(0, 0, 0)): IBlockTanglePosition => {
        const validPoint = generateAValidRandomPoint(bps, initialPosition, prevPoints);
        
        const randomYNumber = randomNumberFromInterval(0, BLOCK_STEP_PX / 20);
        const randomZNumber = randomNumberFromInterval(0, BLOCK_STEP_PX / 20);

        validPoint.y += randomYNumber;
        validPoint.z += randomZNumber;

        return validPoint;
    };
}

export function getNewSinusoidalPosition(time: number, amplitude: number): number {
    const period = HALF_WAVE_PERIOD_SECONDS * 2;
    const frequency = 1 / period;
    const phase = (time % period) * frequency

    const newY = amplitude * Math.sin(phase * 2 * Math.PI);

    return newY;
}
