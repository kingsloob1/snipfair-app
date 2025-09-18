import { usePage } from '@inertiajs/react';
import { createContext, ReactNode, useContext } from 'react';

export interface WebsiteConfig {
    currency_symbol?: string;
    currency_code?: string;
    siteName?: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    timezone?: string;
    dateFormat?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Allow additional properties
}

interface WebsiteConfigContextType {
    config: WebsiteConfig;
    currency_symbol: string;
    currency_code: string;
    siteName: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    timezone: string;
    dateFormat: string;
    get<T>(key: keyof WebsiteConfig, fallback: T): T;
}

const WebsiteConfigContext = createContext<
    WebsiteConfigContextType | undefined
>(undefined);

export function WebsiteConfigProvider({ children }: { children: ReactNode }) {
    const { props } = usePage();
    const config = (props.website_configs || {}) as WebsiteConfig;

    const contextValue: WebsiteConfigContextType = {
        config,
        currency_symbol: config.currency_symbol ?? 'R',
        currency_code: config.currency_code ?? 'ZAR',
        siteName: config.siteName ?? 'My Website',
        logo: config.logo ?? '/default-logo.png',
        primaryColor: config.primaryColor ?? '#000000',
        secondaryColor: config.secondaryColor ?? '#666666',
        timezone: config.timezone ?? 'UTC',
        dateFormat: config.dateFormat ?? 'YYYY-MM-DD',
        get<T>(key: keyof WebsiteConfig, fallback: T): T {
            return (config[key] as T) ?? fallback;
        },
    };

    return (
        <WebsiteConfigContext.Provider value={contextValue}>
            {children}
        </WebsiteConfigContext.Provider>
    );
}

export function useWebsiteConfig() {
    const context = useContext(WebsiteConfigContext);
    if (context === undefined) {
        throw new Error(
            'useWebsiteConfig must be used within a WebsiteConfigProvider',
        );
    }
    return context;
}
