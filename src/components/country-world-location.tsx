"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  clientToWorld,
  getWorldLocation,
  zoomLimitWidth,
  zoomWorldView,
  type WorldView,
} from "@/lib/world-location";

function touchDistance(touches: TouchList) {
  return Math.hypot(
    touches[1].clientX - touches[0].clientX,
    touches[1].clientY - touches[0].clientY,
  );
}

function touchMidpoint(touches: TouchList) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

export function CountryWorldLocation({
  countryCode,
  name,
  className,
  zoomable = false,
}: {
  countryCode: string;
  name?: string;
  className?: string;
  zoomable?: boolean;
}) {
  const base = getWorldLocation(countryCode);
  const [view, setView] = useState<WorldView>(base.view);
  const viewRef = useRef(view);
  const minWidthRef = useRef(zoomLimitWidth(base.view.width));
  const pinchRef = useRef<{
    distance: number;
    focusX: number;
    focusY: number;
    view: WorldView;
  } | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  viewRef.current = view;
  minWidthRef.current = zoomLimitWidth(base.view.width);

  useEffect(() => {
    const next = getWorldLocation(countryCode).view;
    setView(next);
    viewRef.current = next;
    pinchRef.current = null;
  }, [countryCode]);

  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  const frameRef = useCallback(
    (frame: HTMLDivElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;

      if (!frame || !zoomable) {
        return;
      }

      const target = frame;

      function rectOf() {
        return target.getBoundingClientRect();
      }

      function onTouchStart(event: TouchEvent) {
        if (event.touches.length !== 2) {
          pinchRef.current = null;
          return;
        }

        const rect = rectOf();
        const mid = touchMidpoint(event.touches);
        const focus = clientToWorld(mid.x, mid.y, rect, viewRef.current);
        pinchRef.current = {
          distance: touchDistance(event.touches),
          focusX: focus.x,
          focusY: focus.y,
          view: viewRef.current,
        };
      }

      function onTouchMove(event: TouchEvent) {
        const pinch = pinchRef.current;
        if (event.touches.length !== 2 || !pinch || pinch.distance === 0) {
          return;
        }

        event.preventDefault();
        const rect = rectOf();
        const mid = touchMidpoint(event.touches);
        const scale = touchDistance(event.touches) / pinch.distance;
        const next = zoomWorldView(
          pinch.view,
          { x: pinch.focusX, y: pinch.focusY },
          mid.x,
          mid.y,
          rect,
          scale,
          minWidthRef.current,
        );
        viewRef.current = next;
        setView(next);
      }

      function onTouchEnd(event: TouchEvent) {
        if (event.touches.length < 2) {
          pinchRef.current = null;
        }
      }

      target.addEventListener("touchstart", onTouchStart, { passive: true });
      target.addEventListener("touchmove", onTouchMove, { passive: false });
      target.addEventListener("touchend", onTouchEnd);
      target.addEventListener("touchcancel", onTouchEnd);

      cleanupRef.current = () => {
        target.removeEventListener("touchstart", onTouchStart);
        target.removeEventListener("touchmove", onTouchMove);
        target.removeEventListener("touchend", onTouchEnd);
        target.removeEventListener("touchcancel", onTouchEnd);
      };
    },
    [zoomable],
  );

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!zoomable) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const current = viewRef.current;
    const focus = clientToWorld(event.clientX, event.clientY, rect, current);
    const scale = Math.exp(-event.deltaY * 0.002);
    const next = zoomWorldView(
      current,
      focus,
      event.clientX,
      event.clientY,
      rect,
      scale,
      minWidthRef.current,
    );
    viewRef.current = next;
    setView(next);
  }

  const location = getWorldLocation(countryCode, zoomable ? view : base.view);
  const currentView = location.view;
  const label = name
    ? zoomable
      ? `${name} i verden. Knip for å zoome.`
      : `${name} i verden`
    : zoomable
      ? "Landets plassering i verden. Knip for å zoome."
      : "Landets plassering i verden";

  return (
    <div
      ref={frameRef}
      className={[
        "countryWorldLocation",
        zoomable ? "countryWorldLocationZoomable" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onWheel={zoomable ? handleWheel : undefined}
    >
      <svg
        viewBox={location.viewBox}
        role="img"
        aria-label={label}
        focusable="false"
      >
        <rect
          className="countryWorldLocationOcean"
          x={currentView.x}
          y={currentView.y}
          width={currentView.width}
          height={currentView.height}
        />
        <path className="countryWorldLocationLand" d={location.land} />
        {location.selected?.d ? (
          <path
            className="countryWorldLocationSelected"
            d={location.selected.d}
          />
        ) : null}
      </svg>
      {location.selected?.marker ? (
        <span
          className="countryWorldLocationMarker"
          aria-hidden="true"
          style={{
            left: `${((location.selected.x - currentView.x) / currentView.width) * 100}%`,
            top: `${((location.selected.y - currentView.y) / currentView.height) * 100}%`,
          }}
        />
      ) : null}
    </div>
  );
}
