import { TestBed } from '@angular/core/testing';
import { PayrollResultComponent } from './payroll-result';
import { PayrollService } from '../../services/payroll.service';

describe('Resultado anual de pagas extraordinarias', () => {
  it('muestra junio y diciembre con devengos distintos y fechas inclusivas', async () => {
    await TestBed.configureTestingModule({ imports:[PayrollResultComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PayrollResultComponent);
    fixture.componentInstance.result = new PayrollService().calculatePayroll({
      cuerpo:'Secundaria', isla:'Tenerife', mes:10, anio:2026, diasTrabajados:30, horasSemanales:18,
      porcentajeJornada:100, fechaInicioContrato:'2026-09-15', fechaFinContrato:'2027-08-31',
      cargoDirectivo:'', tipoCentro:'D', complementos:[], irpf:20, trienios:0, sexenios:0,
      compatibilidadPrivada:false, diasCompatibilidad:0
    });
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Paga Extra de Junio 2026');
    expect(content).toContain('Paga Extra de Diciembre 2026');
    expect(content).toContain('Devengo: 0%');
    expect(content).toContain('Devengo: 42.22%');
    expect(content).toContain('15/09/2026 - 31/08/2027');
  });
});
