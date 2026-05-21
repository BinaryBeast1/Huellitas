/**
 * Secreto JWT estable. Si cambia el .env, los tokens viejos dejan de servir:
 * hay que cerrar sesión y volver a entrar.
 */
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (secret && secret.trim()) {
        return secret.trim();
    }
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET es obligatorio en producción');
    }
    console.warn('⚠️  JWT_SECRET no definido — usando secreto de desarrollo. Crea huellitas-backend/.env');
    return 'huellitas-dev-secret-local';
}

module.exports = { getJwtSecret };
