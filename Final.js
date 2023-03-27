function changeCanvas(letter){

    let canvas = document.getElementById('canvas');
	let context = canvas.getContext('2d');
	const svg = SVG().addTo('body');

	let isDrawing = false;
	let isErasing = false;
	let lastX = 0;
	let lastY = 0;
	let size = 5;
	let path = null;

	let undoStack = [];
	let redoStack = [];

	canvas.addEventListener('mousedown', function(e) {
		isDrawing = true;
		lastX = e.offsetX;
		lastY = e.offsetY;
	});

	canvas.addEventListener('mousemove', function(e) {
		if (isDrawing) {
            if (isErasing) {
                context.beginPath();
                context.arc(e.offsetX, e.offsetY, size / 2, 0, 2 * Math.PI);
                context.fillStyle = "#ffffff";
                context.fill();
              }
               else {
				context.beginPath();
				context.moveTo(lastX, lastY);
				context.lineTo(e.offsetX, e.offsetY);
				context.lineWidth = size;
				context.lineCap = 'round';
				context.stroke();
				lastX = e.offsetX;
				lastY = e.offsetY;
						
				undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
			}
		}
		if (!path) {
			path = svg.path(`M${lastX} ${lastY}`);
			path.stroke({ width: size, color: '#000000' });
		  } else if (path.array() && path.array().value) {
			path.plot(path.array().value.concat([lastX, lastY]));
		  }
	});

	canvas.addEventListener('mouseup', function() {
		isDrawing = false;
		redoStack = [];
	});

	document.getElementById('pen').addEventListener('click', function() {
		isErasing = false;
		canvas.style.cursor = 'default';
	});

	document.getElementById('eraser').addEventListener('click', function() {
		isErasing = true;
		canvas.style.cursor = 'cell';
	});

	document.getElementById('undo').addEventListener('click', function() {
		if (undoStack.length > 0) {
			redoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
			context.putImageData(undoStack.pop(), 0, 0);
		}
	});

	document.getElementById('redo').addEventListener('click', function() {
		if (redoStack.length > 0) {
			undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
			context.putImageData(redoStack.pop(), 0, 0);
		}
	});

	document.getElementById('clear').addEventListener('click', function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
			undoStack = [];
			redoStack = [];
	});

	document.getElementById('size-slider').addEventListener('change', function() {
		size = this.value;
	});

	function saveAsSVG() {
		let canvas = document.getElementById("canvas");
		let canvasSVG = canvas2svg(canvas);
		let svgData = canvasSVG.outerHTML;
		localStorage.setItem(letter, svgData); // Save SVG data to local storage
		document.getElementById('save-svg').href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
	}

	// Load SVG data from local storage if it exists
	if (localStorage.getItem(letter)) {
		let svgData = localStorage.getItem(letter);
		document.getElementById('save-svg').href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
	}
}