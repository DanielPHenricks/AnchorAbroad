import React from "react";
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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";

const drawerWidth = 240;

const Sidebar = () => {
  const menuItems = [
    { text: "Program Home", icon: <HomeIcon /> },
    { text: "Classes", icon: <WorkIcon /> },
    { text: "Fees", icon: <SettingsIcon /> },
    { text: "Other Info", icon: <InfoIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#f8f9fa",
          color: "#333",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ ml: 1 }}>
          About the Program
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton>
                <ListItemIcon sx={{ color: "#555" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
