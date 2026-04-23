"use client";
import React, { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { MoveDirection, OutMode } from "@tsparticles/engine"; // ← add this import

const ParticleBg = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options = useMemo(() => ({
        fullScreen: { enable: false },
        background: { color: "transparent" },
        fpsLimit: 60,
        particles: {
            number: { value: 80 },
            color: { value: ["#8b5cf6", "#a78bfa", "#c4b5fd"] },
            shape: { type: "circle" },
            opacity: {
                value: { min: 0.1, max: 0.5 },
                animation: {
                    enable: true,
                    speed: 0.5,
                    minimumValue: 0.1,
                    sync: false,
                },
            },
            size: {
                value: { min: 1, max: 2 },
            },
            move: {
                enable: true,
                direction: MoveDirection.bottom, // ← enum instead of string
                speed: { min: 0.5, max: 1.5 },
                straight: true,
                outModes: {
                    default: OutMode.out,         // ← enum instead of string
                },
                angle: {
                    value: 10,
                    offset: 0,
                },
            },
            links: { enable: false },
        },
        interactivity: {
            events: {
                onHover: { enable: false },
                onClick: { enable: false },
            },
        },
    }), []);

    if (!init) return <div className="absolute inset-0" />;

    return (
        <Particles
            id="tsparticles"
            options={options}
            className="absolute inset-0 -z-10 pointer-events-none"
        />
    );
};

export default React.memo(ParticleBg);