import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function UserStatus() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }
  
  return (
    <div className="mt-4 flex items-center justify-between text-zinc-400 text-xs p-3">
      <div className="flex items-center gap-2">
        {/* <div className="flex items-center justify-center bg-green-900/20 text-green-500 rounded-full p-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div> */}
        <span>Signed in as {user.email || user.displayName}</span>
      </div>
      <button 
        onClick={signOut}
        className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors"
        title="Sign out"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}