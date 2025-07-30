export interface CueBeats {
  logline: string;
  synopsis: string;
  targetAudience: string;
  keyThemes: string;
  moodVisualDirection: string;
  musicSoundtrackDirection: string;
  soundDesignDirection: string;  
}

export interface CueBeatsContextProps {
    cueBeats: CueBeats | null;
    setCueBeats: (cueBeats: CueBeats | null) => void;

    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;

    error: string | null;
    setError: (error: string | null) => void;
    
    secondaryUpdateCueBeats: (updatedCueBeats: CueBeats) => Promise<void>;
    updateCueBeats: (field: keyof CueBeats, content: string) => void;
    handleFileUpload: (file: File) => void;
}

export interface SectionProps {
  title: string;
  field: keyof CueBeats;
  ref?: React.RefObject<HTMLDivElement | null>;
}