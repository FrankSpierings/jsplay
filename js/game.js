function loadImage(src, flip) {
	return new Promise(function(resolve, reject) {
		const image = new Image();
		image.addEventListener('load', function () {
			if ((flip) & (flip == true)) {
				const canvas = document.createElement("canvas");
				canvas.height = this.height;
				canvas.width = this.width;
				const ctx = canvas.getContext("2d");
				ctx.translate(this.width, 0);
				ctx.scale(-1, 1);
				ctx.drawImage(image, 0, 0);
				
				const flippedImage = new Image();
				flippedImage.addEventListener('load', function () {
					resolve(flippedImage);
				});
				
				flippedImage.src = canvas.toDataURL();
			}
			else {
				resolve(image);
			}
		});
		image.src = src;
	});
}


class Player {
	height = 32;
	width = 32;

	constructor() {
		this.loaded = false;

		this.sprites = ["./img/player/sprite_1.png", "./img/player/sprite_2.png"]
		this.stdframes = [];
		this.leftframes = [];
		this.frameindex = 0;
	}

	onload(cb) {
		const self = this;


		var stditems = [];
		for (var i = 0; i < self.sprites.length; i++) {				
			stditems.push(loadImage(self.sprites[i]));
		}

		var leftframes = [];
		for (var i = 0; i < self.sprites.length; i++) {				
			leftframes.push(loadImage(self.sprites[i], true));
		}

		//Chain stditems before leftitems, using another nested Promise.All.
		Promise.all(stditems).then(function (values) {
			self.stdframes = values;
			return Promise.all(leftframes);
		}).then(function (values) {
			self.leftframes = values;
			self.framearray = self.stdframes;
			cb();
		})
	}

	getframe() {
		if ((this.frameindex + 1) >= this.framearray.length) {
			this.frameindex = 0;
		}
		else {
			this.frameindex += 1;
		}
		console.debug("Frameindex: " + this.frameindex);
		return this.framearray[this.frameindex];
	}

	left() {
		this.framearray = this.leftframes;
	}

	right() {
		this.framearray = this.stdframes;
	}

	up() {

	}

	down() {

	}
}

class Level {
	constructor () {
		this.canvas = document.createElement("canvas");
		this.canvas.id = "GameCanvas"

		document.body.appendChild(this.canvas);

		this.player = new Player();
		this.playerpos = [0, 0];

		this.canvas.height = this.player.height * 10;
		this.canvas.width = this.player.width * 10;
		this.canvas.style = "z-index:1;position:absolute;left:0px;top:0px;";

		this.ctx = this.canvas.getContext("2d");
	}

	onload(cb) {			
		document.onkeydown = this.keydown.bind(this);

		var self = this;
		this.player.onload(function () {
			var img = self.player.getframe();
			self.ctx.drawImage(img, self.playerpos[0], self.playerpos[1]);
		});

		cb();
	}

	keydown(e) {
		e = e || window.event;
		var keyCode = e.keyCode;
		if (keyCode >= 37 && keyCode <= 40) {
			e.preventDefault();
			this.ctx.clearRect(this.playerpos[0], this.playerpos[1], this.playerpos[0] + this.player.width, this.playerpos[1] + this.player.height);

			var width = this.player.width;
			var height = this.player.height;

			if (keyCode == 38) {
				// up
				var newpos = [this.playerpos[0], this.playerpos[1] - this.player.height];
				if (this.boundcheck(newpos)) {
					this.playerpos = newpos;
				}
				this.player.up();
			}
			else if (keyCode == 40) {
			    // down
			    var newpos = [this.playerpos[0], (this.playerpos[1] + this.player.height)];
			    if (this.boundcheck(newpos)) {
			    	this.playerpos = newpos;
			    }
			    this.player.down();
			}
			else if (keyCode == 37) {
				// left
			   	var newpos = [(this.playerpos[0] - this.player.width), this.playerpos[1]];
			    if (this.boundcheck(newpos)) {
			    	this.playerpos = newpos;
			    }
			    this.player.left();
			}
			else if (keyCode == 39) {
				// right
			   	var newpos = [(this.playerpos[0] + this.player.width), this.playerpos[1]];
			    if (this.boundcheck(newpos)) {
			    	this.playerpos = newpos;
			    }
			    this.player.right();
			}
			this.ctx.drawImage(this.player.getframe(), this.playerpos[0], this.playerpos[1]);
		    return false;
		}
	}

	boundcheck(pos) {			
		if ((pos[0] >= 0) && ((pos[0] + this.player.width) <= this.canvas.width) &&
			(pos[1] >= 0) && ((pos[1] + this.player.height) <= this.canvas.height))
		{
			console.debug("boundcheck: " + pos + " - OK");
			return true;
		}
		else 
		{
			console.debug("boundcheck: " + pos + " - No way");
			return false;
		}
	}
}

var level = new Level();
level.onload(function () {});