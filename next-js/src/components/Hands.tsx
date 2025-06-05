"use client";

import React from "react";
import {
  HandLandmarker,
  FilesetResolver,
  HandLandmarkerResult,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

function useHandLandmarker() {
  const [handLandmarker, setHandlandMarker] = React.useState<HandLandmarker>();

  React.useEffect(() => {
    // load model
    async function createHandLandmarker() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
      );
      const res = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

      setHandlandMarker(res);
    }

    createHandLandmarker();
  }, []);

  return handLandmarker;
}

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

export default function Hands() {
  const handLandmarker = useHandLandmarker();

  let drawingUtils = React.useRef<DrawingUtils>().current;
  const lastVideoTime = React.useRef(-1);
  const results = React.useRef<HandLandmarkerResult | undefined>(undefined);
  const webcamRunning = React.useRef(false);

  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasCtx = canvasRef.current?.getContext("2d");

  // Enable the live webcam view and start detection.
  function enableCam(_event: any) {
    if (!hasGetUserMedia()) return;
    if (!handLandmarker) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
    }

    if (webcamRunning.current === true) {
      webcamRunning.current = false;
    } else {
      webcamRunning.current = true;
    }

    // getUsermedia parameters.
    const constraints = {
      video: true,
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.addEventListener("loadeddata", predictWebcam);
      }
    });
  }

  async function predictWebcam() {
    if (
      !canvasRef.current ||
      !webcamRef.current ||
      !handLandmarker ||
      !canvasCtx
    )
      return;

    if (!drawingUtils) drawingUtils = new DrawingUtils(canvasCtx);

    canvasRef.current.style.width = `${webcamRef.current.videoWidth}px`;
    canvasRef.current.style.height = `${webcamRef.current.videoHeight}px`;
    canvasRef.current.width = webcamRef.current.videoWidth;
    canvasRef.current.height = webcamRef.current.videoHeight;

    let startTimeMs = performance.now();
    if (lastVideoTime.current !== webcamRef.current.currentTime) {
      lastVideoTime.current = webcamRef.current.currentTime;
      results.current = handLandmarker.detectForVideo(
        webcamRef.current,
        startTimeMs,
      );
    }

    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    if (results?.current?.landmarks) {
      for (const landmarks of results.current.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          HandLandmarker.HAND_CONNECTIONS,
          {
            color: "#FFFFFF",
            lineWidth: 2,
          },
        );
        drawingUtils.drawLandmarks(landmarks, {
          color: "#49c3ff",
          radius: 2,
        });
      }
    }

    canvasCtx.restore();

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning.current === true) {
      window.requestAnimationFrame(predictWebcam);
    }
  }

  return (
    <>
      <section>
        <button onClick={enableCam}>
          <span>ENABLE WEBCAM</span>
        </button>
        <div className="relative">
          <video
            ref={webcamRef}
            id="webcam"
            autoPlay={true}
            playsInline={true}
          ></video>
          <canvas
            ref={canvasRef}
            id="output_canvas"
            className="absolute left-0 top-0 z-10"
          ></canvas>
        </div>
      </section>
    </>
  );
}
