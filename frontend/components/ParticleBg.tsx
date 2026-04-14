"use client";
import React, { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticleBg = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    // Memoize options so they aren't recalculated on re-renders
    const options = useMemo(() => ({
        fullScreen: { enable: false }, // Keeps it within the absolute container
        background: { color: "transparent" },
        fpsLimit: 60, // Limit FPS to reduce GPU load
        particles: {
            number: { value: 40 }, // Reduced from 60 to 40 for performance
            size: { value: 1.5 },
            move: { enable: true, speed: 0.8 },
            links: {
                enable: true,
                color: "#8b5cf6",
                distance: 120,
                opacity: 0.3
            },
            color: { value: "#8b5cf6" },
        },
    }), []);

    if (!init) return <div className="absolute inset-0 bg-black" />;

    return (
        <Particles
            id="tsparticles"
            options={options}
            className="absolute inset-0 -z-10 pointer-events-none"
        />
    );
};

// CRITICAL: Prevent re-rendering when parent state changes
export default React.memo(ParticleBg);