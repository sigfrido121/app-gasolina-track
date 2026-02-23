# Guía de Despliegue - App Gasolina

Este proyecto está configurado para desplegarse usando **Docker** y un **Túnel de Cloudflare**.

## Requisitos Previos

- Docker y Docker Compose instalados.
- Un token de Cloudflare Tunnel.

## Estructura de Despliegue

La aplicación utiliza tres contenedores:
1.  **gasolina_app**: La aplicación Next.js.
2.  **gasolina_db**: Base de datos MongoDB.
3.  **gasolina_tunnel**: Conector para acceder a la app desde internet sin abrir puertos.

## Pasos para el Despliegue

### 1. Configurar el Token de Cloudflare
Edita el archivo `.env.production` y pon tu token real en `TUNNEL_TOKEN`:
```env
TUNNEL_TOKEN=tu_token_de_cloudflare_aqui
```

### 2. Levantar los servicios
Ejecuta el siguiente comando en la terminal:
```bash
docker compose up -d
```

### 3. Verificar el estado
Puedes ver si los contenedores están corriendo con:
```bash
docker compose ps
```

Y revisar los logs si algo falla:
```bash
docker compose logs -f
```

## Notas Adicionales
- La base de datos guarda sus datos en la carpeta `mongodb_data` del proyecto para que no se pierdan al reiniciar.
- La aplicación es accesible internamente en el puerto `3000`.
- El túnel de Cloudflare dirigirá el tráfico de tu dominio configurado directamente al contenedor `app`.

---
*Generado por Antigravity*
