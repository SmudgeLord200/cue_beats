import { Box, Button, CircularProgress, IconButton, Typography } from "@mui/material";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useCueBeatsContext } from "../contexts/CueBeatsProvider";
import { useEffect } from "react";
import { SECTION } from "../constant";
import Section from "./Section";
import type { CueBeats } from "../type";
import { StyledContainer, StyledMainBox } from "../StyledComponents";

const HomePage = () => {
    const { handleFileUpload, cueBeats, isLoading, setCueBeats, secondaryUpdateCueBeats, exportCueBeatsToPDF } = useCueBeatsContext();

    useEffect(() => {
        if (cueBeats && SECTION[0]?.ref?.current) {
            SECTION[0].ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [cueBeats]);

    // mock data to test
    // useEffect(() => {
    //     if (!cueBeats) {
    //         const simulatedCueBeats: CueBeats = {
    //             logline: "Sample logline",
    //             synopsis: "Sample synopsis",
    //             targetAudience: "Sample audience",
    //             keyThemes: "Sample themes",
    //             moodVisualDirection: "Sample mood",
    //             musicSoundtrackDirection: "Sample music",
    //             soundDesignDirection: "Sample sound design",
    //         };
    //         setCueBeats(simulatedCueBeats);
    //     }
    // }, [cueBeats]);

    return (
        <StyledContainer maxWidth="md">
            <StyledMainBox>
                <Typography variant="h4">Cue + Beats</Typography>
                <Typography variant="subtitle1">Cue the Vision. Beat to Life</Typography>

                {isLoading ? (
                    <CircularProgress sx={{ mt: 2, color: 'white' }} />
                ) : (
                    <IconButton
                        sx={{ color: 'white' }}
                        aria-label="upload file"
                        component="label"
                        disabled={isLoading}
                    >
                        <CloudUploadOutlinedIcon sx={{ fontSize: 40 }} />
                        <input
                            type="file"
                            hidden
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                    handleFileUpload(file);
                                }
                            }}
                        />
                    </IconButton>
                )}
            </StyledMainBox>

            {cueBeats && (
                SECTION.map((section) => (
                    <Section
                        key={section.field}
                        title={section.title}
                        field={section.field}
                        ref={section.ref}
                    />
                ))
            )}

            {/* {SECTION.map((section) => (
                <Section
                    key={section.field}
                    title={section.title}
                    field={section.field}
                    ref={section.ref}
                />
            ))} */}

            {cueBeats && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 4 }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: 'rgba(85, 85, 85, 0.8)', // dark grey
                            '&:hover': {
                                backgroundColor: 'rgba(120, 120, 120, 0.9)', // lighter grey on hover
                            },
                            borderRadius: 3,
                        }}
                        onClick={() => secondaryUpdateCueBeats(cueBeats)}
                    >
                        Cue the beats!
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: 'rgba(85, 85, 85, 0.8)', // dark grey
                            '&:hover': {
                                backgroundColor: 'rgba(120, 120, 120, 0.9)', // lighter grey on hover
                            },
                            borderRadius: 3,
                        }}
                        onClick={exportCueBeatsToPDF}
                    >
                        Generate PDF
                    </Button>
                </Box>
            )}
        </StyledContainer>
    )
}

export default HomePage;