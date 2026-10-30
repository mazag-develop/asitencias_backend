import { isPlatformBrowser, NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AsistenciaScanResponse } from '../../../core/models/asistencia.model';
import { TipoPersona } from '../../../core/models/persona.model';
import { AsistenciasService } from '../../../core/services/asistencias.service';

type ScreenState = 'idle' | 'success' | 'duplicate' | 'error';

interface HistoryRow {
  id: string;
  nombre: string;
  codigo: string;
  hora: string;
  resultado: 'success' | 'duplicate' | 'error';
}

@Component({
  selector: 'app-asistencia-scan-page',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `
    <section class="kiosk-screen" [ngClass]="screenState()">
      <div class="topbar">
        <div>
          <p class="eyebrow">Sistema escolar</p>
          <h1>CONTROL DE ASISTENCIA</h1>
        </div>
        <div class="topbar-right">
          <span class="indicator">{{ connectionState() }}</span>
          <span class="clock">{{ currentTime() }}</span>
        </div>
      </div>

      <div class="date-row">
        <span>{{ currentDate() }}</span>
      </div>

      <div class="card">
        <div class="prompt">{{ screenState() === 'idle' ? 'Lector preparado.' : 'Resultado de lectura' }}</div>
        <div class="icon-block" [ngClass]="screenState() === 'idle' ? 'idle' : screenState()">
          {{ iconText }}
        </div>

        @if (screenState() === 'idle') {
          <h2>BIENVENIDO</h2>
          <p class="subtitle">Registra tu asistencia.</p>
          <div class="input-panel">
            <label for="scan-input">ESCANEA TU CÓDIGO</label>
            <input
              id="scan-input"
              #scanInput
              type="text"
              [(ngModel)]="scanValue"
              (keydown.enter)="submitScan()"
              (input)="onInputChange()"
              autocomplete="off"
              spellcheck="false"
              placeholder="Escanea tu código"
              aria-label="Código de asistencia"
            />
          </div>
          <div class="status-line">Esperando lectura...</div>
        } @else {
          <div class="result-block">
            <h2>{{ headline }}</h2>
            <p class="person-name">{{ personName() }}</p>
            <p class="person-type">{{ personType() }}</p>
            @if (screenState() === 'success') {
              <p class="info-line">Hora: {{ resultHour() }}</p>
            }
            @if (screenState() === 'duplicate') {
              <p class="info-line">Primera marcación: {{ resultHour() }}</p>
            }
            <p class="message">{{ message() }}</p>
          </div>
        }
      </div>

      <div class="history-panel">
        <div class="history-header">
          <h3>Últimas lecturas</h3>
          <span>{{ processing() ? 'Procesando...' : 'Listo' }}</span>
        </div>
        @if (history().length) {
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Hora</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              @for (item of history(); track item.id) {
                <tr>
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.codigo }}</td>
                  <td>{{ item.hora }}</td>
                  <td>
                    <span class="result-badge result-{{ item.resultado }}">
                      {{ item.resultado === 'success' ? 'OK' : item.resultado === 'duplicate' ? 'DUP' : 'ERR' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="empty-history">Sin lecturas aún.</p>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #081929 0%, #0f172a 50%, #12253d 100%);
      color: white;
      font-family: 'Segoe UI', Tahoma, sans-serif;
    }

    .kiosk-screen {
      min-height: 100vh;
      padding: 1.25rem clamp(1rem, 2vw, 2rem) 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .eyebrow {
      margin: 0;
      font-size: 0.75rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #a5d4ff;
    }

    h1 {
      margin: 0.2rem 0 0;
      font-size: clamp(1.6rem, 2vw, 2.3rem);
      letter-spacing: 0.08em;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .indicator,
    .clock,
    .date-row span {
      background: rgba(148, 163, 184, 0.12);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 999px;
      padding: 0.5rem 0.8rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #dbeafe;
    }

    .date-row {
      display: flex;
      justify-content: flex-end;
    }

    .card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 1.5rem;
      padding: clamp(1.1rem, 3vw, 2rem);
      box-shadow: 0 28px 60px rgba(2, 6, 23, 0.5);
      text-align: center;
      max-width: 980px;
      width: min(100%, 980px);
      margin: 0 auto;
    }

    .prompt {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #93c5fd;
      margin-bottom: 0.75rem;
    }

    .icon-block {
      width: 84px;
      height: 84px;
      display: grid;
      place-items: center;
      margin: 0 auto 1rem;
      border-radius: 20px;
      font-size: 2.1rem;
      font-weight: 800;
      background: rgba(59, 130, 246, 0.18);
      border: 1px solid rgba(147, 197, 253, 0.5);
    }

    .icon-block.idle { background: rgba(59, 130, 246, 0.18); color: #bfdbfe; }
    .icon-block.success { background: rgba(22, 163, 74, 0.2); color: #86efac; }
    .icon-block.duplicate { background: rgba(245, 158, 11, 0.18); color: #fbbf24; }
    .icon-block.error { background: rgba(220, 38, 38, 0.18); color: #fca5a5; }

    h2 {
      margin: 0;
      font-size: clamp(1.8rem, 4vw, 3rem);
      letter-spacing: 0.03em;
    }

    .subtitle {
      margin-top: 0.6rem;
      color: #cbd5e1;
      font-size: 1rem;
    }

    .input-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1.2rem;
      gap: 0.8rem;
    }

    .input-panel label {
      color: #bfdbfe;
      font-size: 0.8rem;
      letter-spacing: 0.14em;
      font-weight: 700;
    }

    input {
      width: min(100%, 420px);
      border: 2px solid rgba(96, 165, 250, 0.7);
      border-radius: 1rem;
      background: rgba(15, 23, 42, 0.9);
      color: white;
      padding: 1.05rem 1.25rem;
      font-size: clamp(1.1rem, 2vw, 1.5rem);
      text-align: center;
      outline: none;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    }

    .status-line {
      margin-top: 1rem;
      color: #bfdbfe;
      font-size: 0.9rem;
      letter-spacing: 0.04em;
    }

    .result-block {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.5rem;
    }

    .person-name {
      font-size: clamp(1.3rem, 2vw, 2.1rem);
      font-weight: 800;
      color: white;
      margin-top: 0.2rem;
    }

    .person-type,
    .info-line,
    .message {
      color: #e2e8f0;
      margin: 0;
    }

    .message {
      max-width: 680px;
      font-size: 1rem;
      line-height: 1.6;
      margin-top: 0.25rem;
    }

    .history-panel {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 1.2rem;
      width: min(100%, 980px);
      margin: 0 auto;
      padding: 1rem 1.2rem;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.8rem;
      color: #cbd5e1;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.92rem;
    }

    th,
    td {
      text-align: left;
      padding: 0.8rem 0.5rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      color: #e2e8f0;
    }

    th {
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.7rem;
    }

    .result-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 52px;
      border-radius: 999px;
      padding: 0.3rem 0.55rem;
      font-weight: 700;
      font-size: 0.7rem;
    }

    .result-success { background: rgba(22, 163, 74, 0.16); color: #86efac; }
    .result-duplicate { background: rgba(245, 158, 11, 0.14); color: #fcd34d; }
    .result-error { background: rgba(220, 38, 38, 0.14); color: #fca5a5; }

    .empty-history {
      margin: 0;
      color: #cbd5e1;
      padding: 0.5rem 0 0;
    }

    @media (max-width: 700px) {
      .topbar,
      .history-header {
        flex-direction: column;
        align-items: flex-start;
      }

      table {
        display: block;
        overflow-x: auto;
      }
    }
  `
})
export class AsistenciaScanPage implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly asistenciasService = inject(AsistenciasService);
  private readonly queue: string[] = [];
  private readonly historyLimit = 5;
  private processingQueue = false;
  private resetTimer: number | undefined;
  private autoSubmitTimer: ReturnType<typeof setTimeout> | undefined;
  private audioContext: AudioContext | null = null;

  @ViewChild('scanInput') private readonly scanInput?: ElementRef<HTMLInputElement>;

  readonly screenState = signal<ScreenState>('idle');
  readonly message = signal('Registra tu asistencia.');
  readonly personName = signal('');
  readonly personType = signal('');
  readonly resultHour = signal('');
  readonly currentTime = signal('00:00:00');
  readonly currentDate = signal('');
  readonly connectionState = signal('Servidor listo');
  readonly processing = signal(false);
  readonly history = signal<HistoryRow[]>([]);

  scanValue = '';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentDate.set(new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }));
      this.startClock();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.focusInput(), 80);
    }
  }

  ngOnDestroy(): void {
    if (this.autoSubmitTimer) {
      clearTimeout(this.autoSubmitTimer);
    }

    if (this.resetTimer && isPlatformBrowser(this.platformId)) {
      window.clearTimeout(this.resetTimer);
    }
  }

  onInputChange(): void {
    this.scanValue = this.scanValue.replace(/\s+/g, ' ').trim();

    if (this.autoSubmitTimer) {
      clearTimeout(this.autoSubmitTimer);
    }

    if (this.scanValue) {
      this.autoSubmitTimer = setTimeout(() => this.submitScan(), 350);
    }
  }

  submitScan(): void {
    if (this.autoSubmitTimer) {
      clearTimeout(this.autoSubmitTimer);
      this.autoSubmitTimer = undefined;
    }

    const normalized = this.scanValue.trim();
    if (!normalized) {
      this.screenState.set('error');
      this.message.set('CÓDIGO NO ENCONTRADO\nVerifique que su código esté registrado.');
      this.playErrorSound();
      this.scheduleReset();
      return;
    }

    this.queue.push(normalized);
    this.scanValue = '';
    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue) {
      return;
    }

    this.processingQueue = true;
    this.processing.set(true);

    while (this.queue.length > 0) {
      const nextCode = this.queue.shift() ?? '';
      if (!nextCode) {
        continue;
      }

      await this.processCode(nextCode);
    }

    this.processingQueue = false;
    this.processing.set(false);
    this.focusInput();
  }

  private processCode(code: string): Promise<void> {
    return new Promise((resolve) => {
      this.asistenciasService.scan(code).subscribe({
        next: (response: AsistenciaScanResponse) => {
          this.handleSuccess(response, code);
          resolve();
        },
        error: (error) => {
          this.handleError(error, code);
          resolve();
        }
      });
    });
  }

  private handleSuccess(response: AsistenciaScanResponse, code: string): void {
    const nombre = response.data.persona ?? 'Persona';
    const tipo = response.data.tipo ?? 'ESTUDIANTE';
    const hora = response.data.hora ?? '00:00:00';

    this.personName.set(nombre);
    this.personType.set(tipo);
    this.resultHour.set(hora);
    this.message.set('¡ASISTENCIA REGISTRADA!\nTu ingreso fue registrado correctamente.');
    this.screenState.set('success');
    this.playSuccessSound();
    this.addHistory({ nombre, codigo: code, hora, resultado: 'success' });
    this.scheduleReset();
  }

  private handleError(error: { status?: number; error?: { code?: string; message?: string; data?: { persona?: string; hora?: string; tipo?: string } } }, code: string): void {
    const payload = error?.error ?? {};
    const errorCode = payload.code ?? '';
    const nombre = payload.data?.persona ?? 'Persona';
    const tipo = payload.data?.tipo ?? 'ESTUDIANTE';
    const hora = payload.data?.hora ?? '00:00:00';

    this.personName.set(nombre);
    this.personType.set(tipo);
    this.resultHour.set(hora);

    if (error?.status === 409 || errorCode === 'ASISTENCIA_DUPLICADA') {
      this.screenState.set('duplicate');
      this.message.set('¡YA REGISTRASTE TU ASISTENCIA!\nTu asistencia ya fue registrada el día de hoy.');
      this.playDuplicateSound();
      this.addHistory({ nombre, codigo: code, hora, resultado: 'duplicate' });
      this.scheduleReset();
      return;
    }

    if (errorCode === 'PERSONA_INACTIVA') {
      this.screenState.set('error');
      this.message.set('PERSONA INACTIVA\nNo se puede registrar su asistencia.');
      this.playErrorSound();
      this.addHistory({ nombre, codigo: code, hora, resultado: 'error' });
      this.scheduleReset();
      return;
    }

    if (errorCode === 'CODIGO_NO_ENCONTRADO') {
      this.screenState.set('error');
      this.message.set('CÓDIGO NO ENCONTRADO\nVerifique que su código esté registrado.');
      this.playErrorSound();
      this.addHistory({ nombre: 'Código no encontrado', codigo: code, hora: new Date().toLocaleTimeString('es-PE', { hour12: false }), resultado: 'error' });
      this.scheduleReset();
      return;
    }

    this.screenState.set('error');
    this.message.set('SIN CONEXIÓN CON EL SERVIDOR\nNo se pudo verificar tu asistencia.');
    this.connectionState.set('Sin conexión');
    this.playErrorSound();
    this.addHistory({ nombre, codigo: code, hora: new Date().toLocaleTimeString('es-PE', { hour12: false }), resultado: 'error' });
    this.scheduleReset();
  }

  private scheduleReset(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.resetTimer) {
      window.clearTimeout(this.resetTimer);
    }

    this.resetTimer = window.setTimeout(() => {
      this.screenState.set('idle');
      this.message.set('Registra tu asistencia.');
      this.personName.set('');
      this.personType.set('');
      this.resultHour.set('');
      this.focusInput();
    }, 4200);
  }

  private addHistory(row: Omit<HistoryRow, 'id'>): void {
    this.history.update((current) => [{
      id: `${Date.now()}-${Math.random()}`,
      ...row
    }, ...current].slice(0, this.historyLimit));
  }

  private startClock(): void {
    const tick = () => {
      const now = new Date();
      this.currentTime.set(
        now.toLocaleTimeString('es-PE', {
          hour12: false,
          timeZone: 'America/Lima'
        })
      );
    };

    tick();
    setInterval(tick, 1000);
  }

  private focusInput(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => this.scanInput?.nativeElement.focus(), 40);
  }

  private getAudioContext(): AudioContext | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const audioWindow = window as Window & typeof globalThis & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const AudioCtor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioCtor) {
      return null;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioCtor();
    }

    return this.audioContext;
  }

  private resumeAudio(): void {
    const context = this.getAudioContext();
    if (context && context.state === 'suspended') {
      void context.resume();
    }
  }

  private playTone(frequency: number, durationMs: number, volume: number, startOffsetMs = 0): void {
    const context = this.getAudioContext();
    if (!context) {
      return;
    }

    this.resumeAudio();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0;

    const now = context.currentTime + startOffsetMs / 1000;
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    oscillator.start(now);
    oscillator.stop(now + durationMs / 1000 + 0.05);
  }

  private playSuccessSound(): void {
    this.playTone(660, 140, 0.05, 0);
    this.playTone(880, 150, 0.06, 100);
  }

  private playDuplicateSound(): void {
    this.playTone(440, 180, 0.05, 0);
    this.playTone(310, 210, 0.04, 120);
  }

  private playErrorSound(): void {
    this.playTone(220, 260, 0.06, 0);
  }

  get iconText(): string {
    if (this.screenState() === 'idle') {
      return '◌';
    }
    if (this.screenState() === 'success') {
      return '✓';
    }
    if (this.screenState() === 'duplicate') {
      return '!';
    }
    return '✕';
  }

  get headline(): string {
    if (this.screenState() === 'success') {
      return '¡ASISTENCIA REGISTRADA!';
    }
    if (this.screenState() === 'duplicate') {
      return '¡YA REGISTRASTE TU ASISTENCIA!';
    }
    return 'ERROR';
  }
}
