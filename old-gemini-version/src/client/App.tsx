
// src/client/App.tsx
import React from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Box, Drawer, List, ListItem, ListItemButton, ListItemText, Grid } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import theme from './theme';
import Dashboard from './components/Dashboard';
import Applications from './components/Applications';
import ApplicationForm from './components/ApplicationForm';

const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', path: '/' },
  { text: 'Mentors', path: '/applications/mentors' },
  { text: 'Mentees', path: '/applications/mentees' },
  { text: 'Supporters', path: '/applications/supporters' },
  { text: 'Apply as Mentor', path: '/apply/mentor' },
  { text: 'Apply as Mentee', path: '/apply/mentee' },
  { text: 'Apply as Supporter', path: '/apply/supporter' },
];

function App() {
  const location = useLocation();

  // Render only the form for embeddable routes
  if (location.pathname.startsWith('/form')) {
    return (
      <Container maxWidth="sm" sx={{ pt: 4 }}>
        <Routes>
          <Route path="/form/mentor" element={<ApplicationForm
            type="mentors"
            title="Apply as a Mentor"
            fields={[
              { name: 'name', label: 'Your Name' },
              { name: 'email', label: 'Your Email', type: 'email' },
              { name: 'specialization', label: 'Your Specialization' },
            ]}
          />} />
          <Route path="/form/mentee" element={<ApplicationForm
            type="mentees"
            title="Apply as a Mentee"
            fields={[
              { name: 'name', label: 'Your Name' },
              { name: 'email', label: 'Your Email', type: 'email' },
              { name: 'business_description', label: 'Business Description', multiline: true, rows: 4 },
            ]}
          />} />
          <Route path="/form/supporter" element={<ApplicationForm
            type="supporters"
            title="Apply as a Supporter"
            fields={[
              { name: 'name', label: 'Your Name' },
              { name: 'email', label: 'Your Email', type: 'email' },
              { name: 'support_area', label: 'Area of Support' },
            ]}
          />} />
        </Routes>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Mentoring Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path} selected={location.pathname === item.path}>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications/:type" element={<Applications />} />
            <Route path="/apply/mentor" element={<ApplicationForm
              type="mentors"
              title="Apply as a Mentor"
              fields={[
                { name: 'name', label: 'Your Name' },
                { name: 'email', label: 'Your Email', type: 'email' },
                { name: 'specialization', label: 'Your Specialization' },
              ]}
            />} />
            <Route path="/apply/mentee" element={<ApplicationForm
              type="mentees"
              title="Apply as a Mentee"
              fields={[
                { name: 'name', label: 'Your Name' },
                { name: 'email', label: 'Your Email', type: 'email' },
                { name: 'business_description', label: 'Business Description', multiline: true, rows: 4 },
              ]}
            />} />
            <Route path="/apply/supporter" element={<ApplicationForm
              type="supporters"
              title="Apply as a Supporter"
              fields={[
                { name: 'name', label: 'Your Name' },
                { name: 'email', label: 'Your Email', type: 'email' },
                { name: 'support_area', label: 'Area of Support' },
              ]}
            />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default function AppWrapper() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  );
}
