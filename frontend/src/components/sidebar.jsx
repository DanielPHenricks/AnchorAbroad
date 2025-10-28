import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
  IconButton,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';

const drawerWidth = 400;

// You can extend this mapping with more icons if needed
const iconMapping = {
  'Program Overview': <DescriptionIcon />,
};

const Sidebar = ({ open, onClose, selectedMarker }) => {
  const [openSections, setOpenSections] = useState({});

  const handleToggle = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!selectedMarker) return null;

  const menuItems = selectedMarker.sections?.map((section) => ({
    text: section.title,
    icon: iconMapping[section.title] || <DescriptionIcon />,
    content: (
      <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
        {Array.isArray(section.content)
          ? section.content.map((paragraph, i) => (
              <Typography variant="body2" sx={{ mb: 1 }} key={i}>
                {paragraph}
              </Typography>
            ))
          : (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {section.content}
              </Typography>
            )
        }
      </Box>
    ),
  }));
  

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          color: '#333',
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div">
          {selectedMarker.program_details.name}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Toolbar>

      <Divider />

      <Box sx={{ overflow: 'auto', p: 2 }}>
        {/* Program details */}
        <Typography variant="body1" sx={{ mb: 1 }}>
          Program Type: {selectedMarker.program_details.program_type}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Academic Calendar: {selectedMarker.program_details.academic_calendar}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Minimum GPA: {selectedMarker.program_details.minimum_gpa}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Language Prerequisite: {selectedMarker.program_details.language_prerequisite}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Housing: {selectedMarker.program_details.housing}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
          Coordinates: {selectedMarker.latitude?.toFixed(4)},{' '}
          {selectedMarker.longitude?.toFixed(4)}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Dynamic sections */}
        <List>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleToggle(item.text)}>
                  <ListItemIcon sx={{ color: '#555' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {openSections[item.text] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={openSections[item.text]} timeout="auto" unmountOnExit>
                {item.content}
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;