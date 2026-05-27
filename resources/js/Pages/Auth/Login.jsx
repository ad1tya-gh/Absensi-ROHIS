import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary via-[#061324] to-secondary/95 flex items-center justify-center p-4 md:p-6">
            <Head title="Masuk Aplikasi" />

            <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col items-center">
                {/* Logo & Brand Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mb-4">
                        <img src="/images/logo-rohis.png" alt="Logo ROHIS" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">ABSENSI ROHIS 7</h2>
                    <p className="text-sm text-gray-400 mt-1">SMK TI Bali Global Badung</p>
                </div>

                {status && (
                    <div className="mb-6 w-full p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-sm font-semibold text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="w-full space-y-5">
                    {/* Email Input */}
                    <div>
                        <InputLabel htmlFor="email" value="Email Pengguna" className="text-gray-300 font-semibold" />

                        <div className="mt-1 relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </span>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="pl-11 block w-full rounded-2xl border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-primary focus:ring-primary shadow-inner text-sm transition-all py-3"
                                autoComplete="username"
                                placeholder="nama@rohis.id"
                                required
                                onChange={handleOnChange}
                            />
                        </div>

                        <InputError message={errors.email} className="mt-2 text-red-400 text-xs" />
                    </div>

                    {/* Password Input */}
                    <div>
                        <InputLabel htmlFor="password" value="Kata Sandi" className="text-gray-300 font-semibold" />

                        <div className="mt-1 relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="pl-11 block w-full rounded-2xl border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-primary focus:ring-primary shadow-inner text-sm transition-all py-3"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                required
                                onChange={handleOnChange}
                            />
                        </div>

                        <InputError message={errors.password} className="mt-2 text-red-400 text-xs" />
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer select-none">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={handleOnChange}
                                className="rounded bg-white/5 border-white/10 text-primary focus:ring-primary cursor-pointer w-4.5 h-4.5"
                            />
                            <span className="ml-2 text-xs font-medium text-gray-400 hover:text-gray-300">Ingat saya di perangkat ini</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 px-4 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white rounded-2xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-primary/20 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Sedang Masuk...' : 'Masuk Sekarang'}
                    </button>
                </form>
            </div>
        </div>
    );
}
