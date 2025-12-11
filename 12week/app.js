const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    KEY_EVENT_F: "KEY_EVENT_F",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    COLLISION_ENEMY_ULTIMATE: "COLLISION_ENEMY_ULTIMATE",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};

let heroImg, enemyImg, laserImg, lifeImg, explosionImg, ultimateImg,
    canvas, ctx,
    gameObjects = [],
    hero,
    eventEmitter,
    gameLoopId;
    isSurvivalMode = false, 
    survivalStartTime = 0; 

class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }

    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((l) => l(message, payload));
        }
    }

    clear() {
        this.listeners = {};
    }
}

class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }
}

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 60;
        this.height = 50;
        this.type = 'Hero';
        this.speed = { x: 0, y: 0 };
        this.cooldown = 0;
        this.life = 3;
        this.points = 0;
        this.ultimateCooldown = 0;
        this.wingmanId = setInterval(() => {
            this.fireWingmanLasers();
        }, 1000);
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.drawImage(this.img, this.x - 30, this.y + 20, this.width * 0.5, this.height * 0.5);
        ctx.drawImage(this.img, this.x + 60, this.y + 20, this.width * 0.5, this.height * 0.5);
    }

    fire() {
        if (isSurvivalMode) return;
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 25, this.y - 10));
            this.cooldown = 500;
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }

    fireWingmanLasers() {
        if (this.dead) return;
        gameObjects.push(new SecondaryLaser(this.x - 30 + 12, this.y + 20)); 
        gameObjects.push(new SecondaryLaser(this.x + 60 + 12, this.y + 20));
    }
    fireUltimate() {
        if (this.ultimateCooldown <= 0) {
            gameObjects.push(new Ultimate(this.x - 50, this.y - 300)); 
            
            this.ultimateCooldown = 3000;
            
            let id = setInterval(() => {
                if (this.ultimateCooldown > 0) {
                    this.ultimateCooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }
    canFire() {
        return this.cooldown === 0;
    }

    decrementLife() {
        this.life--;
        if (this.life === 0) {
            this.dead = true;
        }
    }

    incrementPoints() {
        this.points += 100;
    }

    stop() {
        clearInterval(this.wingmanId);
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                clearInterval(id);
            }
        }, 300);
    }
}

class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

class Meteor extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 40;  
        this.height = 70;
        this.type = "Meteor";
        this.img = meteorImg;
        this.speed = 5 + Math.random() * 10; 
        
        let id = setInterval(() => {
            if (this.y < canvas.height) {
                this.y += this.speed; 
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 50);
    }
}

class SecondaryLaser extends Laser {
    constructor(x, y) {
        super(x, y);
        this.width = 5;
        this.height = 15;
        this.type = 'Laser'; 
        this.img = laserImg;
    }
}

class Explosion extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Explosion";
        this.img = explosionImg;
        setTimeout(() => {
            this.dead = true;
        }, 300);
    }
}

class Ultimate extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 200;  
        this.height = 400; 
        this.type = 'Ultimate';
        this.img = ultimateImg;
        
        
        let id = setInterval(() => {
            if (this.y > -this.height) {
                this.y -= 10; 
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 50);
    }
}

function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}

function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

function displayMessage(message, color = "red") {
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function endGame(win) {
    clearInterval(gameLoopId);
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (win) {
            displayMessage(
                "Victory!!! Pew Pew... Press [Enter] to start a new game Captain Pew Pew",
                "green"
            );
        } else {
            displayMessage(
                "You died !!! Press [Enter] to start a new game Captain Pew Pew"
            );
        }
    }, 200);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawPoints();
    drawLife();

    if (isSurvivalMode) {
        let elapsed = Date.now() - survivalStartTime;
        let remaining = 10 - Math.floor(elapsed / 1000);

        ctx.font = "40px Arial";
        ctx.fillStyle = "orange";
        ctx.textAlign = "center";
        ctx.fillText("WARNING! METEOR SHOWER!", canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = "white";
        ctx.fillText("SURVIVE: " + remaining + "s", canvas.width / 2, canvas.height / 2);

        
        if (Math.random() < 0.7) { 
            createMeteor();
        }

        if (remaining <= 0) {
            isSurvivalMode = false;
            eventEmitter.emit(Messages.GAME_END_WIN);
        }
    } 

    updateGameObjects();
    drawGameObjects(ctx);
}

function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId);
        eventEmitter.clear();
        
        if (hero) {
            hero.stop();
        }

        initGame();
        gameLoopId = setInterval(updateGame, 100);
    }
}

function createEnemies() {
   const ROWS = 4;
    const ENEMY_WIDTH = 98;
    const ENEMY_HEIGHT = 50;

    for (let row = 0; row < ROWS; row++) {
        const rowEnemies = row + 1;
        const rowWidth = rowEnemies * ENEMY_WIDTH;
        const startX = (canvas.width - rowWidth) / 2;

        for (let i = 0; i < rowEnemies; i++) {
            const x = startX + i * ENEMY_WIDTH;
            const y = row * ENEMY_HEIGHT;
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function createHero() {
    hero = new Hero(
        canvas.width / 2 - 45,
        canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    gameObjects.push(hero);
}

function updateGameObjects() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const lasers = gameObjects.filter((go) => go.type === "Laser");
    const ultimates = gameObjects.filter((go) => go.type === "Ultimate");
    const meteors = gameObjects.filter((go) => go.type === "Meteor");
    lasers.forEach((l) => {
        enemies.forEach((m) => {
            if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: l,
                    second: m,
                });
            }
        });
    });
    ultimates.forEach((u) => {
        enemies.forEach((e) => {
            if (intersectRect(u.rectFromGameObject(), e.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_ULTIMATE, {
                    enemy: e, 
                });
            }
        });
    });
    enemies.forEach(enemy => {
        const heroRect = hero.rectFromGameObject();
        if (intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });
    meteors.forEach((meteor) => {
        const heroRect = hero.rectFromGameObject();
        if (intersectRect(heroRect, meteor.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy: meteor });
        }
    });
    gameObjects = gameObjects.filter((go) => !go.dead);
}

function drawGameObjects(ctx) {
    gameObjects.forEach((go) => go.draw(ctx));
}

function drawLife() {
    const START_POS = canvas.width - 180;
    for (let i = 0; i < hero.life; i++) {
        ctx.drawImage(
            lifeImg,
            START_POS + (45 * (i + 1)),
            canvas.height - 37
        );
    }
}

function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height - 20);
}

function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}

function isHeroDead() {
    return hero.life <= 0;
}

function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
    return enemies.length === 0;
}

function initGame() {
    isSurvivalMode = false;
    gameObjects = [];
    createEnemies();
    createHero();

    eventEmitter = new EventEmitter();

    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y -= 12;
    });
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y += 12;
    });
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x -= 12;
    });
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x += 12;
    });
    eventEmitter.on(Messages.KEY_EVENT_F, () => {
        hero.fireUltimate();
    });
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }
    });

   eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        hero.incrementPoints();
        gameObjects.push(new Explosion(second.x, second.y));
        
        if (isEnemiesDead()) {
            startSurvivalMode(); 
        }
    });

    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();
        
        if (isHeroDead()) {
            eventEmitter.emit(Messages.GAME_END_LOSS);
            return;
        }
        if (!isSurvivalMode && isEnemiesDead()) {
         startSurvivalMode(); 
    }
    });
    eventEmitter.on(Messages.COLLISION_ENEMY_ULTIMATE, (_, { enemy }) => {
        enemy.dead = true;
        hero.incrementPoints();
        gameObjects.push(new Explosion(enemy.x, enemy.y));
        
        if (isEnemiesDead()) {
            startSurvivalMode(); 
        }
    });

    eventEmitter.on(Messages.GAME_END_WIN, () => {
        endGame(true);
    });
    eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false);
    });
    
    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        resetGame();
    });
}
function startSurvivalMode() {
    if (isSurvivalMode) return; 
    isSurvivalMode = true;
    survivalStartTime = Date.now();
    gameObjects = gameObjects.filter(go => go.type !== "Laser" && go.type !== "Ultimate");
}

function createMeteor() {
    const x = Math.random() * (canvas.width - 50); 
    const meteor = new Meteor(x, -50); 
    gameObjects.push(meteor);
}

window.addEventListener("keydown", (e) => {
    switch (e.keyCode) {
        case 37:
        case 38:
        case 39:
        case 40:
        case 32:
            e.preventDefault();
            break;
    }
});

window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if (evt.keyCode === 32) {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    } else if (evt.key === "f" || evt.key === "F") {
        eventEmitter.emit(Messages.KEY_EVENT_F);
    } else if (evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    }
});

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    
    heroImg = await loadTexture("assets/png/player.png");
    enemyImg = await loadTexture("assets/png/enemyShip.png");
    laserImg = await loadTexture("assets/png/laserRed.png");
    lifeImg = await loadTexture("assets/png/life.png");
    explosionImg = await loadTexture("assets/png/laserRedShot.png");
    ultimateImg = await loadTexture("assets/png/one.gif");
    meteorImg = await loadTexture("assets/png/meteor.png");

    initGame();
    
    gameLoopId = setInterval(updateGame, 100);
};