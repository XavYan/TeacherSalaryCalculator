# Revisión de retribuciones de Canarias 2026

Fuente principal: [guía STEC-IC, actualización febrero de 2026](https://www.stec.es/stec/archivos_subidos/gal_descargas/2/_214.pdf), páginas 1–3. La página 4 contiene pensiones, fuera del cálculo de nómina de esta aplicación.

## Importes comprobados

Los cinco cuerpos coinciden con la guía en sueldo, destino, específico, residencia, trienios, suplemento no capitalino, extra y sexenios. Se conservan las diferencias de céntimos entre destino ordinario y extra que imprime el PDF. Los sexenios son importes acumulados (por ejemplo, dos sexenios = 119 €/mes), no sumas de escalones.

Se han corregido las tablas de cargos directivos y separado de coordinación de escuelas rurales. El centro se selecciona independientemente del cuerpo docente. Los guiones del PDF significan que la combinación no está disponible; nunca se transforman en un cargo con importe cero.

| Tipo | CER/CEIP/EE/Adultos: unidades | IES/EEAA: alumnado | EEOOII: alumnado |
| --- | --- | --- | --- |
| A | Más de 35 | 1650 o más | 3000 o más |
| B | 27–35 | 901–1649 | 2000–2999 |
| C | 18–26 | 581–900 | 1000–1999 |
| D | 9–17 | Hasta 580 | Hasta 999 |
| E | 6–8 | No existe en la tabla | No existe en la tabla |
| F | 1–5 | No existe en la tabla | No existe en la tabla |

El encabezado del PDF incluye también Medias y A distancia; los umbrales de alumnado aparecen rotulados como IES/EEAA y EEOOII. No se inventan equivalencias para centros con clasificación singular.

Los 24 conceptos de otros cargos originales coinciden con el PDF. Se añaden conservatorio superior, coordinación rural y comedor (18 importes). Los tramos se conservan literalmente: el documento deja sin aclarar exactamente 300 comensales y exactamente 1000 alumnos para vicesecretaría. La interfaz lo advierte.

## Cálculos y decisiones

- Jornada mediante porcentaje retribuido. No se presupone que 18 horas lectivas equivalgan a jornada completa para todos los cuerpos. El servicio conserva el formato antiguo para llamadas existentes.
- Mensualidades: factor días/30 × porcentaje de jornada. Redondeo por concepto a céntimos antes de sumar; esto puede producir un céntimo de diferencia respecto a multiplicar el total agregado.
- Extra: sueldo extra + trienios extra + destino extra + específico extra + sexenio extra. Se calculan por separado junio y diciembre del año seleccionado, intersectando las fechas inclusivas del contrato con 1 de diciembre anterior–31 de mayo y 1 de junio–30 de noviembre. Cada mes natural completo aporta 1/6 y cada día de mes incompleto 1/180, hasta 100%, conforme a la [guía de Intervención General, II.4.B, 5.2.a](https://www.gobiernodecanarias.org/hacienda/intervencion/servicios/guia_rrhh/libro2/ii4b.jsp). La fracción exacta se aplica al dinero; solo se redondea el porcentaje mostrado. Es una previsión del contrato completo, no del tiempo transcurrido hasta hoy. El mes de simulación no cambia las dos extras del año. Al cese la parte devengada puede liquidarse anticipadamente. Los días de diciembre devengan para junio siguiente. Se presupone una jornada constante. No se añade residencia ni suplemento insular del trienio a la extra.
- Prorrata mensual de extras para cotización: extra íntegra a jornada actual / 6, proporcional a los días en alta del mes. Las fechas de contrato que determinan el devengo de las dos extras no reducen la prorrata mensual de cotización del mes simulado.
- Kilómetros y horas complementarias se multiplican por unidades realmente realizadas en el mes, sin volver a reducirlas por jornada o días. La itinerancia de 0,26 €/km se trata como desplazamiento justificado exento (no desplazamiento domicilio-trabajo).
- IRPF: porcentaje introducido por el usuario aplicado a la base sujeta. No calcula el porcentaje fiscal personal ni regularizaciones.
- RG interinos: 4,85% de la guía = CC 4,70% + MEI 0,15%; además desempleo 1,55% y FP 0,10%. No se añade dos veces el MEI. Topes y solidaridad según [Orden PJC/297/2026, artículos 2, 3, 16 y 17](https://www.boe.es/buscar/act.php?id=BOE-A-2026-7296). Máximo mensual 5101,20 €, proporcional a días en alta; no se reduce por jornada parcial. Mínimos orientativos de grupos 1/A1 y 2/A2 proporcionales a jornada; las jornadas parciales con horas/días de alta particulares requieren cálculo individual.
- MUFACE/Clases Pasivas: cuotas del PDF A1 51,68 + 118,04 €, A2 40,68 + 92,90 €, más las cuotas adicionales de la extra. La doble cuota está descrita en [MUFACE](https://www.muface.es/muface_Home/es/mutualistas/cotizacion/Regimen-de-Cotizaciones.html) y [Clases Pasivas](https://www.portalclasespasivas.gob.es/sitios/clasespasivas/es-ES/Paginas/cuotaderechospasivos.aspx). No se usa el 6,50% del Régimen General. No se modela el régimen mixto MUFACE + pensiones RG.
- Compatibilidad: la fórmula anterior sumaba trienios al límite del 30%, aunque el [artículo 16.4 de la Ley 53/1984](https://www.boe.es/buscar/act.php?id=BOE-A-1985-151#a16) excluye la antigüedad. Como la guía no determina la reducción individual autorizada, ahora se introduce la reducción mensual de la resolución a jornada completa, y se aplica según días y jornada. No se presume autorización por marcar una casilla.

## Alcance y límites

La guía no permite asegurar una nómina universal exacta: no desglosa extras de cargos/complementos, variaciones durante el semestre, atrasos, liquidaciones, bases particulares a tiempo parcial ni todos los regímenes de cotización. La extra mostrada incluye solo los conceptos expresamente desglosados en su tabla. La aplicación lo declara en el resultado; los cargos ordinarios sí se calculan con sus tablas completas. Tampoco determina si dos cargos son acumulables: solo deben elegirse los reconocidos y compatibles.

El año se limita a 2026 para evitar presentar las mismas tablas como si fueran de cualquier ejercicio. La pensión no se calcula.

## Verificación

`npm test -- --watch=false` comprueba los cinco totales mensuales en ambos grupos de islas, cinco extras, trienios, seis niveles de sexenios, todas las celdas de las dos tablas directivas, combinaciones no disponibles, jornada/días, unidades, cuotas, topes, validaciones y redondeo. El flujo de publicación ejecuta las pruebas antes de compilar y desplegar.

El despliegue de GitHub Pages se genera desde `src` por GitHub Actions. Las copias históricas de `docs` y `dist` del repositorio no son la fuente del artefacto publicado por ese flujo.
