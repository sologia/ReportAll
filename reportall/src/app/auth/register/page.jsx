'use client'

import { useForm } from '@/hooks/useForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/auth';
import Swal from 'sweetalert2';

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
    <main className='min-h-screen w-full app-shell px-4 py-8 sm:py-14 flex items-center justify-center'>
      <section className='glass-card w-full max-w-3xl rounded-3xl p-6 sm:p-8 md:p-10'>
        <header className='text-center'>
          <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>ReportALL</p>
          <div className='w-32 sm:w-40 mx-auto mb-4'>
            <img src="/img/logoENACAL.png" alt='Logo ENACAL' className='w-full h-auto object-contain' />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Crear cuenta</h1>
          <p className='mt-2 text-sm sm:text-base text-slate-600'>Completa el formulario para registrarte en ReportALL</p>
        </header>

        <form className="mt-8 flex flex-col gap-5" onSubmit={registerSubmit} noValidate>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label htmlFor='registerName' className='field-label'>Primer nombre</label>
              <input
                id='registerName'
                type="text"
                placeholder="Ejemplo: Maria"
                name='registerName'
                value={registerName}
                onChange={onRegisterInputChange}
                className="field-control"
                required
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='registerLastName' className='field-label'>Primer apellido</label>
              <input
                id='registerLastName'
                type="text"
                placeholder="Ejemplo: Gonzalez"
                name='registerLastName'
                value={registerLastName}
                onChange={onRegisterInputChange}
                className="field-control"
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label htmlFor='registerNIC' className='field-label'>Numero NIC</label>
            <input
              id='registerNIC'
              type="text"
              placeholder="Solo numeros (6 a 10 digitos)"
              name='registerNIC'
              value={registerNIC}
              onChange={onRegisterInputChange}
              className="field-control"
              inputMode="numeric"
              pattern="[0-9]{6,10}"
              minLength={6}
              maxLength={10}
              required={registerRole === 'cliente'}
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='registerEmail' className='field-label'>Correo electronico</label>
            <input
              id='registerEmail'
              type="email"
              placeholder="usuario@correo.com"
              name='registerEmail'
              value={registerEmail}
              onChange={onRegisterInputChange}
              className="field-control"
              autoComplete='email'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label htmlFor='registerPassword' className='field-label'>Contrasena</label>
              <input
                id='registerPassword'
                type="password"
                placeholder="Minimo 6 caracteres"
                name='registerPassword'
                value={registerPassword}
                onChange={onRegisterInputChange}
                className="field-control"
                autoComplete='new-password'
                required
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='registerPassword2' className='field-label'>Confirmar contrasena</label>
              <input
                id='registerPassword2'
                type="password"
                placeholder="Repite la contrasena"
                name='registerPassword2'
                value={registerPassword2}
                onChange={onRegisterInputChange}
                className="field-control"
                autoComplete='new-password'
                required
              />
            </div>
          </div>

          {/* <div className='space-y-2'>
            <label htmlFor='registerRole' className='field-label'>Tipo de cuenta</label>
            <select
              id='registerRole'
              name='registerRole'
              value={registerRole}
              onChange={onRegisterInputChange}
              className="field-control"
            >
              <option value="cliente">Cliente</option>
            </select>
          </div> */}

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Crear cuenta
          </button>

          <p className='text-center text-sm text-slate-600'>
            ¿Ya tienes cuenta?{' '}
            <Link className='text-sky-700 font-semibold hover:text-sky-800 underline underline-offset-4' href="/auth/login">Volver a ingresar</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default RegisterPage;
