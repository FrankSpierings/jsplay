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

class Fire {
	height = 32;
	width = 32;

	constructor() {
		this.loaded = false;

		this.sprites = ["./img/fire/fire_1.png", "./img/fire/fire_2.png"]
		this.frames = [];
		this.frameindex = 0;
	}

	onload(cb) {
		const self = this;


		let frames = [];
		for (let i = 0; i < self.sprites.length; i++) {				
			frames.push(loadImage(self.sprites[i]));
		}

		//Chain stditems before leftitems, using another nested Promise.All.
		Promise.all(frames).then(function (values) {
			self.frames = values;
			cb();
		})
	}


	getframe() {
		let frame = this.frames[this.frameindex];
		if ((this.frameindex + 1) >= this.frames.length) {
			this.frameindex = 0;
		}
		else {
			this.frameindex += 1;
		}
		return frame;
	}

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


		let stditems = [];
		for (let i = 0; i < self.sprites.length; i++) {				
			stditems.push(loadImage(self.sprites[i]));
		}

		let leftframes = [];
		for (let i = 0; i < self.sprites.length; i++) {				
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
		let frame = this.framearray[this.frameindex];
		if ((this.frameindex + 1) >= this.framearray.length) {
			this.frameindex = 0;
		}
		else {
			this.frameindex += 1;
		}
		console.debug("Frameindex: " + this.frameindex);
		return frame;
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
		this.bgcanvas = document.createElement("canvas");
		this.bgcanvas.id = "background"

		this.playercanvas = document.createElement("canvas");
		this.playercanvas.id = "player"

		this.itemcanvas = document.createElement("canvas");
		this.itemcanvas.id = "items"

		this.player = new Player();
		this.playerpos = [0, 0];

		let levelheight = this.player.height * 10;
		let levelwidht = this.player.width * 10;

		this.bgcanvas.height = levelheight;
		this.bgcanvas.width = levelwidht;
		this.bgcanvas.style = "z-index:1;position:absolute;left:0px;top:0px;zoom:200%";

		this.playercanvas.height = levelheight;
		this.playercanvas.width = levelwidht;
		this.playercanvas.style = "z-index:2;position:absolute;left:0px;top:0px;zoom:200%";

		this.itemcanvas.height = levelheight;
		this.itemcanvas.width = levelwidht;
		this.itemcanvas.style = "z-index:3;position:absolute;left:0px;top:0px;zoom:200%";

		let ctx = this.bgcanvas.getContext("2d");
		ctx.rect(0, 0, this.bgcanvas.height, this.bgcanvas.width);
		ctx.fillStyle = "gray";
		ctx.fill();

		document.body.appendChild(this.bgcanvas);
		document.body.appendChild(this.playercanvas);
		document.body.appendChild(this.itemcanvas);

	}

	onload(cb) {
		// Bind keyboard to movement
		document.onkeydown = this.keydown.bind(this);


		// Initialize player
		var self = this;
		this.player.onload(function () {
			let img = self.player.getframe();
			let ctx = self.playercanvas.getContext("2d");
			ctx.drawImage(img, self.playerpos[0], self.playerpos[1]);
		});


		// Initialize flame(s)
		this.fire = new Fire();
		this.fire.onload(function () {
			let img = self.fire.getframe();
			let ctx = self.itemcanvas.getContext("2d");
			ctx.drawImage(img, 4 * self.fire.height, 4 * self.fire.width);

			setInterval(function () {
				let img = self.fire.getframe();
				let ctx = self.itemcanvas.getContext("2d");
				let x = (4 * self.fire.height);
				let y = (4 * self.fire.width);
				let xsize = x + self.fire.height
				let ysize = y + self.fire.width
				ctx.clearRect(4 * self.fire.height, self.fire.width, xsize, ysize);
				ctx.drawImage(img, x, y);
				console.log('here');
			}, 400);
		})

		cb();
	}

	keydown(e) {
		e = e || window.event;
		let keyCode = e.keyCode;
		if (keyCode >= 37 && keyCode <= 40) {		 	
			e.preventDefault();
			let ctx = this.playercanvas.getContext("2d");
			ctx.clearRect(this.playerpos[0], this.playerpos[1], this.playerpos[0] + this.player.width, this.playerpos[1] + this.player.height);

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
			ctx.drawImage(this.player.getframe(), this.playerpos[0], this.playerpos[1]);
		    return false;
		}
	}

	boundcheck(pos) {			
		if ((pos[0] >= 0) && ((pos[0] + this.player.width) <= this.playercanvas.width) &&
			(pos[1] >= 0) && ((pos[1] + this.player.height) <= this.playercanvas.height))
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