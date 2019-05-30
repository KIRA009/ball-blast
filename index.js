var Rectangle = function(x, y, width, height, color) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;
	var slide = 2;
	var up = 4;
	var self = this;

	this.move = function(dir) {
		if (self.y >= game.vh)
			return;
		if (dir == 'r')
			self.x += slide;
		else if (dir == 'l')
			self.x -= slide;
		else if (dir == 'u')
			self.y -= up;

		if (self.x < 0) {
			self.x = 0;
			return;
		}
		if (self.x > game.vw - 100) {
			self.x = game.vw - 100;
			return;
		}
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
		if (ball.score == 0) {
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
	var slide = 2;

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
		self.cx += (self.dirs[0] * slide);
		self.cy += (self.dirs[1] * slide);

		var left = game.cannon.x;
		var width = left + game.cannon.width;
		var top = game.cannon.y;
		var height = top + game.cannon.height;

		if (width < self.cx && width > self.cx - self.rad) {
			if (Math.pow(self.cx - width, 2) + Math.pow(self.cy - game.cannon.y, 2) < Math.pow(self.rad, 2))
				game.stop();
			else if (self.cy > top && self.cy < height)
				game.stop();
		}
		else if (left > self.cx && left < self.cx + self.rad){
			if (Math.pow(self.cx - left, 2) + Math.pow(self.cy - game.cannon.y, 2) < Math.pow(self.rad, 2))
				game.stop();
			else if (self.cy > top && self.cy < height)
				game.stop();
		}
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
		self.kd = false;
		self.ongoing = false;
	}

	this.move = function(evt) {
		if (evt.type == 'keydown') {
			if (evt.keyCode != 37 && evt.keyCode != 39)
				return;
			if (!self.kd) {
				self.kd = true;
				if (evt.keyCode == 37)
					var dir = 'l';
				else if (evt.keyCode == 39)
					var dir = 'r'
				mouse = setInterval(function() {
					self.cannon.move(dir);
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
		self.painter = new Painter(self);
		self.painter.draw();
	}

	this.start = function() {
		self.painter.create_bullets();
		self.painter.create_balls();
		painting = setInterval(function() {
			self.painter.draw();
		}, 10);
	}

	this.stop = function() {
		try{clearInterval(bullet_factory);}
		catch{}
		try{clearInterval(ball_factory);}
		catch{}
		try{clearInterval(painting);}
		catch{}
		console.log('Here');
		const explosion = new Image();
		explosion.src = 'explosion.png';
		explosion.onload = function(e) {
			self.painter.drawImage(explosion, {x: self.cannon.x - 70, y: self.cannon.y - 80});
		}
	}
}

var Painter = function(game_inst) {
	var self = this;
	this.game = game_inst;
	const cannon_ball = new Image();
	const cannon = new Image();
	cannon_ball.src = 'cannon_ball.png';
	cannon.src = 'cannon.png';

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
			self.game.bullets.push(new Rectangle(self.game.cannon.x + 25, self.game.cannon.y, 8, 10, 'brown'));
			self.game.bullets.push(new Rectangle(self.game.cannon.x + 40, self.game.cannon.y, 8, 10, 'brown'));
		}, 50);
	}

	this.create_balls = function() {
		ball_factory = setInterval(function() {
			if (self.game.balls.length < 4)
				self.game.balls.push(new Circle(100, 200))
		}, 10000);
		self.game.balls.push(new Circle(100, 200));
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
			bullet.move('u');
		}
		for (var i=0; i<self.game.balls.length; i++) {
			var ball = self.game.balls[i];
			self.fill_circle(ball);
			ball.move();
		}
	}
}

game = new Game();
game.init();
game.draw();
game.start();