import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import AddTransactionButton from '../components/AddTransactionButton';
interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else console.log('Logged in:', data.user);
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
        color: 'white'
      },
      '& .MuiOutlinedInput-input': { // Add styles for input text
        color: 'white'
      },
      '& .MuiOutlinedInput-notchedOutline': { // Add styles for input borders
        borderColor: 'white',
      },
      }}
    >
      <Typography variant="h5" align="center" fontWeight="bold" sx={{ color: 'white' }}>
        Log In
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

      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}
      <div style={{ width: '100%' }}>
        <AddTransactionButton onClick={handleLogin} name="LOG IN" fullWidth/>
      </div>
      
      <Button
        onClick={onSwitchToSignup}
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
        Create an Account
      </Button>
    </Paper>
  );
};

export default Login;
