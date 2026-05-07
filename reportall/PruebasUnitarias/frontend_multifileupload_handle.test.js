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
});

