# Calculadora de Nómina Docente (Canarias 2026) 🎓💰

Esta aplicación es una herramienta avanzada diseñada para que el personal docente de la Comunidad Autónoma de Canarias pueda calcular su salario neto de forma precisa, transparente y actualizada a la normativa de **2026**.

La información salarial y los componentes de la nómina se basan en las tablas oficiales publicadas por el **STEC-IC**, disponibles en este [enlace oficial (PDF)](https://www.stec.es/stec/archivos_subidos/gal_descargas/2/_214.pdf).

## 🚀 Características Principales

- **Actualizado a 2026**: Incluye las últimas tablas salariales y porcentajes de cotización.
- **Multicuerpo**: Soporte para distintos cuerpos docentes (Maestros, Secundaria, Catedráticos, etc.).
- **Gestión de Trienios y Sexenios**:
  - Cálculo automático de trienios con suplemento por islas no capitalinas.
  - Integración del Complemento de Formación Permanente (Sexenios) según la tabla oficial.
- **Cálculo de Pagas Extras**:
  - Desglose detallado del bruto de la paga extra.
  - Cálculo del importe neto estimado tras retenciones.
- **Transparencia en Deducciones**:
  - Cálculo de bases de cotización (CC y CP) incluyendo el prorrateo de pagas extras.
  - Desglose de cuotas obreras de la Seguridad Social (Contingencias Comunes, Desempleo y FP).
  - Simulación de retención de IRPF personalizada.
- **Reducción por Compatibilidad**: Implementación de la regla del 30% para compatibilizar el puesto con actividad privada.
- **Interfaz Moderna**: Diseño premium basado en Angular (Standalone, Signals) con Bootstrap 5 y animaciones fluidas.

## 🛠️ Tecnologías Utilizadas

- **Core**: Angular 21 (Signals, Standalone Components).
- **Estilos**: Bootstrap 5, Bootstrap Icons, Animate.css.
- **Datos**: JSON data-driven architecture para salarios y complementos.

## 💻 Desarrollo

### Servidor de Desarrollo

Para iniciar el servidor local de desarrollo:

```bash
npm run dev
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente al detectar cambios.

### Construcción (Build)

Para generar el bundle de producción:

```bash
npm run build
```

Los artefactos se almacenarán en el directorio `dist/`.

## 📄 Licencia

Este proyecto es una herramienta informativa. Los cálculos son estimaciones y no tienen validez legal oficial. Se recomienda contrastar los resultados con la nómina emitida por la Consejería de Educación.
