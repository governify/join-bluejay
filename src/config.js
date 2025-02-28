let config = {
    scopeUrl: 'http://localhost:5700',
    registryUrl: 'http://localhost:5400',
    internalAssetsUrl: 'http://host.docker.internal:5200',
    internalScopeUrl: 'http://host.docker.internal:5700',
    renderUrl: 'http://localhost:5100',
    dashboardUrl: 'http://localhost:5600',
    reporterUrl: 'http://localhost:5300',
    directorUrl: 'http://localhost:5800',
    assetsUrl: 'http://localhost:5200'
};

export const loadConfig = async () => {
    try {
        const response = await fetch('/config.json');
        const data = await response.json();
        config = { ...config, ...data };
    } catch (error) {
        console.error('Error loading config:', error);
    }
};

export default config;