//******************************************************************************
// PLATE (LAYER) object - Plate (Layer) is an array of wells; well is a collection of properties
//******************************************************************************
class Layer {
	constructor(I) {
		let r = I.Rows;
		let c = I.Cols;
		this.Plate = I.Plate;
		this.Rows = r;
		this.Cols = c;
		this.Index = I.Index;
		this.ArrayIndex = I.ArrayIndex;
		this.Wells = [];
		this.Highlight = undefined; //
		this.Contents = undefined;  //References to the DOM canvas elements
		this.Grid = undefined;		//
		this.Selected = undefined; //Wells currently selected
		this.Root = "Layer_" + I.Index;
		this.Name = `Plate ${this.Index + 1}`;
		this.Metadata = {};
		this.ExportedName = this.Name;
		let index = 0;
		for(let i=0;i<r;i++) { //Rows
			for(let j=0;j<c;j++) { //Columns
				this.Wells.push(new Well({Index: index, Row: i, Col: j, Layer: this}));
				index++;
			}
		}
		return this;
	}

	//Static methods
	static rootHTML(name, root) { //Return the html used as root for the plate (layer)
		return '<fieldset><legend id="legend_' + root + '">' + this.legendInnerHTML(name) + '</legend><div id="' + root + '" style="position: relative;"></div></fieldset>';
	}

	static legendInnerHTML(name) { //Return the html used as the innerHTML for the legend of the layer fieldset
		return `<span>${name} &bull; </span>`;
	}
	static exportControls(l) { //Create controls allowing export of the plate (layer) as jpg or html, for the passed plate (layer) object
		let b = LinkCtrl.buttonBar([ //Create the button bar
			this.getAsJPGControl(l),
			this.getAsHTMLControl(l),
			this.getAsTxtControl(l),
		], true); //The second argument is to get the buttonbar inline
		b.style.fontWeight = "normal";
		b.style.fontSize = "0.7em";
		GetId(l.Root).previousSibling.append(b); //Append the button
	}
	static getAsJPGControl(l) { //Returns an object suitable to create a button (using the LinkCtrl constructor) that will output the plate (layer) l as a jpg
		let action = function() { //The click action for the button
			let canvas = document.createElement("canvas"); //Create an empty canvas element
			canvas.height = l.Grid.height; //Define its size to match that of the Grid
			canvas.width = l.Grid.width;
			let ctx = canvas.getContext("2d");
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.width, canvas.height); //Apply a white background first, to prevent transparent pixels from turning black
			ctx.drawImage(l.Grid, 0, 0); //Draw the grid and contents, drop the highlight
			ctx.drawImage(l.Contents, 0, 0);
			let href = canvas.toDataURL('image/jpeg');
			Reporter.printable("<p><b>Plate " + (l.ArrayIndex + 1) + "</b></p><img src=\"" + href + "\"></img>");
		};
		return {Label: "jpg", Title: "Click here to view this plate as a .jpg image file", Click: action};
	}

	static getAsHTMLControl(l) { //Returns an object suitable to create a button (using the LinkCtrl constructor) that will output the layer l as an html array
		const id = 'Form_GetAsHTML';
		const controls = id + '_Controls';
		const output = id + '_Output';

		const updateOutput = function (dataList, metadataDisplayState) {
			document.getElementById(output).innerHTML = dataList
				.sort(([prevLayer], [nextLayer]) => {
					if (prevLayer.Index > nextLayer.Index) return 1;
					else if (prevLayer.Index < nextLayer.Index) return -1;
					else return 0;
				})
				.map(([layer]) => {
					return [layer, Layer.getAsHTML(l, metadataDisplayState)];
				})
				.map(([layer, data]) => {
					const showPlateMetadata = _.some(Object.values(metadataDisplayState.plate), Boolean);
					const plateMetadataSection = showPlateMetadata
						? '<p>'
						+ ((metadataDisplayState.plate.cellLine)
							? '<div>Cell line: ' + (layer.Metadata.CellLine || '') + '</div>'
							: '')
						+ ((metadataDisplayState.plate.cellLinePassage)
							? '<div>Cell line passage: ' + (layer.Metadata.CellLinePassage || '') + '</div>'
							: '')
						+ ((metadataDisplayState.plate.transfectionReagent)
							? '<div>Transfection reagent: ' + (layer.Metadata.TransfectionReagent || '') + '</div>'
							: '')
						+ ((metadataDisplayState.plate.transfectionReagentLOT)
							? '<div>Transfection reagent LOT: ' + (layer.Metadata.TransfectionReagentLOT || '') + '</div>'
							: '')
						+ ((metadataDisplayState.plate.transfectionEndPoint)
							? '<div>Transfetcion end point: ' + (layer.Metadata.TransfectionEndPoint || '') + '</div>'
							: '')
						+ '</p>'
						: '';

					return (
						'<div><p><b>'
						+ (layer.Name)
						+ '</b></p>'
						+ plateMetadataSection
						+ data.HTML
						+ '</div>'
					);
				}).join('<br/>');
		};

		const action = function () { //The click action for the button
			const metadataDisplayState = {
				plate: {
					cellLine: false,
					cellLinePassage: false,
					transfectionReagent: false,
					transfectionReagentLOT: false,
					transfectionEndPoint: false,
				},
				well: {
					cellsPerWell: true,
					concentration: true,
					transfectionReagentAmount: true,
				}
			};
			//Layer.getAsHTML(l) - This will get the html for unresolved items and run the promises to get the content for ranges
			let dataList = [[l]];
			const layerSelectControls = Editor.Plate.Layers.map(layer => {
				return LinkCtrl.new('Checkbox', {
						ID: `plate_checkbox-${layer.Index}`,
						Default: layer.Index === l.Index,
						Label: layer.Name,
						NewLine: true,
						Change: function (checked) {
							if (checked) {
								dataList = [...dataList, [layer]];
							} else {
								dataList = dataList.filter(([layerItem]) => layerItem.Index !== layer.Index);
							}
							updateOutput(dataList, metadataDisplayState);
						}.bind(this),
						Title: 'Check to display the plate'
					}
				);
			});
			const layerSelectControlsContainers = Editor.Plate.Layers.map(layer => {
				return `<div id="plate_checkbox-${layer.Index}"></div>`;
			}).join('');

			const layerMetadataControls = [
				LinkCtrl.new('Checkbox', {
						ID: `plate_metadata_checkbox-cellLine`,
						Default: metadataDisplayState.plate.cellLine,
						Label: 'Cell line',
						NewLine: false,
						Change: function (checked) {
							metadataDisplayState.plate.cellLine = checked;
							updateOutput(dataList, metadataDisplayState);
						}.bind(this),
						Title: 'Check to display the cell line value'
					}
				),
				LinkCtrl.new('Checkbox', {
						ID: `plate_metadata_checkbox-cellLinePassage`,
						Default: metadataDisplayState.plate.cellLinePassage,
						Label: 'Cell Line Passage',
						NewLine: false,
						Change: function (checked) {
							metadataDisplayState.plate.cellLinePassage = checked;
							updateOutput(dataList, metadataDisplayState);
						}.bind(this),
						Title: 'Check to display the cell line value'
					}
				),
				LinkCtrl.new('Checkbox', {
						ID: `plate_metadata_checkbox-transfectionReagent`,
						Default: metadataDisplayState.plate.transfectionReagent,
						Label: 'Transfection Reagent',
						NewLine: false,
						Change: function (checked) {
							metadataDisplayState.plate.transfectionReagent = checked;
							updateOutput(dataList, metadataDisplayState);
						}.bind(this),
						Title: 'Check to display the cell line value'
					}
				),
				LinkCtrl.new('Checkbox', {
						ID: `plate_metadata_checkbox-transfectionReagentLOT`,
						Default: metadataDisplayState.plate.transfectionReagentLOT,
						Label: 'Transfection Reagent LOT',
						NewLine: false,
						Change: function (checked) {
							metadataDisplayState.plate.transfectionReagentLOT = checked;
							updateOutput(dataList, metadataDisplayState);
						}.bind(this),
						Title: 'Check to display the cell line value'
					}
				),
				LinkCtrl.new('Checkbox', {
						ID: `plate_metadata_checkbox-transfectionEndPoint`,
						Default: metadataDisplayState.plate.transfectionEndPoint,
						Label: 'Transfection End-Point',
						NewLine: false,
						Change: function (checked) {
							metadataDisplayState.plate.transfectionEndPoint = checked;
							updateOutput(dataList, metadataDisplayState);
						}.bind(this),
						Title: 'Check to display the cell line value'
					}
				),
			];
			const layerMetadataControlsContainers = `<span id="plate_metadata_checkbox-cellLine"></span>`
				+ `<span id="plate_metadata_checkbox-cellLinePassage"></span>`
				+ `<span id="plate_metadata_checkbox-transfectionReagent"></span>`
				+ `<span id="plate_metadata_checkbox-transfectionReagentLOT"></span>`
				+ `<span id="plate_metadata_checkbox-transfectionEndPoint"></span>`;

			const wellMetadataControls = [
				LinkCtrl.new('Checkbox', {
						ID: `well_metadata_checkbox-cellsPerWell`,
						Default: metadataDisplayState.well.cellsPerWell,
						Label: 'Number of Cells per Well',
						NewLine: false,
						Change: function (checked) {
							metadataDisplayState.well.cellsPerWell = checked;
							updateOutput(dataList, metadataDisplayState);
						}.bind(this),
						Title: 'Check to display the cell line value'
					}
				),
				LinkCtrl.new('Checkbox', {
						ID: `well_metadata_checkbox-concentration`,
						Default: metadataDisplayState.well.concentration,
						Label: 'Concentration',
						NewLine: false,
						Change: function (checked) {
							metadataDisplayState.well.concentration = checked;
							updateOutput(dataList, metadataDisplayState);
						}.bind(this),
						Title: 'Check to display the cell line value'
					}
				),
				LinkCtrl.new('Checkbox', {
						ID: `well_metadata_checkbox-transfectionReagentAmount`,
						Default: metadataDisplayState.well.transfectionReagentAmount,
						Label: 'Transfection Reagent Amount',
						NewLine: false,
						Change: function (checked) {
							metadataDisplayState.well.transfectionReagentAmount = checked;
							updateOutput(dataList, metadataDisplayState);
						}.bind(this),
						Title: 'Check to display the cell line value'
					}
				),
			];
			const wellMetadataControlsContainers = `<span id="well_metadata_checkbox-cellsPerWell"></span>`
				+ `<span id="well_metadata_checkbox-concentration"></span>`
				+ `<span id="well_metadata_checkbox-transfectionReagentAmount"></span>`;

			Form.open({ //Open an empty form with waiting message
				ID: id,
				HTML: '<div id="' + controls + '" style="margin: 10px">'
					+ '<p class="Error">Resolving names, please wait...</p></div>'
					+ '<div style="display: flex;">' + layerSelectControlsContainers + '</div>'
					+ '<div><h4>Show plate metadata</h4>' + layerMetadataControlsContainers + '</div>'
					+ '<div><h4>Show well metadata</h4>' + wellMetadataControlsContainers + '</div>'
					+ '<div id=' + output + ' style="overflow: auto"></div>',
				Size: 1000,
				Title: 'Plate as HTML',
				Buttons: [
					{
						Label: 'Printable Version', Click: function () {
							Reporter.printable(GetId(output).innerHTML);
						}, Title: 'Display the plate in a new window to allow easy printing or copy/pasting to other applications'
					},
					{Label: 'Close', Icon: {Type: 'Cancel', Space: true, Color: 'Red'}, Click: function () {Form.close(id);}},
				],
				onInit: () => {
					[
						...layerSelectControls,
						...layerMetadataControls,
						...wellMetadataControls,
					].forEach(control => control.init());
					updateOutput(dataList, metadataDisplayState);
				}
			});
			Promise.all(
				dataList
					.map(([layer]) => {
						return [layer, Layer.getAsHTML(l, metadataDisplayState)];
					})
					.map(([, data]) => data.Promises)
					.flat()
			)
				.then(function (values) { //Wait for promises to resolve, then process the values
					if (values.length == 0) {
						GetId(controls).remove();
						return;
					} //There are no ranges/definitions, so no need of controls and we can leave here
					const rows = l.Rows;
					const cols = l.Cols;
					const table = GetId(output).children[1]; //The table with the plate (layer) data
					for (let i = 0; i < rows; i++) { //Travel all the rows
						for (let j = 0; j < cols; j++) { //Travel all the cols
							const span = table.rows[i + 1].cells[j + 1].children[2]; //Important to access at row+1/cell+1 because of the headers
							if (span && span.hasAttributes('resolved')) { //If this span exists and has the attribute for a resolved name
								let resolved = false;
								values.forEach(function (v) { //Travel the ranges definitions to update the current well
									const def = v.Definition[i * cols + j]; //The definition value
									if (def !== '') { //We expect only one possible definition per well, since we work on a single plaet (layer)
										span.setAttribute('resolved', def);
										resolved = true;
									}
								});
								if (resolved == false) {span.setAttribute('resolved', span.getAttribute('generic'));} //This well has no resolvable definitions, its resolved name should be same as the generic name
							}
						}
					}
					const ctrl = LinkCtrl.new('Checkbox', {
						ID: controls, Label: 'Show resolved Names', Default: false, Change: function (v) { //The control allowing switching from generic to resolved names
							const coll = GetId(output).getElementsByClassName('Resolved_Definition'); //Get the switchable elements
							const n = coll.length;
							for (let k = 0; k < n; k++) { //Travel the collection to switch the names
								if (v) {coll[k].innerHTML = coll[k].getAttribute('resolved');} else {coll[k].innerHTML = coll[k].getAttribute('generic');}
							}
						}, Title: 'Tick to show the resolved names instead of the generic names for the ranges'
					});
					ctrl.init(); //Display the control
				});
		};
		return {Label: 'html', Title: 'Click here to view this plate as an html array', Click: action};
	}

	static getAsHTML(l, metadataDisplayState) { //Returns a html table filled with the content of the plate (layer) passed (area & conc data)
		const rows = l.Rows;
		const cols = l.Cols;
		const ranges = []; //The array of ranges that will need to be processed for definitions
		let html = '<table style="text-align: center; "><tr><th></th>';
		for (let j = 0; j < cols; j++) { //Headers, for each col
			html += '<th>' + (j + 1) + '</th>';
		}
		html += '</tr>';
		for (let i = 0; i < rows; i++) { //For each row
			html += '<tr><th>' + Well.alphabet(i) + '</th>';
			for (let j = 0; j < cols; j++) { //For each col
				const well = l.Wells[i * cols + j];
				const area = well.Area;
				let bgColor = 'white'; //Default values
				let color = 'black';
				let name = '';
				let metadataNumberOfCellsPerWell = '';
				let metadataConcentration = '';
				let metadataTransfectionReagentAmount = '';
				if (area) { //Area information
					bgColor = area.Color;
					color = CSSCOLORS.font(area.Color); //Adapt font (black/white) depending on the background
					name = '<span style="font-weight: bold; border: 1px solid black; padding: 0em 0.1em; margin-right: 0.2em">'
						+ TypeMap.symbolForValue(TypeMap.valueForType(area.Type))
						+ '</span>'
						+ area.Name;
					if (area.Type == 'Range') {
						//For ranges, first collect all the different ranges as they come, then fetch the items at once at the end.
						//This is way faster than waiting for each well to return the resolved value
						name += '&nbsp;(#' + well.RangeIndex
							+ ')<br><span style="font-style: italic; padding:0.1em" class="Resolved_Definition" resolved="" generic="#'
							+ well.RangeIndex + '">#'
							+ well.RangeIndex
							+ '</span>'; //Prepare placeholders for generice/resolved values, resolved values will be added later
						if (ranges.find(function (r) {return r.Name == area.Name;}) === undefined) {
							ranges.push(area); //Push unique ranges
						}
					}
					if (metadataDisplayState.well.cellsPerWell && typeof well.Metadata.NumberOfCellsPerWell === 'number') {
						metadataNumberOfCellsPerWell = `<div style="white-space: nowrap;"><span>Cells per well: </span><span>${well.Metadata.NumberOfCellsPerWell || ''}</span></div>`
					}
					if (metadataDisplayState.well.concentration && typeof well.Metadata.Concentration === 'number') {
						metadataConcentration = `<div style="white-space: nowrap;"><span>Concentration: </span><span>${well.Metadata.Concentration || ''}</span></div>`
					}
					if (metadataDisplayState.well.transfectionReagentAmount && typeof well.Metadata.TransfectionReagentAmount === 'number') {
						metadataTransfectionReagentAmount = `<div style="white-space: nowrap;"><span>Reagent amount: </span><span>${well.Metadata.TransfectionReagentAmount || ''}</span></div>`
					}
				}
				html += '<td style="background-color:' + bgColor
					+ '; color: ' + color
					+ '; padding: 0.2em; border: 1px solid black">'
					+ name
					+ '<br>'
					+ metadataNumberOfCellsPerWell
					+ metadataConcentration
					+ metadataTransfectionReagentAmount
					+ Well.dose(well) + '</td>';
			}
			html += '</tr>';
		}
		html += '</table>';
		const promises = [];
		ranges.forEach(function (range) {
			if (range.Definition) { //If this range has an existing definition
				promises.push(Definition.getAsPlate(range.Definition)); //Push the promise
			}
		});
		return {HTML: html, Promises: promises}; //Return the promises without waiting for resolution
	}
	static getAsTxtControl(l) { //Returns an object suitable to create a button (using the LinkCtrl constructor) that will output the plate (layer) l as a tab-delimited txt file
		let Cancelled = false; //Tracker for cancellation
		let action = function() { //The click action for the button
			let id = "Form_GetAsTxt";
			let controls = id + "_Controls";
			let output = id + "_Output";
			let data = Layer.getAsTxt(l); //This will run the promises to get the content for ranges
			Form.open({ //Open an empty form with waiting message
				ID: id,
				HTML: "<p class=\"Error\">Resolving names, please wait...</p>",
				Size: 700,
				Title: "Plate as Txt",
				Buttons: [
					{Label: "Cancel", Icon: {Type: "Cancel", Space: true, Color: "Red"}, Click: function() {Cancelled = true; Form.close(id)} },
				],
			});
			Promise.all(data.Promises).then(function(values) { //Wait for promises to resolve, then process the values
				if(Cancelled) {return} //Action was cancelled
				let save = l.toTxt(values); //Create the output string
				Form.close(id); //Close the waiting form
				Form.download(save, {FileName: "Plate_" + (l.ArrayIndex + 1) + ".txt"}); //Form for the download
			});
		};
		return {Label: "txt", Title: "Click here to generate a tab-separated .txt file representing the content of this plate as a list", Click: action};
	}
	static getAsTxt(l) {
		let ranges = []; //The array of ranges that will need to be processed for definitions
		l.Wells.forEach(function(w) { //Travel each well to recover the ranges that need resolution
			let a = w.Area;
			if(a !== undefined && a.Type == "Range") { //A range
				if(ranges.find(function(r) {return r.Name == a.Name}) === undefined) {ranges.push(a)} //Push unique ranges
			}
		});
		let promises = [];
		ranges.forEach(function(r) { //Travel the ranges
			if(r.Definition) { //If this range has an existing definition
				promises.push(Definition.getAsPlate(r.Definition)); //Push the promise
			}
		});
		return {Promises: promises};
	}
//*******************
//SAVE & LOAD METHODS
//*******************
	static save(lay) { //Return a JSON.stringify version of the plate (layer) object for saving
		let out = [];
		lay.Wells.forEach(function(w) { //Area data are saved separately, so only the concentration data are needed here
			if(w.Conc) {
				out.push(Well.save(w));
			}
		});
		return out;
	}
	static load(l, data, digit, size, margin) { //Update the provided plate (layer) with the data provided
		data.forEach(function(w) {
			let target = l.Wells[w.Index];
			if(target) {
				target.tagConc({Value: w.Value, Unit: w.Unit, Digit: digit});
			}
		});
	}
//*******************
	static resize(l, r, c) { //Resize the plate (layer) to new dimension, keeping concentration data if needed
		let oldRows = l.Rows;
		let oldCols = l.Cols;
		let temp = []; //The new Wells array
		var index = 0; //Index in the new dimension
		let i = 0;
		while(i < r) {
			let j = 0;
			while(j < c) {
				if(j < oldCols && i < oldRows) { //Salvage the old wells
					let w = l.Wells[oldCols * i + j]; //The old well at this location
					w.Index = index; //Update the index
					temp.push(w);
				}
				else { //Otherwise, push a new well
					temp.push(new Well({Index: index, Row: i, Col: j, Layer: l}));
				}
				index++;
				j++;
			}
			i++;
		}
		l.Wells = temp; //Update the plate (layer) array
		l.Rows = r; //Update plate (layer) size
		l.Cols = c; //
	}
	static getCoords(e) { //Returns the coordinates for the event e, normalized for either mouse or touch screen events
		if(e.clientX) { //Mouse event
			return {
				clientX: e.clientX,
				clientY: e.clientY,
				layerX: e.layerX,
				layerY: e.layerY,
			}
		}
		e.preventDefault();
		let source = e.targetTouches;
		if(e.targetTouches.length == 0) {source = e.changedTouches}
		return { //Touch Screen event
			clientX: source[0].clientX,
			clientY: source[0].clientY,
			layerX: source[0].clientX - e.target.getBoundingClientRect().x,
			layerY: source[0].clientY - e.target.getBoundingClientRect().y,
		}
	}
	//Methods
	init() { //Initialize the html elements for the plate (layer)
		let html = "";
		html += "<canvas style=\"position: absolute;\"></canvas>"; //Highlights should be at the bottom, so that the events fire with Contents as a target //style=\"position: absolute; left: 0; top: 0; z-index: 0\"
		html += "<canvas style=\"position: absolute;\"></canvas>"; //Grid
		html += "<canvas style=\"position: absolute;\"></canvas>"; //Contents
		let out = GetId(this.Root);
		out.innerHTML = html;
		Layer.exportControls(this); //Prepare the control buttons to get the plate (layer) as jpg or html
		this.Highlight = out.children[0];
		this.Grid = out.children[1];
		this.Contents = out.children[2];
		this.bindEvents(out);
		return this;
	}
	bindEvents(root) { //Bind events to the plate (layer)
		let plate = this.Plate;
		let timeOut = undefined;
		let down = function(e) { //Mouse down (or touch start)
			if(e.button !== undefined && e.button != 0 ) {return}
			if(e.touches !== undefined && e.touches.length > 1) {return}
			let coords = Layer.getCoords(e);
			let w = plate.wellAtPointer(coords, this);
			if(e.ctrlKey == false && plate.Options.AddToSel.getValue() == false) {plate.resetSelection()} //Reset previous selection for the entire plate
			plate.select(e, coords, {Start: w});
		}.bind(this);
		let up = function(e) { //Mouseup (touch end)
			let coords = Layer.getCoords(e);
			let w = plate.wellAtPointer(coords, this);
			plate.select(e, coords, {Stop: true, Layer: this.Index, Well: w});
		}.bind(this);
		let stop = function(e) { //Stop the selection
			plate.highlight();
			if(timeOut) {clearTimeout(timeOut)}
			plate.infoPopup(); //hide the popup
		}.bind(this);
		let move = function(e) { //Move the cursor and extend the selection
			if(e.target.nodeName != "CANVAS") {return}
			let coords = Layer.getCoords(e);
			let w = plate.wellAtPointer(coords, this);
			let popup = GetId(Editor.Anchors.Popup.Root);
			popup.style.left = coords.clientX + 10 + "px";
			popup.style.top = coords.clientY - 40 + "px";
			if((plate.Highlighting && plate.Highlighting.Index != w.Index) || (plate.Highlighting === undefined)) { //A different well is being highlighted, or nothing is currently highlighted
				plate.highlight(e, w);
				if(timeOut) {
					clearTimeout(timeOut);
					plate.infoPopup(); //hide the popup
				}
//******************************************************************************
//When executing the plate.infoPopup function within the setTimeout method,
//the "this" context inside infoPopup is changed to window and no longer points
//to the plate Object. So binding of the plate object is necessary to recover
//the expected this context within infoPopup.
				timeOut = setTimeout(plate.infoPopup.bind(plate), 500, e, w); //Show the popup after 500ms of mouse inactivity
//******************************************************************************
			}
			if(e.buttons == 0) {plate.select(undefined, coords, {Stop: true})}
			else {
				if(plate.Selecting) {plate.select(e, coords, {Move: w})}
			}
		}.bind(this);
		root.addEventListener("touchstart", down, {passive: false});
		root.addEventListener("mousedown", down);
		root.addEventListener("touchend", function(e) { //For touch screen there is no pointer out, so combine it with touchend
			up(e);
			stop(e);
		});
		root.addEventListener("mouseup", up);
		root.addEventListener("touchmove", move, {passive: false});
		root.addEventListener("mousemove", move);
		root.addEventListener("mouseout", stop);
		root.addEventListener("wheel", stop, {passive: true});
		return this;
	}
	grid(G) { //Draw the grid plate (layer) using the grid provided from plate
		let h = G.height;
		let w = G.width;
		let r = Editor.pixelRatio;
		[this.Grid, this.Highlight, this.Contents].forEach(function(c) { // Also resize canvas plate (layer) to match grid size
			c.height = h;
			c.width = w;
			c.style.height = h / r + "px";
			c.style.width = w / r + "px";
		});
		let div = GetId(this.Root); //Wrapping div for the canvas, also adjust its size
		div.style.width = (G.width / r) + "px";
		div.style.height = (G.height / r) + "px";
		this.Grid.getContext("2d").drawImage(G, 0, 0);
		return this;
	}
	highlight(array) { //Draw the highlight image at the coordinates provided. Each element in array is an object specifying the image to draw and the coordinates x and y
		let hl = this.Highlight;
		let ctx = hl.getContext("2d");
		ctx.clearRect(0, 0, hl.width, hl.height);
		if(array.length > 0) {
			array.forEach(function(a) {
				ctx.drawImage(a.Image, a.x, a.y);
			});
		}
		return this;
	}
	select(array, size, margin) { //Select wells in array
		let C = this.Contents;
		let ctx = C.getContext("2d");
		ctx.setTransform(Editor.pixelRatio, 0, 0, Editor.pixelRatio, 0, 0);
//****************************************************************************************
//Here, array is first traversed to set all elements in Selected state
//Then, Wells is fully traversed by filter to recover the selected wells
//Using this approach, the complexity is minimal, because Wells is traversed only once
//Other approaches would require to traverse Wells n times, where n is the size of array,
//in order to guarantee unicity of the selected wells in the Selected array
		array.forEach(function(w) {
			if(w) {
				w.Selected = true;
				w.content(ctx, size, margin);
			}
		});
		this.Selected = this.Wells.filter(function(w) {return w.Selected});
//****************************************************************************************
		const [selectedWell] = this.Selected;
		if (selectedWell) {
			Editor.resetWellMetadataControls();
			const selectedMetadata = selectedWell.getMetadata();
			Object.entries(selectedMetadata).forEach(([key, value]) => {
				if (Editor.Controls.MetadataWellLevel[key]) {
					Editor.Controls.MetadataWellLevel[key].setValue(value || "");
				}
			})
		}

		return this;
	}
	unselect(size, margin) {
		if(this.Selected) {
			let C = this.Contents;
			let ctx = C.getContext("2d");
			this.Selected.forEach(function(w) {
				w.Selected = false;
				w.content(ctx, size, margin);
			});
			this.Selected = undefined;
		}
		return this;
	}
	content(size, margin) { //Draw the content of each well
		let C = this.Contents;
		let ctx = C.getContext("2d");
		ctx.clearRect(0, 0, C.width, C.height);
		ctx.font = (Math.floor(margin / 2) * 5) + "px arial"; //Increment the size by 5px every 2 increments.
		ctx.setTransform(Editor.pixelRatio, 0, 0, Editor.pixelRatio, 0, 0);
		this.Wells.forEach(function(w) {
			w.content(ctx, size, margin);
		});
		return this;
	}
	tagArea(a, I) { //Tag the area in selection
		let R = I.Results; //Results of the tagging
		if(this.Selected) {
			I.Layer = this;
			let ctx = this.Contents.getContext("2d");
			let size = I.Size;
			let margin = I.Margin;
			this.Selected.forEach(function(w) {
				w.tag(a, I);
				if(w.Duplicate == false && w.Error == false) { //Not tagged in duplicate or in error
					Area.log(a, this, w); //Log the well in the area
					R.Tagged++;
					if(a.Type != "Range" || (a.Type == "Range" && a.Custom)) {w.content(ctx, size, margin)} //Update well display. In case of range, this will be done at the end, after all wells are logged
				}
				else { //Update display for wells on error or duplicate
					if(w.Error) {w.content(ctx, size, margin)} //Always update wells on error
					else { //For duplicate, update now only if not range, otherwise it will be done at the end
						if(a.Type != "Range" || (a.Type == "Range" && a.Custom)) {w.content(ctx, size, margin)}
					}
				}
				R.Selected++;
			}, this);
			if(I.Keep == false) {this.Selected = undefined} //Reset the selection
		}
		return this;
	}
	untag(I) { //Untag the areas in the selected wells
		let R = I.Results;
		if(this.Selected) {
			I.Layer = this;
			let ctx = this.Contents.getContext("2d");
			let size = I.Size;
			let margin = I.Margin;
			this.Selected.forEach(function(w) {
				w.untag(I);
				w.content(ctx, size, margin);
				R.Untag++;
			});
			if(I.Keep == false) {this.Selected = undefined} //Reset the selection
		}
		return this;
	}
	cleanTags(I) { //Clean-up the tags from this plate (layer). This should be done only as part of the removal process of this plate (layer)
		I.Layer = this;
		this.Wells.forEach(function(w) { //Travel all the wells and remove the tags when needed
			w.untag(I); //This will take care of updating: the Tags for the impacted areas, the TypeMap and I with the impacted Ranges
		});
		return this;
	}
	highlightConflicts(conflicts, size, margin) { //Highlight wells with indices passed in the array conflicts
		let ctx = this.Contents.getContext("2d");
		let w = this.Wells;
		let array = [];
		conflicts.forEach(function(c) {
			w[c].Error = true;
			array.push(w[c]);
		});
		this.select(array, size, margin);
		return this;
	}
	tagConc(I) { //Tag the concentration given in the selected wells
		if(this.Selected) {
			let ctx = this.Contents.getContext("2d");
			let size = I.Size;
			let margin = I.Margin;
			this.Selected.forEach(function(w) {
				w.tagConc(I);
				w.content(ctx, size, margin);
				I.Selected++;
			});
			if(I.Keep == false) {this.Selected = undefined} //Reset the selection
		}
		return this;
	}
	untagConc(I) { //UnTag the concentration given in the selected wells
		if(this.Selected) {
			let ctx = this.Contents.getContext("2d");
			let size = I.Size;
			let margin = I.Margin;
			this.Selected.forEach(function(w) {
				w.untagConc();
				w.content(ctx, size, margin);
				I.Selected++;
			});
			if(I.Keep == false) {this.Selected = undefined} //Reset the selection
		}
		return this;
	}
	resetConc(I) { //Reset concentrations for all wells
		let ctx = this.Contents.getContext("2d");
		let size = I.Size;
		let margin = I.Margin;
		this.Wells.forEach(function(w) {
			w.untagConc();
			w.content(ctx, size, margin);
		});
		return this;
	}
	concMap(root) { //Display a map of the concentrations for this plate (layer), in the container adjacent to the provided root
		let r = this.Rows;
		let c = this.Cols;
		let html = "<table class=\"PlateTable\"><tr><th></th>";
		for(let j=0;j<c;j++) {html += "<th>" + (j + 1) + "</th>"} //Headers, for each col
		let logAvailable = true;
		let min = this.Wells.reduce(function(a, b) {
			if(b.Value !== undefined) {
				if(b.Value <= 0) {logAvailable = false}
				return Math.min(a, b.Value);
			}
			else {return a}
		}, +Infinity); //Must provide an initial value to avoid NaN
		let max = this.Wells.reduce(function(a, b) {
			if(b.Value !== undefined) {
				if(b.Value <= 0) {logAvailable = false}
				return Math.max(a, b.Value);
			}
			else {return a}
		}, -Infinity); //Must provide an initial value to avoid NaN
		if(logAvailable) {
			min = Math.log10(min);
			max = Math.log10(max);
		}
		let colors = [[150,150,255], [255,255,255], [255,150,150]]; //Blue-White-Red (min-middle-max)
		html += "</tr>";
		for(let i=0;i<r;i++) { //For each row
			html += "<tr><th>" + Well.alphabet(i) + "</th>";
			for(let j=0;j<c;j++) { //For each col
				let w = this.Wells[i * c + j];
				//html += "<td style=\"background-color:" + CSSCOLORS.heatmap(Math.log10(w.Value), min, max, colors) + "\">" + Well.dose(w) + "</td>";
				html += "<td style=\"background-color:";
				if(logAvailable) {html += CSSCOLORS.heatmap(Math.log10(w.Value), min, max, colors)}
				else {html += CSSCOLORS.heatmap(w.Value, min, max, colors)}
				html += "\">" + Well.dose(w) + "</td>";
			}
			html += "</tr>";
		}
		html += "</table>";
		GetId(root).nextElementSibling.innerHTML = html;
		return this;
	}
	tagDRC(I) { //Tag the selected wells with the DRC provided
		let S = this.Selected;
		if(S) {
			let ctx = this.Contents.getContext("2d");
			let size = I.Size;
			let margin = I.Margin;
			if(I.Direction == "Horizontal") {S.sort(function(a, b) {return a.Index - b.Index})} //Sort per well Index for horizontal mode
			else {S.sort(function(a, b) {return ((a.Col - b.Col) || (a.Row - b.Row))})} //Sort per Col, then by row for vertical mode
			let rep = 0; //Current replicate
			let value = I.Value; //Current value
			let dose = 0; //Current dose
			S.forEach(function(w) {
				w.tagConc(I);
				w.content(ctx, size, margin);
				rep++;
				if(rep == I.Rep) { //Number of replicates reached, move to the next dose
					rep = 0; //Reset the replicate
					dose++; //Move a dose up
					if(dose == I.Doses) { //End of the DRC, start at the beginning
						I.Value = value;
						dose = 0;
					}
					else { //Compute the next dose
						I.Value = eval(I.Value + I.Operator + I.Factor);
					}
				}
				I.Selected++;
			});
		}
		return this;
	}
	changeDigit(digit, size, margin) { //Redraw the wells to update the digit
		let ctx = this.Contents.getContext("2d");
		this.Wells.forEach(function(w) {
			if(w.Conc) {
				w.changeDigit(digit);
				w.content(ctx, size, margin);
			}
		});
		return this;
	}
	toTxt(values) { //Output the plate (layer) as a tab-delimited list in a string format. Use the resolved values when available
		let out = "Well\tRow\tCol\tWell Index\tArea\tConc.\tUnit\tDefinition\n";
		this.Wells.forEach(function(w, i) {
			if(i > 0) {out += "\n"}
			out += w.Name + "\t" + w.Row + "\t" + w.Col + "\t" + w.Index + "\t";
			let a = w.Area;
			if(a !== undefined) { //Area present in this well, add its name
				if(a.Type == "Range") {out += a.Name + " #" + w.RangeIndex}
				else {out += a.Name}
			}
			out += "\t";
			if(w.Value !== undefined) {out += w.Value} //Add the concentration if available
			out += "\t";
			if(w.Unit !== undefined) {out += w.Unit} //Add the unit if available
			out += "\t";
			if(a !== undefined) { //Area present in this well: add the resolved name if available
				values.forEach(function(v) { //Travel the ranges definitions to update the current well
					let def = v.Definition[i]; //The definition value
					if(def !== "") { //We expect only one possible definition per well, since we work on a single plate (layer)
						out += def;
					}
				});
			}
		});
		return out;
	}

	static clone(layerOrigin) {
		const clone = new Layer({
			Rows: layerOrigin.Rows,
			Cols: layerOrigin.Cols,
			Index: layerOrigin.Index,
			ArrayIndex: layerOrigin.ArrayIndex,
			Plate: layerOrigin.Plate
		});
		clone.Wells = layerOrigin.Wells.map(well => Well.clone(well, layerOrigin));
		clone.Metadata = {...layerOrigin.Metadata}
		return clone;
	}

	getMetadata() {
		return this.Metadata;
	}

	applyMetadata(I) {
		if (I.CellLine) {
			this.Metadata.CellLine = I.CellLine;
		}
		if (I.CellLinePassage) {
			this.Metadata.CellLinePassage = parseFloat(I.CellLinePassage);
		}
		if (I.TransfectionReagent) {
			this.Metadata.TransfectionReagent = I.TransfectionReagent;
		}
		if (I.TransfectionReagentLOT) {
			this.Metadata.TransfectionReagentLOT = I.TransfectionReagentLOT;
		}
		if (I.TransfectionEndPoint) {
			this.Metadata.TransfectionEndPoint = parseFloat(I.TransfectionEndPoint);
		}
	}

	applyWellsMetadata(I) {
		let updated = 0;
		let empty = 0;
		if (this.Selected) {
			this.Selected.forEach(well => {
				if (well.Area) {
					well.applyMetadata(I);
					updated += 1;
				} else {
					empty += 1;
				}
			});
		}
		return [updated, empty];
	}

	rename(newName) {
		this.Name = newName;
		document.getElementById(`legend_${this.Root}`).firstChild.innerHTML = `<span>${this.Name} &bull; </span>`;
	}
}
