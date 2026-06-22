'use client'
import { useForm } from '@/hooks/useForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth';
import { getDefaultRouteByRole, normalizeRole } from '@/lib/rbac';
import Swal from 'sweetalert2';

const loginFormFields = {
    loginEmail: '',
    loginPassword: ''
}

function LoginPage() {

    const router = useRouter();

    const { loginEmail, loginPassword, onInputChange: onLoginInputChange } = useForm(loginFormFields);

    const loginSubmit = async (event) => {
        event.preventDefault();

        const normalizedEmail = loginEmail.trim();

        if (!normalizedEmail || !loginPassword) {
            await Swal.fire({
                icon: 'warning',
                title: 'Datos incompletos',
                text: 'Debes ingresar correo electrónico y contraseña.',
                confirmButtonText: 'Aceptar',
            });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            await Swal.fire({
                icon: 'warning',
                title: 'Correo inválido',
                text: 'Ingresa un correo electrónico válido.',
                confirmButtonText: 'Aceptar',
            });
            return;
        }

        const session = await loginUser({ email: normalizedEmail, password: loginPassword });

        if (!session) {
            await Swal.fire({
                icon: 'error',
                title: 'Inicio de sesión fallido',
                text: 'Credenciales inválidas.',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        const role = normalizeRole(session.role);
        await Swal.fire({
            icon: 'success',
            title: 'Bienvenido',
            text: 'Inicio de sesión correcto.',
            timer: 1400,
            showConfirmButton: false,
        });
        router.push(getDefaultRouteByRole(role));
    }

    return (
        <main className='min-h-screen w-full app-shell px-4 py-8 sm:py-14 flex items-center justify-center'>
            <section className='w-full max-w-5xl grid gap-8 lg:grid-cols-[1.2fr_1fr]'>
                <article className='hidden lg:flex rounded-3xl p-10 text-white bg-linear-to-br from-sky-700 via-cyan-700 to-blue-900 shadow-(--sombra2) flex-col justify-between'>
                    <div>
                        <p className='text-xs tracking-[0.22em] uppercase text-cyan-100'>ReportALL</p>
                        <h1 className='mt-4 text-4xl leading-tight font-bold pb-3'>Controla reportes y seguimiento operativo en un solo lugar</h1>
                        <p className='mt-4 text-cyan-100'>Accede a tu panel para registrar incidencias, administrar cuadrillas y consultar avances en tiempo real.</p>
                    </div>
                    {/* <div className='rounded-2xl bg-white/12 border border-white/20 p-4'>
                        <p className='text-sm text-cyan-100'>Plataforma enfocada en simplicidad para usuarios tecnicos y no tecnicos.</p>
                    </div> */}
                </article>

                <article className='glass-card rounded-3xl p-6 sm:p-8 md:p-10'>
                    <header className='text-center'>
                        <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>ReportALL</p>
                        <div className='w-32 sm:w-40 mx-auto mb-4'>
                            <img src="/img/logoENACAL.png" alt='Logo ENACAL' className='w-full h-auto object-contain' />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold">Iniciar Sesion</h2>
                        <p className='mt-2 text-sm sm:text-base text-slate-600'>Ingresa con tus credenciales para continuar</p>
                    </header>

                    <form className="mt-8 flex flex-col gap-5" onSubmit={loginSubmit} noValidate>
                        <div className='space-y-2'>
                            <label htmlFor='loginEmail' className='field-label'>Correo electronico</label>
                            <input
                                id='loginEmail'
                                type="email"
                                placeholder="usuario@correo.com"
                                name='loginEmail'
                                value={loginEmail}
                                onChange={onLoginInputChange}
                                className="field-control"
                                autoComplete='email'
                            />
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor='loginPassword' className='field-label'>Contrasena</label>
                            <input
                                id='loginPassword'
                                type="password"
                                placeholder="Tu contrasena"
                                name='loginPassword'
                                value={loginPassword}
                                onChange={onLoginInputChange}
                                className="field-control"
                                autoComplete='current-password'
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full mt-1"
                        >
                            Iniciar sesion
                        </button>

                        <p className='text-center text-sm text-slate-600'>
                            ¿No tienes cuenta?{' '}
                            <Link className='text-sky-700 font-semibold hover:text-sky-800 underline underline-offset-4' href="/auth/register">Crear cuenta</Link>
                        </p>
                    </form>
                </article>
            </section>
        </main>
    )
}

export default LoginPage;