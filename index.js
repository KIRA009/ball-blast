var Rectangle = function(x, y, width, height, color) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;
	var slide = 3;
	var up = 20;
	var self = this;

	this.slide = function(dir) {
		self.x += (dir * slide);

		if (self.x < 0) {
			self.x = 0;
			return;
		}

		if (self.x > game.vw - 100) {
			self.x = game.vw - 100;
			return;
		}
	}

	this.move = function() {
		self.y -= up;

		for (var i=0; i<game.balls.length; i++) {
			var ball = game.balls[i];
			var left = self.x;
			var width = self.x + self.width;
			if (width < ball.cx && width > ball.cx - ball.rad) {
				if (self.check(ball, 1)) {
					self.remove(ball);
				}
			}
			else if (left > ball.cx && left < ball.cx + ball.rad){
				if (self.check(ball, 0)) {
					self.remove(ball);
				}
			}
		}
	}

	this.check = function(ball, dir) {
		return Math.pow(ball.cx - self.x - dir * self.width, 2) + Math.pow(ball.cy - self.y, 2) < Math.pow(ball.rad, 2);
	}

	this.remove = function(ball) {
		if (self == game.cannon)
			return;
		game.bullets.splice(game.bullets.indexOf(self), 1);
		ball.score -= 1;
		if (ball.score <= 0) {
			game.add_score(ball.rad * 2);
			game.balls.splice(game.balls.indexOf(ball), 1);
			if (ball.rad < 35) return;
			game.balls.push(new Circle(ball.cx - ball.rad, ball.cy, Math.floor(ball.rad), [-1, ball.dirs[1]]));
			game.balls.push(new Circle(ball.cx + ball.rad, ball.cy, Math.floor(ball.rad), [1, ball.dirs[1]]));
		}
	}
}


var Circle = function(cx, cy, score, dirs) {
	var rand_color = function() {
		var r = Math.floor(Math.random() * 255);
		var g = Math.floor(Math.random() * 255);
		var b = Math.floor(Math.random() * 255);
  		var b_color = 'rgb(' + r + ',' + g + ' ,' + b + ')';
  		if (r > 128 || g > 128 || b > 128)
  			var f_color = '#000';
  		else
  			var f_color = '#fff';
  		return [b_color, f_color];
	}

	this.cx = cx;
	this.cy = cy;
	this.colors = rand_color();
	this.dirs = dirs || [1, 1];
	this.cy_init = cy > 300 ? 300 : 200;
	this.score = score || 60 + Math.floor(Math.random() * 100);
	this.rad = this.score * 0.5;
	var self = this;
	var hor = 5;
	var vert = 3;

	this.move = function() {
		if (self.cx + self.rad > game.vw - 60) {
			self.cx = game.vw - 60 - self.rad;
			self.dirs[0] = -1;
		}
		if (self.cx - self.rad < 0) {
			self.cx = self.rad;
			self.dirs[0] = 1;
		}
		if (self.cy + self.rad > game.vh - 50) {
			self.dirs[1] = -1;
			self.cy = game.vh - 50 - self.rad;
		}
		if (self.cy < self.cy_init) {
			self.cy = self.cy_init;
			self.dirs[1] = 1;
		}
		self.cx += (self.dirs[0] * hor);
		self.cy += (self.dirs[1] * vert);

		var left = game.cannon.x;
		var width = left + game.cannon.width;
		var top = game.cannon.y;
		var height = top + game.cannon.height;

		if (width < self.cx && width > self.cx - self.rad) {
			if (Math.pow(self.cx - width, 2) + Math.pow(self.cy - game.cannon.y, 2) < Math.pow(self.rad, 2) || (self.cy > top && self.cy < height)) {
				game.game_over = true;
				game.stop();
			}
		}
		else if (left > self.cx && left < self.cx + self.rad){
			if (Math.pow(self.cx - left, 2) + Math.pow(self.cy - game.cannon.y, 2) < Math.pow(self.rad, 2) || (self.cy > top && self.cy < height)) {
				game.game_over = true;
				game.stop();
			}
		}
	}
}


var Storage = function() {
	this.storage = window.localStorage;
	var self = this;
	this.set = function(high) {
		if (high == null) {
			high = (self.get() === "undefined" || self.get() === "null") ? 0 : self.get();
		}
		self.storage.setItem('high-score', high);
		high_score.innerHTML = high;
	}

	this.get = function() {
		return self.storage.getItem('high-score');
	}
}



var Game = function() {
	var self = this;
	this.vw = window.innerWidth;
	this.vh = window.innerHeight;

	this.init = function() {
		self.canvas = document.getElementsByTagName('canvas')[0];
		var body = document.getElementsByTagName('body')[0];
		body.addEventListener('keydown', self.move);
		body.addEventListener('keyup', self.move);
		self.canvas.height = self.vh;
		self.canvas.width = self.vw;
		self.ctx = self.canvas.getContext('2d');
		self.cannon = new Rectangle((self.vw - 20) * 0.5, self.vh - 150, 75, 95, '#31bbfc');
		self.bullets = [];
		self.balls = [];
		self.score = -1;
		self.kd = false;
		self.ongoing = false;
		self.game_over = true;
	}

	this.move = function(evt) {
		if (evt.type == 'keydown') {
			if (evt.keyCode == 32)
				self.toggle_state();
			if (evt.keyCode != 37 && evt.keyCode != 39)
				return;
			if (!self.kd) {
				self.kd = true;
				if (evt.keyCode == 37)
					var dir = -1;
				else if (evt.keyCode == 39)
					var dir = 1;
				mouse = setInterval(function() {
					self.cannon.slide(dir);
				}, 5);
			}
		}
		else {
			self.kd = false;
			try {clearInterval(mouse);}
			catch{}
		}
	}

	this.draw = function() {
		info.style.boxShadow = '';
		info.style.backgroundColor = '';
		info.style.top = '10px';
		info.innerHTML = "Press 'SPACEBAR' to pause / resume";
		self.painter = new Painter(self);
		self.painter.draw();
		self.add_score(1);
	}

	this.add_score = function(ds) {
		self.score += ds;
		cur_score.innerHTML = self.score;
	}

	this.toggle_state = function() {
		if (self.ongoing)
			self.stop();
		else
			self.resume();
	}

	this.start = function() {
		self.painter.create_bullets();
		self.painter.create_balls();
		self.game_over = false;
		self.ongoing = true;
		painting = setInterval(function() {
			self.painter.draw();
		}, 20);
	}

	this.stop = function() {
		try{clearInterval(bullet_factory);}
		catch{}
		try{clearInterval(ball_factory);}
		catch{}
		try{clearInterval(painting);}
		catch{}
		self.ongoing = false;
		if (self.game_over) {
			self.painter.drawImage(explosion, {x: self.cannon.x - 70, y: self.cannon.y - 80});
			smash.play();
			if (storage.get() < self.score)
				storage.set(self.score);
			setTimeout(function() {
				info.style.boxShadow = '0 0 100px 100px #dedede';
				info.style.backgroundColor = '#dedede';
				info.style.top = '45vh';
				info.innerHTML = 'Press \'SPACEBAR\' to restart';
			}, 100);
		}
	}

	this.resume = function() {
		if (self.game_over) {
			self.init();
			self.draw();
			self.start();
		}
		else if (!self.ongoing) {
			self.start();
		}
	}
}

var Painter = function(game_inst) {
	var self = this;
	this.game = game_inst;

	this.fill_circle = function(el) {
		self.game.ctx.beginPath();
		self.game.ctx.arc(el.cx, el.cy, el.rad, 0, 2*Math.PI);
		self.game.ctx.fillStyle = el.colors[0];
		self.game.ctx.fill();
		self.game.ctx.beginPath();
		self.game.ctx.font = '18px serif';
		self.game.ctx.fillStyle = el.colors[1];
		self.game.ctx.fillText(el.score, el.cx - el.score.toString().length * 5.2, el.cy + 5);
	}

	this.drawImage = function(image, el) {
		self.game.ctx.beginPath();
		self.game.ctx.drawImage(image, el.x, el.y);
	}

	this.create_bullets = function() {
		bullet_factory = setInterval(function() {
			self.game.bullets.push(new Rectangle(self.game.cannon.x + 18, self.game.cannon.y, 8, 10, 'brown'));
			self.game.bullets.push(new Rectangle(self.game.cannon.x + 28, self.game.cannon.y, 8, 10, 'brown'));
			self.game.bullets.push(new Rectangle(self.game.cannon.x + 38, self.game.cannon.y, 8, 10, 'brown'));
			self.game.bullets.push(new Rectangle(self.game.cannon.x + 48, self.game.cannon.y, 8, 10, 'brown'));
		}, 50);
	}

	this.create_balls = function() {
		ball_factory = setInterval(function() {
			if (self.game.balls.length < 4)
				self.game.balls.push(new Circle(100, 200))
		}, 5000);
	}

	this.draw = function() {
		self.game.ctx.clearRect(0, 0, self.game.canvas.width, self.game.canvas.height);
		self.game.ctx.beginPath();
		self.game.ctx.rect(0, 0, self.game.canvas.width, self.game.canvas.height);
		self.game.ctx.fillStyle = 'rgb(191, 191, 191)';
		self.game.ctx.fill();
		self.drawImage(cannon, self.game.cannon);
		for (var i=0; i<self.game.bullets.length; i++) {
			var bullet = self.game.bullets[i];
			self.drawImage(cannon_ball, bullet);
			bullet.move();
		}
		for (var i=0; i<self.game.balls.length; i++) {
			var ball = self.game.balls[i];
			self.fill_circle(ball);
			ball.move();
		}
	}
}

var cur_score = document.getElementById('cur-score');
var high_score = document.getElementById('high-score');
var info = document.getElementsByTagName('p')[0];
const relative_path = './resources/';
const cannon_ball = new Image();
const cannon = new Image();
const explosion = new Image();
const smash = new Audio();
cannon_ball.src = relative_path + 'cannon_ball.png';
cannon.src = relative_path + 'cannon.png';
explosion.src = relative_path + 'explosion.png';
smash.src = relative_path + 'smash.mp3';

var load = setInterval(function() {
	if (explosion.complete && cannon_ball.complete && cannon.complete && smash.readyState == 4) {
		game = new Game();
		storage = new Storage();
		storage.set();
		game.init();
		game.draw();
		game.start();
		clearInterval(load);
	}
}, 1000);