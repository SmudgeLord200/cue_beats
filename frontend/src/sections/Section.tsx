import { Box, IconButton, TextareaAutosize, Typography } from "@mui/material";
import { useCueBeatsContext } from "../contexts/CueBeatsProvider";
import { StyledBox } from "../StyledComponents";
import type { SectionProps } from "../type";
import EditIcon from '@mui/icons-material/EditOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import { useEffect, useState } from "react";

const Section = ({ title, field, ref }: SectionProps) => {
    const { cueBeats, updateCueBeats } = useCueBeatsContext();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [localContent, setLocalContent] = useState<string>(cueBeats?.[field] || '');

    useEffect(() => {
        setLocalContent(cueBeats?.[field] || '');
    }, [cueBeats, field]);

    const handleSave = () => {
        updateCueBeats(field, localContent);
        setIsEdit(false);
    };

    const handleEdit = () => {
        setIsEdit(!isEdit);
    }

    return (
        <StyledBox ref={ref}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {title}
                </Typography>
                <IconButton
                    sx={{ color: 'white' }}
                    onClick={isEdit ? handleSave : handleEdit}
                >
                    {isEdit ? <SaveIcon /> : <EditIcon />}
                </IconButton>
            </Box>
            {isEdit ?
                <TextareaAutosize
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    style={{ width: '100%', minHeight: '100px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', padding: '8px' }}
                />
                : (
                    <Typography variant="body1" component="div" sx={{ marginTop: 1 }}>
                        {cueBeats?.[field]}
                    </Typography>
                )}
        </StyledBox>
    )
}

export default Section