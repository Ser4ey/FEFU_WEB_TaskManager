import { Snackbar } from '@mui/material';

export default function Dashboard() {
    const [deadlineWarning, setDeadlineWarning] = useState(null);

    useEffect(() => {
        const checkDeadlines = () => {
            const now = new Date();
            const upcoming = tasks.find(t => new Date(t.deadline) < new Date(now.getTime() + 24 * 60 * 60 * 1000));
            if (upcoming) {
                setDeadlineWarning(`Задача "${upcoming.title}" истекает через 24 часа`);
            }
        };
        const interval = setInterval(checkDeadlines, 3600000); // Проверять каждые 60 минут
        return () => clearInterval(interval);
    }, [tasks]);

    return (
        <>
            {/* ... */}
            <Snackbar
                open={!!deadlineWarning}
                message={deadlineWarning}
                autoHideDuration={6000}
                onClose={() => setDeadlineWarning(null)}
            />
        </>
    );
}