'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, File, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  preview?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUpload({
  onFileSelect,
  multiple = false,
  accept = 'image/*',
  maxSize = 5,
  maxFiles = 5,
  preview = true,
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Dosya boyutu ${maxSize}MB'dan büyük olamaz`;
    }

    // Check file type
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        return 'Desteklenmeyen dosya türü';
      }
    }

    return null;
  };

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles: FileWithPreview[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      
      if (error) {
        const fileWithError: FileWithPreview = {
          ...file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'error',
          error,
        };
        validFiles.push(fileWithError);
        continue;
      }

      const fileWithPreview: FileWithPreview = {
        ...file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'uploading',
      };

      if (preview && file.type.startsWith('image/')) {
        fileWithPreview.preview = await createFilePreview(file);
      }

      fileWithPreview.status = 'success';
      validFiles.push(fileWithPreview);
    }

    const newFiles = multiple ? [...files, ...validFiles] : validFiles;
    const limitedFiles = newFiles.slice(0, maxFiles);
    
    setFiles(limitedFiles);
    onFileSelect(limitedFiles);
  }, [files, multiple, maxFiles, preview, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFileSelect(updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <p className="font-medium">
              Dosyaları buraya sürükleyin veya seçmek için tıklayın
            </p>
            <p className="text-xs mt-1">
              {accept === 'image/*' ? 'Resim dosyaları' : 'Dosyalar'} • 
              Maksimum {maxSize}MB • 
              {multiple ? ` En fazla ${maxFiles} dosya` : ' Tek dosya'}
            </p>
          </div>
        </div>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">
            Seçilen Dosyalar ({files.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className={`relative border rounded-lg p-3 ${
                  file.status === 'error' 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* File Content */}
                <div className="flex items-start space-x-3">
                  {preview && file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded">
                      {getFileIcon(file)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      {file.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {file.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 