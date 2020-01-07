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

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

class Fire {
	constructor() {
		this.loaded = false;

		this.sprites = ["./img/fire/fire_1.png", "./img/fire/fire_2.png"]
		this.height = 32;
		this.width = 32;

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

class Tree {
	constructor() {
		this.loaded = false;

		this.sprites = ["./img/tree/tree_1.png"];
		this.height = 32;
		this.width = 32;

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
	constructor() {
		this.loaded = false;

		this.sprites = ["./img/player/sprite_1.png", "./img/player/sprite_2.png"]
		this.height = 32;
		this.width = 32;
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

			self.loaded = true;
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
		// console.debug("Frameindex: " + this.frameindex);
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
		var self = this;

		this.bgcanvas = document.createElement("canvas");
		this.bgcanvas.id = "background"

		this.playercanvas = document.createElement("canvas");
		this.playercanvas.id = "player"

		this.itemcanvas = document.createElement("canvas");
		this.itemcanvas.id = "items"

		this.treecanvas = document.createElement("canvas");
		this.treecanvas.id = "trees"

		this.player = new Player();
		this.playerpos = [0, 0];

		this.fires = [
			{
				'position': [randInt(0,9), randInt(0,9)],
			},
			{
				'position': [randInt(0,9), randInt(0,9)],
			},
			{
				'position': [randInt(0,9), randInt(0,9)],
			}
		];

		this.trees = [
			{
				'position': [randInt(0,9), randInt(0,9)],
			},
			{
				'position': [randInt(0,9), randInt(0,9)],
			},
			{
				'position': [randInt(0,9), randInt(0,9)],
			},
			{
				'position': [randInt(0,9), randInt(0,9)],
			},
			{
				'position': [randInt(0,9), randInt(0,9)],
			},
			{
				'position': [randInt(0,9), randInt(0,9)],
			},
		];

		let levelheight = this.player.height * 10;
		let levelwidht = this.player.width * 10;

		this.bgcanvas.height = levelheight;
		this.bgcanvas.width = levelwidht;
		this.bgcanvas.style = "z-index:1;position:absolute;left:0;top:0;zoom:200%";

		this.playercanvas.height = levelheight;
		this.playercanvas.width = levelwidht;
		this.playercanvas.style = "z-index:2;position:absolute;left:0;top:0;zoom:200%";

		this.treecanvas.height = levelheight;
		this.treecanvas.width = levelwidht;
		this.treecanvas.style = "z-index:3;position:absolute;left:0;top:0;zoom:200%";

		this.itemcanvas.height = levelheight;
		this.itemcanvas.width = levelwidht;
		this.itemcanvas.style = "z-index:4;position:absolute;left:0;top:0;zoom:200%";

		let ctx = this.bgcanvas.getContext("2d");
		ctx.rect(0, 0, this.bgcanvas.height, this.bgcanvas.width);
		ctx.fillStyle = "gray";
		ctx.fill();

		let controldiv = document.createElement('div');
		controldiv.style = "position: relative;";

		this.buttonup = document.createElement("button");
		this.buttonup.innerHTML = "⬆️";
		this.buttonup.style = "font-size : 200%;"
		this.buttonup.addEventListener("click", function() {
		  self.playerUp();
		});
		controldiv.appendChild(this.buttonup);

		this.buttonleft = document.createElement("button");
		this.buttonleft.innerHTML = "⬅️";
		this.buttonleft.style = "font-size : 200%;"
		this.buttonleft.addEventListener("click", function() {
		  self.playerLeft();
		});
		controldiv.appendChild(this.buttonleft);

		this.buttonright = document.createElement("button");
		this.buttonright.innerHTML = "➡️";
		this.buttonright.style = "font-size : 200%;"
		this.buttonright.addEventListener("click", function() {
		  self.playerRight();
		});
		controldiv.appendChild(this.buttonright);

		this.buttondown = document.createElement("button");
		this.buttondown.innerHTML = "⬇️";
		this.buttondown.style = "font-size : 200%;"
		this.buttondown.addEventListener("click", function() {
		  self.playerDown();
		});
		controldiv.appendChild(this.buttondown);

		document.body.appendChild(controldiv);	
		

		let gamediv = document.createElement('div');
		gamediv.style = "position: relative;";
		gamediv.appendChild(this.bgcanvas);
		gamediv.appendChild(this.playercanvas);
		gamediv.appendChild(this.itemcanvas);
		gamediv.appendChild(this.treecanvas);
		document.body.appendChild(gamediv);

	}

	drawItems() {
		var self = this;
		let ctx = self.itemcanvas.getContext("2d");
		for (let i=0; i<this.fires.length; i++) {			
			let fire = new Fire();
			self.fires[i]['obj'] = fire;
			fire.onload(function () {
				let pos = self.fires[i]['position'];
				let img = fire.getframe();
				ctx.drawImage(img, pos[0] * fire.height, pos[1] * fire.width);
			})
		}

		for (let i=0; i<this.trees.length; i++) {			
			let tree = new Tree();
			self.trees[i]['obj'] = tree;
			tree.onload(function () {
				let pos = self.trees[i]['position'];
				let img = tree.getframe();
				self.treecanvas.getContext("2d").drawImage(img, pos[0] * tree.height, pos[1] * tree.width);
			})
		}
	}

	redrawItems() {
		var self = this;
		let ctx = self.itemcanvas.getContext("2d");
		for (let i=0; i<this.fires.length; i++) {			
			let fire = self.fires[i]['obj'];
			let pos = self.fires[i]['position'];
			let img = fire.getframe();
			ctx.clearRect(pos[0] * fire.height, pos[1] * fire.width, (pos[0] * fire.height) + fire.height, (pos[1] * fire.width) + fire.width);
			ctx.drawImage(img, pos[0] * fire.height, pos[1] * fire.width);
		}
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

		self.drawItems();

		setInterval(function () {
			self.redrawItems();
		}, 400);

		self.loaded = true;
		cb();
	}

	keydown(e) {
		e = e || window.event;
		let keyCode = e.keyCode;
		if (keyCode >= 37 && keyCode <= 40) {		 	
			e.preventDefault();

			if (keyCode == 38) {
				this.playerUp();
			}
			else if (keyCode == 40) {
			    this.playerDown();
			}
			else if (keyCode == 37) {
				this.playerLeft();
			}
			else if (keyCode == 39) {
				// right
				this.playerRight();	
			}			
		    return false;
		}
	}

	playerClear() {
		let ctx = this.playercanvas.getContext("2d");
		ctx.clearRect(this.playerpos[0], this.playerpos[1], this.playerpos[0] + this.player.width, this.playerpos[1] + this.player.height);
	}

	playerDraw(position) {
		let ctx = this.playercanvas.getContext("2d");
		ctx.drawImage(this.player.getframe(), this.playerpos[0], this.playerpos[1]);
	}

	playerUp() {
		this.playerClear();
		var newpos = [this.playerpos[0], this.playerpos[1] - this.player.height];
		if (this.boundcheck(newpos)) {
			this.playerpos = newpos;
		}
		this.player.up();
		this.playerDraw();
	}

	playerDown() {
		this.playerClear();
		var newpos = [this.playerpos[0], (this.playerpos[1] + this.player.height)];
		if (this.boundcheck(newpos)) {
			this.playerpos = newpos;
		}
		this.player.down();
		this.playerDraw();
	}

	playerLeft() {
		this.playerClear();
		var newpos = [(this.playerpos[0] - this.player.width), this.playerpos[1]];
		if (this.boundcheck(newpos)) {
			this.playerpos = newpos;
		}
		this.player.left();
		this.playerDraw();
	}

	playerRight() {
		this.playerClear();
		var newpos = [(this.playerpos[0] + this.player.width), this.playerpos[1]];
		 if (this.boundcheck(newpos)) {
		 	this.playerpos = newpos;
		 }
		 this.player.right();
		 this.playerDraw();
	}



	boundcheck(pos) {			
		if ((pos[0] >= 0) && ((pos[0] + this.player.width) <= this.playercanvas.width) &&
			(pos[1] >= 0) && ((pos[1] + this.player.height) <= this.playercanvas.height))
		{
			// console.debug("boundcheck: " + pos + " - OK");
			return true;
		}
		else 
		{
			// console.debug("boundcheck: " + pos + " - No way");
			return false;
		}
	}
}

var level = new Level();
level.onload(function () {});