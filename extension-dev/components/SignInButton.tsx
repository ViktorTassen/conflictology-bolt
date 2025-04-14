import { LoaderPinwheel, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function SignInButton() {
  const { user, isLoading, signIn, error } = useAuth();

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    signIn().catch(err => {
      console.error('Sign in error:', err);
    });
  };

  // Only show the sign-in button if the user is not signed in
  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className={`
          w-full mt-3 bg-[#111111]/80 
          ${!isLoading ? 'hover:bg-[#151515]' : ''} 
          text-white rounded-md p-4 flex items-center justify-between group 
          transition-all duration-200 shadow-lg relative overflow-hidden border border-zinc-800/40
        `}
        style={{ position: 'relative', zIndex: 50 }}
      >
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-blue-600/20 group-hover:opacity-100 opacity-70"></div>
        <div className="absolute inset-y-0 left-0 w-1 bg-blue-600"></div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-900/10 flex items-center justify-center group-hover:bg-blue-900/20 transition-colors">
            {isLoading ? (
              <LoaderPinwheel className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
          </div>
          <div className="text-left">
            <div className="font-semibold text-base text-zinc-100">
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </div>
            <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
              Required to create or join games
            </div>
          </div>
        </div>
        <div className="w-6 h-6 text-zinc-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          ›
        </div>
      </button>
    );
  }
  
  // Don't render anything if user is already signed in
  return null;
}