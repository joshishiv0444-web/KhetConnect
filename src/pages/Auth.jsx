import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, User, Phone, MapPin, Calendar, CreditCard, Sprout, Briefcase, LocateFixed, Loader2 } from "lucide-react";

const BIGDATA_KEY = 'bdc_8085115997c242ea92a95c7b8ed133e6';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "", password: "", confirmPassword: "",
    phone: "", location: "", age: "", aadhar: "",
    dob: "", occupation: "", role: "farmer",
  });

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // ── Auto-detect location using browser GPS + BigDataCloud reverse geocoding ──
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;
          const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en&key=${BIGDATA_KEY}`;
          const res  = await fetch(url);
          const data = await res.json();
          // Build a readable address: locality + city + state
          const parts = [
            data.locality,
            data.city,
            data.principalSubdivision,
            data.countryName,
          ].filter(Boolean);
          const address = parts.join(', ');
          setFormData(prev => ({ ...prev, location: address }));
        } catch {
          setGeoError('Could not fetch address. Please type it manually.');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoError(err.code === 1
          ? 'Location access denied. Please allow location in your browser.'
          : 'Unable to retrieve your location.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      if (isLogin) {
        // LOGIN — pass name, password, and role
        await login(formData.name, formData.password, formData.role);
      } else {
        // SIGNUP
        if (formData.password !== formData.confirmPassword)
          throw new Error("Passwords do not match");
        if (!formData.dob)
          throw new Error("Date of birth is required");

        await signup({
          name:       formData.name,
          phone:      formData.phone,
          location:   formData.location,
          age:        formData.age,
          dob:        formData.dob,
          aadhar:     formData.aadhar,
          occupation: formData.occupation,
          password:   formData.password,
          role:       formData.role,
        });
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-[#ffe8b6] focus:bg-white/15 outline-none transition backdrop-blur-sm text-sm";
  const iconCls  = "absolute left-4 top-3.5 text-white/40";

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a3d2b 0%, #2d6145 28%, #4a7c59 52%, #3b5e2d 72%, #5c3a21 100%)' }}
    >
      {/* BG glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#d4a373]/10 blur-3xl pointer-events-none" />

      {/* Crop icon strip */}
      <div className="absolute top-8 left-0 right-0 flex justify-center gap-8 text-white/10 text-4xl pointer-events-none select-none overflow-hidden">
        {['🌾','🌿','🍃','🌱','🌾','🌿','🍃','🌱','🌾','🌿'].map((e, i) => (
          <span key={i} className="hidden sm:inline">{e}</span>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* ── LEFT PANEL ── */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start px-8 sm:px-16 lg:px-24 py-16 text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-[#ffe8b6]/20 border border-[#ffe8b6]/30 flex items-center justify-center shadow-lg">
              <Sprout size={28} className="text-[#ffe8b6]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">KhetConnect</h1>
              <p className="text-white/50 text-sm">India's Farmer Marketplace</p>
            </div>
          </div>

          <h2 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 drop-shadow-xl">
            खेत से<br /><span className="text-[#ffe8b6] italic">घर तक।</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md">
            Join thousands of farmers and buyers across India. Direct trade, fair prices, zero middlemen.
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {[
              { e: '🌾', t: 'Direct Trade' }, { e: '🚜', t: 'F2F Market' },
              { e: '📊', t: 'Smart Pricing' }, { e: '🛡️', t: 'Secure Deals' },
            ].map(({ e, t }) => (
              <div key={t} className="flex items-center gap-3 bg-white/8 border border-white/15 backdrop-blur-sm px-4 py-3 rounded-2xl">
                <span className="text-xl">{e}</span>
                <span className="text-sm font-semibold text-white/80">{t}</span>
              </div>
            ))}
          </div>
          <p className="mt-14 text-white/20 text-xs italic hidden lg:block">
            "उत्तम खेती, मध्यम बान, अधम चाकरी, भीख निदान।"
          </p>
        </div>

        {/* ── RIGHT PANEL (Form) ── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:py-0">
          <div className="w-full max-w-md bg-white/10 border border-white/15 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">

            {/* Login / Signup tabs */}
            <div className="flex gap-1 p-1 bg-white/10 rounded-2xl mb-6 border border-white/10">
              {['Login', 'Sign Up'].map((label, i) => {
                const active = isLogin ? i === 0 : i === 1;
                return (
                  <button key={label} type="button"
                    onClick={() => { setIsLogin(i === 0); setError(''); }}
                    className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm ${active ? 'bg-[#ffe8b6] text-[#5c3a21] shadow-md' : 'text-white/60 hover:text-white'}`}
                  >{label}</button>
                );
              })}
            </div>

            {/* Role selector — always visible */}
            <div className="flex gap-2 p-1 bg-white/10 rounded-xl border border-white/10 mb-5">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'farmer' })}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.role === 'farmer' ? 'bg-[#4a7c59] text-white shadow-md' : 'text-white/50 hover:text-white'}`}>
                🧑‍🌾 Farmer
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'buyer' })}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.role === 'buyer' ? 'bg-[#5c3a21] text-white shadow-md' : 'text-white/50 hover:text-white'}`}>
                🛒 Buyer
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {isLogin ? 'Welcome back 👋' : 'Create account'}
            </h3>
            <p className="text-white/50 text-xs mb-5">
              {isLogin
                ? `Log in as a ${formData.role}`
                : `Register as a ${formData.role}`}
            </p>

            {error && (
              <div className="bg-red-500/20 text-red-200 p-3 rounded-xl mb-4 text-sm border border-red-400/30">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Name — used as login ID too */}
              <div className="relative">
                <User className={iconCls} size={18} />
                <input type="text" name="name" placeholder="Full Name"
                  value={formData.name} onChange={handleChange} required className={inputCls} />
              </div>

              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Phone className={iconCls} size={18} />
                      <input type="tel" name="phone" placeholder="Mobile No." value={formData.phone} onChange={handleChange} required className={inputCls} />
                    </div>
                    {/* Location field with GPS detect button */}
                    <div className="col-span-2">
                      <div className="flex gap-2 items-start">
                        <div className="relative flex-1">
                          <MapPin className={iconCls} size={18} />
                          <input
                            type="text"
                            name="location"
                            placeholder="Your Address / Village / City"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className={inputCls}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={detectLocation}
                          disabled={geoLoading}
                          title="Auto-detect my location"
                          className="flex-shrink-0 h-[46px] px-3 bg-[#ffe8b6]/20 border border-[#ffe8b6]/30 text-[#ffe8b6] rounded-xl hover:bg-[#ffe8b6]/30 transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap backdrop-blur-sm"
                        >
                          {geoLoading
                            ? <Loader2 size={16} className="animate-spin" />
                            : <LocateFixed size={16} />}
                          {geoLoading ? 'Detecting...' : 'Detect'}
                        </button>
                      </div>
                      {geoError && (
                        <p className="text-red-300 text-xs mt-1.5 flex items-center gap-1">
                          ⚠️ {geoError}
                        </p>
                      )}
                      {formData.location && !geoLoading && (
                        <p className="text-[#ffe8b6]/70 text-xs mt-1.5 flex items-center gap-1">
                          📍 {formData.location}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <Calendar className={iconCls} size={18} />
                      <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className={inputCls} />
                    </div>
                    <div className="relative">
                      <Calendar className={iconCls} size={18} />
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} required
                        className={inputCls + " appearance-none"} title="Date of Birth" />
                    </div>
                    {formData.role === 'farmer' ? (
                      <div className="relative col-span-2">
                        <CreditCard className={iconCls} size={18} />
                        <input type="number" name="aadhar" placeholder="Aadhar Number" value={formData.aadhar} onChange={handleChange} required className={inputCls} />
                      </div>
                    ) : (
                      <div className="relative col-span-2">
                        <Briefcase className={iconCls} size={18} />
                        <input type="text" name="occupation" placeholder="Occupation (e.g. Trader, Retailer)" value={formData.occupation} onChange={handleChange} required className={inputCls} />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="relative">
                <Lock className={iconCls} size={18} />
                <input type="password" name="password" placeholder="Password"
                  value={formData.password} onChange={handleChange} required className={inputCls} />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className={iconCls} size={18} />
                  <input type="password" name="confirmPassword" placeholder="Confirm Password"
                    value={formData.confirmPassword} onChange={handleChange} required className={inputCls} />
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full bg-[#ffe8b6] hover:bg-[#ffd980] text-[#5c3a21] py-4 rounded-xl font-extrabold shadow-xl transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none text-base mt-2">
                {isLoading
                  ? 'Please wait...'
                  : isLogin
                    ? `🌾 Login as ${formData.role === 'farmer' ? 'Farmer' : 'Buyer'}`
                    : `🌱 Create ${formData.role === 'farmer' ? 'Farmer' : 'Buyer'} Account`}
              </button>
            </form>

            <p className="mt-5 text-center text-white/50 text-sm">
              {isLogin ? 'New to KhetConnect?' : 'Already have an account?'}
              <button className="text-[#ffe8b6] font-bold ml-2 hover:underline"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                {isLogin ? 'Sign up free' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};