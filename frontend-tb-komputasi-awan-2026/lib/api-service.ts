import axios, { AxiosInstance } from 'axios';
import type { Endpoints } from './api-context';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
  timestamp: number;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class ApiService {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private endpoints: Endpoints | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = this.normalizeBaseUrl(baseUrl);
    this.axiosInstance = this.createAxiosInstance(this.baseUrl);
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = this.normalizeBaseUrl(baseUrl);
    this.axiosInstance = this.createAxiosInstance(this.baseUrl);
  }

  private normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.trim().replace(/\/+$/, '');
  }

  private shouldUseProxy(baseUrl: string): boolean {
    return (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      baseUrl.startsWith('http://')
    );
  }

  private createAxiosInstance(baseUrl: string): AxiosInstance {
    const useProxy = this.shouldUseProxy(baseUrl);

    return axios.create({
      baseURL: useProxy ? '/api/proxy' : baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(useProxy ? { 'x-target-base-url': baseUrl } : {}),
      },
    });
  }

  setEndpoints(ep: Endpoints | null) {
    this.endpoints = ep;
  }

  private resolvePath(endpoint: string, id?: string | number): string {
    if (id !== undefined) {
      return endpoint.replace('{id}', String(id));
    }
    return endpoint;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/');
      return response.status === 200 || response.status === 404;
    } catch (error) {
      return false;
    }
  }

  async getRecords(resource: string, page: number = 1, limit: number = 10) {
    try {
      const path = this.endpoints?.list || `/${resource}`;
      const startTime = performance.now();
      const response = await this.axiosInstance.get(this.resolvePath(path), {
        params: { page, limit },
      });
      const endTime = performance.now();

      return {
        data: Array.isArray(response.data)
          ? response.data
          : response.data.data && Array.isArray(response.data.data)
            ? response.data.data
            : response.data.items || [],
        total: response.data.total
          || (response.data.data && typeof response.data.data === 'object' && 'length' in response.data.data
            ? response.data.data.length
            : 0)
          || (Array.isArray(response.data) ? response.data.length : 0),
        responseTime: endTime - startTime,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch records'
      );
    }
  }

  async createRecord(resource: string, data: any) {
    try {
      const path = this.endpoints?.create || `/${resource}`;
      const startTime = performance.now();
      const response = await this.axiosInstance.post(this.resolvePath(path), data);
      const endTime = performance.now();

      return {
        data: response.data,
        responseTime: endTime - startTime,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to create record'
      );
    }
  }

  async updateRecord(resource: string, id: string | number, data: any) {
    try {
      const path = this.endpoints?.update || `/${resource}/${id}`;
      const startTime = performance.now();
      const response = await this.axiosInstance.put(this.resolvePath(path, id), data);
      const endTime = performance.now();

      return {
        data: response.data,
        responseTime: endTime - startTime,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update record'
      );
    }
  }

  async deleteRecord(resource: string, id: string | number) {
    try {
      const path = this.endpoints?.delete || `/${resource}/${id}`;
      const startTime = performance.now();
      const response = await this.axiosInstance.delete(this.resolvePath(path, id));
      const endTime = performance.now();

      return {
        data: response.data,
        responseTime: endTime - startTime,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete record'
      );
    }
  }

  async getSchema(): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/schema');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch schema'
      );
    }
  }

  async searchRecords(resource: string, query: string, limit: number = 10) {
    try {
      const path = this.endpoints?.list || `/${resource}`;
      const startTime = performance.now();
      const response = await this.axiosInstance.get(this.resolvePath(path), {
        params: { search: query, limit },
      });
      const endTime = performance.now();

      return {
        data: Array.isArray(response.data)
          ? response.data
          : response.data.data && Array.isArray(response.data.data)
            ? response.data.data
            : response.data.items || [],
        responseTime: endTime - startTime,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to search records'
      );
    }
  }
}

let apiServiceInstance: ApiService | null = null;

export function getApiService(baseUrl: string): ApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService(baseUrl);
  } else {
    apiServiceInstance.setBaseUrl(baseUrl);
  }
  return apiServiceInstance;
}
