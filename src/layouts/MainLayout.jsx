import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
            <Navbar />

            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
                <Outlet />
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] mt-auto transition-colors duration-300">
                <div className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 dark:text-gray-500">
                    <p>© {new Date().getFullYear()} Hotel Room Monitor. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 md:mt-0 font-medium">
                        <a href="#" className="hover:text-primary transition-colors">System Status: Online</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
