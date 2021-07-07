'use strict';

document.addEventListener('DOMContentLoaded', function() {

	const restartButton = document.getElementById('restart');
	const instrMsg = document.getElementById('procedure-message');

	restartButton.addEventListener('click', function() { restart(); });

	function randomNumber(min, max) {
		return (Math.random() * (max - min) + min).toFixed(2);
	};

	function logic(tableData)
	{
		const soilData = { 'Silt': randomNumber(2.65, 2.7), 'Sand': randomNumber(2.63, 2.67), 'Clay': randomNumber(2.67, 2.9) };
		tableData.forEach(function(row, index) {
			const ans = (Number)(soilData[row['Soil Type']]);
			row['Water Mass(g) [same volume as soil]'] = (wetSoilMass / ans).toFixed(2);
			row['Specific Gravity'] = ans;
		});
	};

	function limCheck(obj, translate, lim, step)
	{
		if(obj.pos[0] === lim[0])
		{
			translate[0] = 0;
		}

		if(obj.pos[1] === lim[1])
		{
			translate[1] = 0;
		}

		if(translate[0] === 0 && translate[1] === 0)
		{
			if(step === 2)
			{
				document.getElementById("output1").innerHTML = "Mass of pycnometer = " + String(10) + "g";
			}

			else if(step === 4)
			{
				document.getElementById("output2").innerHTML = "Mass of soil = " + String(wetSoilMass) + "g";
			}

			else if(step === enabled.length - 2)
			{
				logic(tableData);
				generateTableHead(table, Object.keys(tableData[0]));
				generateTable(table, tableData);

				document.getElementById("apparatus").style.display = 'none';
				document.getElementById("observations").style.width = '40%';
				if(small)
				{
					document.getElementById("observations").style.width = '85%';
				}
			}

			return step + 1;
		}

		return step;
	};

	function updatePos(obj, translate)
	{
		obj.pos[0] += translate[0];
		obj.pos[1] += translate[1];
	};

	class pycnometer {
		constructor(height, width, radius, x, y) {
			this.height = height;
			this.width = width;
			this.radius = radius;
			this.pos = [x, y];
			this.moves = [2];
		};

		draw(ctx, fill="white") {
			ctx.fillStyle = fill;
			ctx.lineWidth = 3;

			if(this.width < 2 * this.radius) 
			{
				this.radius = this.width / 2;
			}

			if(this.height < 2 * this.radius) 
			{
				this.radius = this.height / 2;
			}

			const e1 = [this.pos[0] + this.width, this.pos[1]], e2 = [...this.pos];
			const gradX = (e1[0] - e2[0]) / -4, gradY = 20;
			ctx.beginPath();
			ctx.moveTo(e2[0], e2[1]);
			curvedArea(ctx, e2, -1 * gradX, -1 * gradY);
			ctx.arcTo(this.pos[0] + this.width, this.pos[1] + this.height, this.pos[0], this.pos[1] + this.height, this.radius);
			ctx.arcTo(this.pos[0], this.pos[1] + this.height, this.pos[0], this.pos[1], this.radius);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		};
	};

	class soil {
		constructor(height, width, radius, x, y) {
			this.height = height;
			this.width = width;
			this.radius = radius;
			this.pos = [x, y];
			this.moves = [4];
		};

		draw(ctx) {
			if(this.width < 2 * this.radius) 
			{
				this.radius = this.width / 2;
			}

			if(this.height < 2 * this.radius) 
			{
				this.radius = this.height / 2;
			}

			ctx.beginPath();
			ctx.fillStyle = "#654321";
			ctx.lineWidth = lineWidth;
			ctx.beginPath();
	
			ctx.moveTo(this.pos[0] + this.radius, this.pos[1]);
			ctx.arcTo(this.pos[0] + this.width, this.pos[1], this.pos[0] + this.width, this.pos[1] + this.height, this.radius);
			ctx.arcTo(this.pos[0] + this.width, this.pos[1] + this.height, this.pos[0], this.pos[1] + this.height, this.radius);
			ctx.arcTo(this.pos[0], this.pos[1] + this.height, this.pos[0], this.pos[1], this.radius);
			ctx.arcTo(this.pos[0], this.pos[1], this.pos[0] + this.width, this.pos[1], this.radius);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		};

		heating(unit) {
			this.height -= unit;
		};
	};

	class weight{
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.img = new Image();
			this.img.src = './images/weighing-machine.png';
			this.img.onload = () => { ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height); }; 
			this.moves = [];
		};

		draw(ctx) {
			ctx.drawImage(objs['weight'].img, objs['weight'].pos[0], objs['weight'].pos[1], objs['weight'].width, objs['weight'].height);
		};
	};

	class water {
		constructor(height, width, radius, x, y) {
			this.height = height;
			this.width = width;
			this.radius = radius;
			this.pos = [x, y];
			this.moves = [6, 9];
		};

		draw(ctx) {
			new pycnometer(this.height, this.width, this.radius, this.pos[0], this.pos[1]).draw(ctx, "#1ca3ec");
		};

		adding(unit) {
			this.height -= unit;
			this.pos[1] += unit;
		};
	};

	function init()
	{
		document.getElementById("output1").innerHTML = "Mass of pycnometer = ___ g";
		document.getElementById("output2").innerHTML = "Mass of soil = ___ g";

		objs = {
			"weight": new weight(270, 240, 90, 160),
			"pycnometer": new pycnometer(180, 90, 8, 600, 180),
			"water": new water(10, 90, 8, 165, 175),
			"soil": new soil(60, 90, 8, 600, 270),
		};
		keys = [];

		enabled = [["weight"], ["weight", "pycnometer"], ["weight", "pycnometer"], ["weight", "pycnometer", "soil"], ["weight", "pycnometer", "soil"], ["weight", "pycnometer", "soil", "water"], ["weight", "pycnometer", "soil", "water"], ["pycnometer"], ["weight", "pycnometer", "water"], ["weight", "pycnometer", "water"], []];
		step = 0;
		translate = [0, 0];
		lim = [-1, -1];
	};

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 

		document.getElementById("inputForm").style.display = 'none';
		document.getElementById("apparatus").style.display = 'block';
		document.getElementById("observations").style.width = '';

		table.innerHTML = "";
		init();

		tmHandle = window.setTimeout(draw, 1000 / fps); 
	};

	function generateTableHead(table, data) {
		const thead = table.createTHead();
		const row = thead.insertRow();
		data.forEach(function(key, ind) {
			const th = document.createElement("th");
			const text = document.createTextNode(key);
			th.appendChild(text);
			row.appendChild(th);
		});
	};

	function generateTable(table, data) {
		data.forEach(function(rowVals, ind) {
			const row = table.insertRow();
			Object.keys(rowVals).forEach(function(key, i) {
				const cell = row.insertCell();
				const text = document.createTextNode(rowVals[key]);
				cell.appendChild(text);
			});
		});
	};

	function check(event, translate, flag=true)
	{ 
		if(translate[0] !== 0 || translate[1] !== 0)
		{
			return;
		}

		const canvasPos = [(canvas.width / canvas.offsetWidth) * (event.pageX - canvas.offsetLeft), (canvas.height / canvas.offsetHeight) * (event.pageY - canvas.offsetTop)];
		const errMargin = 10;

		let hover = false;
		canvas.style.cursor = "default";
		keys.forEach(function(val, ind) {
			if(canvasPos[0] >= objs[val].pos[0] - errMargin && canvasPos[0] <= objs[val].pos[0] + objs[val].width + errMargin && canvasPos[1] >= objs[val].pos[1] - errMargin && canvasPos[1] <= objs[val].pos[1] + objs[val].height + errMargin)
			{
				if(step === 2 && val === "pycnometer")
				{
					hover = true;
					translate[0] = -5;
					translate[1] = -5;
					lim[0] = 165;
					lim[1] = 55;
				}

				else if(step === 4 && val === "soil")
				{
					hover = true;
					translate[0] = -5;
					translate[1] = -5;
					lim[0] = 165;
					lim[1] = 175;
				}

				else if(step === 7 && val === "pycnometer") 
				{
					hover = true;
					if(flag)
					{
						keys = keys.filter(function(val, index) {
							return val !== "soil" && val !== "water";
						});

						objs['water'] = new water(0, 90, 8, 165, 235);
						step += 1;
					}
				}
			}
		});

		if(!flag && hover)
		{
			canvas.style.cursor = "pointer";
			translate[0] = 0;
			translate[1] = 0;
			lim[0] = 0;
			lim[1] = 0;
		}
	};

	const sliders = ["soilMass"];
	sliders.forEach(function(elem, ind) {
		const slider = document.getElementById(elem);
		const output = document.getElementById("demo_" + elem);
		output.innerHTML = slider.value; // Display the default slider value

		slider.oninput = function() {
			output.innerHTML = this.value;
			if(ind === 0)
			{
				wetSoilMass = this.value;
			}
		};
	});

	function curvedArea(ctx, e, gradX, gradY)
	{
		ctx.bezierCurveTo(e[0], e[1] += gradY, e[0] += gradX, e[1] += gradY, e[0] += gradX, e[1]);
		ctx.bezierCurveTo(e[0] += gradX, e[1], e[0] += gradX, e[1] -= gradY, e[0], e[1] -= gradY);
	};

	const canvas = document.getElementById("main");
	canvas.width = 840;
	canvas.height = 400;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9", border = "black", lineWidth = 1.5, fps = 150;
	const msgs = [
		"Click on 'Weighing Machine' in the apparatus menu to add a weighing machine to the workspace.", 
		"Click on 'Pycnometer' in the apparatus menu to add a pycnometer to the workspace.",
		"Click on the pycnometer to move it to the weighing machine and weigh it.",
		"Click on 'Soil Sample' in the apparatus menu, set appropriate input values (Soil Mass) and click 'Add' to add a soil sample to the workspace.",
		"Click on the soil sample to add it to the pycnometer and weigh it.",
		"Click on 'Water' in the apparatus menu to add water to the pycnometer and weigh the pycnometer contents.", 
		"Click on 'Water' in the apparatus menu to add water to the pycnometer and weigh the pycnometer contents.", 
		"Click on the pycnometer to empty it out.",
		"Click on 'Water' in the apparatus menu to fill the pycnometer with water and weigh it.", 
		"Click on 'Water' in the apparatus menu to fill the pycnometer with water and weigh it.", 
		"Click the restart button to perform the experiment again.",
	];

	let step, translate, lim, objs, keys, enabled, small;
	init();

	const tableData = [
		{ "Soil Type": "Silt", "Specific Gravity": "" },
		{ "Soil Type": "Sand", "Specific Gravity": "" },
		{ "Soil Type": "Clay", "Specific Gravity": "" },
	];

	const objNames = Object.keys(objs);
	objNames.forEach(function(elem, ind) {
		const obj = document.getElementById(elem);
		obj.addEventListener('click', function(event) {
			if(elem === "soil")
			{
				enabled[step].pop();
				document.getElementById("inputForm").style.display = 'block';
				return;
			}

			else if(elem === "water")
			{
				translate[1] = -1;
				lim[1] = 55;
			}

			keys.push(elem);
			step += 1;
		});
	});

	// Input Parameters 
	let wetSoilMass = 100; 
	canvas.addEventListener('mousemove', function(event) {check(event, translate, false);});
	canvas.addEventListener('click', function(event) {check(event, translate);});

	const submitButton = document.getElementById("submit"), table = document.getElementsByClassName("table")[0];
	submitButton.addEventListener('click', function(event) {
		document.getElementById("inputForm").style.display = 'none';
		enabled[step].push("soil");
		keys.push("soil");
		step += 1;
	});

	function responsiveTable(x) {
		if(x.matches)	// If media query matches
		{ 
			small = true;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '85%';
			}
		} 

		else
		{
			small = false;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '40%';
			}
		}
	};

	let x = window.matchMedia("(max-width: 1023px)");
	responsiveTable(x); // Call listener function at run time
	x.addListener(responsiveTable); // Attach listener function on state changes

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height); 
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		let ctr = 0;
		document.getElementById("main").style.pointerEvents = 'none';

		objNames.forEach(function(name, ind) {
			document.getElementById(name).style.pointerEvents = 'auto';
			if(keys.includes(name) || !(enabled[step].includes(name)))
			{
				document.getElementById(name).style.pointerEvents = 'none';
			}

			if(keys.includes(name)) 
			{
				if(enabled[step].includes(name))
				{
					ctr += 1;
				}
				objs[name].draw(ctx);
			}
		});

		if(ctr === enabled[step].length)
		{
			document.getElementById("main").style.pointerEvents = 'auto';
		}

		if(translate[0] !== 0 || translate[1] !== 0)
		{
			let temp = step;

			keys.forEach(function(key, ind) {
				if(objs[key].moves.includes(step))
				{
					if(key === "water")
					{
						objs[key].adding(translate[1]);
					}

					else
					{
						updatePos(objs[key], translate);
					}
					temp = limCheck(objs[key], translate, lim, step);
				}
			});

			step = temp;
		}

		document.getElementById("procedure-message").innerHTML = msgs[step];
		tmHandle = window.setTimeout(draw, 1000 / fps);
	};

	let tmHandle = window.setTimeout(draw, 1000 / fps);
});
