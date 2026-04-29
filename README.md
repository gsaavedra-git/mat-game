# MatGame

Demostraciones visuales e interactivas de matemáticas y física, hechas con HTML, CSS y JavaScript puros. Sin dependencias, sin build, sin frameworks: abres el `index.html` y funciona.

El objetivo es que conceptos que en clase suelen quedarse en una fórmula se vuelvan tangibles — que puedas mover un parámetro y ver al instante cómo cambia el fenómeno.

## Demos incluidas

| Demo | Tema | Qué se aprende |
|---|---|---|
| 📐 **Teorema de Pitágoras** | Matemáticas | Arrastra los catetos y observa cómo se cumple a² + b² = c² con cuadrados sobre cada lado. |
| 🌍 **Gravedad y caída libre** | Física | Objetos cayendo con gravedad, masa y resistencia del aire ajustables. |
| 🎯 **Tiro parabólico** | Física | Ángulo, velocidad inicial, alcance y altura máxima de un proyectil. |
| 🌀 **Péndulo doble** | Caos | Sistema caótico clásico: dos péndulos casi idénticos divergen con el tiempo. |
| 🌊 **Ondas e interferencia** | Ondas | Múltiples fuentes generan patrones de interferencia constructiva y destructiva. |
| 🔬 **Doble rendija (Young)** | Cuántica | El experimento que demostró la naturaleza ondulatoria de la luz, con modo partículas. |
| 🦋 **Atractor de Lorenz** | Caos | Tres ecuaciones simples generan la mariposa 3D — el efecto mariposa hecho gráfico. |

## Cómo usarlo

```bash
git clone https://github.com/gsaavedra-git/mat-game.git
cd mat-game
```

Y abre `index.html` en cualquier navegador moderno. No hay paso de instalación.

## Estructura

```
mat-game/
├── index.html          ← galería de demos
├── styles.css          ← estilos compartidos
└── demos/
    ├── pitagoras.html / .js
    ├── gravedad.html / .js
    ├── parabolico.html / .js
    ├── pendulo.html / .js
    ├── ondas.html / .js
    ├── rendija.html / .js
    └── lorenz.html / .js
```

Cada demo es autónoma: un HTML con sus controles y bloques de teoría, más un JS con la simulación dibujada en `<canvas>`. Para añadir una demo nueva basta con replicar ese patrón y agregar una tarjeta en `index.html`.

## Tecnologías

- HTML5 + CSS3 (variables CSS, grid)
- JavaScript vanilla
- Canvas 2D para todas las simulaciones
- Integración numérica por Runge-Kutta 4 donde hace falta (péndulo doble, Lorenz)

## Licencia

Uso libre con fines educativos.
