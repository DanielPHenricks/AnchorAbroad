import { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Avatar } from '@mui/material';
import { Send, SmartToy, Person } from '@mui/icons-material';
import { marked } from 'marked';
import apiService from '../services/api';

export default function Chat() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your Anchor Abroad AI assistant. I can help you find the perfect study abroad program based on your interests, academic goals, and preferences. What are you looking for in a study abroad experience?",
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [programs, setPrograms] = useState([]);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Fetch programs on mount
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await apiService.getPrograms();
                setPrograms(data);
            } catch (error) {
                console.error('Error fetching programs:', error);
            }
        };
        fetchPrograms();
    }, []);

    const generateBotResponse = async (userMessage) => {
        // Create a trimmed version of programs for the AI
        const trimmedPrograms = programs.map(p => ({
            name: p.program_details?.name || 'Unknown',
            location: p.location || 'Unknown',
            program_id: p.program_id,
            program_type: p.program_details?.program_type,
            minimum_gpa: p.program_details?.minimum_gpa,
            language_prerequisite: p.program_details?.language_prerequisite,
            academic_calendar: p.program_details?.academic_calendar,
        }));

        const programsJson = JSON.stringify(trimmedPrograms, null, 2);

        const prompt = `You are an AI study abroad advisor for Vanderbilt University's Anchor Abroad program. Your role is to help students find the perfect study abroad program based on their interests, academic goals, location preferences, and other criteria.

Key guidelines:
- Provide thoughtful, personalized recommendations
- Ask clarifying questions to better understand student needs
- Consider factors like: academic interests, language requirements, program type, location, duration, GPA requirements
- Be encouraging and supportive
- Format all responses in Markdown for better readability
- Keep responses concise but informative
- When recommending programs, provide 2-3 options with brief explanations and include the program name
- Rate program matches on a scale of 1-10 based on the student's stated preferences
- Reference specific programs from the list below when making recommendations

Here is the list of available study abroad programs:
${programsJson}

The student's message: ${userMessage}`;

        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyD7sBwlLf4_fA8vFRWz1FBJgWQjAoAaAvI';
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt,
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'API request failed');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error generating response:', error);
            return "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to explore programs directly on the map!";
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            text: inputMessage,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        const botResponseText = await generateBotResponse(inputMessage);

        setIsTyping(false);

        const botMessage = {
            id: messages.length + 2,
            text: botResponseText,
            sender: 'bot',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Box
            sx={{
                height: 'calc(100vh - 64px)',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #46474b 0%, #b8bac6 100%)',
                p: 3,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    maxWidth: 1000,
                    width: '100%',
                    mx: 'auto',
                }}
            >
                {/* Chat Header */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #B49248 0%, #8B7355 100%)',
                        color: 'white',
                        p: 3,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h5" fontWeight="600">
                        Anchor Buddy - Study Abroad Assistant
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                        Get personalized program recommendations
                    </Typography>
                </Box>

                {/* Messages Container */}
                <Box
                    ref={chatContainerRef}
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        backgroundColor: '#f8f9fa',
                    }}
                >
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            sx={{
                                display: 'flex',
                                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                alignItems: 'flex-start',
                                gap: 1,
                            }}
                        >
                            {message.sender === 'bot' && (
                                <Avatar
                                    sx={{
                                        bgcolor: '#B49248',
                                        width: 36,
                                        height: 36,
                                    }}
                                >
                                    <SmartToy fontSize="small" />
                                </Avatar>
                            )}

                            <Paper
                                elevation={1}
                                sx={{
                                    maxWidth: '70%',
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: message.sender === 'user' ? '#B49248' : 'white',
                                    color: message.sender === 'user' ? 'white' : '#333',
                                    borderBottomRightRadius: message.sender === 'user' ? 4 : 16,
                                    borderBottomLeftRadius: message.sender === 'bot' ? 4 : 16,
                                }}
                            >
                                <Box
                                    sx={{
                                        '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                                        '& ul, & ol': { m: 0, pl: 2.5, mb: 1 },
                                        '& li': { mb: 0.5 },
                                        '& strong': { fontWeight: 600 },
                                        '& h1, & h2, & h3': { mt: 1, mb: 0.5, fontWeight: 600 },
                                        '& code': {
                                            backgroundColor: message.sender === 'user' ? 'rgba(255,255,255,0.2)' : '#f1f3f4',
                                            padding: '2px 6px',
                                            borderRadius: 1,
                                            fontSize: '0.9em',
                                        },
                                    }}
                                    dangerouslySetInnerHTML={{ __html: marked.parse(message.text) }}
                                />
                            </Paper>

                            {message.sender === 'user' && (
                                <Avatar
                                    sx={{
                                        bgcolor: 'secondary.main',
                                        width: 36,
                                        height: 36,
                                    }}
                                >
                                    <Person fontSize="small" />
                                </Avatar>
                            )}
                        </Box>
                    ))}

                    {isTyping && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                            }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: '#B49248',
                                    width: 36,
                                    height: 36,
                                }}
                            >
                                <SmartToy fontSize="small" />
                            </Avatar>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    borderBottomLeftRadius: 4,
                                    backgroundColor: 'white',
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {[0, 1, 2].map((i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                backgroundColor: '#999',
                                                animation: 'typing 1.4s infinite ease-in-out',
                                                animationDelay: `${i * 0.16}s`,
                                                '@keyframes typing': {
                                                    '0%, 80%, 100%': {
                                                        transform: 'scale(0.8)',
                                                        opacity: 0.5,
                                                    },
                                                    '40%': {
                                                        transform: 'scale(1)',
                                                        opacity: 1,
                                                    },
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Paper>
                        </Box>
                    )}

                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: 'white',
                        borderTop: '1px solid #e1e5e9',
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about study abroad programs..."
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: '#f8f9fa',
                                },
                            }}
                        />
                        <IconButton
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isTyping}
                            sx={{
                                bgcolor: '#B49248',
                                color: 'white',
                                width: 48,
                                height: 48,
                                '&:hover': {
                                    bgcolor: '#8B7355',
                                },
                                '&:disabled': {
                                    bgcolor: '#e1e5e9',
                                    color: '#999',
                                },
                            }}
                        >
                            <Send />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
