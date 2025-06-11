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
    const [deadlineSort, setDeadlineSort] = useState('urgent'); // urgent, later, default

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

    //сортировка задач по дедлайну с учетом выбранного режима сортировки
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (deadlineSort === 'default') {
            //без сортировки, возвращаем исходный порядок
            return 0;
        }
        
        //задачи без дедлайна размещаем в конце списка
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        
        //сортировка по дедлайну
        if (deadlineSort === 'urgent') {
            //сначала срочные
            return new Date(a.deadline) - new Date(b.deadline);
        } else {
            //сначала несрочные
            return new Date(b.deadline) - new Date(a.deadline);
        }
    });

    return (
        <Container sx={{ pb: 6 }}>
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
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
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
                    <FormControl sx={{ minWidth: 220 }}>
                        <InputLabel>Сортировка по дедлайну</InputLabel>
                        <Select
                            value={deadlineSort}
                            onChange={(e) => setDeadlineSort(e.target.value)}
                            label="Сортировка по дедлайну"
                        >
                            <MenuItem value="default">По умолчанию</MenuItem>
                            <MenuItem value="urgent">Сначала срочные</MenuItem>
                            <MenuItem value="later">Сначала несрочные</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {sortedTasks.map(task => (
                        <TaskCard key={task.id} task={task} project={projects.find(p => p.id === task.project)} />
                    ))}
                </Box>
            </Box>
        </Container>
    );
}