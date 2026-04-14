"use client";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useState } from "react";

export default function ParticleBg() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    return (
        <Particles
            id="tsparticles"
            options={{
                background: { color: "#000" },
                particles: {
                    number: { value: 60 },
                    size: { value: 2 },
                    move: { enable: true, speed: 1 },
                    links: {
                        enable: true,
                        color: "#8b5cf6",
                        distance: 120,
                    },
                    color: { value: "#8b5cf6" },
                },
            }}
            className="absolute inset-0 -z-10"
        />
    );
}