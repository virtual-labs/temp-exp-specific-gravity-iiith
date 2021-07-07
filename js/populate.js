function genColumn(elem) {
	const column = document.createElement("div");
	column.classList.add('column', 'has-text-centered');
	elem.appendChild(column);
	return column;
};

function genCols(elem) {
	const cols = document.createElement("div");
	cols.classList.add('columns', 'is-centered');
	elem.appendChild(cols);
	return cols;
};

function genText(elem, metric, value) {
	const textElem = document.createElement("div");
	const text = document.createTextNode(metric + ': ' + String(value));
	textElem.appendChild(text);
	elem.appendChild(textElem);
};

function generateTableHead(table, title, keys) {
	const thead = table.createTHead();
	const titleRow = thead.insertRow();
	const titleth = document.createElement("th");
	titleth.colSpan = keys.length;
	const titleText = document.createTextNode(title);
	titleth.appendChild(titleText);
	titleRow.appendChild(titleth);

	const row = thead.insertRow();
	keys.forEach(function(key, ind) {
		const th = document.createElement("th");
		const text = document.createTextNode(key);
		th.appendChild(text);
		row.appendChild(th);
	});
};

function generateTable(table, data) {
	Object.keys(data['mobile']).forEach(function(metric, ind) {
		const row = table.insertRow();
		let cell = row.insertCell();
		let text = document.createTextNode(metric.charAt(0).toUpperCase() + metric.slice(1));
		cell.appendChild(text);

		cell = row.insertCell();
		text = document.createTextNode(data['mobile'][metric]);
		cell.appendChild(text);

		cell = row.insertCell();
		text = document.createTextNode(data['desktop'][metric]);
		cell.appendChild(text);
	});
};

function genLink(elem, link)
{
	const a = document.createElement('a');
	a.textContent = 'Detailed Report';
	a.href = link;
	a.target = "_blank";
	elem.appendChild(a);
};

function drawCircle(ctx, radius, color, percent) {
	percent = Math.min(Math.max(0, percent || 1), 1);
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, Math.PI * 2 * percent, false);
	ctx.strokeStyle = color;
	ctx.stroke();
};

function scoreDial(segment, score)
{
	const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
	const options = {
		size: 100,
		lineWidth: 5,
		rotate: 0
	};

	canvas.width = canvas.height = options.size;
	ctx.translate(options.size / 2, options.size / 2); // change center
	ctx.rotate((-1 / 2 + options.rotate / 180) * Math.PI); // rotate -90 deg

	const radius = (options.size - options.lineWidth) / 2;
	ctx.lineCap = 'round';
	ctx.lineWidth = options.lineWidth;

	let color = 'green';
	if(score < 50)
	{
		color = 'red';
	}

	else if(score < 90)
	{
		color = 'orange';
	}

	drawCircle(ctx, radius, '#efefef', 100 / 100);
	drawCircle(ctx, radius, color, score / 100);

	ctx.rotate((1 / 2 + options.rotate / 180) * Math.PI); // rotate 90 deg to original config
	ctx.font = "30px Arial";
	ctx.fillStyle = color;
	ctx.fillText(score, -15, 10);

	segment.appendChild(canvas);
};

function genTitle(elem, title) {
	const titleDiv = document.createElement("div");
	titleDiv.classList.add('subtitle', 'is-2');
	const text = document.createTextNode(title);
	titleDiv.appendChild(text);
	elem.appendChild(titleDiv);
};

function populate(main, link, data)
{
	Object.keys(data).forEach((device, idx) => {
		const segment = document.createElement("div");
		segment.id = device;
		segment.classList.add('segment');
		main.appendChild(segment);

		const titleCols = genCols(segment), dialsCols = genCols(segment), linkCols = genCols(segment);
		const titleColumn = genColumn(titleCols);
		genTitle(titleColumn, device[0].toUpperCase() + device.slice(1));

		Object.keys(data[device]).reverse().forEach(function(metric, ind) {
			if(metric === 'Scores')
			{
				Object.keys(data[device]['Scores']).forEach((key, ix) => {
					const column = genColumn(dialsCols);
					scoreDial(column, data[device]['Scores'][key]);

					const label = document.createElement("div");
					const text = document.createTextNode(key[0].toUpperCase() + key.slice(1));
					label.appendChild(text);
					column.appendChild(label);
				});
			}

			else if(metric === 'Detailed Report')
			{
				const column = genColumn(linkCols);
				genLink(column, data[device]['Detailed Report']);
			}

			else
			{
				const metricCols = genCols(segment);
				const column = genColumn(metricCols);
				genText(column, metric, data[device][metric]);
			}
		});
	});
};
