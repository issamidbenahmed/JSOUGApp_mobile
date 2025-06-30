import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';

const menuItems = [
  { text: 'Moniteurs', icon: <PeopleIcon />, key: 'moniteurs' },
  // Tu pourras ajouter d'autres menus ici
];

export default function Sidebar({ onMenuClick, onLogout, selected }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 220,
          boxSizing: 'border-box',
          background: '#fff',
          borderRight: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Box>
        <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 22, color: '#FFB800', letterSpacing: 1 }}>
          Admin
        </Box>
        <List>
          {menuItems.map(item => (
            <ListItem
              button
              key={item.key}
              selected={selected === item.key}
              onClick={() => onMenuClick(item.key)}
              sx={{
                transition: 'background 0.2s',
                '&:hover': { background: '#FFF3E0' },
                color: selected === item.key ? '#FFB800' : '#222',
              }}
            >
              <ListItemIcon sx={{ color: selected === item.key ? '#FFB800' : '#888' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <Divider />
        <List>
          <ListItem
            button
            onClick={onLogout}
            sx={{
              color: '#F44336',
              '&:hover': { background: '#FFEBEE' },
            }}
          >
            <ListItemIcon sx={{ color: '#F44336' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
} 