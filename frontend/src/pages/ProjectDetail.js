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
import { TaskCard } from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import api from '../api';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        description: '',
        is_public: false
    });

    const loadProject = useCallback(async () => {
        try {
            const response = await api.projects.getById(id);
            setProject(response.data);
            setEditData({
                name: response.data.name,
                description: response.data.description,
                is_public: response.data.is_public
            });
        } catch (error) {
            console.error('Ошибка при загрузке проекта:', error);
        }
    }, [id]);

    const loadTasks = useCallback(async () => {
        try {
            const response = await api.tasks.getAll();
            setTasks(response.data.filter(task => task.project === parseInt(id)));
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
        }
    }, [id]);

    useEffect(() => {
        loadProject();
        loadTasks();
    }, [loadProject, loadTasks]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            name: project.name,
            description: project.description,
            is_public: project.is_public
        });
    };

    const handleSave = async () => {
        try {
            const response = await api.projects.update(id, editData);
            setProject(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка при обновлении проекта:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
            try {
                await api.projects.delete(id);
                navigate('/');
            } catch (error) {
                console.error('Ошибка при удалении проекта:', error);
            }
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            const response = await api.tasks.create({
                ...taskData,
                project: parseInt(id)
            });
            setTasks([...tasks, response.data]);
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
        }
    };

    if (!project) {
        return <Typography>Загрузка...</Typography>;
    }

    return (
        <Container>
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                {isEditing ? (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5">Редактирование проекта</Typography>
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
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
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
                            <InputLabel>Зона видимости</InputLabel>
                            <Select
                                value={editData.is_public.toString()}
                                onChange={(e) => setEditData({ ...editData, is_public: e.target.value === 'true' })}
                            >
                                <MenuItem value="false">Приватный</MenuItem>
                                <MenuItem value="true">Публичный</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h4">{project.name}</Typography>
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
                        </Box>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            {project.description}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Зона видимости: {project.is_public ? 'Публичный' : 'Приватный'}
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4">Задачи проекта</Typography>
                    <TaskForm onSubmit={handleCreateTask} projectId={id} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} project={project} />
                    ))}
                </Box>
            </Box>
        </Container>
    );
} 