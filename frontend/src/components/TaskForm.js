import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Alert
} from '@mui/material';
import api from '../api';

export default function TaskForm({ onSubmit, initialData = null, projectId = null }) {
    const [open, setOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'in_progress',
        deadline: '',
        project: projectId || ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else if (projectId) {
            setFormData(prev => ({ ...prev, project: projectId }));
        }
    }, [initialData, projectId]);

    const loadProjects = async () => {
        try {
            const response = await api.projects.getAll();
            setProjects(response.data);
            setError(null);
        } catch (error) {
            console.error('Ошибка при загрузке проектов:', error);
            setError('Не удалось загрузить список проектов');
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.project) {
            setError('Выберите проект');
            return;
        }
        if (!formData.deadline) {
            setError('Выберите дедлайн');
            return;
        }
        const taskData = {
            ...formData,
            project: Number(formData.project),
            status: formData.status
        };
        onSubmit(taskData);
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'in_progress',
            deadline: '',
            project: projectId || ''
        });
        setOpen(false);
        setError(null);
    };

    const handleOpen = () => {
        setOpen(true);
        loadProjects();
    };

    return (
        <>
            <Button variant="contained" onClick={handleOpen}>
                {initialData ? 'Редактировать задачу' : 'Создать задачу'}
            </Button>
            <Dialog open={open} onClose={() => {
                setOpen(false);
                setError(null);
            }}>
                <DialogTitle>{initialData ? 'Редактирование задачи' : 'Создание новой задачи'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <TextField
                            autoFocus
                            margin="dense"
                            name="title"
                            label="Название"
                            type="text"
                            fullWidth
                            required
                            value={formData.title}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Описание"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                        />
                        <FormControl fullWidth margin="dense" error={!formData.project}>
                            <InputLabel>Проект</InputLabel>
                            <Select
                                name="project"
                                value={formData.project}
                                onChange={handleChange}
                                required
                            >
                                {projects.map(project => (
                                    <MenuItem key={project.id} value={project.id}>
                                        {project.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Приоритет</InputLabel>
                            <Select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="low">Низкий</MenuItem>
                                <MenuItem value="medium">Средний</MenuItem>
                                <MenuItem value="high">Высокий</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Статус</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="in_progress">В процессе</MenuItem>
                                <MenuItem value="completed">Выполнено</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            name="deadline"
                            label="Дедлайн"
                            type="datetime-local"
                            fullWidth
                            value={formData.deadline}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setOpen(false);
                            setError(null);
                        }}>
                            Отмена
                        </Button>
                        <Button type="submit" variant="contained">
                            {initialData ? 'Сохранить' : 'Создать'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}