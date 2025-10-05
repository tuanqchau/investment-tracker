import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box } from '@mui/material';

interface AppUser {
  id: string;
  email: string | null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [showLogin, setShowLogin] = useState(false); // 👈 toggle between login/signup

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const supaUser = data.session?.user;
      if (supaUser) {
        setUser({
          id: supaUser.id,
          email: supaUser.email ?? null,
        });
      } else {
        setUser(null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const supaUser = session?.user;
      if (supaUser) {
        setUser({ id: supaUser.id, email: supaUser.email ?? null });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {!user ? (
        <Box
          sx={{
            minHeight: '100vh',
            minWidth: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          
            p: 3,
          }}
        >
          {showLogin ? (
            <Login onSwitchToSignup={() => setShowLogin(false)} />
          ) : (
            <Signup onSwitchToLogin={() => setShowLogin(true)} />
          )}
        </Box>
      ) : (
        <Dashboard user={user} />
      )}
    </LocalizationProvider>
  );
};

export default App;
