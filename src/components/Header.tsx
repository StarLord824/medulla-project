import { Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-white/20 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent tracking-tight">
            ImageLab
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
            Features
          </button>
          <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
            Docs
          </button>
          <button className="p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}