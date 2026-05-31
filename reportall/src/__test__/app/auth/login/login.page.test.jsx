import '@testing-library/jest-dom';
import LoginPage from '@/app/auth/login/page.jsx';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

const pushMock = jest.fn();

jest.mock('sweetalert2', () => ({
    __esModule: true,
    default: {
        fire: jest.fn().mockResolvedValue({}),
    },
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));


describe('LoginPage()', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
        localStorage.clear();
    });

    const setup = () => {
        render(<LoginPage />);
    }

    it('renderiza el formulario de inicio de sesión', () => {
        setup();
        expect(screen.getByPlaceholderText("Correo electrónico")).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('actualiza email y password al escribir en el formulario', () => {
        setup();

        const emailInput = screen.getByPlaceholderText('Correo electrónico');
        const passwordInput = screen.getByPlaceholderText('Contraseña');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password');
    });

    it('muestra advertencia si faltan credenciales', async () => {
        setup();

        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith({
                icon: 'warning',
                title: 'Datos incompletos',
                text: 'Debes ingresar correo electrónico y contraseña.',
                confirmButtonText: 'Aceptar',
            });
        });
        expect(fetch).not.toHaveBeenCalled();
    });

    it('muestra advertencia si el correo tiene formato inválido', async () => {
        setup();

        fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'user.test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith({
                icon: 'warning',
                title: 'Correo inválido',
                text: 'Ingresa un correo electrónico válido.',
                confirmButtonText: 'Aceptar',
            });
        });
        expect(fetch).not.toHaveBeenCalled();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it('muestra error cuando las credenciales no son válidas', async () => {
        fetch.mockResolvedValueOnce({ ok: false });
        setup();

        fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'user@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith({
                icon: 'error',
                title: 'Inicio de sesión fallido',
                text: 'Credenciales inválidas.',
                confirmButtonText: 'Entendido',
            });
        });
        expect(pushMock).not.toHaveBeenCalled();
    });

    it.each([
        ['cliente', '/dashboard/clientes'],
        ['administrador', '/dashboard/enacal'],
        ['director_it', '/dashboard/enacal/reports/summary'],
        ['cuadrilla', '/dashboard/enacal/crew/reports'],
        ['lider_cuadrilla', '/dashboard/enacal/assignments'],
    ])('inicia sesión y redirecciona según rol %s', async (role, expectedRoute) => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: { role } }),
        });
        setup();

        fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'user@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });

        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: 'user@test.com', password: '123456' }),
            });
            expect(Swal.fire).toHaveBeenCalledWith({
                icon: 'success',
                title: 'Bienvenido',
                text: 'Inicio de sesión correcto.',
                timer: 1400,
                showConfirmButton: false,
            });
            expect(pushMock).toHaveBeenCalledWith(expectedRoute);
        });
    });

});