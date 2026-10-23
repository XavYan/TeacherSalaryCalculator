import type { jsPDF } from 'jspdf';
import { regular, bold } from './pdf-fonts/fonts';
import type { PayrollResult } from '../models/payroll.model';
import complementos from '../../assets/data/complementos.json';

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const clean = (value: string) => value.replace(/[\u2010-\u2015]/g, '-').replace(/[\u00a0\u202f]/g, ' ');
const euro = (value: number) => clean(new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value));
export const payrollPdfFilename = (r: PayrollResult) => `simulacion-nomina-${r.input.anio}-${String(r.input.mes).padStart(2, '0')}.pdf`;

/** Writes an immutable calculated snapshot, never the current (possibly edited) form. */
export function buildPayrollPdf(doc: jsPDF, r: PayrollResult): jsPDF {
  doc.addFileToVFS('DejaVuSans.ttf', regular);
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', bold);
  doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');
  const input = r.input, d = r.detalleDevengos, c = r.detalleDeducciones, extra = r.pagaExtraDetalle;
  const left = 18, right = 192, bottom = 273;
  let y = 0;
  const text = (value: string, x: number, at: number, options = {}) => doc.text(clean(value), x, at, options);
  const header = () => {
    doc.setFillColor(22, 57, 91); doc.rect(0, 0, 210, 31, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('DejaVuSans', 'bold'); doc.setFontSize(16);
    text('Simulación de nómina docente', left, 14);
    doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(10);
    text(`Canarias 2026 | ${meses[input.mes - 1]} ${input.anio}`, left, 23);
    doc.setTextColor(35, 45, 55); y = 41;
  };
  const space = (height: number) => { if (y + height > bottom) { doc.addPage(); header(); } };
  const section = (title: string, minimum = 23) => {
    space(minimum); y += 3;
    doc.setFillColor(231, 239, 247); doc.rect(left, y - 5, right - left, 9, 'F');
    doc.setFont('DejaVuSans', 'bold'); doc.setFontSize(10); text(title, left + 3, y + 1); y += 10;
  };
  const row = (label: string, value: string, bold = false) => {
    doc.setFont('DejaVuSans', bold ? 'bold' : 'normal'); doc.setFontSize(9);
    const labels: string[] = doc.splitTextToSize(clean(label), 119);
    const values: string[] = doc.splitTextToSize(clean(value), 47);
    const height = Math.max(labels.length, values.length) * 4.5 + 3;
    space(height);
    doc.setFont('DejaVuSans', bold ? 'bold' : 'normal'); doc.setFontSize(9);
    text(labels.join('\n'), left + 2, y);
    text(values.join('\n'), right - 2, y, { align: 'right' });
    y += height;
    doc.setDrawColor(224, 230, 235); doc.line(left, y - 3, right, y - 3);
  };
  const amount = (label: string, value: number, bold = false) => row(label, euro(value === 0 ? 0 : value), bold);
  const paragraph = (value: string) => {
    doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(8.5);
    const lines: string[] = doc.splitTextToSize(clean(value), right - left - 4);
    for (const line of lines) { space(4.3); doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(8.5); text(line, left + 2, y); y += 4.3; }
    y += 3;
  };
  doc.setProperties({ title: `Simulación de nómina - ${meses[input.mes - 1]} ${input.anio}`, subject: 'Estimación de retribuciones docentes de Canarias', author: 'Calculadora de Nómina Docente' });
  header();
  section('Resumen');
  amount('Bruto ordinario', r.totalDevengado);
  amount('Deducciones ordinarias', r.totalDeducciones);
  amount('Neto ordinario mensual', r.salarioNeto, true);
  amount('Paga extra neta estimada (separada del neto ordinario)', r.pagaExtraNeta, true);
  section('Datos de la simulación');
  row('Cuerpo', input.cuerpo); row('Isla', input.isla);
  row('Días retribuidos / jornada', `${input.diasTrabajados} días / ${input.porcentajeJornada ?? input.horasSemanales / 18 * 100}%`);
  row('Trienios / sexenios', `${input.trienios} / ${input.sexenios}`);
  row('Retención IRPF / devengo semestral de extra', `${input.irpf}% / ${input.porcentajeDevengoExtra ?? 100}%`);
  row('Régimen', input.regimen === 'pasivos' ? 'MUFACE y Clases Pasivas' : 'Régimen General (interinos)');
  if (input.cargoDirectivo) {
    row('Familia de centro', input.familiaCentro ?? '');
    row('Cargo / tipo de centro', `${input.cargoDirectivo} / ${input.tipoCentro}`);
    const clasificacion = complementos['clasificacion centros'] as Record<string, Record<string, string>>;
    paragraph(`Clasificación: ${clasificacion[input.familiaCentro ?? '']?.[input.tipoCentro] ?? input.tipoCentro}.`);
  }
  row('Compatibilidad privada', input.compatibilidadPrivada ? `Sí / ${input.diasCompatibilidad} días` : 'No');
  if (input.compatibilidadPrivada) amount('Reducción mensual autorizada a jornada completa', input.importeReduccionCompatibilidad ?? 0);
  section('Devengos ordinarios');
  amount('Sueldo base', d.sueldoBase); amount('Trienios', d.trienios); amount('Sexenios', d.sexenios);
  amount('Complemento de destino', d.complementoDestino); amount('Complemento específico', d.complementoEspecifico);
  amount('Residencia', d.residencia); amount('Cargo directivo', d.cargoDirectivo);
  for (const item of d.otrosCargosList) {
    const cantidad = input.cantidadesComplementos?.[item.nombre];
    const unidades = item.nombre === 'Itinerancia (€/km)' ? 'km' : 'horas';
    const variable = item.nombre === 'Itinerancia (€/km)' || item.nombre.startsWith('Hora lectiva complementaria');
    amount(item.nombre + (variable && cantidad !== undefined ? ` (${cantidad} ${unidades})` : ''), item.importe);
  }
  amount('Otros complementos - subtotal (incluido arriba)', d.otrosCargos);
  amount('Reducción por compatibilidad', -d.reduccionCompatibilidad);
  amount('Total devengado ordinario', r.totalDevengado, true);
  section('Bases y deducciones ordinarias');
  amount('Base sujeta a IRPF', c.baseIRPF);
  amount('Base de contingencias comunes', c.basesCotizacion.contingenciasComunes);
  amount('Base de contingencias profesionales / desempleo / FP', c.basesCotizacion.contingenciasProfesionales);
  amount(`Retención IRPF (${input.irpf}%)`, c.irpf);
  const ss = c.seguridadSocialDetalle;
  if (input.regimen === 'pasivos') { amount('MUFACE', ss.muface); amount('Clases Pasivas', ss.pasivos); }
  else {
    amount('Contingencias comunes + MEI (4,85%)', ss.contingenciasComunes);
    amount('Desempleo (1,55%)', ss.desempleo);
    amount('Formación profesional (0,10%)', ss.formacionProfesional);
    amount('Cotización de solidaridad', ss.solidaridad);
  }
  amount('Cotizaciones y cuotas - subtotal', c.seguridadSocial);
  amount('Total deducciones ordinarias', r.totalDeducciones, true);
  amount('Neto ordinario mensual', r.salarioNeto, true);
  section('Paga extraordinaria estimada');
  amount('Sueldo base extra', extra.sueldoBase); amount('Trienios extra', extra.trienios);
  amount('Sexenios extra', extra.sexenios); amount('Complemento de destino extra', extra.destino);
  amount('Complemento específico extra', extra.especifico);
  amount('Bruto de la extra', r.pagaExtraBruta, true);
  amount(`Retención IRPF de la extra (${input.irpf}%)`, r.pagaExtraIrpf);
  amount('Cuotas adicionales MUFACE / Clases Pasivas', r.pagaExtraCuotas);
  amount('Neto de la extra', r.pagaExtraNeta, true);
  section('Alcance y fuentes', 80);
  paragraph('Simulación informativa, sin validez de nómina oficial. Los importes corresponden a la última simulación calculada, con el porcentaje de IRPF indicado por el usuario.');
  paragraph('La extra se muestra separada del neto ordinario y depende del devengo semestral y la jornada indicados. Incluye los conceptos desglosados en la guía; no incluye extras de cargos u otros complementos.');
  paragraph('En Régimen General las extras cotizan mediante prorrata mensual. En MUFACE/Clases Pasivas se contemplan cuotas adicionales en las extras. El régimen mixto MUFACE + pensiones del Régimen General no está incluido.');
  paragraph('Cambios de jornada, nombramiento o complementos durante el semestre, atrasos, liquidaciones y bases particulares a jornada parcial requieren cálculo individual. La itinerancia presupone desplazamientos justificados dentro de los límites exentos.');
  paragraph('Importes: guía STEC-IC, febrero de 2026. Cotizaciones: Orden PJC/297/2026.');
  const source = 'https://www.stec.es/stec/archivos_subidos/gal_descargas/2/_214.pdf';
  paragraph(source);
  const pages = doc.getNumberOfPages();
  for (let n = 1; n <= pages; n++) {
    doc.setPage(n); doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(8); doc.setTextColor(90, 105, 120);
    doc.setDrawColor(210, 220, 230); doc.line(left, 282, right, 282);
    text('Calculadora de Nómina Docente | Simulación informativa', left, 288);
    text(`${n} / ${pages}`, right, 288, { align: 'right' });
  }
  return doc;
}
