'use client'
import { useForm } from '@/hooks/useForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth';
import 'tailwindcss';

const loginFormFields = {
    loginEmail: '',
    loginPassword: '',
    loginRole: 'trabajador'
}

function LoginPage() {

    const router = useRouter();

    const { loginEmail, loginPassword, loginRole, onInputChange: onLoginInputChange } = useForm(loginFormFields);

    const loginSubmit = (event) => {
        event.preventDefault();
        const session = loginUser({ email: loginEmail, password: loginPassword, role: loginRole });

        if (!session) {
            window.alert('Credenciales inválidas o rol incorrecto');
            return;
        }

        if (session.role === 'trabajador') {
            router.push('/dashboard/enacal');
            return;
        }

        router.push('/dashboard/clientes');
    }

    return (
        <>
            <div className='h-screen w-full flex items-center justify-center bg-gray-100'>
                <div className='w-full max-w-xl bg-white rounded-2xl shadow-xl'>

                    <div className='bg-white'>
                        <h2 className="text-3xl font-bold mb-6 mt-6 text-center">Iniciar Sesión</h2>

                        <div className='w-48 m-auto mb-5'>
                            <img src="/img/logoENACAL.png" />
                        </div>

                        <form className="flex flex-col gap-4" onSubmit={loginSubmit}>
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                name='loginEmail'
                                value={loginEmail}
                                onChange={onLoginInputChange}
                                className="p-3 border rounded-lg w-90 m-auto"
                            />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                name='loginPassword'
                                value={loginPassword}
                                onChange={onLoginInputChange}
                                className="p-3 border rounded-lg w-90 m-auto"
                            />
                            <select
                                name='loginRole'
                                value={loginRole}
                                onChange={onLoginInputChange}
                                className="p-3 border rounded-lg w-90 m-auto"
                            >
                                <option value="trabajador">Trabajador</option>
                                <option value="cliente">Cliente</option>
                            </select>
                            <button
                                type="submit"
                                className="w-90 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                            >
                                Entrar
                            </button>

                            <Link className='text-blue-700 m-auto mt-3' href="/auth/register">Crear cuenta</Link>

                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage;