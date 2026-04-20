'use client'

import { useForm } from '@/hooks/useForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/auth';
import Swal from 'sweetalert2';
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

    const normalizedName = registerName.trim();
    const normalizedLastName = registerLastName.trim();
    const normalizedNic = registerNIC.trim();
    const normalizedEmail = registerEmail.trim();

    if (!normalizedName) {
      await Swal.fire({
        icon: 'warning',
        title: 'Nombre requerido',
        text: 'Debes ingresar el primer nombre.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!normalizedLastName) {
      await Swal.fire({
        icon: 'warning',
        title: 'Apellido requerido',
        text: 'Debes ingresar el primer apellido.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!/^\d{6,10}$/.test(normalizedNic)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Número NIC inválido',
        text: 'El número NIC debe contener solo números y tener entre 6 y 10 dígitos.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!normalizedEmail) {
      await Swal.fire({
        icon: 'warning',
        title: 'Correo requerido',
        text: 'Debes ingresar el correo electrónico.',
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

    if (!registerPassword) {
      await Swal.fire({
        icon: 'warning',
        title: 'Contraseña requerida',
        text: 'Debes ingresar una contraseña.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (registerPassword.length < 6) {
      await Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!registerPassword2) {
      await Swal.fire({
        icon: 'warning',
        title: 'Confirmación requerida',
        text: 'Debes confirmar la contraseña.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (registerPassword !== registerPassword2) {
      await Swal.fire({
        icon: 'warning',
        title: 'Contraseñas diferentes',
        text: 'Las contraseñas no coinciden.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const registered = await registerUser({
      email: normalizedEmail,
      password: registerPassword,
      role: registerRole,
      displayName: `${normalizedName} ${normalizedLastName}`.trim(),
      clientData: {
        FirstName: normalizedName,
        SecondName: '',
        FirstLastName: normalizedLastName,
        SecondLastName: '',
        Numero_NIC: normalizedNic,
      },
      workerData: {
        Name_Leader: `${normalizedName} ${normalizedLastName}`.trim(),
      },
    });

    if (!registered.ok) {
      await Swal.fire({
        icon: 'error',
        title: 'Registro fallido',
        text: registered.message || 'No se pudo registrar usuario.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    await Swal.fire({
      icon: 'success',
      title: 'Registro completado',
      text: 'Cuenta creada correctamente. Ahora debes iniciar sesión.',
      confirmButtonText: 'Continuar',
    });
    router.push('/auth/login');
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-100 px-4 py-6'>
      <div className='w-full max-w-xl bg-white rounded-2xl shadow-xl'>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 mt-6 text-center">Registro</h2>

        <div className='w-48 m-auto mb-5'>
          <img src="/img/logoENACAL.png" alt="Logo ENACAL" className="w-full h-auto object-contain" />
        </div>

        <form className="flex flex-col gap-4 px-4 sm:px-8 pb-6" onSubmit={registerSubmit} noValidate>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <input
              type="text"
              placeholder="Primer nombre"
              name='registerName'
              value={registerName}
              onChange={onRegisterInputChange}
              className="p-3 border rounded-lg w-full"
              required
            />

            <input
              type="text"
              placeholder="Primer apellido"
              name='registerLastName'
              value={registerLastName}
              onChange={onRegisterInputChange}
              className="p-3 border rounded-lg w-full"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Numero NIC"
            name='registerNIC'
            value={registerNIC}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-full"
            inputMode="numeric"
            pattern="[0-9]{6,10}"
            minLength={6}
            maxLength={10}
            required={registerRole === 'cliente'}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            name='registerEmail'
            value={registerEmail}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-full"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            name='registerPassword'
            value={registerPassword}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-full"
            required
          />

          <input
            type="password"
            placeholder="Repita la contraseña"
            name='registerPassword2'
            value={registerPassword2}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-full"
            required
          />

          <select
            name='registerRole'
            value={registerRole}
            onChange={onRegisterInputChange}
            className="p-3 border rounded-lg w-full"
          >
            <option value="cliente">Cliente</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Crear cuenta
          </button>

          <Link className='text-blue-700 text-center mb-1' href="/auth/login">Volver a ingresar</Link>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage;
