import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-4 px-6 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-t border-white/20 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-sm text-slate-600 dark:text-slate-400">
          © 2025 ImageLab — All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}