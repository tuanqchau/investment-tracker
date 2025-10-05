import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // ✅ add this

interface AppUser {
  id: string;
  email: string | null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      const supaUser = data.session?.user;
      if (supaUser) {
        setUser({
          id: supaUser.id,
          email: supaUser.email ?? null, // convert undefined -> null
        });
      } else {
        setUser(null);
      }
    });

    // Listen for auth changes
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
      {/* ✅ Wrap the app here so all children can use date pickers */}
      {!user ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
          <div>
            <Login />
            <hr style={{ margin: '20px 0' }} />
            <Signup />
          </div>
        </div>
      ) : (
        <Dashboard user={user} />
      )}
    </LocalizationProvider>
  );
};

export default App;
