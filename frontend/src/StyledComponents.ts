import { Box, Container, styled } from "@mui/material";

export const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: "100vh",
    textAlign: 'left',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    color: 'white',
}));

export const StyledMainBox = styled(Box)(({ }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 2,
    textAlign: 'center',
}));

export const StyledContainer = styled(Container)(({ }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
}))