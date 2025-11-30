import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <header className="bg-[#F97415] text-white shadow-md dark:bg-[#F97415]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Restaurant Tablet</h1>
            {user && (
              <p className="text-sm text-white/90 mt-1">
                {user.name} ({user.email})
              </p>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={cn(
                  'p-2 rounded-md bg-white/20 hover:bg-white/30 transition-colors',
                  'flex items-center justify-center'
                )}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleLogout}
                className={cn(
                  'px-4 py-2 bg-white text-[#F97415] rounded-md font-medium',
                  'hover:bg-gray-100 transition-colors dark:bg-white/20 dark:text-white dark:hover:bg-white/30'
                )}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

