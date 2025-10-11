import React from 'react';
import { supabase } from '../supabaseClient';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

interface MenuProps {
  userEmail: string | null;
}

const Menu: React.FC<MenuProps> = ({ userEmail }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        mb: 2,
        bgcolor: 'var(--background-color)',
        boxShadow: 'none',
        borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',

      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'var(--primary-text, #fff)', fontWeight: 'bold', fontSize: '1.5rem' }}>
          Portfolio Tracker
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {userEmail && (
            <Typography variant="body2" sx={{ color: 'var(--primary-text, rgba(255, 255, 255, 0.8))' }}>
              {userEmail}
            </Typography>
          )}
          
          <Button
            onClick={handleLogout}
            sx={{
              bgcolor: "transparent",
              color: "var(--primary-text, #fff)",
              fontWeight: "bold",
              "&:hover": {
                background: "var(--tri-background, rgba(255, 255, 255, 0.1))",
              },
              borderRadius: "10px",
              textTransform: 'none',
            }}
          >
            Log Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Menu;