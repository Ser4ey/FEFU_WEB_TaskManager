import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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

    return (
        <Card 
            sx={{ 
                minWidth: 275,
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: 6
                }
            }}
            onClick={() => navigate(`/projects/${project.id}`)}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5">{project.name}</Typography>
                    <Chip 
                        label={visibilityLabels[isPublic]} 
                        color={visibilityColors[isPublic]} 
                        size="small"
                        sx={chipStyle}
                    />
                </Box>
                <Typography color="text.secondary">
                    {project.description}
                </Typography>
            </CardContent>
        </Card>
    );
}