import React, { useState } from 'react';
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
    MenuItem
} from '@mui/material';

export default function ProjectForm({ onSubmit }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_public: false
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.name === 'is_public' ? e.target.value === 'true' : e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            name: '',
            description: '',
            is_public: false
        });
        setOpen(false);
    };

    return (
        <>
            <Button variant="contained" onClick={() => setOpen(true)}>
                Создать проект
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Создание нового проекта</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Название"
                            type="text"
                            fullWidth
                            required
                            value={formData.name}
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
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Зона видимости</InputLabel>
                            <Select
                                name="is_public"
                                value={formData.is_public.toString()}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="false">Приватный</MenuItem>
                                <MenuItem value="true">Публичный</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Отмена</Button>
                        <Button type="submit" variant="contained">Создать</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
} 