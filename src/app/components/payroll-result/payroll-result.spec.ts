import { TestBed } from '@angular/core/testing';
import { PayrollResultComponent } from './payroll-result';
import { PayrollService } from '../../services/payroll.service';

describe('Resultado anual de pagas extraordinarias', () => {
  it('muestra junio y diciembre con devengos distintos y fechas inclusivas', async () => {
    await TestBed.configureTestingModule({ imports:[PayrollResultComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PayrollResultComponent);
    fixture.componentInstance.result = new PayrollService().calculatePayroll({
      cuerpo:'Secundaria', isla:'Tenerife', mes:10, anio:2026, diasTrabajados:30, horasSemanales:18,
      porcentajeJornada:100, fechaInicioContrato:'2026-09-15', fechaFinContrato:'2027-08-15',
      cargoDirectivo:'', tipoCentro:'D', complementos:[], irpf:20, trienios:0, sexenios:0,
      compatibilidadPrivada:false, diasCompatibilidad:0, mostrarMesCompleto:true
    });
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Paga Extra de Junio 2027');
    expect(content).toContain('Paga Extra de Diciembre 2026');
    expect(content).toContain('Devengo: 100%');
    expect(content).toContain('Devengo: 58.89%');
    expect(content).toContain('15/09/2026 - 15/08/2027');
    expect(content).toContain('Paga Extra de Diciembre 2027');
    expect(content).toContain('Mes completo (30 días retribuidos)');
    expect(content).toContain('Liquidación al finalizar el contrato');
    expect(content).toContain('Totales por año del contrato');
    expect(content).toContain('Vacaciones pendientes (12.58 días)');
  });
});
