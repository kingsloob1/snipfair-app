let isRefreshingToken = false;
let refreshPromise: Promise<void> | null = null;

const getCsrfToken = (): string | null => {
    const matches = document.cookie.match(
        new RegExp('(^| )XSRF-TOKEN=([^;]+)'),
    );
    return matches ? decodeURIComponent(matches[2]) : null;
};

const refreshCSRFToken = async (): Promise<void> => {
    if (isRefreshingToken && refreshPromise) {
        return refreshPromise;
    }

    isRefreshingToken = true;
    refreshPromise = fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include', // important: include cookies
    }).then(() => {
        isRefreshingToken = false;
        refreshPromise = null;
    });

    return refreshPromise;
};

export const apiCall = async (
    url: string,
    options: RequestInit = {},
): Promise<Response> => {
    const method = (options.method || 'GET').toUpperCase();
    const needsCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method);

    const makeRequest = () => {
        const csrfToken = getCsrfToken();
        const headers: Record<string, string> = {
            Accept: 'application/json',
            ...(options.headers as Record<string, string> | undefined),
        };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (needsCsrf && csrfToken) {
            headers['X-XSRF-TOKEN'] = csrfToken;
        }

        return fetch(url, {
            credentials: 'include', // send + receive cookies
            headers,
            ...options,
        });
    };

    let response = await makeRequest();

    if (response.status === 419) {
        await refreshCSRFToken();
        response = await makeRequest();
    }

    return response;
};
