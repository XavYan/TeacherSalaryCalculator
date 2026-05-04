import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <a class="navbar-brand" href="#">
          <i class="bi bi-calculator-fill me-2"></i>Nómina Docente
        </a>
      </div>
    </nav>
  `,
  styles: `
    .navbar-brand {
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  `,
})
export class Header {}
