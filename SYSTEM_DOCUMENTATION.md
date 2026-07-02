# ApexRMM — Remote Monitoring & Management System Documentation

Esta documentación técnica presenta el estado del sistema ApexRMM, detallando qué módulos se encuentran completamente implementados y operativos, qué partes utilizan datos simulados (mocks) y el mapa de ruta para producción.

---

## 🛠️ Arquitectura del Sistema

El sistema está dividido en tres componentes principales:
1. **Agente (Windows/Go)**: Un servicio nativo de Windows escrito en Go que ejecuta tareas de telemetría WMI, terminal remota interactiva y backups.
2. **Backend (Go/SQLite)**: Servidor central de transporte y persistencia. Utiliza WebSockets para terminal remota/eventos en vivo y base de datos local SQLite (`rmm.db`).
3. **Frontend (Next.js/xterm.js)**: Consola de operaciones moderna con interfaz oscura ("stone" theme), inicio de sesión con JWT y notificaciones reactivas.

---

## 🟢 Funcionalidades al 100% (Listas para Producción)

### 1. Despliegue Silencioso y Servicio Windows (Fase 1)
- **Servicio Windows Nativo**: El agente (`agent.exe`) se ejecuta en segundo plano bajo privilegios de `SYSTEM`.
- **Evasión de Antivirus**: El script dropper (`deploy/installer.ps1`) añade exclusión automática en Windows Defender (`Add-MpPreference -ExclusionPath`) para la ruta de instalación silenciosa en `C:\ProgramData\OzyShield\`.
- **Persistencia**: Sobrevive a los reinicios del sistema operativo del cliente sin intervención manual.

### 2. Resiliencia de Datos y Cola Offline (Fase 2)
- **SQLite Local**: El agente implementa una base de datos local `queue.db` en la máquina del cliente.
- **Buffering Offline**: Si la máquina se desconecta o el backend se cae, las métricas de telemetría se encolan localmente en SQLite.
- **Flush on Reconnect**: Al restablecerse el canal WebSocket, el agente sube todo el historial de métricas con sus marcas de tiempo originales al backend.

### 3. Autenticación, Seguridad & JWT
- **Filtros JWT**: Todas las APIs del backend de Go y los túneles WebSockets están protegidos por middleware JWT.
- **Formulario de Acceso**: La UI cuenta con una pantalla de Login (`/login`) que interactúa con la base de datos de técnicos (`users` table).
- **Next.js Middleware**: Las rutas del frontend están interceptadas para denegar acceso a técnicos no autenticados.
- **Credenciales Sembradas**: `admin` / `password123`.

### 4. Terminal Remota Interactiva (Console Shell)
- **xterm.js**: La vista de detalle de dispositivo en Next.js (`/devices/[id]`) abre un shell interactivo de PowerShell sobre el equipo en vivo mediante túneles WebSocket.

### 5. Notificaciones de Incidencias en Tiempo Real
- **WebSocket Event Hub**: El backend expone un canal Pub/Sub (`/api/events/ws`).
- **Toasts Reactivos**: Si se registra una alerta crítica (CPU > 90%), el servidor notifica de inmediato al navegador del técnico con notificaciones dinámicas (Sonner toasts).

---

## 🟡 Funcionalidades Híbridas / Con Mocks

### 1. Backups (Kopia Sidecar)
- **Estado**: Híbrido.
- **Parte Real**:
  - Base de datos de respaldos (`backup_jobs` table) en el backend y API para consultar/iniciar tareas manuales.
  - El agente simula la orquestación e instalación del motor `kopia.exe` y transmite el progreso de la carga en vivo por WebSocket.
- **Mock / Pendiente**:
  - La descarga de Kopia utiliza una simulación y el snapshot no realiza una carga física a un bucket S3 o SFTP (requiere configurar las credenciales de almacenamiento en la nube).

### 2. Clientes / Tenants
- **Estado**: Híbrido.
- **Parte Real**: El dashboard permite filtrar las vistas según el tenant/cliente.
- **Mock**: Los tenants (`tenants` list en `rmm-data.ts`) siguen siendo estáticos; no hay una tabla `tenants` en SQLite todavía para la gestión multitenant dinámica.

---

## 🔴 Módulos Faltantes / No Implementados

### 1. Patch Management (Windows Updates)
- El KPI de parches en el frontend actualmente muestra un porcentaje simulado. Falta desarrollar el colector WMI en el agente para listar parches ausentes e instalar Windows Updates vía CLI.

### 2. Administración y Configuración (Settings)
- La pantalla de configuraciones es estática. Falta implementar el almacenamiento en base de datos para la configuración de SMTP (notificación por correo), umbrales de alerta y gestión de técnicos adicionales.

---

## 📋 Credenciales de Acceso por Defecto
- **Técnico**: `admin`
- **Clave**: `password123`
