const isTestEnv = typeof window !== 'undefined' && window.location.href.includes('localhost:8080')

export { isTestEnv }
