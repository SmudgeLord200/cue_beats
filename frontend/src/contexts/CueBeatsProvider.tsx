import { createContext, useContext, useMemo, useState } from "react";
import type { AddSectionParams, CueBeats, CueBeatsContextProps } from "../type";
import { fetchFileUpload } from "../api/fetchFileUpload";
import { fetchSecondaryUpdates } from "../api/fetchSecondaryUpdates";
import jsPDF from "jspdf";

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
    const handleFileUpload = async (file: File) => {
        // valdate file type
        if (file.type !== "application/pdf") {
            alert("Please upload a valid PDF file.");
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const { response, error } = await fetchFileUpload(file);

            if (error || !response) {
                setError(error || "An unknown error occurred while parsing the response.");
                setIsLoading(false);
                return;
            }
            setCueBeats(response);
        } catch (error) {
            console.error("Error uploading file: ", error);
            setError("Failed to upload file. Please try again.");
        } finally {
            setIsLoading(false);
        }
        // Call backend API to parse the PDF and return a CueBeats object
        // For now, we'll simulate this with a timeout
        // setIsLoading(true);
        // setTimeout(() => {
        //     const simulatedCueBeats: CueBeats = {
        //         logline: "Sample logline",
        //         synopsis: "Sample synopsis",
        //         targetAudience: "Sample audience",
        //         keyThemes: "Sample themes",
        //         moodVisualDirection: "Sample mood",
        //         musicSoundtrackDirection: "Sample music",
        //         soundDesignDirection: "Sample sound design",
        //     };
        //     setCueBeats(simulatedCueBeats);
        //     setIsLoading(false);
        // }, 1000);
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
            const { response, error } = await fetchSecondaryUpdates(updatedCueBeats);
            if (error || !response) {
                setError(error || "An unknown error occurred while updating CueBeats.");
                setIsLoading(false);
                return;
            }
            setCueBeats(response);
            setIsLoading(false);
        } catch (error) {
            console.error("Error updating CueBeats: ", error);
            setError("Failed to update CueBeats. Please try again.")
        }
    }

    // Export the result into PDF
    const exportCueBeatsToPDF = () => {
        if (!cueBeats) return;

        const doc = new jsPDF();
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const textWidth = pageWidth - (2 * margin);

        // Function to add a section with a title and content
        const addSection = ({ title, content }: AddSectionParams): void => {
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 30, 30);
            doc.text(title, margin, yPos);
            yPos += 8;

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 60, 60);
            const splitText: string[] = doc.splitTextToSize(content, textWidth);
            doc.text(splitText, margin, yPos);

            yPos += (splitText.length * 7) + 10;

            if (yPos > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
        };

        // Add a main title for the document
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Film Cue Beats Document", margin, yPos);
        yPos += 15;

        // Add sections from the cueBeats object
        (Object.keys(cueBeats) as (keyof CueBeats)[]).forEach((key) => {
            let content = cueBeats[key];
            const title = String(key).replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

            if (Array.isArray(content)) {
                content = content.join(', ');
            }

            addSection({ title, content: content as string });
        });

        doc.save("Film_Cue_Beats.pdf");
    };

    const contextValue: CueBeatsContextProps = useMemo(() => ({
        cueBeats,
        setCueBeats,
        isLoading,
        setIsLoading,
        error,
        setError,
        exportCueBeatsToPDF,
        secondaryUpdateCueBeats,
        updateCueBeats,
        handleFileUpload
    }), [cueBeats, setCueBeats, isLoading, setIsLoading, error, setError, exportCueBeatsToPDF, secondaryUpdateCueBeats, updateCueBeats, handleFileUpload]);

    return (
        <CueBeatsContext.Provider value={contextValue}>
            {children}
        </CueBeatsContext.Provider>
    );
}

export default CueBeatsProvider;