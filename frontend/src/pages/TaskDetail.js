import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    IconButton,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import RoleBadge from '../components/RoleBadge';
import api from '../api';

export default function TaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'in_progress',
        project: '',
        deadline: ''
    });

    const loadTask = useCallback(async () => {
        try {
            const response = await api.tasks.getById(id);
            setTask(response.data);
            setEditData({
                title: response.data.title,
                description: response.data.description,
                priority: response.data.priority,
                status: response.data.status,
                project: response.data.project,
                deadline: response.data.deadline || ''
            });
            if (response.data.project_data) {
                setProject(response.data.project_data);
            }
        } catch (error) {
            console.error('Ошибка при загрузке задачи:', error);
        }
    }, [id]);

    useEffect(() => {
        loadTask();
    }, [loadTask]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            project: task.project,
            deadline: task.deadline || ''
        });
    };

    const handleSave = async () => {
        try {
            const response = await api.tasks.update(id, editData);
            setTask(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
            try {
                await api.tasks.delete(id);
                navigate('/');
            } catch (error) {
                console.error('Ошибка при удалении задачи:', error);
            }
        }
    };

    //проверяем, есть ли у пользователя право на редактирование
    const canEdit = task?.current_user_role === 'creator' || 
                   task?.current_user_role === 'admin' || 
                   task?.current_user_role === 'editor';

    if (!task) {
        return <Typography>Загрузка...</Typography>;
    }

    return (
        <Container>
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                {isEditing ? (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5">Редактирование задачи</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Сохранить">
                                    <IconButton color="primary" onClick={handleSave}>
                                        <SaveIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Отмена">
                                    <IconButton color="error" onClick={handleCancel}>
                                        <CancelIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        <TextField
                            fullWidth
                            label="Название"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Описание"
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={4}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Приоритет</InputLabel>
                            <Select
                                value={editData.priority}
                                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                            >
                                <MenuItem value="low">Низкий</MenuItem>
                                <MenuItem value="medium">Средний</MenuItem>
                                <MenuItem value="high">Высокий</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Статус</InputLabel>
                            <Select
                                value={editData.status}
                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                            >
                                <MenuItem value="in_progress">В процессе</MenuItem>
                                <MenuItem value="completed">Выполнено</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h4">{task.title}</Typography>
                                <RoleBadge role={task.current_user_role} />
                            </Box>
                            {canEdit && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Редактировать">
                                        <IconButton onClick={handleEdit} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Удалить">
                                        <IconButton onClick={handleDelete} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            {task.description}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="body2">
                                Приоритет: {task.priority === 'low' ? 'Низкий' : task.priority === 'medium' ? 'Средний' : 'Высокий'}
                            </Typography>
                            <Typography variant="body2">
                                Статус: {task.status === 'in_progress' ? 'В процессе' : 'Выполнено'}
                            </Typography>
                            {project && (
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: 'primary.main', 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    Проект: {project.name}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
} 