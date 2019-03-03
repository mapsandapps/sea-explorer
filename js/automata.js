function Automata(width, height) {
  this.width = Math.floor(width);
  this.height = Math.floor(height);
  this.cells = [];

  // initialize Map
  this.resetMap();
}

Automata.prototype.resetMap = function() {
  this.map = [];
  for (var y = 0; y < this.height; y++) {
    this.map.push([]);

    this.map[y].push(new Array(this.width));

    for (var x = 0; x < this.width; x++) {
      this.map[y][x] = TERRAIN_WATER;
    }
  }
};

Automata.prototype.print = function () {
  // print the Current Map
  var printedMap = '\n';
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var cell = '';
      if (this.map[y][x] === TERRAIN_WATER) {
        cell = '~';
      } else {
        cell = this.map[y][x];
      }
      printedMap += cell;
    }
    printedMap += "\n";
  }
  console.log(printedMap);
  return printedMap;
};

Automata.prototype.csv = function () {
  //Save the map as a CSV string
  var printedMap = '';
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      printedMap += this.map[y][x];
      if (x < this.width - 1) {
        printedMap += ',';
      }
    }
    printedMap += "\n";
  }
  return printedMap;
};

Automata.prototype.addCell = function (xpos, ypos, terrain) {
  var x = xpos || Math.floor(this.width / 2);
  var y = ypos || Math.floor(this.height / 2);
  var cell = new Cell(x, y, this.map[y][x]);
  cell.terrain = terrain;
  this.map[cell.y][cell.x] = terrain;

  this.cells.push(cell);
};

Automata.prototype.addIsland = function(terrain) {
  // place island at random map point, unless there is already land there
  // TODO: decide if the island should be placed somewhere else if there is already land (if the map is all already land, this will be a bug) or if it should just not exist
  var retries = 4;
  while (retries > 0) {
    var xpos = Math.floor(Math.random() * this.width);
    var ypos = Math.floor(Math.random() * this.height);
    if (this.map[ypos][xpos] === TERRAIN_WATER) {
      this.addCell(xpos, ypos, terrain);
      retries = 0;
    } else {
      if (retries === 1) {
        console.warn('FAILED TO PLACE ISLAND, NO TRIES LEFT');
      } else {
        console.warn('FAILED TO PLACE ISLAND, RETRYING');
      }
    }
    retries--;
  }
}

Automata.prototype.generate = function() {
  if (this.cells.length === 0) {
    // TODO: make this a for loop
    this.addIsland(TERRAIN_1);
    this.addIsland(TERRAIN_2);
    this.addIsland(TERRAIN_3);
    this.addIsland(TERRAIN_4);
    this.addIsland(TERRAIN_5);
    this.addIsland(TERRAIN_6);
    this.addIsland(TERRAIN_7);
  }

  while (this.cells.length > 0) {
    for (var d = 0; d < this.cells.length; d++) {
      var cell = this.cells[d];
      if (cell.alive) {
        this.map = cell.cycle(this.map);
      } else {
        // remove cell from cells
        var index = this.cells.indexOf(cell);
        if (index > -1) {
          this.cells.splice(index, 1);
        }
      }
    }
  }
};

var Cell = function Cell(xpos, ypos) {
  this.alive = true;
  this.cycleLimit = 30;

  this.x = xpos;
  this.y = ypos;
};

Cell.prototype = {
  north: function north(map) {
    var x = this.x;
    var y = this.y - 1;
    if (y < 0) return;
    var direction = 'north';
    var terrain = map[y][x];
    return { x: x, y: y, direction: direction, terrain: terrain };
  },
  east: function east(map) {
    var x = this.x + 1;
    var y = this.y;
    if (y >= map[0].length) return;
    var direction = 'east';
    var terrain = map[y][x];
    return { x: x, y: y, direction: direction, terrain: terrain };
  },
  south: function south(map) {
    var x = this.x;
    var y = this.y + 1;
    if (y >= map.length) return;
    var direction = 'south';
    var terrain = map[y][x];
    return { x: x, y: y, direction: direction, terrain: terrain };
  },
  west: function west(map) {
    var x = this.x - 1;
    var y = this.y;
    if (y < 0) return;
    var direction = 'west';
    var terrain = map[y][x];
    return { x: x, y: y, direction: direction, terrain: terrain };
  },
  moveTo: function moveTo(pos) {
    this.x = pos.x;
    this.y = pos.y;
  },
  cycle: function cycle(map) {
    if (this.neighbors(map).length > 0) {
      var moveTo = this.neighbors(map)[Math.floor(Math.random() * this.neighbors(map).length)];
      if (this.alive) {
        this.x = moveTo.x;
        this.y = moveTo.y;
        // check that this cell's neighbors are all either this.terrain or water; only move if so
        if (!bordersAnotherIsland(moveTo, map, this.terrain)) {
          map[moveTo.y][moveTo.x] = this.terrain;
        } else {
          this.alive = false;
        }
      }
    }
    return map;
  }
};

function isAnotherIsland(cell, currentIsland) {
  if (cell) {
    return cell.terrain !== currentIsland && cell.terrain !== TERRAIN_WATER;
  }
  return null;
}

function bordersAnotherIsland(pos, map, currentTerrain) {
  var posCell = new Cell(pos.x, pos.y);
  if (isAnotherIsland(posCell.north(map), currentTerrain)) return true;
  if (isAnotherIsland(posCell.east(map), currentTerrain)) return true;
  if (isAnotherIsland(posCell.south(map), currentTerrain)) return true;
  if (isAnotherIsland(posCell.west(map), currentTerrain)) return true;
  return false;
}

Cell.prototype.checkNeighbour = function(pos, map) {
  try {
    if (map[pos.y][pos.x] !== TERRAIN_WATER) {
      return false;
    } else {
      return true;
    }
  } catch(err) {
    // console.log(pos.x, pos.y, err);
  }
};

Cell.prototype.neighbors = function(map) {
  var neighbors = [];
  if (this.checkNeighbour(this.north(map), map)) {
    neighbors.push(this.north(map));
  }
  if (this.checkNeighbour(this.east(map), map)) {
    neighbors.push(this.east(map));
  }
  if (this.checkNeighbour(this.south(map), map)) {
    neighbors.push(this.south(map));
  }
  if (this.checkNeighbour(this.west(map), map)) {
    neighbors.push(this.west(map));
  }
  if (neighbors.length === 0) {
    this.alive = false;
  }
  return neighbors;
};
