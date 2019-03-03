/*global Game*/
Game.Menu = function(game){
  this.game = game;
};

Game.Menu.prototype =  {
    create: function() {
        this.instructions = this.game.add.sprite(0, 0, 'intro');

        this.highestScore = parseInt(JSON.parse(localStorage.getItem('atRogueSlasherHighestScore')));
        if (this.highestScore > 0) {
          var scoreText = this.game.add.text(game.width / 2, game.height - 40, 'High Score: ' + this.highestScore);
          scoreText.font = 'kenney_future_narrowregular';
          scoreText.fontSize = 24;
          scoreText.anchor.setTo(0.5);
          scoreText.addColor('#8B572A', 0);
        }
    },
    update: function() {
      //Click to Start
      if (this.game.input.activePointer.isDown){
        this.game.state.start('Play');
      }
    }
};
