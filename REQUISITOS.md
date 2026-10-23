# REQUISITOS - Sistema de Gestión de Condominios

Documento de requisitos para un sistema de gestión de condominios (administración de
unidades, residentes, cuotas y gastos comunes, pagos, reservas de áreas comunes,
incidencias y comunicación).

## 1. Descripción general

El sistema permite administrar uno o varios condominios: registro de unidades y
residentes, cobro de gastos comunes, registro de pagos y morosidad, reserva de áreas
comunes, gestión de incidencias/mantenimiento y envío de comunicados y notificaciones
a los residentes.

### Actores
- **Administrador del sistema**: gestiona condominios, usuarios y configuración global.
- **Administrador de condominio**: administra unidades, residentes, cuotas y avisos.
- **Tesorería/Contabilidad**: emite cuotas, registra pagos y controla morosidad.
- **Conserje/Portería**: registra visitas, reservas, paquetería e incidencias.
- **Propietario**: consulta su unidad y estado de cuenta, reserva áreas y reporta incidencias.
- **Inquilino**: accede con permisos limitados sobre la unidad que ocupa.

---

## 2. Requisitos funcionales

### 2.1 Autenticación y usuarios
- Registro e inicio de sesión de usuarios.
- Recuperación de contraseña.
- Gestión de usuarios, roles y permisos.
- Cierre de sesión.

### 2.2 Condominios y unidades
- Registrar, editar y eliminar condominios.
- Gestionar torres/bloques y unidades (número, piso, superficie, tipo).
- Asignar propietarios e inquilinos a cada unidad.
- Consultar ficha y estado de una unidad.

### 2.3 Residentes
- Registrar, editar y eliminar personas (propietarios e inquilinos).
- Registrar vehículos, mascotas y estacionamientos/bodegas asignados.
- Mantener datos de contacto para notificaciones.

### 2.4 Cuotas y gastos comunes
- Configurar ítems de gasto común y su forma de reparto.
- Emitir cuotas periódicas por unidad.
- Emitir cuotas extraordinarias.
- Calcular intereses y recargos por mora.
- Anular o ajustar cuotas emitidas.

### 2.5 Pagos y cobranza
- Registrar pagos (efectivo, transferencia, tarjeta).
- Imputar pagos a una o varias cuotas (parcial o total).
- Consultar el estado de cuenta por unidad.
- Generar y enviar comprobantes de pago.
- Reportar morosidad y antigüedad de saldos.
- Registrar gastos del condominio.

### 2.6 Reservas de áreas comunes
- Definir áreas comunes reservables y sus reglas (horario, tarifa, aforo).
- Consultar disponibilidad y crear reservas sin solapamientos.
- Confirmar o cancelar reservas.
- Cobrar la reserva a la cuenta de la unidad.

### 2.7 Incidencias y mantenimiento
- Registrar incidencias con categoría, prioridad y adjuntos.
- Gestionar el ciclo de vida (nueva, asignada, en progreso, resuelta, cerrada).
- Asignar incidencias a personal o proveedores.
- Registrar comentarios y seguimiento.
- Programar mantenimiento preventivo.

### 2.8 Comunicación y notificaciones
- Publicar comunicados y avisos a residentes.
- Enviar notificaciones por correo ante eventos (cuota emitida, pago registrado,
  reserva confirmada, incidencia actualizada).
- Consultar bandeja de mensajes/notificaciones.

### 2.9 Asambleas y votaciones
- Convocar asambleas con orden del día.
- Registrar asistencia y poderes.
- Realizar votaciones con ponderación por coeficiente de copropiedad.
- Registrar acuerdos y su seguimiento.

### 2.10 Visitas y control de acceso
- Registrar visitas con unidad destino y vigencia.
- Autorizar el acceso y registrar entradas/salidas.
- Registrar paquetería recibida y su entrega.
- Consultar historial de visitas.

### 2.11 Proveedores y contratos
- Registrar proveedores y su información de contacto.
- Gestionar contratos con vigencia y monto.
- Asociar gastos y órdenes de trabajo a proveedores.

### 2.12 Reportes
- Reportes de recaudación, morosidad, gastos y presupuesto.
- Reportes de incidencias por estado y tiempo de resolución.
- Reportes de uso de áreas comunes y estacionamientos.
- Exportación de reportes y panel de indicadores.
- Auditoría de operaciones sensibles.

---

## 3. Requisitos no funcionales

### 3.1 Rendimiento
- Los endpoints de consulta deben responder en menos de 1 segundo en condiciones normales.
- El sistema debe soportar múltiples condominios y miles de unidades sin degradarse.
- Las operaciones pesadas (emisión masiva de cuotas, reportes) deben ejecutarse en
  segundo plano sin bloquear la interfaz.

### 3.2 Escalabilidad
- El sistema debe poder crecer en número de condominios y usuarios sin rediseño.
- Debe permitir agregar capacidad de forma horizontal.

### 3.3 Disponibilidad y fiabilidad
- Disponibilidad objetivo de 99,5% mensual.
- Operaciones críticas (registro de pagos) no deben perderse ante fallos temporales.
- Debe existir respaldo periódico de la información y restauración documentada.

### 3.4 Seguridad
- Las contraseñas se almacenan cifradas.
- El acceso se controla por roles y permisos.
- La comunicación se cifra (HTTPS).
- Un usuario solo accede a los condominios donde tiene rol.
- Los datos de tarjetas no se almacenan en el sistema.

### 3.5 Usabilidad
- Interfaz clara e intuitiva para administradores y residentes.
- Mensajes de error comprensibles.
- La información se presenta en el idioma y formatos locales del condominio.

### 3.6 Compatibilidad
- Accesible desde navegadores web actuales.
- Debe permitir integración con pasarelas de pago y servicios de correo.
- Formatos de fecha y moneda configurables.

### 3.7 Mantenibilidad
- Código modular y documentado.
- Debe incluir pruebas automatizadas.
- Actualizaciones de software sin pérdida de datos.

### 3.8 Observabilidad
- Registro de eventos y errores del sistema.
- Monitoreo del estado y desempeño de los servicios.

### 3.9 Legal y privacidad
- Cumplimiento de la normativa de protección de datos personales.
- Retención de información financiera según la normativa vigente.
- Consentimiento y derecho de acceso/rectificación de datos de los residentes.
