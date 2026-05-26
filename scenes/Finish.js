export default class Finish extends Phaser.Scene {
  constructor() {
    super("finish");
  }

  init(data) {
    this.score = data.score || 0;
    this.timeLeft = data.timeLeft || 0;
    this.state = data.state || "";
  }

  preload() {}

  create() {
    this.add.image(400, 300, "sky");
    this.add
      .text(400, 200, this.state, { fontSize: "64px", fill: "#000" })
      .setOrigin(0.5);
    this.add
      .text(400, 300, `Points: ${this.score}`, {
        fontSize: "32px",
        fill: "#000",
      })
      .setOrigin(0.5);
    this.add
      .text(400, 350, `Time: ${this.timeLeft}`, {
        fontSize: "32px",
        fill: "#000",
      })
      .setOrigin(0.5);
  }
}
