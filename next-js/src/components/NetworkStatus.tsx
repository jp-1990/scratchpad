"use client";

import { useNetworkStatus } from "../hooks/useNetworkStatus";

export default function NetworkStatus() {
  const { isOnline } = useNetworkStatus();

  return (
    <div
      className={`p-2 font-mono ${
        isOnline ? "text-green-500" : "text-red-500"
      }`}
    >
      {isOnline ? "ONLINE" : "OFFLINE"}
    </div>
  );
}
