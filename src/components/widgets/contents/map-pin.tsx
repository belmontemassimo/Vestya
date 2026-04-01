"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";

interface MapPinProps {
  latitude: number;
  longitude: number;
  name: string;
}

const MapPinInner = dynamic(
  () =>
    import("./map-pin-inner").then((mod) => ({
      default: mod.MapPinInner,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-xs text-slate-400">Loading map...</span>
      </div>
    ),
  }
);

class MapErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center bg-slate-100 rounded-lg text-xs text-slate-400">
          Map unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

export function MapPin(props: MapPinProps) {
  return (
    <MapErrorBoundary>
      <MapPinInner {...props} />
    </MapErrorBoundary>
  );
}
