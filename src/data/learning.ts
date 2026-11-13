import type { Asteroid } from "@/data/types";
import { l } from "@/i18n/localized";

const GITHUB: string = "https://github.com/Zerik-Official";

export const ASTEROIDS: readonly Asteroid[] = [
  { id: "class-one", name: "Class-one", description: l("Ejercicios de la primera clase en Riwi.", "Exercises from my first class at Riwi."), techId: "python", repo: `${GITHUB}/Class-one` },
  { id: "login-pyqt5", name: "Login-form-with-pyqt5", description: l("Formulario de inicio de sesión con PyQt5.", "Login form built with PyQt5."), techId: "pyqt", repo: `${GITHUB}/Login-form-with-pyqt5` },
  { id: "bank-chafa", name: "Bank-Chafa", description: l("Lógica simple de un banco en consola.", "Simple console banking logic."), techId: "python", repo: `${GITHUB}/Bank-Chafa` },
  { id: "survival-economy", name: "Survival-Economy-Simulator", description: l("Economía de una aldea medieval en invierno, con eventos aleatorios.", "Economy of a medieval village in winter, with random events."), techId: "python", repo: `${GITHUB}/Survival-Economy-Simulator` },
  { id: "temu-geometric", name: "TemuGeometricCalculator", description: l("Calculadora geométrica 2D y 3D con interfaz gráfica.", "2D and 3D geometry calculator with a GUI."), techId: "python", repo: `${GITHUB}/TemuGeometricCalculator` },
  { id: "user-inventory", name: "UserInventory", description: l("Inventario modular en consola.", "Modular console inventory."), techId: "python", repo: `${GITHUB}/UserInventory` },
  { id: "grid-flex", name: "Grid-and-flex-elements", description: l("Práctica de CSS Grid y Flexbox.", "CSS Grid and Flexbox practice."), techId: "css", repo: `${GITHUB}/Grid-and-flex-elements` },
  { id: "stories-html", name: "User_Stories_Html_CSS", description: l("Historias de usuario del módulo de HTML y CSS.", "User stories from the HTML and CSS module."), techId: "html", repo: `${GITHUB}/User_Stories_Html_CSS` },
  { id: "perf-html-css", name: "Performance-test-html-css", description: l("Prueba de desempeño del módulo dos.", "Module two performance test."), techId: "css", repo: `${GITHUB}/Performance-test-html-css` },
  { id: "stories-js", name: "User_Stories_JavaScript", description: l("Historias de usuario del módulo de JavaScript.", "User stories from the JavaScript module."), techId: "javascript", repo: `${GITHUB}/User_Stories_JavaScript` },
  { id: "perf-js", name: "Performance-Test-JavaScript", description: l("Prueba de desempeño del módulo tres.", "Module three performance test."), techId: "javascript", repo: `${GITHUB}/Performance-Test-JavaScript` },
  { id: "perf-sql", name: "performance-test-sql", description: l("Prueba de desempeño de SQL.", "SQL performance test."), techId: "mysql", repo: `${GITHUB}/performance-test-sql` },
  { id: "perf-react", name: "Performance-test-react", description: l("Prueba de desempeño de React.", "React performance test."), techId: "react", repo: `${GITHUB}/Performance-test-react` },
];
