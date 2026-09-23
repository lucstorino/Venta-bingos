import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Sparkles,
  Server,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { TuBingoLogo } from '../common/TuBingoLogo';

interface AdminLoginProps {
  onSuccess: () => void;
  onGoToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onGoToHome }) => {
  const { login } = useAdminAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(usernameOrEmail, password, remember);
      setIsLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'No fue posible iniciar sesión.');
      }
    }, 350);
  };

  const handleQuickFill = () => {
    setUsernameOrEmail('admin@tubingo.com');
    setPassword('admin');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden py-10 px-4 sm:px-6">
      {/* Subtle Background Glows matching Configurator */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <button
          type="button"
          onClick={onGoToHome}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Tienda Pública</span>
        </button>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>Servidor Privado</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto z-10 my-auto">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
          {/* Logo & Subtitle */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 mb-4 shadow-inner">
              <TuBingoLogo variant="dark" />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ruta Privada • Gestión Oficial</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Acceso a Configuración
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xs">
              Ingrese con sus credenciales autorizadas para administrar bingos, cartones, ventas y extractos.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Acceso denegado</p>
                <p className="text-[11px] text-rose-300/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User/Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Usuario o Correo Administrativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin@tubingo.com"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Contraseña de Seguridad
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Recordar sesión en este equipo</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-200 transform active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verificando credenciales...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>INGRESAR AL PANEL PRIVADO</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
                </>
              )}
            </button>
          </form>

          {/* Demo Helper Box */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 mb-2">
              ¿Desea ingresar rápidamente para probar la administración?
            </p>
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-700/60 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autocompletar: admin@tubingo.com / admin</span>
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Autenticación privada y sesión cifrada</span>
          </div>
          <p className="text-[10px] text-slate-600">
            TuBingo Oficial • Sistema de Lotería y Sorteos Digitales
          </p>
        </div>
      </div>

      {/* Bottom spacer for balance */}
      <div className="h-6" />
    </div>
  );
};
