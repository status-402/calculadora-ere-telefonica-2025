# Calculadora ERE

Una herramienta web sencilla y eficaz para calcular estimaciones de indemnización en procesos de ERE (Expediente de Regulación de Empleo).

> **⚠️ AVISO IMPORTANTE**: Esta calculadora proporciona datos aproximados y **no tiene validez legal**. Para cálculos oficiales y asesoramiento legal, consulte con profesionales especializados.

## Características

- **Cálculo Basado en Meses**: Sistema de cálculo mensual más preciso que cuenta los meses completos desde la fecha de inicio hasta la fecha de fin.
- **Cálculo de Indemnización**: Basado en salario bruto y días por año estipulados.
- **Pagos Fraccionados**: Posibilidad de configurar fechas de pago para dividir el importe total en plazos.
- **Topes Legales**: Soporte para limitar la indemnización a un máximo de mensualidades (ej. 12 meses).
- **Primas por Antigüedad**: Configuración de tramos de antigüedad para añadir importes extra.
  - El cálculo respeta el límite de días (mensualidades × 30) si se excede.
  - Se aplica como 30 días por cada mes por STS de 18-2-2016, recurso 3257/2014, ECLÍ:ES:TS:2016:893. Más información en las fuentes.
- **Sistema de Estrategias Extensible**:
  - **Personalizado**: Permite ajustar todos los parámetros (días/año, bonus, beneficios, etc.).
  - **Perfiles de Empresa**: Fácilmente configurables mediante archivos JS independientes.
- **Cálculo Automático de Periodo**: 
  - Introduce fechas de inicio y fin.
  - El sistema calcula automáticamente los meses trabajados.
  - Si el día de inicio ≤ día de fin, se suma 1 mes al cálculo.
- **Desglose Detallado**: 
  - Salario diario calculado a partir del salario bruto + bonus + beneficios.
  - Días de indemnización por mes (conversión automática de días/año).
  - Explicación completa del cálculo final.
- **Cálculo de Indemnización Exenta de Impuestos**:
  - Calcula automáticamente la indemnización exenta según la normativa de despido improcedente.
  - Divide el periodo en dos: hasta 11/02/2012 (×3.75) y desde 12/02/2012 (×2.75).
  - Aplica el límite legal de 180.000€.
  - Muestra el desglose detallado del cálculo por periodos.
- **Validación de Fechas**: Indicación visual cuando la fecha de fin es anterior a la fecha de inicio.
- **Renta Irregular**:
  - Detecta automáticamente si se tiene derecho a la reducción del 30% por renta irregular.
  - Compara la antigüedad con los años de cobro (debe superar el doble de años de cobro más un día).
  - Muestra claramente si aplica o no la reducción.
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

### Cálculo de Indemnización Exenta de Impuestos

La calculadora determina la cantidad máxima exenta de tributación según la normativa de despido improcedente:

1. **División del Periodo**: Se divide el periodo laboral en dos tramos:
   - **Periodo 1** (hasta 11/02/2012): Meses × 3.75 días/mes = Días totales periodo 1
   - **Periodo 2** (desde 12/02/2012): Meses × 2.75 días/mes = Días totales periodo 2
2. **Aplicación de Límites por Periodo**:
   - **Periodo 1**: Limitado a 42 meses × 30 días = 1.260 días máximo
   - **Periodo 2**: El total acumulado (Periodo 1 + Periodo 2) no puede exceder 24 meses × 30 días = 720 días
3. **Cálculo del Importe**: 
   - Importe Periodo 1 = Días limitados Periodo 1 × Salario Diario
   - Importe Periodo 2 = Días limitados Periodo 2 × Salario Diario
4. **Aplicación del Límite Total**: Se aplica un tope máximo de **180.000€**

**Ejemplo**:
- Fecha inicio: 01/01/2010, Fecha fin: 01/01/2015 (25 meses periodo 1, 35 meses periodo 2)
- Salario diario: 100€
- Periodo 1: 25 meses × 3.75 días/mes = 93.75 días → 93.75 días × 100€ = 9.375€
- Periodo 2: 35 meses × 2.75 días/mes = 96.25 días
  - Total acumulado: 93.75 + 96.25 = 190 días
  - Límite periodo 2: 720 días (total) – 93.75 días (periodo 1) = 626.25 días disponibles
  - Como 96.25 < 626.25, se usan los 96.25 días → 96.25 × 100€ = 9.625€
- Total exento: 9.375€ + 9.625€ = 19.000€ (bajo el límite de 180.000€)

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
    ├── voluntary.js        # Perfil Voluntario TID, TSA TGS
    ├── forced.js           # Perfil Forzado TID, TSA TGS
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
           endDate: '2024-12-31', // Opcional, actualizado
           maxCompensationMonths: 24, // Opcional
           benefits: 1200,        // Opcional
           paymentDates: ['2025-06-01', '2026-06-01'], // Fechas para pagos fraccionados
           extras: [              // Opcional, actualizado
               { years: 10, amount: 5000 }
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
