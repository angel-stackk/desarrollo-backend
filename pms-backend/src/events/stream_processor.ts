import { EventEmitter } from 'events';

/**
 * Capítulo 17: Procesamiento de flujos de eventos y captura de cambios de datos.
 * Event Sourcing (log de eventos inmutable) + CQRS (vista materializada derivada).
 */

// 1. Interfaz de evento inmutable (Event Sourcing)
export interface DomainEvent<T = any> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  timestamp: Date;
  payload: T;
}

// 2. Eventos concretos del dominio de proyectos
export interface TaskCreatedPayload {
  title: string;
  projectId: string;
  assignedUserId: string;
}

export interface TaskStatusChangedPayload {
  oldStatus: string;
  newStatus: string;
}

// 3. Proyector de vista materializada (CQRS - Read Model)
export class ProjectAnalyticsProjector {
  private activeTaskCount = 0;
  private completedTaskCount = 0;

  public handleEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'TaskCreated':
        this.activeTaskCount++;
        break;
      case 'TaskCompleted':
        if (this.activeTaskCount > 0) this.activeTaskCount--;
        this.completedTaskCount++;
        break;
      default:
        // Ignorar eventos no relevantes para este modelo de lectura
        break;
    }
  }

  public getMetrics(): { activeTasks: number; completedTasks: number; totalProcessed: number } {
    return {
      activeTasks: this.activeTaskCount,
      completedTasks: this.completedTaskCount,
      totalProcessed: this.activeTaskCount + this.completedTaskCount
    };
  }
}

// 4. Bus de eventos asíncrono e in-memory Event Store (append-only)
export class EventStore extends EventEmitter {
  private events: DomainEvent[] = [];

  public appendEvent(event: DomainEvent): void {
    // Almacenamiento inmutable en un log de solo anexado
    this.events.push(Object.freeze(event));
    this.emit('eventPublished', event);
  }

  public getEventStream(aggregateId: string): DomainEvent[] {
    return this.events.filter((e) => e.aggregateId === aggregateId);
  }
}

// 5. Demostración de ejecución: proyección en tiempo real de una vista materializada
async function runEventStreamDemo(): Promise<void> {
  const store = new EventStore();
  const projector = new ProjectAnalyticsProjector();

  // Suscripción de proyección CQRS (read side)
  store.on('eventPublished', (event: DomainEvent) => {
    projector.handleEvent(event);
  });

  // Emisión de eventos simulando mutaciones capturadas por CDC
  store.appendEvent({
    eventId: 'evt-001',
    eventType: 'TaskCreated',
    aggregateId: 'task-101',
    timestamp: new Date(),
    payload: { title: 'Diseñar arquitectura CDC', projectId: 'prj-1', assignedUserId: 'usr-5' }
  });

  store.appendEvent({
    eventId: 'evt-002',
    eventType: 'TaskCompleted',
    aggregateId: 'task-101',
    timestamp: new Date(),
    payload: { oldStatus: 'IN_PROGRESS', newStatus: 'COMPLETED' }
  });

  console.log('[Métricas]', projector.getMetrics());
  console.log('[Stream task-101]', store.getEventStream('task-101').map((e) => e.eventType));
}

runEventStreamDemo();
