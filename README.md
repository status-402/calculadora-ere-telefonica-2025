# Calculadora ERE

Una herramienta web sencilla y eficaz para calcular estimaciones de indemnización en procesos de ERE (Expediente de Regulación de Empleo).

## Características

- **Cálculo de Indemnización**: Basado en salario bruto, antigüedad y días por año.
- **Sistema de Estrategias Extensible**:
  - **Personalizado**: Permite ajustar todos los parámetros (días/año, bonus, beneficios, etc.).
  - **Perfiles de Empresa**: Fácilmente configurables mediante archivos JS independientes.
- **Primas por Antigüedad**:
  - Sistema flexible para añadir reglas de bonus extra según años trabajados.
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
  - `registry.js`: Sistema de registro de estrategias.
  - `main.js`: Lógica principal de la calculadora.
  - `custom.js`: Configuración de la estrategia personalizada.
  - `example1.js`, `example2.js`: Ejemplos de estrategias de empresa.
  - `tests.js`: Suite de pruebas automatizadas.
- `tests.html`: Ejecutor de pruebas.

## Cómo añadir una nueva empresa

1. Crea un nuevo archivo en `scripts/` (ej: `mi_empresa.js`).
2. Usa la función `registerStrategy` para definir la configuración:
   ```javascript
   registerStrategy({
       name: 'mi_empresa',
       label: 'Nombre Visible de la Empresa',
       defaults: { daysPerYear: 33 },
       isDaysEditable: false,
       showBonus: true,
       showBenefits: true,
       extras: [], // Array de objetos {years: 5, amount: 1000}
       isExtrasEditable: false
   });
   ```
3. Importa el script en `index.html`:
   ```html
   <script src="scripts/mi_empresa.js"></script>
   ```

## Tests

Para verificar el correcto funcionamiento de la calculadora, abre el archivo `tests.html` en tu navegador.
