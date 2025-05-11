import React, { useEffect, useState } from 'react';
import { TaskCard } from '../components/TaskCard';
import { ProjectCard } from '../components/ProjectCard';
import TaskForm from '../components/TaskForm';
import ProjectForm from '../components/ProjectForm';
import { ButtonGroup, Button, Box, Typography, Container, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import api from '../api';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tasksRes, projectsRes] = await Promise.all([
                api.tasks.getAll(),
                api.projects.getAll()
            ]);
            setTasks(tasksRes.data);
            setProjects(projectsRes.data);
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            const response = await api.tasks.create(taskData);
            setTasks([...tasks, response.data]);
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            const response = await api.projects.create(projectData);
            setProjects([...projects, response.data]);
        } catch (error) {
            console.error('Ошибка при создании проекта:', error);
        }
    };

    const filteredTasks = tasks.filter(task => {
        const priorityMatch = filter === 'all' || task.priority === filter;
        const projectMatch = projectFilter === 'all' || task.project === Number(projectFilter);
        const statusMatch = statusFilter === 'all' || task.status === statusFilter;
        return priorityMatch && projectMatch && statusMatch;
    });

    return (
        <Container>
            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4">Проекты</Typography>
                    <ProjectForm onSubmit={handleCreateProject} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                    {projects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4">Задачи</Typography>
                    <TaskForm onSubmit={handleCreateTask} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <ButtonGroup variant="contained">
                        <Button onClick={() => setFilter('all')}>Все</Button>
                        <Button onClick={() => setFilter('low')}>Низкий</Button>
                        <Button onClick={() => setFilter('medium')}>Средний</Button>
                        <Button onClick={() => setFilter('high')}>Высокий</Button>
                    </ButtonGroup>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Проект</InputLabel>
                        <Select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            label="Проект"
                        >
                            <MenuItem value="all">Все проекты</MenuItem>
                            {projects.map(project => (
                                <MenuItem key={project.id} value={project.id}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Статус</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Статус"
                        >
                            <MenuItem value="all">Все статусы</MenuItem>
                            <MenuItem value="in_progress">В процессе</MenuItem>
                            <MenuItem value="completed">Выполнено</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} project={projects.find(p => p.id === task.project)} />
                    ))}
                </Box>
            </Box>
        </Container>
    );
}