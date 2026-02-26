import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import type { FormEvent } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const { signInWithGoogle, loginWithEmail, registerWithEmail, user } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(t(err.message));
      } else {
        setError(t("An unexpected error occurred during Google sign in."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      navigate('/');
    } catch (err: unknown) {
       if (err instanceof Error) {
        // Firebase auth errors are a bit messy, let's try to make them cleaner
        let message = err.message;
        if (message.includes("auth/user-not-found")) message = "No account found with this email.";
        if (message.includes("auth/wrong-password")) message = "Incorrect password.";
        if (message.includes("auth/email-already-in-use")) message = "Email is already in use.";
        if (message.includes("auth/weak-password")) message = "Password should be at least 6 characters.";
        if (message.includes("auth/invalid-email")) message = "Invalid email address.";
        setError(t(message));
      } else {
        setError(t("An unexpected error occurred."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="font-bold text-xl text-white">P</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">{t('Standards and Means')}</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            {t('Manage your budget and workforce efficiently.')}
          </h2>
          <ul className="space-y-4 text-slate-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <span>{t('Track production and expenses in real-time')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <span>{t('Manage staff and medical data securely')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <span>{t('Generate comprehensive reports instantly')}</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          © {new Date().getFullYear()} Protocole. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 relative bg-white">
        <div className="absolute top-6 right-6">
          <LanguageSelector />
        </div>

        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? t('Welcome back') : t('Create an account')}
            </h1>
            <p className="text-slate-600">
              {isLogin 
                ? t('Enter your credentials to access your account') 
                : t('Fill in your details to get started')}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md text-sm animate-fade-in" role="alert">
              <span className="font-medium">{t('Error')}:</span> {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                {t('Email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-xs text-slate-900 placeholder:text-slate-400"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                {t('Password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-xs text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('Processing...')}
                </>
              ) : (
                <>
                  {isLogin ? t('Sign In') : t('Sign Up')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">{t('Or continue with')}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 cursor-pointer"
              >
                <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                {t('Google')}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? t("Don't have an account? ") : t('Already have an account? ')}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-blue-600 hover:text-blue-800 focus:outline-none hover:underline transition-colors cursor-pointer"
              >
                {isLogin ? t('Sign up') : t('Sign in')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
