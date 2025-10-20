/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 30 mins
 */

import { useParams } from 'react-router-dom';
import { Typography, Box } from '@mui/material';

export default function MessageDetail() {
  const { id } = useParams();
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">Messages with alum ID: {id}</Typography>
    </Box>
  );
}
