export interface ICameraAngles {
    minAzimuthAngle: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    maxAzimuthAngle: number;
}

export interface IThreeDimensionalPosition {
    x: number;
    y: number;
    z: number;
}

export interface ITimeBasedPositionParams {
    currentAnimationTime: number;
}

export interface ISinusoidalPositionParams extends ITimeBasedPositionParams {
    periods: number[];
    periodsSum: number;
    sinusoidAmplitudes: number[];
}
