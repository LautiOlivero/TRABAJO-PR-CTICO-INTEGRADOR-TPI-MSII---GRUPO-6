# Guía de Implementación: Jira Software y GitHub

El enunciado del TPI requiere que el equipo gestione el proyecto utilizando **Jira** (para organizar el trabajo, Backlog, Épicas, User Stories, Sprints) y **GitHub** (para versionar el código).

Esta guía rápida les mostrará cómo configurar ambas herramientas para empezar a trabajar bajo el marco Scrum.

---

## 🛠️ Parte 1: Configuración de Jira Software

Jira será el centro de control del proyecto. Todos los integrantes deben tener cuenta allí y tener acceso al tablero.

### Paso 1: Crear el Proyecto
1. El líder del grupo (o Scrum Master) debe crear una cuenta en [Jira Software](https://www.atlassian.com/software/jira).
2. Al crear un nuevo proyecto, asegúrense de elegir la plantilla **"Scrum"** y el tipo de proyecto **"Administrado por el equipo"** (Team-managed) ya que es más flexible y fácil de usar para proyectos universitarios.
3. Nombren al proyecto (ej. `Body Paint TPI`).
4. Inviten a todos los miembros del equipo desde la sección de configuración/equipo.

### Paso 2: Cargar el Product Backlog
1. En el menú izquierdo, vayan a **Backlog**.
2. **Crear Épicas:** En el panel de Épicas (suele estar a la izquierda o arriba), creen las épicas definidas en nuestro `Product_Backlog.md` (Ej: *Gestión de Clientes*, *Catálogo y Carrito*, etc.).
3. **Crear User Stories:** En la lista del Backlog, empiecen a crear las *Historias* copiando el título de las US (ej. `US-01: Registro de Cliente`).
4. Entren a cada Historia y peguen la **Descripción** y los **Criterios de Aceptación** que definimos. Por último, vinculen la historia a su Épica correspondiente.

### Paso 3: Estimar y Planificar el Sprint 1
1. **Estimaciones:** Reúnanse con el equipo, debatan cada historia y asignen un valor numérico (Story Points) en el campo "Estimación" (Story point estimate) basado en el Esfuerzo, Complejidad e Incertidumbre.
2. **Crear Sprint:** En la pantalla de Backlog, hagan clic en **"Crear Sprint"** (Sprint 1).
3. **Seleccionar Historias:** Arrastren las Historias de Usuario priorizadas desde el Backlog general hacia el cuadro del "Sprint 1".
4. **Iniciar Sprint:** Hagan clic en "Iniciar Sprint", estableciendo una duración de **2 semanas** (como pide la cátedra) y un Objetivo del Sprint.

### Paso 4: Tablero (Board) y Tareas Técnicas
Una vez iniciado el Sprint, vayan al **Tablero (Board)**. Aquí verán columnas como *Por hacer* (To Do), *En curso* (In Progress) y *Listo* (Done).
- Cada desarrollador debe "asignarse" una historia cuando empiece a trabajar en ella y moverla de columna.
- *Tip del Enunciado:* Pueden descomponer cada Historia en **Tareas (Tasks)** o **Sub-tareas** técnicas (ej. "Crear base de datos para Clientes", "Maquetar formulario de registro").

---

## 🐙 Parte 2: Configuración de GitHub

GitHub será el lugar donde resida el código fuente del sistema. Ya tenemos un repositorio local inicializado en tu computadora con la documentación inicial.

### Paso 1: Crear el Repositorio Remoto
1. Ve a [GitHub](https://github.com) e inicia sesión.
2. Haz clic en **"New"** (Nuevo repositorio).
3. Ponle un nombre (ej. `tpi-bodypaint-ms2`).
4. **IMPORTANTE:** Déjalo como **Público** o **Privado** (si es privado, recuerda invitar a los profesores y a tus compañeros de equipo en Settings > Collaborators).
5. **No marques** la opción de agregar un README, .gitignore o licencia, ya que nosotros ya tenemos archivos locales. Dale a "Create repository".

### Paso 2: Conectar lo local con lo remoto
Una vez creado, GitHub te mostrará unos comandos. Abre la consola o terminal en la carpeta `TPI_MSII` de tu computadora y ejecuta estos dos comandos (reemplazando tu usuario):

```bash
git remote add origin https://github.com/TU-USUARIO/tpi-bodypaint-ms2.git
git push -u origin master
```
*¡Listo! Tus archivos (README, Backlog, etc.) ya estarán en la nube de GitHub.*

### Paso 3: Flujo de Trabajo (Git Flow recomendado)
Para que no se sobreescriban el código entre los 3 miembros del equipo:
1. **Nadie trabaja en la rama `master` (o `main`) directamente.**
2. Cada vez que alguien vaya a programar una funcionalidad (ej. la US-01), debe crear una rama nueva:
   ```bash
   git checkout -b feature/US-01-Registro
   ```
3. Trabaja, programa y hace sus commits en esa rama (`git add .`, `git commit -m "..."`).
4. Luego, sube la rama a GitHub:
   ```bash
   git push origin feature/US-01-Registro
   ```
5. En GitHub, crea un **Pull Request (PR)** para que el resto del equipo revise el código antes de fusionarlo (merge) con la rama principal.
