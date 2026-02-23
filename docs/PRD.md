# Product Requirements Document (PRD)

## 1. Introducción
**AutoGasto AI** es una aplicación web diseñada para gestionar gastos de vehículos y predecir costes de viaje utilizando IA para la entrada y análisis de datos.

## 2. Perfiles de Usuario
-   **Conductor Cuidadoso**: Quiere saber exactamente cuánto gasta y cuándo le toca mantenimiento.
-   **Viajero Planificador**: Necesita saber el coste de combustible para sus vacaciones.

## 3. Requisitos Funcionales

### 3.1. Ingreso de Datos (El Core)
El sistema debe aceptar una entrada (Input) y convertirla en una transacción estructurada:
`{ fecha, importe, litros, kilometraje, tipo_combustible, lugar }`.

-   **RF-01 Entrada Manual**: Formulario web clásico.
-   **RF-02 Entrada por Visión (OCR/IA)**:
    -   Usuario sube 1 o 2 fotos (Surtidor, Odómetro).
    -   Sistema detecta: Precio total, Litros, Precio/Litro, Kilometraje actual.
    -   *Criterio de éxito*: Precisión del 90%+ en fotos claras.
-   **RF-03 Entrada por Voz/Texto Natural**:
    -   Usuario envía audio o escribe: "Llené el tanque con 50 euros, tengo 120.300 km".
    -   Sistema transcribe (si es audio) y extrae entidades JSON.

### 3.2. Dashboard y Visualización
-   **RF-04 Histórico**: Lista de repostajes ordenados cronológicamente.
-   **RF-05 Gráficas**: Consumo medio (L/100km) a lo largo del tiempo.
-   **RF-06 KPIs**: Gasto total mes actual, último consumo medio.

### 3.3. Predicción y Ciencia de Datos
-   **RF-07 Calculadora de Viaje**:
    -   Input: Distancia (km) o Destino.
    -   Process: Usa el consumo medio histórico del usuario * precio actual medio.
    -   Output: Coste estimado (€) y Litros necesarios.

### 3.4. Mantenimiento
-   **RF-08 Alertas de Mantenimiento**:
    -   Basado en el odómetro actual vs. último mantenimiento (ej. cambio de aceite cada 15.000 km).

## 4. Requisitos No Funcionales
-   **RNF-01**: Diseño "Mobile First" y Responsive.
-   **RNF-02**: Tiempos de carga < 2s (Optimización de imágenes).
-   **RNF-03**: Seguridad de datos (Las claves de API no deben exponerse al cliente).

## 5. Modelo de Datos (Conceptual)

### Entidad: Refuel (Repostaje)
-   id (UUID)
-   date (Date)
-   amount_eur (Number)
-   liters (Number)
-   price_per_liter (Number)
-   odometer_km (Number)
-   user_notes (String)
-   evidence_images (Array<URL>)

### Entidad: Vehicle
-   id (UUID)
-   name (String)
-   fuel_type (String)
-   tank_capacity (Number)
-   maintenance_schedule (Array)
