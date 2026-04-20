'use client'
import { useForm } from '@/hooks/useForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth';
import { getDefaultRouteByRole, normalizeRole } from '@/lib/rbac';
import Swal from 'sweetalert2';
import 'tailwindcss';

const loginFormFields = {
    loginEmail: '',
    loginPassword: '',
    loginRole: 'cliente'
}

function LoginPage() {

    const router = useRouter();

    const { loginEmail, loginPassword, loginRole, onInputChange: onLoginInputChange } = useForm(loginFormFields);

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

        const session = await loginUser({ email: normalizedEmail, password: loginPassword, role: loginRole });

        if (!session) {
            await Swal.fire({
                icon: 'error',
                title: 'Inicio de sesión fallido',
                text: 'Credenciales inválidas o rol incorrecto.',
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
        <>
            <div className='min-h-screen w-full flex items-center justify-center bg-gray-100 px-4 py-6'>
                <div className='w-full max-w-xl bg-white rounded-2xl shadow-xl'>

                    <div className='bg-white'>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 mt-6 text-center">Iniciar Sesión</h2>

                        <div className='w-48 m-auto mb-5'>
                            <img src="/img/logoENACAL.png" alt="Logo ENACAL" className="w-full h-auto object-contain" />
                        </div>

                        <form className="flex flex-col gap-4 px-4 sm:px-8 pb-6" onSubmit={loginSubmit} noValidate>
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                name='loginEmail'
                                value={loginEmail}
                                onChange={onLoginInputChange}
                                className="p-3 border rounded-lg w-full"
                            />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                name='loginPassword'
                                value={loginPassword}
                                onChange={onLoginInputChange}
                                className="p-3 border rounded-lg w-full"
                            />
                            <select
                                name='loginRole'
                                value={loginRole}
                                onChange={onLoginInputChange}
                                className="p-3 border rounded-lg w-full"
                            >
                                <option value="cliente">Cliente</option>
                                <option value="administrador">Administrador</option>
                                <option value="director_it">Director IT</option>
                                <option value="cuadrilla">Cuadrilla</option>
                                <option value="lider_cuadrilla">Líder de cuadrilla</option>
                            </select>
                            <button
                                type="submit"
                                className="w-full mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                            >
                                Entrar
                            </button>

                            <Link className='text-blue-700 text-center mt-3' href="/auth/register">Crear cuenta</Link>

                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage;