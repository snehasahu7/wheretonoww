import React from 'react';
import { useState, useEffect} from 'react';

import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
};
import './Hero.css';

const Hero = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedEventUrl, setSelectedEventUrl] = useState('');
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [error, setError] = useState(null);

    // Function to validate event data
    const isValidEvent = (event) => {
        return (
            event &&
            typeof event === 'object' &&
            event.name && 
            event.name.trim() !== '' &&
            event.description && 
            event.description.trim() !== '' &&
            event.date && 
            event.date.trim() !== '' &&
            event.location && 
            event.location.trim() !== '' &&
            event.link && 
            event.link.trim() !== '' &&
            event.image && 
            event.image.trim() !== '' &&
            event.image !== 'https://via.placeholder.com/300x200?text=No+Image'
        );
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/eventlist", {
                    withCredentials: true
                });
                
                // Filter out invalid events silently
                const validEvents = response.data.filter(isValidEvent);
                setEvents(validEvents);
                setFilteredEvents(validEvents);
                
                // Only show error if no events are available at all
                if (validEvents.length === 0) {
                    setError('No events available at the moment. Please try again later.');
                } else {
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Failed to load events. Please try again later.');
                setEvents([]);
                setFilteredEvents([]);
            }
        };

        fetchEvents();
    }, []);

    const handleOpen = (url) => {
    setSelectedEventUrl(url);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setConsent(false);
  };

    // Add function to test session
    const testSession = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/test-session', {
                withCredentials: true
            });
            console.log('Session test response:', response.data);
            return response.data.success;
        } catch (err) {
            console.error('Session test failed:', err);
            return false;
        }
    };

    // Test session on component mount
    useEffect(() => {
        const verifySession = async () => {
            const sessionWorking = await testSession();
            console.log('Session working:', sessionWorking);
        };
        verifySession();
    }, []);

    const handleticket = async () => {
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email.');
            return;
        }
        if (!consent) {
            alert('Please check the box to give email consent.');
            return;
        }

        try {
            // First verify session is working
            const sessionWorking = await testSession();
            if (!sessionWorking) {
                throw new Error('Session not working properly');
            }

            // Store email in session storage
            sessionStorage.setItem('lastSubmittedEmail', email);

            // Send email and event URL to backend
            const response = await axios.post('http://localhost:4000/api/storemail', 
                {
                    email,
                    eventurl: selectedEventUrl
                }, 
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Store email response:', response.data);

            if (response.data.success) {
                // Verify the data was stored
                const verifyResponse = await axios.get('http://localhost:4000/api/stored-emails', {
                    withCredentials: true
                });
                console.log('Stored emails verification:', verifyResponse.data);

                if (verifyResponse.data.success && verifyResponse.data.clicks) {
                    console.log('Email successfully stored and verified');
                    window.open(selectedEventUrl, '_blank');
                    handleClose();
                } else {
                    throw new Error('Email storage verification failed');
                }
            } else {
                throw new Error(response.data.error || 'Failed to store email');
            }
        } catch (err) {
            console.error('Error in email storage process:', err);
            alert(err.response?.data?.error || err.message || 'Error saving email. Please try again.');
        }
    };

    // Add function to check stored emails
    const checkStoredEmails = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/stored-emails', {
                withCredentials: true
            });
            console.log('Stored emails:', response.data);
        } catch (err) {
            console.error('Error checking stored emails:', err);
        }
    };

    // Check stored emails on component mount
    useEffect(() => {
        checkStoredEmails();
    }, []);

  return (
    <div className='Hero'>
        <div className="hero-container">
            <div className="hero-img-container">
                <img src="https://themeatandwineco.com/wp-content/uploads/2023/05/vivid-sydney-social-1024x538.png" alt="" className="hero-img" />
            </div>
            <div className="Header">
                <p>From concerts to festivals, find everything in one place.</p>
            </div>
            
            <h2 className="upcoming-events-header">Upcoming Events</h2>

            {error && (
                <Alert 
                    severity="error"
                    sx={{ width: '100%', mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            <div className="event-container">
                {filteredEvents.map((evt,index)=>(
                    <div key={index} className="event-box">
                        <img 
                            src={evt.image} 
                            alt={evt.name}
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                                e.target.onerror = null; // Prevent infinite loop
                            }}
                        />
                        <div className="content">
                            <h2>{evt.name}</h2>
                            <p className="date">{evt.date}</p>
                            <p className="location">{evt.location}</p>
                            <p className="description">{evt.description}</p>
                        </div>
                        <div className="button-container">
                            <button onClick={()=>handleOpen(evt.link)}>GET TICKETS</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
         <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>Enter Your Email</Typography>
          <TextField
            label="Email Address"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            type="email"
            required
            id="email"
            name="email"
          />
          <FormControlLabel
            control={<Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />}
            label="I agree to receive event-related emails."
          />
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleticket} 
            sx={{ mt: 2 }}
            disabled={!email || !consent}
          >
            Continue
          </Button>
        </Box>
      </Modal>
      
    </div>
  )
}

export default Hero;