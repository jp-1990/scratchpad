"use client";

import { useNetworkStatus } from "../hooks/useNetworkStatus";
import useFps from "../hooks/useFps";

export default function NetworkStatus() {
  const { isOnline } = useNetworkStatus();
  const { currentFps } = useFps(60);

  return (
    <div className="flex flex-col justify-center p-2 font-mono">
      <div
        className={`leading-none ${isOnline ? "text-green-500" : "text-red-500"}`}
      >
        {isOnline ? "ONLINE" : "OFFLINE"}
      </div>
      <span
        className={`leading-none text-xs ${currentFps < 30 ? "text-red-500" : currentFps < 60 ? "text-orange-500" : "text-green-500"}`}
      >
        {currentFps} FPS
      </span>
    </div>
  );
}
