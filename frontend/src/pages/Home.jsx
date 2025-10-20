import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Box,
  Button,
} from "@mui/material";

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/programs/")
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch((err) => console.error("Error fetching programs:", err));
  }, []);

  useEffect(() => {
    setMessages([
      { id: 1, name: "Sophia Carter", program: "Art History" },
      { id: 2, name: "Ethan Walker", program: "Spanish Language" },
      { id: 3, name: "Olivia Bennett", program: "Japanese Culture" },
      { id: 4, name: "Liam Harper", program: "French Literature" },
    ]);
  }, []);

  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      {/* Explore Programs button */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            borderRadius: 3,
            textTransform: "none",
            px: 4,
            py: 1.5,
            fontWeight: 600,
          }}
          onClick={() => navigate("/map")}
        >
          Explore Programs
        </Button>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {/* Favorite Programs */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="600" mb={2}>
              My Favorite Programs
            </Typography>
            <List>
              {programs.map((p) => (
                <ListItemButton
                  key={p.id}
                  onClick={() => navigate(`/programs/${p.id}`)}
                  sx={{
                    border: "1px solid #eee",
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={p.name}
                    secondary={p.location || p.subtitle}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Messages */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="600" mb={2}>
              Messages
            </Typography>
            <List>
              {messages.map((m) => (
                <ListItemButton
                  key={m.id}
                  onClick={() => navigate(`/messages/${m.id}`)}
                  sx={{
                    border: "1px solid #eee",
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <Avatar sx={{ mr: 2 }}>{m.name[0]}</Avatar>
                  <ListItemText
                    primary={m.name}
                    secondary={`Alumni, ${m.program}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}