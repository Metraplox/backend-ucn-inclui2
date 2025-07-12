// Configuración centralizada de base de datos
// Última actualización: 10/07/2025

/**
 * ESTÁNDAR DE BASE DE DATOS UCN INCLUI2
 * 
 * Base de datos única: ucn_inclui2
 * 
 * Desde contenedores Docker: mongodb://mongodb_prod:27017/ucn_inclui2
 * Desde host local: mongodb://localhost:27017/ucn_inclui2
 * 
 * Esta configuración debe usarse en TODOS los scripts y servicios.
 * NO usar otras bases de datos como ucn_inclui2_prod, ucn_inclui2_db, etc.
 */

const DB_CONFIG = {
  // Configuración para uso desde Docker (contenedores)
  DOCKER_URI: 'mongodb://mongodb_prod:27017/ucn_inclui2',
  
  // Configuración para uso desde host local (scripts, desarrollo)
  LOCAL_URI: 'mongodb://localhost:27017/ucn_inclui2',
  
  // Nombre de la base de datos
  DATABASE_NAME: 'ucn_inclui2',
  
  // Contenedor de MongoDB
  CONTAINER_NAME: 'mongodb_prod',
  
  // Puerto mapeado
  PORT: 27017
};

/**
 * Obtiene la URI de conexión según el contexto de ejecución
 * @param {boolean} isDocker - True si se ejecuta desde un contenedor Docker
 * @returns {string} URI de conexión a MongoDB
 */
function getMongoURI(isDocker = false) {
  return isDocker ? DB_CONFIG.DOCKER_URI : DB_CONFIG.LOCAL_URI;
}

/**
 * Obtiene la URI desde variables de entorno o usa el fallback apropiado
 * @param {boolean} isDocker - True si se ejecuta desde un contenedor Docker
 * @returns {string} URI de conexión a MongoDB
 */
function getMongoURIFromEnv(isDocker = false) {
  return process.env.MONGODB_URI || getMongoURI(isDocker);
}

module.exports = {
  DB_CONFIG,
  getMongoURI,
  getMongoURIFromEnv
};
