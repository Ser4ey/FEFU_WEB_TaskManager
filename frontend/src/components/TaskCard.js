import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RoleBadge from './RoleBadge';

const priorityColors = {
    low: 'success',
    medium: 'warning',
    high: 'error'
};

const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
};

const statusColors = {
    in_progress: 'primary',
    completed: 'success'
};

const statusLabels = {
    in_progress: 'В процессе',
    completed: 'Выполнено'
};

const chipStyle = {
    minWidth: '100px',
    height: '24px',
    fontSize: '0.75rem',
    fontWeight: 500,
    '& .MuiChip-label': {
        px: 1
    }
};

export function TaskCard({ task, project }) {
    const navigate = useNavigate();
    const userRole = task.current_user_role;

    return (
        <Card 
            sx={{ 
                minWidth: 275, 
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: 6
                }
            }}
            onClick={() => navigate(`/tasks/${task.id}`)}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div">
                        {task.title}
                    </Typography>
                    <RoleBadge role={userRole} sx={{ ml: 1 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {task.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                        label={priorityLabels[task.priority]} 
                        color={priorityColors[task.priority]} 
                        size="small"
                        sx={chipStyle}
                    />
                    <Chip 
                        label={statusLabels[task.status]} 
                        color={statusColors[task.status]} 
                        size="small"
                        sx={chipStyle}
                    />
                    {project && (
                        <Chip 
                            label={project.name}
                            color="info"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/projects/${project.id}`);
                            }}
                            sx={chipStyle}
                        />
                    )}
                </Box>
                {task.deadline && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Дедлайн: {task.deadline ? task.deadline.substring(0, 16).replace('T', ' ') : ''}
                        {/* вывод по-человечески без лишней лабуды */}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}