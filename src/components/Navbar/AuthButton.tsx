import { useState } from 'react';
import { MdLogin, MdLogout } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setAuth, clearAuth } from '../../redux/slices/authSlice';
import { requestAccessToken, revokeToken } from '../../utils/youtubeAuth';

export default function AuthButton() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const isSignedIn = !!auth.accessToken && !!auth.expiresAt && Date.now() < auth.expiresAt;

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { token, expiresAt } = await requestAccessToken();
      dispatch(setAuth({ token, expiresAt }));
    } catch (err) {
      console.error('[AuthButton] sign-in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    if (auth.accessToken) revokeToken(auth.accessToken);
    dispatch(clearAuth());
  };

  if (isSignedIn) {
    return (
      <button
        type="button"
        aria-label="sign out from YouTube"
        onClick={handleSignOut}
        className="flex items-center gap-1 my-auto ml-2 px-2 py-1 rounded-md text-xs font-open text-textColor border border-textColor/30 hover:border-secondary hover:text-secondary active:scale-105 transition-colors"
      >
        <MdLogout size={16} />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="sign in with YouTube"
      onClick={handleSignIn}
      disabled={loading}
      className="flex items-center gap-1 my-auto ml-2 px-2 py-1 rounded-md text-xs font-open text-textColor border border-textColor/30 hover:border-secondary hover:text-secondary active:scale-105 transition-colors disabled:opacity-50"
    >
      <MdLogin size={16} />
      <span className="hidden sm:inline">{loading ? 'Signing in…' : 'Sign in'}</span>
    </button>
  );
}
