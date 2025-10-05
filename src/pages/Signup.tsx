import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import AddTransactionButton from '../components/AddTransactionButton';

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else console.log('Signed up:', data.user);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        width: '100%',
        maxWidth: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRadius: 3,
        backgroundColor: 'var(--secondary-background)',
        '& .MuiInputLabel-root': { // Add styles for input labels
        color: 'var(--primary-text)'
        },
        '& .MuiOutlinedInput-input': { // Add styles for input text
            color: 'var(--primary-text)'
        },
        '& .MuiOutlinedInput-notchedOutline': { // Add styles for input borders
            borderColor: 'var(--primary-text)',
        },
      }}
    >
      <Typography variant="h5" align="center" fontWeight="bold" sx={{color: 'var(--primary-text)'}}>
        Sign Up
      </Typography>

      <TextField
        label="Email"
        type="email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={{ width: '100%' }}>
        <AddTransactionButton onClick={handleSignup} name="Log In" fullWidth/>
      </div>

      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}

      {/* 👇 Switch button */}
      <Button
        onClick={onSwitchToLogin}
        sx={{
          mt: 1,
          bgcolor: 'transparent',
          color: 'var(--primary-text)',
          fontWeight: 'bold',
          '&:hover': {
            background: 'var(--tri-background)',
          },
          borderRadius: '10px',
          
        }}
      >
        Sign In
      </Button>
    </Paper>
  );
};

export default Signup;
