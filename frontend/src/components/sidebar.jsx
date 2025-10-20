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
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HouseIcon from '@mui/icons-material/House';

const drawerWidth = 400;

const Sidebar = ({ open, onClose, selectedMarker }) => {
  // Track open/closed state for each section
  const [openSections, setOpenSections] = useState({});

  const handleToggle = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Currently hardcoded data for a program. Should be replaced with dynamic data from api
  const menuItems = [
    {
      text: 'Description',
      icon: <DescriptionIcon />,
      content: (
        <Typography variant="body2" sx={{ pl: 2, pr: 2, pb: 1 }}>
          This engineering abroad program offers students hands-on experience in global technology
          and innovation settings. Participants will explore local culture, gain international
          teamwork experience, and complete key academic credits while abroad.
        </Typography>
      ),
    },
    {
      text: 'Classes',
      icon: <WorkIcon />,
      content: (
        <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Core Engineering Courses:
          </Typography>
          <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 16 }}>
            <li>Thermodynamics</li>
            <li>Fluid Mechanics</li>
            <li>Materials Science</li>
          </ul>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Electives:
          </Typography>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: 16 }}>
            <li>Renewable Energy Systems</li>
            <li>Robotics & Automation</li>
            <li>Engineering Ethics & Sustainability</li>
          </ul>
        </Box>
      ),
    },
    {
      text: 'Fees',
      icon: <SettingsIcon />,
      content: (
        <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
          <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 16 }}>
            <li>Tuition: $12,000</li>
            <li>Housing: $3,500</li>
            <li>Meals: $1,800</li>
            <li>Travel Insurance: $400</li>
          </ul>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" fontWeight="bold">
            Total: $17,700
          </Typography>
        </Box>
      ),
    },
    {
      text: 'Housing & Meals',
      icon: <HouseIcon />,
      content: (
        <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Housing Options:
          </Typography>
          <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 16 }}>
            <li>Furnished student apartments (shared bedrooms)</li>
            <li>Homestays with local families (breakfast and dinner included)</li>
            <li>Private studio upgrades available (limited availability)</li>
          </ul>

          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Meal Plans:
          </Typography>
          <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 16 }}>
            <li>Daily breakfast provided for all students</li>
            <li>Lunch stipend for weekdays (included in program fee)</li>
            <li>Dinner options vary by housing type</li>
          </ul>

          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Additional Notes:
          </Typography>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: 16 }}>
            <li>All housing is within 30 minutes of the main program center</li>
            <li>Wi-Fi, utilities, and laundry access included</li>
          </ul>
        </Box>
      ),
    },
    {
      text: 'Other Info',
      icon: <InfoIcon />,
      content: (
        <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: 16 }}>
            <li>Visa assistance provided upon acceptance</li>
            <li>Weekend excursions to local cultural sites</li>
            <li>On-site orientation and 24/7 student support</li>
            <li>Optional language immersion sessions</li>
          </ul>
        </Box>
      ),
    },
  ];

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
          {selectedMarker ? selectedMarker.name : 'Program Details'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Toolbar>

      <Divider />

      <Box sx={{ overflow: 'auto', p: 2 }}>
        {selectedMarker && (
          <>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {selectedMarker.description}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
              Coordinates: {selectedMarker.latitude.toFixed(4)},{' '}
              {selectedMarker.longitude.toFixed(4)}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

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
