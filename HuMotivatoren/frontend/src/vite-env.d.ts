/// <reference types="vite/client" />

interface FaceDetectorOptions {
	fastMode?: boolean;
	maxDetectedFaces?: number;
}

interface FaceLandmark {
	type: string;
	locations: DOMPointReadOnly[];
}

interface DetectedFace {
	boundingBox: DOMRectReadOnly;
	landmarks?: FaceLandmark[];
}

declare class FaceDetector {
	constructor(options?: FaceDetectorOptions);
	detect(source: ImageBitmapSource): Promise<DetectedFace[]>;
}

interface Window {
	FaceDetector?: typeof FaceDetector;
}
