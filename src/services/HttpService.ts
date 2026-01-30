type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody = unknown> {
    method?: HttpMethod;
    body?: TBody;
    headers?: Record<string, string>;
}

interface HttpResponse<TData> {
    data: TData | null;
    error: Error | null;
    status: number;
}

export class HttpService {
    private baseUrl: string;

    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    private async request<TData, TBody = unknown>(
        endpoint: string,
        options: RequestOptions<TBody> = {}
    ): Promise<HttpResponse<TData>> {
        const { method = 'GET', body, headers = {} } = options;

        const url = `${this.baseUrl}${endpoint}`;

        const requestInit: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        if (body !== undefined) {
            requestInit.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, requestInit);
            const data = await response.json();

            if (!response.ok) {
                return {
                    data: null,
                    error: new Error(data.error || 'Request failed'),
                    status: response.status,
                };
            }

            return {
                data: data as TData,
                error: null,
                status: response.status,
            };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error('Unknown error'),
                status: 0,
            };
        }
    }

    async get<TData>(endpoint: string, headers?: Record<string, string>): Promise<HttpResponse<TData>> {
        return this.request<TData>(endpoint, { method: 'GET', headers });
    }

    async post<TData, TBody = unknown>(
        endpoint: string,
        body?: TBody,
        headers?: Record<string, string>
    ): Promise<HttpResponse<TData>> {
        return this.request<TData, TBody>(endpoint, { method: 'POST', body, headers });
    }

    async put<TData, TBody = unknown>(
        endpoint: string,
        body?: TBody,
        headers?: Record<string, string>
    ): Promise<HttpResponse<TData>> {
        return this.request<TData, TBody>(endpoint, { method: 'PUT', body, headers });
    }

    async patch<TData, TBody = unknown>(
        endpoint: string,
        body?: TBody,
        headers?: Record<string, string>
    ): Promise<HttpResponse<TData>> {
        return this.request<TData, TBody>(endpoint, { method: 'PATCH', body, headers });
    }

    async delete<TData>(endpoint: string, headers?: Record<string, string>): Promise<HttpResponse<TData>> {
        return this.request<TData>(endpoint, { method: 'DELETE', headers });
    }
}

export const httpService = new HttpService();
