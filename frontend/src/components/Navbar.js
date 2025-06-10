import React, { useState, useEffect } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    IconButton, 
    Menu, 
    MenuItem, 
    Avatar, 
    Box,
    Tooltip
} from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../api';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            //не загружаем информацию о пользователе на страницах входа и регистрации
            if (location.pathname === '/login' || location.pathname === '/register') {
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }

            try {
                const response = await api.auth.getCurrentUser();
                setUser(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке пользователя:', error);
                localStorage.removeItem('token');
                if (location.pathname !== '/login') {
                    navigate('/login');
                }
            }
        };
        loadUser();
    }, [location.pathname, navigate]);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        handleClose();
        navigate('/login');
    };

    //определяем находимся ли мы на странице входа или регистрации
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component={RouterLink} 
                    to="/"
                    sx={{ 
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <HomeIcon />
                    Task Manager
                </Typography>
                {!isAuthPage && user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button 
                            color="inherit" 
                            component={RouterLink} 
                            to="/"
                            startIcon={<HomeIcon />}
                        >
                            Главная
                        </Button>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ mr: 2 }}>
                                {user.username}
                            </Typography>
                            <Tooltip title="Меню пользователя">
                                <IconButton
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleMenu}
                                    color="inherit"
                                >
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                                        {user.username ? user.username.charAt(0).toUpperCase() : <PersonIcon />}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleLogout}>
                                    <LogoutIcon sx={{ mr: 1 }} />
                                    Выйти
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                ) : !user && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                            color="inherit" 
                            component={RouterLink} 
                            to="/login"
                            startIcon={<PersonIcon />}
                        >
                            Войти
                        </Button>
                        <Button 
                            color="inherit" 
                            component={RouterLink} 
                            to="/register"
                            variant="outlined"
                        >
                            Регистрация
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}