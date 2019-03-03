var INITIAL_ANIMALS = 10;
var INITIAL_PLANTS = 10;
var INITIAL_TIME_TURNERS = 3;
var INITIAL_SUPPLIES = 20;

var wKey;
var aKey;
var sKey;
var dKey;
var tKey;
var left_key;

var winMsg;
var loseMsg;

var inventory = [];
var inventoryGrids = [];
var inventoryImages = [];
var level = 0;
var score = 0;
var scoreText;
var timeTurnerCount = INITIAL_TIME_TURNERS;
var timeTurnerImages = [];
var suppliesCounter = INITIAL_SUPPLIES;
var uncaughtAnimals;
var uncaughtPlants;
var uniqueInventory = [];

var TERRAIN_WATER, TERRAIN_1, TERRAIN_2, TERRAIN_3, TERRAIN_4, TERRAIN_5, TERRAIN_6, TERRAIN_7;

var map;
var player,actorList,actorMap,livingEnemies,acted;

function addToVisualInventory(specimen) {
  var grid = this.game.add.image(game.width - (20 + (33 * (uniqueInventory.length - 1))), game.height - 20, 'inventoryGrid');
  grid.anchor.setTo(1, 1);
  grid.fixedToCamera = true;
  inventoryGrids.push(grid);
  var specimenImage = this.game.add.sprite(game.width - (20 + (33 * (uniqueInventory.length - 1))), game.height - 20, specimen.meta.sprite);
  specimenImage.frame = specimen.meta.frame;
  specimenImage.anchor.setTo(1, 1);
  specimenImage.fixedToCamera = true;
  specimenImage.scale.setTo(0.5, 0.5);
  inventoryImages.push(specimenImage);
}

function collectSpecimen(specimen, player) {
  var type = specimen.meta.type;
  if (type === 'animal') {
    uncaughtAnimals--;
  } else if (type === 'plant') {
    uncaughtPlants--;
  }
  score++;
  if (!_.find(inventory, function(item) {
    return item.frame === specimen.meta.frame && item.sprite === specimen.meta.sprite;
  })) {
    // if an item of that type isn't in your inventory yet, you get an extra point
    uniqueInventory.push(specimen.meta);
    addToVisualInventory(specimen);
    score++;
  }
  scoreText.setText(`Score: ${score}`);
  inventory.push(specimen.meta);
  delete actorMap[specimen.ty + '_' + specimen.tx];
  specimen.kill();
}

function setActorPosition(actor, dir) {
  delete actorMap[actor.ty + '_' + actor.tx];

  actor.ty += dir.y;
  actor.tx += dir.x;

  actor.y = actor.ty * TILE_SIZE;
  actor.x = actor.tx * TILE_SIZE;

  actorMap[actor.ty + '_' + actor.tx] = actor;
}

function moveActor(actor, dir) {
  if (actor == player) {
    saveState();
  }

  if (!canGo(actor, dir))
    return false;

  var newKey = (actor.ty + dir.y) + '_' + (actor.tx + dir.x);
  if (actorMap[newKey] != undefined) {
    // this is where it would attack, if it could
    if (actor.key === 'player') {
      collectSpecimen(actorMap[newKey]);
      setActorPosition(actor, dir);
    } else if (actorMap[newKey] === 'player') {
      collectSpecimen(actor.key);
    }
  } else {
    setActorPosition(actor, dir);
  }
  if (actor == player) {
    movePlayer();
  }
  return true;
}

function movePlayer() {
  suppliesCounter--;
  suppliesText.setText(suppliesCounter);
  if (suppliesCounter < 1) {
    gameEnds();
  }
}

function saveState() {
  if (timeTurnerCount > 0) {
    var actorData = [];
    _.forEach(actorMap, actor => {
      actorData.push({
        id: actor.meta.id,
        tx: actor.tx,
        ty: actor.ty
      });
    });
    var newState = {
      actorData: actorData,
      inventory: _.cloneDeep(inventory),
      score: score,
      timeTurnerCount: timeTurnerCount,
      suppliesCounter: suppliesCounter
    }
  }
}

function gameEnds() {
  player.kill();
  level = 0;
  inventory = [];
  uniqueInventory = [];
  suppliesCounter = INITIAL_SUPPLIES;
  timeTurnerCount = INITIAL_TIME_TURNERS;
  // TODO: more things need to reset!
  // deadSnd.play();
  loseMsg = this.game.add.text(game.width / 2, game.height / 2, 'Your time here is up.\nThe crew has beamed you back to the ship.\nPress space or click to head to the next planet!');
  loseMsg.font = 'kenney_future_narrowregular';
  loseMsg.fontSize = 24;
  loseMsg.anchor.setTo(0.5);
  loseMsg.fixedToCamera = true;

  var highestScore = parseInt(JSON.parse(localStorage.getItem('seaExplorerHighScore')));
  if (highestScore > 0) {
    var scoreText = this.game.add.text(game.width / 2, game.height - 40, 'High Score: ' + highestScore);
    scoreText.font = 'kenney_future_narrowregular';
    scoreText.fontSize = 24;
    scoreText.anchor.setTo(0.5);
    scoreText.fixedToCamera = true;
  }
}

function canGo(actor, dir) {
  return actor.tx + dir.x >= 0 &&
         actor.tx + dir.x <= COLS - 1 &&
         actor.ty + dir.y >= 0 &&
         actor.ty + dir.y <= ROWS - 1
}

Game.Play = function(game) {
  this.game = game;
};

Game.Play.prototype = {
  aiAct: function(actor) {
    var directions = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 }
    ];

    // walk randomly
    moveActor(actor, directions[_.random(directions.length - 1)]);
  },
  create: function() {
    this.game.world.setBounds(0, 0 ,Game.w ,Game.h);
    this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.stage.backgroundColor = '#000';


    this.highestScore = parseInt(JSON.parse(localStorage.getItem('seaExplorerHighScore')));
    // this.game.input.keyboard.addCallbacks(null, null, onKeyUp);

    // SFX
    attackSnd = this.game.add.sound('attack');
    deadSnd = this.game.add.sound('dead');

    // Setup WASD and extra keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    tKey = this.game.input.keyboard.addKey(Phaser.Keyboard.T);
    spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.movement = {
      up: function() {
        player.frame = 2;
        acted = moveActor(player, { x:0, y:-1 });
      },
      down: function() {
        player.frame = 1;
        acted = moveActor(player, { x:0, y:1 });
      },
      left: function() {
        player.frame = 3;
        player.direction = 'left';
        acted = moveActor(player, { x:-1, y:0 });
      },
      right: function() {
        player.direction = 'right';
        player.frame = 0;
        acted = moveActor(player, { x:1, y:0 });
      }
    };

    // Up Key
    this.cursors.up.onUp.add(this.onKeyUp, this);
    wKey.onUp.add(this.onKeyUp, this);

    // Down Key
    this.cursors.down.onUp.add(this.onKeyUp, this);
    sKey.onUp.add(this.onKeyUp, this);

    // Left Key
    this.cursors.left.onUp.add(this.onKeyUp, this);
    aKey.onUp.add(this.onKeyUp, this);

    // Right Key
    this.cursors.right.onUp.add(this.onKeyUp, this);
    dKey.onUp.add(this.onKeyUp, this);

    // T Key
    tKey.onUp.add(this.onKeyUp, this)

    // Reset Game w/ space on mouse click
    spaceKey.onUp.add(this.resetGame, this);
    this.game.input.onUp.add(this.resetGame, this);

    this.loadLevel();
    this.loadActors();

  },
  resetGame: function() {
    if (uncaughtAnimals === 0 && uncaughtPlants === 0) {
      this.loadLevel();
      this.loadActors();
    }else if (!player.alive) {
      score = 0;
      this.loadLevel();
      this.loadActors();
    }
  },
  onKeyUp: function(key) {
    if (player.alive === false)
      return

    acted = false;

    if (key === this.cursors.up || key === wKey) {
      this.movement.up();
    } else if (key === this.cursors.down || key === sKey) {
      this.movement.down();
    } else if (key === this.cursors.left || key === aKey) {
      this.movement.left();
    } else if (key === this.cursors.right || key === dKey) {
      this.movement.right();
    } else if (key === tKey) {
      this.turnTime(_.random(5, 20));
    }

    if (acted) {
      _.forEach(actorList, (actor, index) => {
        // skip the player
        if (index == 0) {
          // no-op
        } else if (!actor.mobile) {
          // no-op
        } else {
          if (actor != null) {
            this.aiAct(actor);
          }
        }
      });
    };
  },
  turnTime: function(supplies) { // probably have the number of supplies as a parameter
    if (timeTurnerCount > 0) { // TODO: this mechanism will work differently
      // add turns
      suppliesCounter = suppliesCounter + supplies;
      suppliesText.setText(suppliesCounter);

      // remove a time turner
      var timeTurnerIndex = timeTurnerCount - 1;
      timeTurnerImages[timeTurnerIndex].destroy();
      timeTurnerContainer = this.game.add.image(20 + timeTurnerIndex * (64 + 10), 20, 'timeTurnerEmpty');
      timeTurnerContainer.anchor.setTo(0, 0);
      timeTurnerContainer.fixedToCamera = true;
      timeTurnerCount--;

      // recalculate unique inventory
      uniqueInventory = [];
      _.forEach(inventory, itemInInventory => {
        if (!_.find(uniqueInventory, function(item) {
          return item.frame === itemInInventory.frame && item.sprite === itemInInventory.sprite;
        })) {
          uniqueInventory.push(itemInInventory);
        }
      });
      // if there are more items shown than in uniqueInventory, delete the extras
      if (inventoryImages.length > uniqueInventory.length) {
        for (var i = uniqueInventory.length ; i < inventoryImages.length; i++) {
          inventoryImages[i].destroy();
          inventoryGrids[i].destroy();
        }
      }
    } else {
      // TODO: display error
      console.log('No time turners remaining!');
    }
  },
  createActor: function(id, type, sprite, frame) {
    var actor;
    actor = new Actor(this.game, 0, 0, TILE_SIZE, sprite, frame || 0);
    actor.meta = {
      frame: frame,
      id: id,
      sprite: sprite,
      type: type
    }
    if (type === 'player' || type === 'animal') {
      actor.mobile = true;
    } else {
      actor.mobile = false;
    }
    do {
      actor.ty = _.random(ROWS - 1);
      actor.tx = _.random(COLS - 1);
      actor.y = actor.ty*TILE_SIZE;
      actor.x = actor.tx*TILE_SIZE;
    } while (map[actor.ty][actor.tx] == TERRAIN_WATER || actorMap[actor.ty + "_" + actor.tx] != null);

    //Add references
    actorMap[actor.ty + "_" + actor.tx] = actor;
    actorList.push(actor);
  },
  loadActors: function() {
    actorList = [];
    actorMap = {};

    this.createActor('player', 'player', 'player');

    // for(var i = 0; i < INITIAL_ANIMALS; i++) {
    //   this.createActor(`animal${i}`, 'animal', 'animals', _.random(0, 15));
    // }

    // for(var i = 0; i < INITIAL_PLANTS; i++) {
    //   this.createActor(`plant${i}`, 'plant', 'plants', _.random(0, 15));
    // }

    uncaughtAnimals = INITIAL_ANIMALS;
    uncaughtPlants = INITIAL_PLANTS;
    player = actorList[0];
    game.physics.p2.enable(player);
    this.game.camera.follow(player);
  },
  loadLevel: function() {
    TERRAIN_WATER = 0;
    TERRAIN_1 = 1;
    TERRAIN_2 = 2;
    TERRAIN_3 = 3;
    TERRAIN_4 = 4;
    TERRAIN_5 = 5;
    TERRAIN_6 = 6;
    TERRAIN_7 = 7;

    this.auto = new Automata(COLS, ROWS);
    this.auto.generate();

    var cave = this.auto.csv();
    this.auto.print();
		map = this.auto.map;

    this.game.load.tilemap('level', null, cave, Phaser.Tilemap.CSV );
    this.map = this.game.add.tilemap('level', TILE_SIZE, TILE_SIZE);
    this.map.addTilesetImage('background');
    this.layer = this.map.createLayer(0);

    this.map.setCollision(0); //Black Empty Space
    this.layer.resizeWorld();

    scoreText = this.game.add.text(game.width - 30, 20, 'Score: ' + score);
    scoreText.font = 'kenney_future_narrowregular';
    scoreText.fontSize = 24;
    scoreText.anchor.setTo(1, 0);
    scoreText.fixedToCamera = true;

    for (var i = 0; i < timeTurnerCount; i++) {
      var timeTurnerImage = this.game.add.image(20 + i * (64 + 10), 20, 'timeTurner');
      timeTurnerImage.anchor.setTo(0, 0);
      timeTurnerImage.fixedToCamera = true;
      timeTurnerImages.push(timeTurnerImage);
    }

    hourglass = this.game.add.image(20, game.height - 28, 'hourglass');
    hourglass.anchor.setTo(0, 1);
    hourglass.fixedToCamera = true;
    hourglass.scale.setTo(0.5, 0.5);
    suppliesText = this.game.add.text(134, game.height - 36, suppliesCounter);
    suppliesText.font = 'kenney_future_narrowregular';
    suppliesText.fontSize = 18;
    suppliesText.addColor('#ffffff', 0);
    suppliesText.anchor.setTo(1, 1);
    suppliesText.fixedToCamera = true;
  },
  update: function() {
    this.game.physics.arcade.collide(player, this.layer);

    if (score > this.highestScore) {
      this.highestScore = score;
      localStorage.setItem('seaExplorerHighScore', score);
    }
  }
};
