import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { PayrollForm } from './components/payroll-form/payroll-form';
import { PayrollResultComponent } from './components/payroll-result/payroll-result';
import { PayrollService } from './services/payroll.service';
import { PayrollInput, PayrollResult } from './models/payroll.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, PayrollForm, PayrollResultComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private payrollService = inject(PayrollService);
  
  protected payrollResult = signal<PayrollResult | undefined>(undefined);

  protected calculationError = signal('');
  onCalculate(input: PayrollInput) {
    try {
      this.payrollResult.set(this.payrollService.calculatePayroll(input));
      this.calculationError.set('');
    } catch (error) {
      this.payrollResult.set(undefined);
      this.calculationError.set(error instanceof Error ? error.message : 'Revise los datos introducidos.');
    }
  }
}
