# 🧮 Calculadora de Álgebra Lineal & Matrices

Una aplicación web moderna, interactiva y de alta precisión diseñada para la resolución de **sistemas de ecuaciones lineales** y **operaciones matriciales avanzadas**. 

Implementa un motor propio de **aritmética exacta con fracciones** que evita los errores clásicos de redondeo en punto flotante (`float`), acompañando cada resultado con una explicación pedagógica y detallada **paso a paso**.

---

## ✨ Características Principales

### 1. Sistemas de Ecuaciones Lineales ($n \times n$)
- **Dimensiones flexibles**: Resuelve sistemas cuadrados desde $2 \times 2$ hasta $15 \times 15$.
- **Método de Eliminación Escolar y Sustitución Hacia Atrás**:
  - Planteamiento del sistema inicial.
  - Eliminación escalonada mediante combinación lineal vertical de ecuaciones (con línea divisoria estilo pizarra escolar).
  - Sustitución progresiva de incógnitas despejadas.
- **Clasificación del sistema**:
  - **Solución única**: Presenta cada variable con su fracción exacta irreducible y su equivalencia decimal aproximada.
  - **Sistema Incompatible**: Detecta inconsistencias (sin solución / rectas o planos paralelos).
  - **Infinitas Soluciones**: Identifica la presencia de variables libres (sistema indeterminado).
- **Ejemplo integrado**: Botón para cargar al instante un sistema $3 \times 3$ predefinido con solución exacta.

### 2. Operaciones con Matrices ($m \times n$)
- **Modo 1: Resolver Sistema Matricial ($A \cdot X = B$)**:
  - Resuelve la ecuación matricial mediante **Gauss-Jordan** aplicado a la matriz aumentada $[A \mid B]$.
  - Visualización auténtica de corchetes matriciales y línea de separación entre coeficientes y constantes.
- **Modo 2: Combinación Lineal ($k_1 A \pm k_2 B \dots$)**:
  - Soporta entre **2 y 6 matrices** con dimensiones comunes ($1 \le \text{filas}, \text{columnas} \le 8$).
  - Multiplicación de cada matriz por un escalar arbitrario ($k \in \mathbb{R}$).
  - Selección de operadores individuales ($+$ o $-$) entre matrices con vista previa dinámica en tiempo real.
  - Desglose paso a paso: cada matriz escalada y la matriz resultante sumada término a término.
- **Modo 3: Multiplicación en Cadena ($A \times B \times C \dots$)**:
  - Multiplica de 2 a 6 matrices con dimensiones independientes.
  - **Validación automática de compatibilidad dimensional**: Verifica que las columnas de la matriz $i$ coincidan con las filas de la matriz $i+1$.
  - Soporta escalares por cada matriz en la cadena.
  - Muestra cada producto matricial parcial de izquierda a derecha.

### 3. Motor de Aritmética de Fracciones Exactas
- Todas las operaciones internas ($+$, $-$, $\times$, $\div$) se calculan usando pares `{ n: numerador, d: denominador }` reducidos mediante el **Máximo Común Divisor (MCD)**.
- Sin pérdida de precisión ni artefactos numéricos como `0.3333333333333333` o `-0`.

---

## 🎨 Diseño y Experiencia de Usuario (UI/UX)

- **Diseño Responsivo**: Adaptado para pantallas móviles, tablets y monitores panorámicos.
- **Notación Matemática Real**: Renderizado con corchetes matriciales $\begin{bmatrix} \dots \end{bmatrix}$ e indicadores de dimensiones ($r \times c$).
- **Tipografía**: Combinación de **Plus Jakarta Sans** para la interfaz y **JetBrains Mono** para cifras y matrices tabulares.
- **Modo Paso a Paso Opcional**: Interruptor para alternar la visualización del procedimiento analítico sin necesidad de recalcular.
- **Cero dependencias pesadas**: No requiere Node.js, empaquetadores ni servidores backend. Funciona directamente en el navegador.

---

## 🚀 Inicio Rápido

No requiere instalación de dependencias ni compilación.

1. Clona o descarga el repositorio en tu equipo:
   ```bash
   git clone https://github.com/tu-usuario/calculator-template.git
   cd calculator-template
   ```

2. Abre directamente el archivo `index.html` en tu navegador favorito:
   - En Windows (PowerShell / Explorador):
     ```powershell
     Start-Process index.html
     ```
   - O simplemente haz doble clic sobre el archivo `index.html`.

---

## 📁 Estructura del Proyecto

```text
calculator-template/
├── index.html     # Estructura semántica HTML5, estilos Tailwind y CSS nativo
├── script.js      # Motor matemático de fracciones, algoritmos de álgebra y lógica del DOM
└── README.md      # Documentación del proyecto
```

---

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura accesible con roles ARIA y diseño semántico.
- **Tailwind CSS (Play CDN)**: Sistema de diseño utilitario para espaciado, paleta y tipografía.
- **CSS3 Puro**: Componentes robustos estilizados para garantizar compatibilidad sin dependencias externas.
- **JavaScript Moderno (ES6+)**:
  - Aritmética racional exacta con algoritmo de Euclides para el MCD.
  - Algoritmo de eliminación de Gauss y reducción de Gauss-Jordan.
  - Manipulación reactiva del DOM sin frameworks externos.

---

## 📖 Guía de Uso

1. **Seleccionar modo**: Utiliza las pestañas superiores para alternar entre *Ecuaciones Lineales* y *Operaciones con Matrices*.
2. **Definir tamaño**: Establece el número de incógnitas o dimensiones de las matrices y haz clic en **Generar**.
3. **Ingresar valores**: Digita los coeficientes numéricos en cada celda (puedes usar números enteros o decimales; la calculadora los convertirá automáticamente a fracciones exactas).
4. **Resolver / Calcular**: Haz clic en el botón principal para obtener la solución.
5. **Revisar el procedimiento**: Activa la casilla **Mostrar paso a paso** para inspeccionar cada etapa matemática detallada.

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia [MIT](LICENSE).

