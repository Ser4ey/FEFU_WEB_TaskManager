import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Paper,
    Chip,
    Tooltip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { auth, projects } from '../api';

const ROLES = [
    { value: 'admin', label: 'Администратор', color: '#3f51b5' },
    { value: 'editor', label: 'Редактор', color: '#4caf50' },
    { value: 'viewer', label: 'Читатель', color: '#ff9800' }
];

const getRoleLabel = (role) => {
    const roleObj = ROLES.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
};

const getRoleColor = (role) => {
    const roleObj = ROLES.find(r => r.value === role);
    return roleObj ? roleObj.color : '#757575';
};

function ProjectMembersManager({ project, onMembersUpdated, userRole }) {
    const [members, setMembers] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserIdToEdit, setSelectedUserIdToEdit] = useState(null);
    const [selectedRole, setSelectedRole] = useState('viewer');
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загружаем участников при изменении проекта
    useEffect(() => {
        if (project && project.members) {
            setMembers(project.members);
        }
    }, [project]);

    // Поиск пользователей
    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery) {
                setSearchResults([]);
                return;
            }

            setSearchLoading(true);
            try {
                const response = await auth.searchUsers(searchQuery);
                setSearchResults(response.data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Ошибка при поиске пользователей');
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        };

        const timer = setTimeout(searchUsers, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAddDialogOpen = () => {
        setOpenAddDialog(true);
        setSelectedUser(null);
        setSelectedRole('viewer');
        setSearchQuery('');
        setError(null);
    };

    const handleAddDialogClose = () => {
        setOpenAddDialog(false);
        setSelectedUser(null);
        setSearchQuery('');
    };

    const handleEditDialogOpen = (member) => {
        setOpenEditDialog(true);
        setSelectedUserIdToEdit(member.user.id);
        setSelectedRole(member.role);
        setError(null);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
        setSelectedUserIdToEdit(null);
        setSelectedRole('viewer');
    };

    const handleAddMember = async () => {
        if (!selectedUser) {
            setError('Выберите пользователя');
            return;
        }

        try {
            await projects.addMember(project.id, {
                user_id: selectedUser.id,
                role: selectedRole
            });
            
            handleAddDialogClose();
            if (onMembersUpdated) {
                onMembersUpdated();
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Ошибка при добавлении участника');
        }
    };

    const handleEditMember = async () => {
        try {
            await projects.addMember(project.id, {
                user_id: selectedUserIdToEdit,
                role: selectedRole
            });
            
            handleEditDialogClose();
            if (onMembersUpdated) {
                onMembersUpdated();
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Ошибка при изменении роли участника');
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await projects.removeMember(project.id, userId);
            if (onMembersUpdated) {
                onMembersUpdated();
            }
        } catch (err) {
            console.error(err);
            // Можно добавить уведомление об ошибке
        }
    };

    // Проверяем, может ли пользователь управлять правами доступа
    const canManageAccess = userRole === 'creator' || userRole === 'admin';

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Участники проекта</Typography>
                {canManageAccess && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddDialogOpen}
                    >
                        Добавить участника
                    </Button>
                )}
            </Box>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Пользователь</TableCell>
                            <TableCell>Роль</TableCell>
                            {canManageAccess && <TableCell align="right">Действия</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.user.username}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={getRoleLabel(member.role)} 
                                        sx={{ 
                                            backgroundColor: getRoleColor(member.role),
                                            color: 'white'
                                        }}
                                    />
                                </TableCell>
                                {canManageAccess && (
                                    <TableCell align="right">
                                        {/* Не показываем кнопки для создателя проекта */}
                                        {project.creator.id !== member.user.id && (
                                            <>
                                                <Tooltip title="Изменить роль">
                                                    <IconButton 
                                                        onClick={() => handleEditDialogOpen(member)}
                                                        color="primary"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Удалить участника">
                                                    <IconButton 
                                                        onClick={() => handleRemoveMember(member.user.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {members.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={canManageAccess ? 3 : 2} align="center">
                                    Нет участников
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Диалог добавления участника */}
            <Dialog open={openAddDialog} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Добавить участника</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Autocomplete
                            options={searchResults}
                            getOptionLabel={(option) => option.username}
                            loading={searchLoading}
                            value={selectedUser}
                            onChange={(event, newValue) => {
                                setSelectedUser(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Поиск пользователя"
                                    fullWidth
                                    variant="outlined"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    error={!!error}
                                    helperText={error}
                                />
                            )}
                            noOptionsText="Пользователи не найдены"
                            loadingText="Поиск..."
                        />
                        
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="role-select-label">Роль</InputLabel>
                            <Select
                                labelId="role-select-label"
                                value={selectedRole}
                                label="Роль"
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                {ROLES.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddDialogClose}>Отмена</Button>
                    <Button 
                        onClick={handleAddMember} 
                        variant="contained" 
                        disabled={!selectedUser}
                    >
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог редактирования роли */}
            <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="xs" fullWidth>
                <DialogTitle>Изменить роль участника</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel id="edit-role-select-label">Роль</InputLabel>
                            <Select
                                labelId="edit-role-select-label"
                                value={selectedRole}
                                label="Роль"
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                {ROLES.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {error && (
                            <Typography color="error" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose}>Отмена</Button>
                    <Button 
                        onClick={handleEditMember} 
                        variant="contained"
                    >
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ProjectMembersManager; 