import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RespuestaAuditoria } from '../models/persona.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private readonly api = inject(ApiService);

  getRecentEvents(): Observable<RespuestaAuditoria> {
    return this.api.get<RespuestaAuditoria>('/auditoria');
  }
}
