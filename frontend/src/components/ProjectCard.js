import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RoleBadge from './RoleBadge';

const visibilityLabels = {
    false: 'Приватный',
    true: 'Публичный'
};

const visibilityColors = {
    false: 'default',
    true: 'success'
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

export function ProjectCard({ project }) {
    const navigate = useNavigate();
    const isPublic = project.is_public || false;
    const userRole = project.current_user_role;

    return (
        <Card 
            sx={{ 
                width: 320,
                minHeight: 180,
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: 6
                }
            }}
            onClick={() => navigate(`/projects/${project.id}`)}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h5" sx={{ mb: 1, maxWidth: '70%' }}>
                        {project.name}
                    </Typography>
                    <RoleBadge role={userRole} />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip 
                        label={visibilityLabels[isPublic]} 
                        color={visibilityColors[isPublic]} 
                        size="small"
                        sx={{
                            ...chipStyle,
                            opacity: 0.8
                        }}
                    />
                </Box>
                
                <Typography color="text.secondary" sx={{ 
                    minHeight: 60,
                    maxHeight: 80,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {project.description}
                </Typography>
            </CardContent>
        </Card>
    );
}