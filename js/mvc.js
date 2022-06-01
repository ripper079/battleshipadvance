//MVC Pattern
//Model - View - Controller
var view =
{
	//Takes a string parameter and displays it in the message area
	displayMessage: function(pMessage)
	{
		let displayMessageArea = document.getElementById("messageArea");
		displayMessageArea.innerHTML = pMessage;
	},
	displayAuthor: function(pMessageAuthor)
	{
		let displayAuthor = document.getElementById("marketingDaniel");
		displayAuthor.innerHTML = pMessageAuthor;
	},
	displayHit: function(pLocation)
	{
		//pLocation is in the form of 00...06 Upper left to upper right
		//to 60...66 Lower left to Lower Right
		let cell = document.getElementById(pLocation);
		cell.setAttribute("class", "hit");
	},
	displayMiss: function(pLocation)
	{
		//pLocation is in the form of 00...06 Upper left to upper right
		//to 60...66 Lower left to Lower Right
		let cell = document.getElementById(pLocation);
		cell.setAttribute("class", "miss");
	}
}

var model =
{
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipSunk: 0,
	ships:
	[
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	],
	//Returns true or false for confirmed hit
	//pGuess in range 00...06(upperleft->upperright)
	//to 60...66 (lowerleft -> lowerright )
	fire: function(pGuess)
	{
		for (let i = 0; i < this.numShips; i++)
		{
			let ship = this.ships[i];
			let locations = ship.locations;
			let index = locations.indexOf(pGuess);
			//A HIT!!!!!!
			if (index >= 0)
			{
				//Make sound hit				
				let audio = new Audio("./sound/hit_sound.mp3");
				audio.play();

				ship.hits[index] = "hit";
				view.displayHit(pGuess);
				view.displayMessage("BIG HIT!!!");
				if (this.isSunk(ship))
				{
					view.displayMessage("You sank a battleship!");
					this.shipSunk++;
				}
				return true;
			}
		}
		//Make sound miss
		let audio = new Audio("./sound/miss_sound.mp3");
		audio.play();

		view.displayMiss(pGuess);
		view.displayMessage("MISS!");

		return false;
	},
	isSunk: function(pShip)
	{
		for (let i = 0; i < this.shipLength; i++)
		{
			if (pShip.hits[i] !== "hit")
				return false;
		}
		return true;
	},
	generateShipLocations: function()
	{
		let locations;
		for (let i = 0; i < this.numShips; ++i)
		{
			do
			{
				locations = this.generateShip();
			} while (this.collision(locations));

			this.ships[i].locations = locations;
		}
	},
	generateShip: function()
	{
		let direction = Math.floor(Math.random() * 2);
		let row, col;
		if (direction === 1)
		{
			//Starting location - Horizontal ship
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
		}
		else
		{
			//Starting location - Vertical ship
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
			col = Math.floor(Math.random() * this.boardSize);
		}

		let newShipLocations = [];
		for (let i = 0; i < this.shipLength; ++i)
		{
			if (direction === 1)
				newShipLocations.push(row + "" + (col + i));
			else
				newShipLocations.push((row + i) + "" + col);
		}
		return newShipLocations;
	},
	collision: function(pLocations)
	{
		for (let i = 0; i < this.numShips; i++)
		{
			let ship = model.ships[i];
			for (let j = 0; j < pLocations.length; j++)
			{
				if (ship.locations.indexOf(pLocations[j]) >= 0)
					return true;
			}
		}
		return false;
	}
};

var controller =
{
	guesses: 0,
	processGuess: function(pGuess)
	{		
		let location = (pGuess);
		if ((location != "boardGame") && (location != "marketingDaniel"))
		{
			//If cell is empty (no hit/miss pictures displayed) then do
			let cell = document.getElementById(location);
			let cellHasPicture = cell.hasAttribute("class");
			if (cellHasPicture == false)
			{
				this.guesses++;
				let hit = model.fire(location);

				//All ships sunken???
				if (hit && model.shipSunk === model.numShips)
				{
					//Percentage in decimal form
					let averageHitRatio = ((model.numShips*model.shipLength) / (this.guesses));
					//Convert to percentage form
					averageHitRatio = averageHitRatio * 100;
					averageHitRatio = Math.trunc(averageHitRatio);
					//Attach a % to form a finalString
					averageHitRatio = averageHitRatio + "%";

					//Play winner song with 1.5 seconds delay
					setTimeout("playWinnerAudio()", 1500);					

					//End Game
					view.displayMessage("You sank ALL Battleships brave warrior with " + this.guesses + " shots. Hit ratio: " + averageHitRatio + ". Reload page for playing one more time!");

					//Disable click function
					let gameBoard = document.getElementById("boardGame");
					gameBoard.onmousedown = null;
				}
			}
		}
	}
};

function playWinnerAudio()
{
	console.log("The winner in this: " + this);
	//Make winner sound
	let audio = new Audio("./sound/winner_sound.mp3");
	audio.play();
}

function init()
{
	//Display teaser title for encourage playing
	view.displayMessage("Welcome to Battleship Advance. Try to become the next Admiral?");
	//Bragging rights :D
	view.displayAuthor("Programmer Author: Daniel Oikarainen");

	//Register (callback) event handlers
	let gameBoard = document.getElementById("boardGame");
	gameBoard.onmousedown = handleMouseClick;

	//Create random locations for ships
	model.generateShipLocations();
}

function handleMouseClick(pEventObj)
{
	//Return the id of the cell! 00,01,02 ...64,65,66
	let guess = pEventObj.target.id;
	controller.processGuess(guess);
}

//Initialize game
init();
