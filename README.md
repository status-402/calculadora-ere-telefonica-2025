# Calculadora ERE

Una herramienta web sencilla y eficaz para calcular estimaciones de indemnización en procesos de ERE (Expediente de Regulación de Empleo).

> **⚠️ AVISO IMPORTANTE**: Esta calculadora proporciona datos aproximados y **no tiene validez legal**. Para cálculos oficiales y asesoramiento legal, consulte con profesionales especializados.

## Características

- **Cálculo Basado en Meses**: Sistema de cálculo mensual más preciso que cuenta los meses completos desde la fecha de inicio hasta la fecha de fin.
- **Indemnización Completa**: Basado en salario bruto anual, beneficios, y antigüedad en meses.
- **Límite de Indemnización**:
  - Soporte para establecer un tope máximo de mensualidades.
  - El cálculo respeta el límite de días (mensualidades × 30) si se excede.
  - Se aplica como 30 días por cada mes por STS de 18-2-2016, recurso 3257/2014, ECLÍ:ES:TS:2016:893. Más información en las fuentes.
- **Sistema de Estrategias Extensible**:
  - **Personalizado**: Permite ajustar todos los parámetros (días/año, bonus, beneficios, etc.).
  - **Perfiles de Empresa**: Fácilmente configurables mediante archivos JS independientes.
- **Primas por Antigüedad**:
  - Sistema flexible para añadir reglas de bonus extra según años trabajados.
- **Cálculo Automático de Periodo**: 
  - Introduce fechas de inicio y fin.
  - El sistema calcula automáticamente los meses trabajados.
  - Si el día de inicio ≤ día de fin, se suma 1 mes al cálculo.
- **Desglose Detallado**: 
  - Salario diario calculado a partir del salario bruto + bonus + beneficios.
  - Días de indemnización por mes (conversión automática de días/año).
  - Explicación completa del cálculo final.
- **Privacidad Total**: Todo el cálculo se realiza en el navegador del cliente. Ningún dato es enviado a servidores externos.

## Metodología de Cálculo

La calculadora utiliza el siguiente método:

1. **Salario Diario** = (Salario Bruto Anual + Bonus + Beneficios) / 365
2. **Días por Mes** = Días por Año / 12
3. **Meses Trabajados** = Calculados desde fecha inicio hasta fecha fin
4. **Aplicación de Topes**: Si existe un límite de mensualidades, la indemnización se ajusta al máximo de (Mensualidades Máximas × 30) días de salario.
5. **Indemnización** = Salario Diario × (Min(Días por Mes × Meses Trabajados, Tope Días)) + Primas

### Cálculo de Meses

El sistema cuenta los meses entre las fechas de la siguiente manera:
- Se calcula la diferencia de meses ignorando los días
- Si el día de inicio ≤ día de fin, se añade 1 mes adicional

**Ejemplo**: 
- Inicio: 15/01/2023, Fin: 20/03/2023 → 2 meses + 1 = **3 meses**
- Inicio: 20/01/2023, Fin: 15/03/2023 → 2 meses = **2 meses**

## Fuentes de Referencia Legal

Este proyecto se basa en las directrices y regulaciones españolas sobre indemnizaciones por extinción de contrato:

- **[Calculadora Oficial del Poder Judicial](https://www.poderjudicial.es/cgpj/es/Servicios/Utilidades/Calculo-de-indemnizaciones-por-extincion-de-contrato-de-trabajo/)**: Herramienta oficial del Consejo General del Poder Judicial.

- **[Guía Práctica Legal y Jurisprudencial](https://www.poderjudicial.es/stfls/CGPJ/UTILIDADES/Gu%C3%ADa%20pr%C3%A1ctica%20legal%20y%20jurisprudencial%20c%C3%A1lculo%20indemnizaciones_octubre2024.pdf)** (Octubre 2024): Documento oficial que explica los cálculos y las leyes aplicables.

## Tecnologías

- HTML5 / CSS3
- JavaScript (ES6+)
- [Alpine.js](https://alpinejs.dev/) v3.x - Framework reactivo para la interfaz de usuario
- Sin dependencias de backend - 100% cliente

## Uso

### Uso Local
Simplemente abre el archivo `index.html` en cualquier navegador web moderno.

### Uso Web
Accede a la aplicación desplegada o clona este repositorio y ábrelo localmente.

## Estructura del Proyecto

```
calculadoraEre/
├── index.html              # Punto de entrada de la aplicación
├── tests.html              # Suite de pruebas automatizadas
├── css/
│   └── styles.css          # Estilos de la aplicación
└── scripts/
    ├── registry.js         # Sistema de registro de estrategias
    ├── main.js             # Lógica principal de la calculadora
    ├── custom.js           # Estrategia personalizable
    ├── example1.js         # Ejemplo de perfil de empresa 1
    ├── example2.js         # Ejemplo de perfil de empresa 2
    └── tests.js            # Tests automatizados
```

## Cómo Añadir una Nueva Empresa

1. Crea un nuevo archivo en `scripts/` (ej: `mi_empresa.js`).
2. Usa la función `registerStrategy` para definir la configuración:
   ```javascript
   registerStrategy({
       name: 'mi_empresa',
       label: 'Nombre Visible de la Empresa',
       defaults: { 
           daysPerYear: 33,
           endDate: '2026-12-31', // Opcional
           maxCompensationMonths: 24, // Opcional
           benefits: 1200,        // Opcional
           extras: [              // Opcional
               { years: 5, amount: 10000 },
               { years: 10, amount: 20000 }
           ]
       },
       isDaysEditable: false,
       isEndDateEditable: false,
       showBonus: true,
       showBenefits: true,
       isBenefitsEditable: false,
       isExtrasEditable: false,
       isMaxCompensationMonthsEditable: false // Opcional
   });
   ```
3. Importa el script en `index.html`:
   ```html
   <script src="scripts/mi_empresa.js"></script>
   ```

## Tests

Para verificar el correcto funcionamiento de la calculadora, abre el archivo `tests.html` en tu navegador.

## Licencia

Todos los derechos reservados. El uso de este software requiere autorización explícita del autor.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.

## Disclaimer

Esta calculadora es una herramienta orientativa y no sustituye el asesoramiento legal profesional. Los resultados son estimaciones y pueden no reflejar con exactitud casos individuales o situaciones especiales. Para cálculos oficiales, consulte con un abogado laboralista o utilice las herramientas oficiales del Poder Judicial.
