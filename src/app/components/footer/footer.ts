import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="bg-dark text-white text-center py-4 mt-5">
      <div class="container">
        <p class="mb-0">&copy; 2024 Nómina Docente. Todos los derechos reservados.</p>
        <small class="text-secondary">Diseñado con <i class="bi bi-heart-fill text-danger"></i> para educadores</small>
      </div>
    </footer>
  `,
  styles: `
    footer {
      width: 100%;
    }
  `,
})
export class Footer {}
