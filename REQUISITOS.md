# REQUISITOS - Sistema de Gestión de Condominios

Documento de requisitos para un sistema de gestión de condominios (administración de
unidades, residentes, cuotas y gastos comunes, pagos, reservas de áreas comunes,
incidencias y comunicación).

**Total: 35 requisitos** — 25 funcionales (RF-01 a RF-25) y 10 no funcionales (RNF-01 a RNF-10).

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

## 2. Requisitos funcionales (25)

### Autenticación y usuarios
- **RF-01** Registrar e iniciar sesión de usuarios.
- **RF-02** Recuperar la contraseña mediante correo electrónico.
- **RF-03** Gestionar usuarios, roles y permisos.

### Condominios, unidades y residentes
- **RF-04** Registrar, editar y eliminar condominios.
- **RF-05** Gestionar torres/bloques y unidades (número, piso, superficie, tipo).
- **RF-06** Asignar propietarios e inquilinos a las unidades.
- **RF-07** Consultar la ficha y el estado de una unidad.
- **RF-08** Registrar, editar y eliminar residentes (propietarios e inquilinos).
- **RF-09** Registrar vehículos, mascotas y estacionamientos/bodegas asignados.

### Cuotas y gastos comunes
- **RF-10** Configurar ítems de gasto común y su forma de reparto.
- **RF-11** Emitir cuotas periódicas por unidad.
- **RF-12** Emitir cuotas extraordinarias.
- **RF-13** Calcular intereses y recargos por mora.
- **RF-14** Anular o ajustar cuotas emitidas.

### Pagos y cobranza
- **RF-15** Registrar pagos (efectivo, transferencia, tarjeta).
- **RF-16** Imputar pagos a una o varias cuotas (parcial o total).
- **RF-17** Consultar el estado de cuenta por unidad.
- **RF-18** Generar y enviar comprobantes de pago.
- **RF-19** Reportar morosidad y antigüedad de saldos.
- **RF-20** Registrar gastos del condominio.

### Reservas, incidencias y comunicación
- **RF-21** Definir áreas comunes reservables y sus reglas (horario, tarifa, aforo).
- **RF-22** Consultar disponibilidad y crear reservas sin solapamientos.
- **RF-23** Registrar y dar seguimiento a incidencias y mantenimiento.
- **RF-24** Publicar comunicados y enviar notificaciones por eventos.
- **RF-25** Gestionar visitas y control de acceso.

---

## 3. Requisitos no funcionales (10)

- **RNF-01** **Rendimiento**: los endpoints de consulta responden en menos de 1 segundo;
  las operaciones pesadas (emisión masiva de cuotas, reportes) se ejecutan en segundo
  plano sin bloquear al usuario.
- **RNF-02** **Escalabilidad**: el sistema crece en condominios y usuarios, y permite
  agregar capacidad de forma horizontal.
- **RNF-03** **Disponibilidad**: disponibilidad objetivo de 99,5% mensual.
- **RNF-04** **Fiabilidad**: las operaciones críticas (registro de pagos) no se pierden
  ante fallos temporales y existe respaldo periódico con restauración documentada.
- **RNF-05** **Seguridad**: contraseñas cifradas, comunicación por HTTPS y los datos de
  tarjetas no se almacenan en el sistema.
- **RNF-06** **Control de acceso**: acceso por roles y permisos, con aislamiento de datos
  entre condominios.
- **RNF-07** **Usabilidad**: interfaz clara e intuitiva y mensajes de error comprensibles.
- **RNF-08** **Compatibilidad**: accesible desde navegadores web actuales e integrable con
  pasarelas de pago y servicios de correo.
- **RNF-09** **Mantenibilidad**: código modular y documentado, con pruebas automatizadas y
  actualizaciones sin pérdida de datos.
- **RNF-10** **Privacidad y observabilidad**: cumplimiento de la normativa de protección
  de datos personales, con registro de eventos y monitoreo del sistema.
