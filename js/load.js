var ROWS = 20;
var COLS = 30;
var TILE_SIZE = 64;

var Game = {
  w: COLS * TILE_SIZE,
  h: ROWS * TILE_SIZE
};

if (localStorage.getItem('atRogueSlasherHighestScore') === null) { // TODO
  localStorage.setItem('atRogueSlasherHighestScore', 0);
}

Game.Boot = function(game) {
  this.game = game;
};

Game.Boot.prototype = {
  preload: function() {
		this.game.stage.backgroundColor = '#454545';
		this.game.load.image('loading', 'assets/images/loading.png');

    //Scale Image to Fit Window
    // this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.game.scale.maxHeight = window.innerHeight;
    // this.game.scale.maxWidth = window.innerHeight*(Game.w/Game.h);

  },
  create: function() {
   this.game.state.start('Load');
  }
};

Game.Load = function(game) {
  this.game = game;
};

Game.Load.prototype = {
  preload: function() {

    //Debug Plugin
    // this.game.add.plugin(Phaser.Plugin.Debug);

    //Loading Screen Message/bar
    var loadingText = this.game.add.text(Game.w, Game.h, 'Loading...', { font: '30px Helvetica', fill: '#000' });
  	loadingText.anchor.setTo(0.5, 0.5);
  	var preloading = this.game.add.sprite(Game.w/2-64, Game.h/2+50, 'loading');
  	this.game.load.setPreloadSprite(preloading);

    //Temporary Sprites
    this.game.load.spritesheet('player', 'assets/images/adventurer.png', 45, 64, 4, 0, 0);

    this.game.load.spritesheet('background', 'assets/images/backgrounds.png', 64, 64, 16, 0, 0);
    this.game.load.spritesheet('animals', 'assets/images/animals.png', 64, 64, 16, 0, 0);
    this.game.load.spritesheet('plants', 'assets/images/plants.png', 64, 64, 16, 0, 0);
    this.game.load.image('intro','assets/images/intro.png');
    this.game.load.image('inventoryGrid','assets/images/inventory-grid.png');
    this.game.load.image('hourglass','assets/images/hourglass.png');
    this.game.load.image('timeTurner', 'assets/images/timeturner.png');
    this.game.load.image('timeTurnerEmpty', 'assets/images/timeturner-empty.png');

    this.game.load.audio('attack', 'assets/audio/attack.mp3');
    this.game.load.audio('dead', 'assets/audio/dead.mp3');

  },
  create: function() {
    this.game.state.start('Menu');
  }
};
