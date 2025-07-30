import React from "react";
import type { SectionProps } from "./type";

export const SECTION: SectionProps[] = [
    {
        title: "Logline",
        field: "logline",
        ref: React.createRef<HTMLDivElement>(),
    },
    {
        title: "Synopsis",
        field: "synopsis",
        
    },
    {
        title: "Target Audience",
        field: "targetAudience",
        
    },
    {
        title: "Key Themes",
        field: "keyThemes",
        
    },
    {
        title: "Mood & Visual Direction",
        field: "moodVisualDirection",
        
    },
    {
        title: "Music & Soundtrack Direction",
        field: "musicSoundtrackDirection",
        
    },
    {
        title: "Sound Design Direction",
        field: "soundDesignDirection",
        
    }
]