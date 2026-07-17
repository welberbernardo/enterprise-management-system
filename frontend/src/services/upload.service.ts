import { http } from './api';

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<{ url: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<{ url: string }>('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
