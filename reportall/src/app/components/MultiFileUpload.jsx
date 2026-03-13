'use client';
import { useState, useRef } from 'react';

const MultiFileUpload = ({ onFilesSelect }) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Convertir archivos a binario y pasar al callback
    if (onFilesSelect) {
      const filePromises = selectedFiles.map(file =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              binary: reader.result, // ArrayBuffer con los datos binarios
              file: file
            });
          };
          reader.readAsArrayBuffer(file);
        })
      );

      Promise.all(filePromises).then(fileData => {
        onFilesSelect(fileData);
      });
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Input oculto */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Botón de upload */}
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Subir fotos/videos
      </button>

      {/* Lista de archivos seleccionados */}
      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-gray-500">
            {files.length} archivo(s) seleccionado(s)
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-xs">
                <div className="flex items-center gap-2">
                  {file.type.startsWith('image/') ? (
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload;