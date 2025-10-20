import { useParams } from "react-router-dom";
import { Typography, Box } from "@mui/material";

export default function ProgramDetail() {
  const { id } = useParams();
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">Program Details for ID: {id}</Typography>
    </Box>
  );
}