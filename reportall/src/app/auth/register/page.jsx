'use client'

import { useForm } from '@/hooks/useForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/auth';
import 'tailwindcss';

const registerFormFields = {
  registerName: '',
  registerLastName: '',
  registerNIC: '',
  registerEmail: '',
  registerPassword: '',
  registerPassword2: '',
  registerRole: 'cliente'
}

function RegisterPage() {
  const router = useRouter();

  const {
    registerName,
    registerLastName,
    registerNIC,
    registerEmail,
    registerPassword,
    registerPassword2,
    registerRole,
    onInputChange: onRegisterInputChange
  } = useForm(registerFormFields);

  const registerSubmit = async (event) => {
    event.preventDefault();

    if (registerPassword !== registerPassword2) {
      window.alert('Contraseñas no son iguales');
      return;
    }

    const registered = await registerUser({
      email: registerEmail,
      password: registerPassword,
      role: registerRole,
      displayName: `${registerName} ${registerLastName}`.trim(),
      clientData: {
        FirstName: registerName,
        SecondName: '',
        FirstLastName: registerLastName,
        SecondLastName: '',
        Numero_NIC: registerNIC,
      },
      workerData: {
        Name_Leader: `${registerName} ${registerLastName}`.trim(),
      },
    });

    if (!registered.ok) {
      window.alert(registered.message || 'No se pudo registrar usuario');
      return;
    }

    window.alert('Cuenta creada correctamente. Ahora debes iniciar sesión.');
    router.push('/auth/login');
  }

  return (
    <div className='h-screen w-full flex items-center justify-center bg-gray-100'>
      <div className='w-full max-w-xl bg-white rounded-2xl shadow-xl'>
        <h2 className="text-3xl font-bold mb-6 mt-6 text-center">Registro</h2>

        <div className='w-48 m-auto mb-5'>
          <img src="/img/logoENACAL.png" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={registerSubmit}>
          <div className="flex gap-4 m-auto">
            <input
              type="text"
              placeholder="Primer nombre"
              name='registerName'
              value={registerName}
              onChange={onRegisterInputChange}
              className="p-3 border rounded-lg w-44"
              required
            />

            <input
              type="text"
              placeholder="Primer apellido"
              name='registerLastName'
              value={registerLastName}
              onChange={onRegisterInputChange}
              className="p-3 border rounded-lg w-44"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Numero NIC"
            name='registerNIC'
            value={registerNIC}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-90 m-auto"
            required={registerRole === 'cliente'}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            name='registerEmail'
            value={registerEmail}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-90 m-auto"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            name='registerPassword'
            value={registerPassword}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-90 m-auto"
            required
          />

          <input
            type="password"
            placeholder="Repita la contraseña"
            name='registerPassword2'
            value={registerPassword2}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-90 m-auto"
            required
          />

          <select
            name='registerRole'
            value={registerRole}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-90 m-auto"
          >
            <option value="cliente">Cliente</option>
            <option value="trabajador">Trabajador</option>
          </select>

          <button
            type="submit"
            className="w-90 m-auto bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Crear cuenta
          </button>

          <Link className='text-blue-700 m-auto mb-6' href="/auth/login">Volver a ingresar</Link>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage;
