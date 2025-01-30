const config = {
    scopeUrl: import.meta.env.VITE_SCOPE_URL || 'http://localhost:5700', // 'https://scopes.bluejay.governify.io'
    registryUrl: import.meta.env.VITE_REGISTRY_URL || 'http://localhost:5400', // 'https://registry.bluejay.governify.io'
    internalAssetsUrl: import.meta.env.VITE_INTERNAL_ASSETS_URL || 'http://host.docker.internal:5200', // 'http://bluejay-assets-manager'
    internalScopeUrl: import.meta.env.VITE_INTERNAL_SCOPE_URL || 'http://host.docker.internal:5700', // 'http://bluejay-scope-manager'
    renderUrl: import.meta.env.VITE_RENDER_URL || 'http://localhost:5100', // 'https://render.bluejay.governify.io'
    dashboardUrl: import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5600', // 'https://dashboard.bluejay.governify.io'
    reporterUrl: import.meta.env.VITE_REPORTER_URL || 'http://localhost:5300', // 'https://reporter.bluejay.governify.io'
    directorUrl: import.meta.env.VITE_DIRECTOR_URL || 'http://localhost:5800', // 'https://director.bluejay.governify.io'
    assetsUrl: import.meta.env.VITE_ASSETS_URL || 'http://localhost:5200', // 'https://assets.bluejay.governify.io'
};

export default config;