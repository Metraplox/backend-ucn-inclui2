# Configuración del Servidor MCP de GitHub

## Pasos para configurar GitHub MCP

### 1. Crear un Personal Access Token (PAT) en GitHub

1. Ve a GitHub.com y inicia sesión
2. Ve a Settings (Configuración) → Developer settings → Personal access tokens → Tokens (classic)
3. Haz clic en "Generate new token" → "Generate new token (classic)"
4. Configura el token:
   - **Name**: `MCP Server Access`
   - **Expiration**: `90 days` (o como prefieras)
   - **Scopes**: Selecciona los siguientes permisos:
     - `repo` (acceso completo a repositorios)
     - `read:user` (leer información del usuario)
     - `user:email` (leer direcciones de email)
     - `notifications` (acceso a notificaciones)
     - `read:org` (leer organizaciones)

### 2. Configurar el token en mcp_config.json

1. Copia el token generado
2. Abre el archivo `c:\Users\fabi_\.codeium\windsurf\mcp_config.json`
3. Reemplaza `TU_TOKEN_AQUI` con tu token real
4. Cambia `"disabled": true` a `"disabled": false`

### 3. Verificar la configuración

```json
"github": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-github"
  ],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "tu_token_real_aqui"
  },
  "disabled": false
}
```

### 4. Reiniciar VS Code/Windsurf

Después de configurar el token, reinicia completamente VS Code o Windsurf para que los cambios surtan efecto.

### 5. Verificar funcionamiento

Una vez reiniciado, el MCP de GitHub debería estar disponible y podrás:
- Crear issues
- Hacer commits
- Crear pull requests
- Gestionar repositorios
- Ver notificaciones

## Solución de problemas

### Error "Bad credentials"
- Verifica que el token sea correcto
- Asegúrate de que no haya espacios extra
- Verifica que el token no haya expirado

### Error "Not found"
- Verifica los permisos del token
- Asegúrate de tener acceso al repositorio

### El servidor no se inicia
- Verifica que tengas Node.js instalado
- Ejecuta `npx -y @modelcontextprotocol/server-github` manualmente para ver errores

## Uso recomendado

Con el MCP de GitHub configurado podrás:
1. Automatizar tareas de desarrollo
2. Gestionar issues y pull requests
3. Sincronizar con repositorios remotos
4. Recibir notificaciones de GitHub
