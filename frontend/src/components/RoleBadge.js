import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { 
    AdminPanelSettings as AdminIcon, 
    Edit as EditorIcon, 
    Visibility as ViewerIcon,
    Person as CreatorIcon 
} from '@mui/icons-material';

// Конфигурация для разных типов ролей
const ROLE_CONFIG = {
    creator: {
        label: 'Создатель',
        color: '#ff5252',
        icon: <CreatorIcon fontSize="small" />,
        tooltip: 'Полный доступ к проекту и управлению правами'
    },
    admin: {
        label: 'Администратор',
        color: '#3f51b5',
        icon: <AdminIcon fontSize="small" />,
        tooltip: 'Может управлять проектом и правами доступа'
    },
    editor: {
        label: 'Редактор',
        color: '#4caf50',
        icon: <EditorIcon fontSize="small" />,
        tooltip: 'Может редактировать задачи'
    },
    viewer: {
        label: 'Читатель',
        color: '#ff9800',
        icon: <ViewerIcon fontSize="small" />,
        tooltip: 'Может только просматривать'
    }
};

/**
 * Компонент для отображения роли пользователя в виде бейджа
 * @param {string} role - Роль пользователя ('creator', 'admin', 'editor', 'viewer')
 * @param {object} sx - Дополнительные стили для компонента
 */
function RoleBadge({ role, sx = {} }) {
    // Если роль не указана или неизвестна, не отображаем бейдж
    if (!role || !ROLE_CONFIG[role]) {
        return null;
    }

    const config = ROLE_CONFIG[role];

    return (
        <Tooltip title={config.tooltip}>
            <Chip
                icon={config.icon}
                label={config.label}
                sx={{
                    backgroundColor: config.color,
                    color: 'white',
                    fontWeight: 500,
                    ...sx
                }}
                size="small"
            />
        </Tooltip>
    );
}

export default RoleBadge; 