export default class EndScene extends Phaser.Scene {
  constructor() {
    super("end-scene");
  }

  init(data) {
    this.gano    = data.gano;
    this.puntaje = data.puntaje;
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const titulo = this.gano ? "¡GANASTE! 🎉" : "¡PERDISTE! 💀";
    const color  = this.gano ? "#ffdd00"      : "#ff4444";

    this.add.text(400, 180, titulo, {
      font: "48px Arial", fill: color
    }).setOrigin(0.5);

    this.add.text(400, 280, `Puntaje final: ${this.puntaje}`, {
      font: "28px Arial", fill: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(400, 400, "[ Jugar de nuevo ]", {
      font: "24px Arial", fill: "#aaffaa"
    }).setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => this.scene.start("hello-world"));
  }
}