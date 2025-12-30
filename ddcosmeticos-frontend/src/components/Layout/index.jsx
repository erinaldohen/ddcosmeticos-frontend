import { useState } from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PointOfSale as PdvIcon,
  Inventory as ProdutoIcon,
  AttachMoney as FinanceiroIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const usuarioNome = localStorage.getItem('usuario') || 'Usuário';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'PDV (Caixa)', icon: <PdvIcon />, path: '/pdv' },
    { text: 'Produtos', icon: <ProdutoIcon />, path: '/produtos' },
    { text: 'Financeiro', icon: <FinanceiroIcon />, path: '/financeiro' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const drawer = (
    <div>
      <Toolbar sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          DD Cosméticos
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Sair" sx={{ color: 'error.main' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Barra Superior (Header) */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          // AQUI: Removemos a cor manual. Ele vai usar a cor "primary" (Rosa) do tema automaticamente.
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(i => i.path === location.pathname)?.text || 'Sistema'}
          </Typography>
          <Typography variant="body1">
            Olá, {usuarioNome}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Menu Lateral (Drawer) */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Drawer Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Drawer Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Área de Conteúdo (Onde as páginas aparecem) */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, backgroundColor: 'background.default', minHeight: '100vh' }}
      >
        <Toolbar /> {/* Espaço para não ficar embaixo da barra superior */}
        <Outlet />
      </Box>
    </Box>
  );
}