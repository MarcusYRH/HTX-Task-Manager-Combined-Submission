import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskListPage } from './pages/TaskListPage';
import { TaskCreationPage } from './pages/TaskCreationPage';
import { TaskProvider } from './context/TaskContext';

function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {import.meta.env.VITE_APP_NAME || 'Task Assignment'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and assign tasks to developers
                </p>
              </div>
            </header>

            {/* Main Content */}
            <main>
              <Routes>
                <Route path="/" element={<TaskListPage />} />
                <Route path="/create" element={<TaskCreationPage />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <p className="text-center text-sm text-gray-500">
                  Task Assignment Application - Built with React and Node.js
                </p>
              </div>
            </footer>
          </div>
        </TaskProvider>
    </BrowserRouter>
  );
}

export default App;
