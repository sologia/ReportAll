import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MultiFileUpload from '../src/app/components/MultiFileUpload';

describe('MultiFileUpload Component', () => {
  test('should accept multiple files, validate types, call onChange handler', async () => {
    const mockOnFilesSelect = jest.fn();
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });

    const { container } = render(<MultiFileUpload onFilesSelect={mockOnFilesSelect} />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnFilesSelect).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'example.png',
            type: 'image/png'
          })
        ])
      );
    });
  });

  test('should render selected files and remove one from the list', async () => {
    const fileA = new File(['a'], 'photo-a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'video-b.mp4', { type: 'video/mp4' });

    const { container } = render(<MultiFileUpload onFilesSelect={jest.fn()} />);
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [fileA, fileB] } });

    expect(await screen.findByText('2 archivo(s) seleccionado(s)')).toBeTruthy();
    expect(screen.getByText('photo-a.png')).toBeTruthy();
    expect(screen.getByText('video-b.mp4')).toBeTruthy();

    const removeButtons = container.querySelectorAll('button[type="button"]');
    fireEvent.click(removeButtons[1]);

    await waitFor(() => {
      expect(screen.getByText('1 archivo(s) seleccionado(s)')).toBeTruthy();
    });
    expect(screen.queryByText('photo-a.png')).toBeNull();
    expect(screen.getByText('video-b.mp4')).toBeTruthy();
  });
});

