import React, { useState } from 'react';
import { X, User, Mail, MapPin, Shield, CheckCircle2 } from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { AVAILABLE_ZONES } from '../../data/mockData';
import { getTranslatedZone, getTranslatedRole } from '../../data/translations';
import type { UserRole } from '../../types';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, currentUser, updateUserProfile, t, logoutUser } = useEco();

  const [name, setName] = useState(currentUser.isLoggedIn ? currentUser.name : '');
  const [email, setEmail] = useState(currentUser.isLoggedIn ? currentUser.email : '');
  const [zone, setZone] = useState(currentUser.zone || AVAILABLE_ZONES[1]);
  const [role, setRole] = useState<UserRole>(currentUser.role || 'Resident');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!loginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateUserProfile({
      name: name.trim(),
      email: email.trim() || 'user@ecosense.org',
      zone,
      role,
      isLoggedIn: true
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setLoginModalOpen(false);
    }, 900);
  };

  const handleLogout = () => {
    logoutUser();
    setName('');
    setEmail('');
    setLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Top Decorative Header */}
        <div className="bg-[#0F2E23] text-white p-6 relative">
          <button
            onClick={() => setLoginModalOpen(false)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center font-black">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-extrabold text-white">{t.loginModalTitle}</h3>
          </div>
          <p className="text-xs text-emerald-100/70">
            {t.loginModalDesc}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {savedSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-gray-900">{t.loginWelcomeUser}, {name}!</h4>
              <p className="text-gray-500">{t.loginProfileUpdated}</p>
            </div>
          ) : (
            <>
              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#10B981]" />
                  {t.loginNameLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.loginNamePlaceholder}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#10B981] outline-none transition-all"
                />
              </div>

              {/* Email / Phone */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#10B981]" />
                  {t.loginEmailLabel}
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.loginEmailPlaceholder}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#10B981] outline-none transition-all"
                />
              </div>

              {/* Zone Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                  {t.loginZoneLabel}
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-[#10B981] outline-none transition-all cursor-pointer"
                >
                  {AVAILABLE_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {getTranslatedZone(z, t)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Toggle */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                  {t.loginRoleLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Resident', 'Coordinator', 'Administrator'] as UserRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-2 rounded-xl text-center font-bold transition-all cursor-pointer ${
                        role === r
                          ? 'bg-[#0F2E23] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getTranslatedRole(r, t)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black rounded-xl shadow-lg transition-all cursor-pointer text-sm"
                >
                  {t.loginSubmitBtn}
                </button>

                {currentUser.isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-rose-600 font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    {t.loginLogoutBtn}
                  </button>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
