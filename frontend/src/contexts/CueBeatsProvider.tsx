import { createContext, useContext, useMemo, useState } from "react";
import type { CueBeats, CueBeatsContextProps } from "../type";

export const CueBeatsContext = createContext<CueBeatsContextProps | undefined>(undefined);

export const useCueBeatsContext = () => {
    const context = useContext(CueBeatsContext);
    if (context === undefined) {
        throw new Error("useCueBeatsContext must be used within a CueBeatsProvider");
    }
    return context;
}

interface CueBeatsProviderProps {
    children: React.ReactNode;
}

const CueBeatsProvider = ({ children }: CueBeatsProviderProps) => {
    // user flow: upload pdf, call backend to parse, return CueBeats object
    // next, user edit the CueBeats object, then submit it to the backend
    const [cueBeats, setCueBeats] = useState<CueBeats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Upload function to handle file upload
    const handleFileUpload = (file: File) => {
        // valdate file type
        if (file.type !== "application/pdf") {
            alert("Please upload a valid PDF file.");
            return;
        }
        // Call backend API to parse the PDF and return a CueBeats object
        // For now, we'll simulate this with a timeout
        setIsLoading(true);
        setTimeout(() => {
            const simulatedCueBeats: CueBeats = {
                logline: "Sample logline",
                synopsis: "Sample synopsis",
                targetAudience: "Sample audience",
                keyThemes: "Sample themes",
                moodVisualDirection: "Sample mood",
                musicSoundtrackDirection: "Sample music",
                soundDesignDirection: "Sample sound design",
            };
            setCueBeats(simulatedCueBeats);
            setIsLoading(false);
        }, 1000);
    };

    // Function to update the CueBeats object with specific fields
    const updateCueBeats = (field: keyof CueBeats, content: string) => {
        if (cueBeats) {
            setCueBeats({ ...cueBeats, [field]: content });
        }
    };

    // Call the backend API to update the CueBeats object after user edits
    const secondaryUpdateCueBeats = async (updatedCueBeats: CueBeats) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/cuebeats`, {});

            if (!response.ok) {
                setError("Failed to update CueBeats. Please try again.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error upating CueBeats: ", error);
            setError("Failed to update CueBeats. Please try again.")
        }
    }

    const contextValue: CueBeatsContextProps = useMemo(() => ({
        cueBeats,
        setCueBeats,
        isLoading,
        setIsLoading,
        error,
        setError,
        secondaryUpdateCueBeats,
        updateCueBeats,
        handleFileUpload
    }), [cueBeats, setCueBeats, isLoading, setIsLoading, , error, setError, secondaryUpdateCueBeats, updateCueBeats, handleFileUpload]);

    return (
        <CueBeatsContext.Provider value={contextValue}>
            {children}
        </CueBeatsContext.Provider>
    );
}

export default CueBeatsProvider;