"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RoomLocationMapProps {
    latitude?: number | null;
    longitude?: number | null;
    locality?: string;
    landmark?: string | null;
}

/**
 * Gap 6: Leaflet-based map component for approximate room location.
 * Shows a marker with a ~500m circle overlay to indicate approximate area (privacy-preserving).
 * Falls back to a styled message if no coordinates are available.
 */
const RoomLocationMap = ({ latitude, longitude, locality, landmark }: RoomLocationMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || !latitude || !longitude) return;

        // Prevent re-initialization
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        // Initialize Leaflet map
        const map = L.map(mapRef.current, {
            center: [latitude, longitude],
            zoom: 14,
            scrollWheelZoom: false,
            attributionControl: true,
        });

        mapInstanceRef.current = map;

        // Use OpenStreetMap tiles (free, no API key required)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
        }).addTo(map);

        // Custom purple marker icon (matches app theme)
        const markerIcon = L.divIcon({
            className: "custom-map-marker",
            html: `
                <div style="
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #7c3aed, #a78bfa);
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid #fff;
                    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        width: 10px;
                        height: 10px;
                        background: #fff;
                        border-radius: 50%;
                        transform: rotate(45deg);
                    "></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });

        // Add marker
        const marker = L.marker([latitude, longitude], { icon: markerIcon }).addTo(map);

        // Build popup content
        const popupParts: string[] = [];
        if (locality) popupParts.push(`<strong style="color: #7c3aed;">${locality}</strong>`);
        if (landmark) popupParts.push(`<span style="color: #6b7280; font-size: 12px;">Near ${landmark}</span>`);
        if (popupParts.length > 0) {
            marker.bindPopup(
                `<div style="font-family: Arial, sans-serif; line-height: 1.5;">${popupParts.join("<br/>")}</div>`,
                { closeButton: false }
            );
        }

        // Add approximate area circle (~500m radius) for privacy
        L.circle([latitude, longitude], {
            radius: 500,
            color: "#7c3aed",
            fillColor: "#a78bfa",
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: "6 4",
        }).addTo(map);

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude, locality, landmark]);

    // Fallback: no coordinates available
    if (!latitude || !longitude) {
        return (
            <div
                style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    border: "1px solid #2d2d4e",
                    borderRadius: "12px",
                    padding: "32px 24px",
                    textAlign: "center",
                    color: "#6b7280",
                }}
            >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📍</div>
                <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "#9ca3af" }}>
                    Location Not Available
                </p>
                {locality && (
                    <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                        Area: {locality}
                        {landmark ? ` • Near ${landmark}` : ""}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #2d2d4e" }}>
            <div
                ref={mapRef}
                style={{
                    width: "100%",
                    height: "280px",
                }}
            />
            {(locality || landmark) && (
                <div
                    style={{
                        background: "#1a1a2e",
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        borderTop: "1px solid #2d2d4e",
                    }}
                >
                    <span style={{ fontSize: "16px" }}>📍</span>
                    <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                        {locality}
                        {landmark ? ` • Near ${landmark}` : ""}
                    </span>
                    <span
                        style={{
                            marginLeft: "auto",
                            background: "rgba(124, 58, 237, 0.15)",
                            color: "#a78bfa",
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontWeight: 600,
                        }}
                    >
                        Approximate
                    </span>
                </div>
            )}
        </div>
    );
};

export default RoomLocationMap;
