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
// Get config from window object (set by Inertia)
const getConfigFromWindow = (): WebsiteConfig => {
    if (
        typeof window !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).page?.props?.website_configs
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (window as any).page.props.website_configs;
    }
    return {};
};

// Main config object with fallback values
export const websiteConfig = {
    get currency_symbol(): string {
        return getConfigFromWindow()?.currency_symbol ?? 'R';
    },

    get currency_code(): string {
        return getConfigFromWindow()?.currency_code ?? 'ZAR';
    },

    get siteName(): string {
        return getConfigFromWindow()?.siteName ?? 'My Website';
    },

    get logo(): string {
        return getConfigFromWindow()?.logo ?? '/default-logo.png';
    },

    get primaryColor(): string {
        return getConfigFromWindow()?.primaryColor ?? '#000000';
    },

    get secondaryColor(): string {
        return getConfigFromWindow()?.secondaryColor ?? '#666666';
    },

    get timezone(): string {
        return getConfigFromWindow()?.timezone ?? 'UTC';
    },

    get dateFormat(): string {
        return getConfigFromWindow()?.dateFormat ?? 'YYYY-MM-DD';
    },

    // Get all configs
    get all(): WebsiteConfig {
        return getConfigFromWindow();
    },

    // Get a specific config with fallback
    get<T>(key: keyof WebsiteConfig, fallback: T): T {
        return (getConfigFromWindow()[key] as T) ?? fallback;
    },

    // Check if config is available
    get isAvailable(): boolean {
        return (
            typeof window !== 'undefined' &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            !!(window as any).page?.props?.website_configs
        );
    },
};

export default websiteConfig;
