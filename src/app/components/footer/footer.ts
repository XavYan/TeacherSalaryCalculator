import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="bg-dark text-white text-center py-4 mt-5">
      <div class="container">
        <p class="mb-2">&copy; 2026 Nómina Docente. Todos los derechos reservados.</p>
        <p class="mb-2 small">
          <a href="https://www.stec.es/stec/archivos_subidos/gal_descargas/2/_214.pdf" target="_blank" rel="noopener" class="text-info text-decoration-none">
            <i class="bi bi-file-earmark-pdf me-1"></i> Fuente: Guía de retribuciones STEC-IC (febrero 2026)
          </a>
        </p>
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
