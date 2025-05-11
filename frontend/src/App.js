import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectDetail from './pages/ProjectDetail';
import TaskDetail from './pages/TaskDetail';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/tasks/:id" element={
                    <ProtectedRoute>
                        <TaskDetail />
                    </ProtectedRoute>
                } />
                <Route path="/projects/:id" element={
                    <ProtectedRoute>
                        <ProjectDetail />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;