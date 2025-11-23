# Calculadora ERE

Una herramienta web sencilla y eficaz para calcular estimaciones de indemnización en procesos de ERE (Expediente de Regulación de Empleo).

## Características

- **Cálculo de Indemnización**: Basado en salario bruto, antigüedad y días por año.
- **Modos de Cálculo**:
  - **Personalizado**: Permite ajustar todos los parámetros (días/año, bonus, cheques, etc.).
  - **TID (Telefónica Innovación Digital)**: Configuración predefinida con reglas específicas (43 días/año, exclusión de cheques, primas por antigüedad fijas).
- **Primas por Antigüedad**:
  - Sistema flexible para añadir reglas de bonus extra según años trabajados.
  - Configuración automática en modo TID.
- **Cálculo de Fechas**: Permite introducir la fecha de inicio para calcular automáticamente los días trabajados.
- **Desglose Detallado**: Explicación paso a paso de cómo se calcula el salario diario y la indemnización final.
- **Privacidad**: Todo el cálculo se realiza en el navegador del cliente. Ningún dato es enviado a servidores externos.

## Tecnologías

- HTML5 / CSS3
- JavaScript (ES6+)
- [Alpine.js](https://alpinejs.dev/) - Para la reactividad y lógica de la interfaz.

## Uso

Simplemente abre el archivo `index.html` en cualquier navegador web moderno.

## Estructura del Proyecto

- `index.html`: Punto de entrada de la aplicación.
- `css/styles.css`: Estilos de la aplicación.
- `scripts/`:
  - `main.js`: Lógica principal de la calculadora.
  - `custom.js`: Configuración de la estrategia personalizada.
  - `tid.js`: Configuración de la estrategia TID.
  - `tests.js`: Suite de pruebas automatizadas.
- `tests.html`: Ejecutor de pruebas.

## Tests

Para verificar el correcto funcionamiento de la calculadora, abre el archivo `tests.html` en tu navegador.
