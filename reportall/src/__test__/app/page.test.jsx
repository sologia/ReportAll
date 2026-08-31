import { redirect } from 'next/navigation';
import HomePage from '@/app/page.jsx';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('app/page.jsx', () => {
  it('redirecciona a /auth/login', () => {
    HomePage();
    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });
});
