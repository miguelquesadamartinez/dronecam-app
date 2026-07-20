# 📱 DroneCam App

**Aplicación móvil multiplataforma** para visualizar en tiempo real el stream de video de un dron. Desarrollada con [Expo](https://expo.dev) y [React Native](https://reactnative.dev) para máxima compatibilidad entre iOS, Android y Web.

> ✈️ **Objetivo**: Proporcionar una interfaz intuitiva y responsive para el control visual de transmisiones de drones.

---

## ✨ Características Principales

- 🎥 **Reproductor de video en tiempo real** (expo-video)
- 🌙 **Soporte para tema claro/oscuro** (adaptable al sistema)
- 📱 **Multiplataforma** (iOS, Android, Web)
- ⚡ **Fast Refresh** (recarga automática durante desarrollo)
- 🎨 **Componentes reutilizables** y temáticos
- 🧩 **Arquitectura modular** y escalable

---

## 📁 Estructura del proyecto

```
dronecam-app/
├── app/                          # 📑 Rutas y pantallas (File-based routing)
│   ├── _layout.tsx              # Layout raíz con navegación Stack
│   └── (tabs)/                  # Grupo de tabs
│       ├── _layout.tsx          # Layout de navegación inferior
│       └── index.tsx            # 🎥 Pantalla principal (reproductor de video)
│
├── components/                   # 🧩 Componentes reutilizables
│   ├── themed-text.tsx          # Texto adaptable a tema
│   ├── themed-view.tsx          # Contenedor adaptable a tema
│   └── ui/                      # Componentes UI especializados
│       ├── collapsible.tsx      # Acordeón expandible
│       ├── icon-symbol.tsx      # Iconos del sistema (Android/Web)
│       └── icon-symbol.ios.tsx  # Iconos del sistema (iOS)
│
├── constants/                    # ⚙️ Configuración
│   └── theme.ts                 # Paleta de colores y tipografía
│
├── hooks/                        # 🪝 Custom Hooks
│   ├── use-color-scheme.ts      # Detectar tema del sistema
│   ├── use-color-scheme.web.ts  # Variante para Web
│   └── use-theme-color.ts       # Obtener colores según tema
│
├── assets/images/               # 🖼️ Recursos estáticos
│
└── scripts/                      # 🔧 Scripts de utilidad
```

---

## 🚀 Cómo empezar

### 📋 Requisitos Previos

- **Node.js** v18+ y **npm** v9+
- **Expo CLI**: `npm install -g expo-cli`
- **Emulador/Simulador** (opcional) o **Expo Go** en dispositivo físico

### Instalación y Ejecución

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**
   ```bash
   npx expo start
   ```

   > ⚠️ **Importante**: Ejecuta este comando **dentro de `dronecam-app/`** donde está el `package.json`. Desde una carpeta padre obtendrás error `ConfigError: The expected package.json path`.

### 🎮 Opciones de Ejecución

Tras ejecutar `npx expo start`, tendrás estas opciones:

| Opción | Comando | Descripción |
|--------|---------|-------------|
| **Emulador Android** | `a` | Abre en Android Studio Emulator |
| **Simulador iOS** | `i` | Abre en Xcode Simulator |
| **Navegador Web** | `w` | Abre en navegador (localhost) |
| **Expo Go** | Escanea QR | App limitada para pruebas rápidas |

### 🔧 Desarrollo Avanzado

```bash
# Limpiar caché y recompilar
npx expo start --clear

# Acceder desde redes externas (tunnel)
npx expo start --tunnel

# Abrir directamente en plataforma específica
npx expo start --android
npx expo start --ios
npx expo start --web
```

### 📱 ¿Qué hace `npx expo start`?

- ⚙️ Compila TypeScript/JavaScript en tiempo real
- 🔄 **Fast Refresh**: Recarga automática sin perder estado
- 📡 Expone QR para escanear con Expo Go
- 🔌 Servidor de desarrollo Metro Bundler activo

---

## 📦 Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|----------|
| **expo** | ~54.0.34 | Framework base y desarrollo |
| **react-native** | 0.81.5 | Framework UI nativo |
| **expo-router** | ~6.0.23 | Enrutamiento basado en archivos |
---

## 🛠️ Scripts Disponibles

```bash
npm start        # Servidor de desarrollo interactivo
npm run android  # Abre directamente en Android Emulator
npm run ios      # Abre directamente en iOS Simulator
npm run web      # Abre en navegador web
npm run lint     # Ejecuta ESLint
```

---

## 📚 Componentes Principales

### 🎥 Pantalla de Video
Ubicada en [app/(tabs)/index.tsx](./app/(tabs)/index.tsx) - Pantalla principal que renderiza el reproductor de video del dron usando `expo-video`.

### 🖥️ Conectar Raspberry Pi
Para ver la cámara de la Raspberry Pi en el móvil, sigue estos pasos bien definidos:

1. **Conecta la cámara física a la Raspberry Pi**
   - Inserta el cable CSI en el puerto de la cámara.
   - Enciende la Raspberry Pi.

2. **Activa la cámara en el sistema**
   - Ejecuta `sudo raspi-config`.
   - Ve a `Interfacing Options` → `Camera` → `Enable`.
   - Reinicia la Raspberry Pi si te lo pide.

3. **Comprueba que la cámara funciona**
   - Usa `libcamera-hello` para ver la cámara en la Pi:
     ```bash
     libcamera-hello
     ```
   - Si ves la imagen, la cámara está lista.

4. **Encuentra la IP de la Raspberry Pi**
   - Ejecuta:
     ```bash
     hostname -I
     ```
   - Anota la dirección IP local, por ejemplo `192.168.0.100`.

5. **Crea un stream de video desde la Raspberry Pi**
   - La opción recomendada para esta app es **HLS** con `ffmpeg`.
   - Instala las herramientas necesarias:
     ```bash
     sudo apt update
     sudo apt install ffmpeg libcamera-apps
     ```
   - Inicia el stream HLS:
     ```bash
     libcamera-vid -t 0 -o - | ffmpeg -i - -c:v copy -f hls -hls_time 2 -hls_list_size 3 /var/www/html/stream.m3u8
     ```
   - Si no tienes `nginx`/`apache`, puedes usar un servidor simple:
     ```bash
     python3 -m http.server 8080 --directory /var/www/html
     ```

6. **Usa la URL en la app móvil**
   - En la app, introduce la URL del stream.
   - Ejemplo HLS recomendado:
     - `http://192.168.0.100:8080/stream.m3u8`
   - Alternativa MJPEG si tu servidor lo ofrece:
     - `http://192.168.0.100:8080/?action=stream`

### 💡 Consejos importantes
- Asegúrate de que el móvil y la Raspberry Pi están en la misma red Wi-Fi.
- Si ves errores, prueba primero la URL en un navegador web desde otro dispositivo de la misma red.
- Si usas `Expo Go`, abre la app y cambia la URL directamente desde la pantalla de video.

### 🌈 Sistema de Temas
- **Componentes temáticos**: `ThemedText`, `ThemedView`
- **Detección automática**: Se adapta al tema oscuro/claro del sistema
- **Configuración centralizada**: Colores en [constants/theme.ts](./constants/theme.ts)

---

## 📖 Documentación y Recursos

- 📘 [Expo Documentation](https://docs.expo.dev/)
- 🎬 [expo-video API](https://docs.expo.dev/versions/latest/sdk/video/)
- 🚀 [expo-router (File-based Routing)](https://docs.expo.dev/routing/introduction/)
- ⚛️ [React Native Docs](https://reactnative.dev/)
- 🎨 [Expo Icons](https://icons.expo.fyi/)

---

## 👨‍💻 Desarrollo

### Estructura de Archivos
- **`app/`** → Rutas y pantallas (Expo Router)
- **`components/`** → Componentes reutilizables
- **`hooks/`** → Lógica personalizada y hooks
- **`constants/`** → Configuración global

### Mejores Prácticas
✅ Usar componentes temáticos para consistencia visual  
✅ Mantener hooks reutilizables en `/hooks`  
✅ Actualizar README cuando haya cambios importantes  
✅ Usar TypeScript para mayor seguridad de tipos  

---

## 📝 Notas Importantes

- Este proyecto usa **Expo 54+** y **React 19**
- Todas las cambios significativos deben reflejarse en este README
- El proyecto está optimizado para desarrollo ágil con Hot Reload

## Aprende más

- [Documentación de Expo](https://docs.expo.dev/)
- [expo-video](https://docs.expo.dev/versions/latest/sdk/video/)
