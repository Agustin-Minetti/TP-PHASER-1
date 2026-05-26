// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    // key of the scene
    // the key will be used to start the scene by other scenes
    super("hello-world");
  }

  init() {

  }

  preload() {
    this.load.image("jugador",    "public/assets/ninja.png");
    this.load.image("plataforma", "public/assets/piso.png");
    this.load.image("cuadrado",   "public/assets/cuadrado.png");
    this.load.image("triangulo",  "public/assets/triangulo.png");
    this.load.image("rombo",      "public/assets/rombo.png");
    this.load.image("maldito",    "public/assets/maldito.png");
  }

  create() {
    // Fondo
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Plataforma principal
    this.plataforma = this.physics.add.staticGroup();
    this.plataforma.create(400, 590, "plataforma")
    .setDisplaySize(800, 20)
    .refreshBody();

    // Plataformas adicionales
    this.plataforma.create(150, 450, "plataforma")
    .setDisplaySize(200, 15)
    .refreshBody();

    this.plataforma.create(650, 450, "plataforma")
    .setDisplaySize(200, 15)
    .refreshBody();

    this.plataforma.create(400, 320, "plataforma")
    .setDisplaySize(200, 15)
    .refreshBody();

    // Jugador
    this.jugador = this.physics.add.sprite(400, 530, "jugador")
    .setDisplaySize(48, 48);
    this.jugador.setCollideWorldBounds(true);

    // Items (solo una vez)
    this.items = this.physics.add.group();

    // Colisiones
    this.physics.add.collider(this.jugador, this.plataforma);
    this.physics.add.collider(this.items, this.plataforma, this.itemReboto, null, this);
    this.physics.add.overlap(this.jugador, this.items, this.recolectarItem, null, this);

    // Teclado
    this.cursores = this.input.keyboard.createCursorKeys();

    // Tiempo y puntaje
    this.tiempoRestante = 30;
    this.puntaje = 0;

    // Inventario
    this.inventario = [
      { tipo: "cuadrado",  cantidad: 0, puntos: 10 },
      { tipo: "triangulo", cantidad: 0, puntos: 15 },
      { tipo: "rombo",     cantidad: 0, puntos: 20 },
    ];
 
    // UI
    this.textoUI = this.add.text(10, 10, this.getTextoInventario(), {
      font: "16px Arial", fill: "#ffffff"
    });
    this.textoPuntaje = this.add.text(10, 30, `Puntaje: ${this.puntaje}`, {
      font: "16px Arial", fill: "#ffdd00"
    });
    this.textoTiempo = this.add.text(790, 10, `Tiempo: ${this.tiempoRestante}`, {
      font: "16px Arial", fill: "#ffffff"
    }).setOrigin(1, 0);

    // Timers
    this.time.addEvent({
      delay: 500,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true
    });
    this.time.addEvent({
      delay: 1000,
      callback: this.descontarTiempo,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (this.cursores.left.isDown) {
      this.jugador.setVelocityX(-200);
    } else if (this.cursores.right.isDown) {
      this.jugador.setVelocityX(200);
    } else {
      this.jugador.setVelocityX(0);
    }
    if (this.cursores.up.isDown && this.jugador.body.touching.down) {
      this.jugador.setVelocityY(-400);
    }
  }

  spawnItem() {
    const tipos = ["cuadrado", "triangulo", "rombo", "maldito"];
    const tipo  = tipos[Phaser.Math.Between(0, 3)];
    const x     = Phaser.Math.Between(20, 780);

    const item = this.items.create(x, 0, tipo).setDisplaySize(32, 32);
    item.tipo           = tipo;
    item.rebotando      = false;
    item.setVelocityY(150);
    item.setBounce(0.6);
    item.setCollideWorldBounds(true);

    const entrada = this.inventario.find(i => i.tipo === tipo);
    item.puntosRestantes = entrada ? entrada.puntos : 15;
  }

  recolectarItem(jugador, item) {
    if (!item.active) return;
    
    const tipo = item.tipo;
    item.setActive(false).setVisible(false);
    item.body.enable = false;
    this.time.delayedCall(50, () => { item.destroy(); });

    if (tipo === "maldito") {
      this.puntaje -= 15;
      this.puntaje = Math.max(0, this.puntaje);
      this.textoPuntaje.setText(`Puntaje: ${this.puntaje}`);
      return;
    }

    const entrada = this.inventario.find(i => i.tipo === tipo);
    entrada.cantidad++;
    this.puntaje += entrada.puntos;
    this.textoPuntaje.setText(`Puntaje: ${this.puntaje}`);
    this.textoUI.setText(this.getTextoInventario());
    this.verificarVictoria();
  }

  itemReboto(objA, objB) {
    const item = objA.tipo ? objA : objB;
    if (!item || !item.active || !item.tipo) return;
    if (item.rebotando) return;

    item.rebotando = true;
    item.puntosRestantes -= 5;

    if (item.puntosRestantes <= 0) {
      item.setActive(false).setVisible(false); // ← en lugar de destroy()
      item.body.enable = false;                // ← desactivar física
      this.time.delayedCall(50, () => { item.destroy(); }); // ← destruir después
      return;
    }

    this.time.delayedCall(200, () => {
      if (item && item.active) {
        item.rebotando = false;
      }
    });
  }

  descontarTiempo() {
    this.tiempoRestante--;
    this.textoTiempo.setText(`Tiempo: ${this.tiempoRestante}`);
    if (this.tiempoRestante <= 0) {
      this.mostrarFinDeJuego(false);
    }
  }

  verificarVictoria() {
    const tieneItems  = this.inventario.every(i => i.cantidad >= 2);
    const tienePuntos = this.puntaje >= 100;
    if (tieneItems && tienePuntos) {
      this.mostrarFinDeJuego(true);
    }
  }

  getTextoInventario() {
    return this.inventario
      .map(i => `${i.tipo}: ${i.cantidad}`)
      .join("   ");
  }

  mostrarFinDeJuego(gano) {
    this.physics.pause();
    this.time.removeAllEvents();
    this.scene.start("end-scene", { gano: gano, puntaje: this.puntaje });
  }
}