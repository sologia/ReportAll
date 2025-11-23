'use client'
import { useForm } from '@/hooks/useForm';
import { useEffect } from 'react';
// import './login.css';
import 'tailwindcss';
// import { useAuthStore, useForm } from '../../hooks';
// import './login.css';
// import Swal from 'sweetalert2';

const loginFormFields = {
    loginEmail: '',
    loginPassword: ''
}

const registerFormFields = {
    registerName: '',
    registerLastName: '',
    registerNIC: '',
    registerEmail: '',
    registerPassword: '',
    registerPassword2: ''
}


function LoginPage() {

    // const { startLogin, errorMessage, startRegister } = useAuthStore();

    const { loginEmail, loginPassword, onInputChange: onLoginInputChange } = useForm( loginFormFields );
    const { registerName, registerLastName, registerNIC, registerEmail, registerPassword, registerPassword2, onInputChange:onRegisterInputChange  } = useForm( registerFormFields );

    const loginSubmit = ( event ) => {
        event.preventDefault();
        // console.log({ loginEmail, loginPassword });
        // startLogin({ email: loginEmail, password: loginPassword })
    }

    const registerSubmit = ( event ) => {
        
        event.preventDefault();
        // if( registerPassword !== registerPassword2 ){
        //     Swal.fire('Error en el registro', 'Contraseñas no son iguales', 'error')
        //     return;
        // }

        // // console.log({ registerName, registerEmail, registerPassword, registerPassword2 });
        // startRegister( { name: registerName, email: registerEmail, password: registerPassword })
    }




    //Para estar pendientes de los cambios del errorMessage(Del login)
    // useEffect(() => {
    //     if( errorMessage !== undefined ){
    //         Swal.fire('Error en la autenticacion', errorMessage, 'error')
    //     }
    // }, [errorMessage])








    //Para estar pendientes de los cambios del errorMessage(Del registro)
    // useEffect(() => {
    //     if( errorMessage !== undefined ){
    //         Swal.fire('Error en la autenticacion', errorMessage, 'error')
    //     }
    // }, [errorMessage])
    


    return (
        <>
        <div className='h-screen w-full flex items-center justify-center bg-gray-100'>
                <div className='w-full max-w-4xl bg-white rounded-2xl shadow-xl grid md:grid-cols-2 '>

                    {/* Login */}
                    <div className='bg-white border-r'>
                    {/* <div className='flex flex-col gap-4 border-r pr-6'> */}
                        <h2 className="text-3xl font-bold mb-6 mt-6 text-center">Iniciar Sesión</h2>

                        <div className='w-48 m-auto mb-5'>
                            <img src="/img/logoENACAL.png" />
                        </div>

                        <form className="flex flex-col gap-4" onSubmit={ loginSubmit }>
                            <input
                              type="email"
                              placeholder="Correo electrónico"
                              name='loginEmail'
                              value={ loginEmail }
                              onChange={ onLoginInputChange }
                              className="p-3 border rounded-lg w-90 m-auto"
                            />
                            <input
                              type="password"
                              placeholder="Contraseña"
                              name='loginPassword'
                              value={ loginPassword }
                              onChange={ onLoginInputChange }
                              className="p-3 border rounded-lg w-90 m-auto"
                            />
                            <button
                              type="submit"
                            //   value='Login'
                              className="w-90 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                            >
                              Entrar
                            </button>

                            <a className='text-blue-700 m-auto mt-3' href="#">¿Olvidaste tu contraseña?</a>

                        </form>
                </div>

                {/* register */}
                <div className='border-l'>
                {/* <div className='flex flex-col gap-4'> */}
                    <h2 className="text-3xl font-bold mb-6 mt-6 text-center">Registro</h2>

                    <div className='w-48 m-auto mb-5'>      
                        <img src="/img/logoENACAL.png" />
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={ registerSubmit }>

                        <div className="flex gap-9 m-auto">
                            <input
                              type="text"
                              placeholder="Primer nombre"
                              name='registerName'
                              value={ registerName }
                              onChange={ onRegisterInputChange }
                              className="p-3 border rounded-lg w-40"
                            />

                            <input
                              type="text"
                              placeholder="Primer apellido"
                              name='registerLastName'
                              value={ registerLastName }
                              onChange={ onRegisterInputChange }
                              className="p-3 border rounded-lg w-40"
                            />

                        </div>
                        

                        <input
                            type="text"
                            placeholder="Numero NIC"
                            name='registerNIC'
                            value={ registerNIC }
                            onChange={ onRegisterInputChange }
                            className="p-3 border rounded-lg w-90 m-auto"
                        />

                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            name='registerEmail'
                            value={ registerEmail }
                            onChange={ onRegisterInputChange }
                            className="p-3 border rounded-lg w-90 m-auto"
                        />

                        <input
                            type="password"
                            placeholder="Contraseña"
                            name='registerPassword'
                            value={ registerPassword }
                            onChange={ onRegisterInputChange }
                            className="p-3 border rounded-lg w-90 m-auto"
                        />

                        <input
                            type="password"
                            placeholder="Repita la contraseña"
                            name='registerPassword2'
                            value={ registerPassword2 }
                            onChange={ onRegisterInputChange }
                            className="p-3 border rounded-lg w-90 m-auto"
                        />

                        <button
                          type="submit"
                          className="w-90 m-auto bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                        >
                          Registrarme
                        </button>
                    </form>
                </div>
            </div>
        </div>
        
        {/* <div className="container login-container">
            <div className="row">
                <div className="col-md-6 login-form-1">
                    <h3>Ingreso</h3>
                    <form onSubmit={ loginSubmit }>
                        <div className="form-group mb-2">
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Correo"
                                name='loginEmail'
                                value={ loginEmail }
                                onChange={ onLoginInputChange }
                            />
                        </div>
                        <div className="form-group mb-2">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Contraseña"
                                name='loginPassword'
                                value={ loginPassword }
                                onChange={ onLoginInputChange }
                            />
                        </div>
                        <div className="d-grid gap-2">
                            <input 
                                type="submit"
                                className="btnSubmit"
                                value="Login" 
                            />
                        </div>
                    </form>
                </div>

                <div className="col-md-6 login-form-2">
                    <h3>Registro</h3>
                    <form onSubmit={ registerSubmit }>
                        <div className="form-group mb-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nombre"
                                name='registerName'
                                value={ registerName }
                                onChange={ onRegisterInputChange }
                            />
                        </div>
                        <div className="form-group mb-2">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Correo"
                                name='registerEmail'
                                value={ registerEmail }
                                onChange={ onRegisterInputChange }
                            />
                        </div>
                        <div className="form-group mb-2">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Contraseña" 
                                name='registerPassword'
                                value={ registerPassword }
                                onChange={ onRegisterInputChange }
                            />
                        </div>

                        <div className="form-group mb-2">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Repita la contraseña" 
                                name='registerPassword2'
                                value={ registerPassword2 }
                                onChange={ onRegisterInputChange }
                            />
                        </div>

                        <div className="d-grid gap-2">
                            <input 
                                type="submit" 
                                className="btnSubmit" 
                                value="Crear cuenta" />
                        </div>
                    </form>
                </div>
            </div>
        </div> */}
        </>
    )
}

export default LoginPage;