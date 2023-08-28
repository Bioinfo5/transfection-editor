//***********************************************************************************************************
// PLATE object - Plate is an array of plates (layers); plate (layer) is an array of wells; well is a collection of properties
//***********************************************************************************************************
class Plate {
	constructor(root, r, c, options = {}) {
		this.Rows = r;
		this.Cols = c;
		this.Root = root;
		this.WellSize = 20;
		this.WellMargin = 5;
		this.Highlighting = undefined; //Well currently highlighted
		this.Selecting = undefined; //Object to handle the selection
		this.Metadata = {};
		this.SelectedLayer = undefined;

		this.Anchors = {
			Options: root + "_Options",
			Selection: root + "_Selection",
			LayerTab: root + "_LayerTab",
			LayerSelect: root + "_LayerSelect",
			Views: root + "_Views",
		}
		this.Options = { /* LinkCtrl instances */}
		this.Controls = {
			LayerSelect: LinkCtrl.new("Select", {ID: this.Anchors.LayerSelect, Default: 0, Label: "Plate", List: [1], NavBar: true, Change: function(v) {
				this.Layers[v].concMap(this.Anchors.LayerSelect)
			}.bind(this), Title: "Select the plate to use for display"}),
		}
		this.TypeMap = new TypeMap(this);
		this.Grid = document.createElement("canvas");
		this.Highlight = document.createElement("canvas");
		this.Header = document.createElement("canvas");
		const firstLayer = new Layer({Rows: r, Cols: c, Index: 0, ArrayIndex: 0, Plate: this});
		this.Layers = [firstLayer];
		this.LastKey = 1; //Index to use for new layers, to guarantee unicity
		this.LayerTab = new TabControl({
			ID: this.Anchors.LayerTab,
			Multiple: true,
			Tabs: [{
				Label: firstLayer.Name,
				Active: true,
				Controls: ["Rename", "Select", "Duplicate", "Delete"],
				Content: {Type: "HTML", Value: Layer.rootHTML(firstLayer.Name, this.Layers[0].Root)}
			}],
			AfterDelete: function(l) {this.deleteLayer(l)}.bind(this),
			AfterDuplicate: function (l, t) {this.duplicateLayer(l, t)}.bind(this),
			AfterSelect: function (l) {this.selectLayer(l)}.bind(this),
			AfterRename: function (index, value) {this.renameLayer(index, value)}.bind(this),
		});
		return this;
	}
	//Static Methods
	static styleCtx(ctx, style) { //Apply style to the canvas ctx based on the style string passed
		ctx.setTransform(Editor.pixelRatio, 0, 0, Editor.pixelRatio, 0, 0);
		switch(style) {
			case "grid":
				ctx.lineWidth = 2;
				ctx.strokeStyle = "dimgray";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				break;
			case "highlight":
				ctx.strokeStyle = "gold";
				ctx.lineWidth = 2;
				ctx.shadowColor = "goldenrod";
				ctx.shadowBlur = 5;
				break;
			case "header":
				ctx.fillStyle = "pink";
				ctx.shadowColor = "pink";
				break;
			case "selectBox":
				ctx.strokeStyle = "blue";
				ctx.fillStyle = "gray";
				ctx.globalAlpha = 0.4;
				ctx.setLineDash([1, 2]);
				break;
			case "selecting":
				ctx.fillStyle = "gold";
				break;
			default:
		}
	}
//*******************
//SAVE & LOAD METHODS
//*******************
	static save(plate) { //Return a JSON.stringify version of the plate object for saving
		if(plate === undefined) {return "null"}
		let out = [];
		plate.Layers.forEach(function(l) {
			out.push(Layer.save(l));
		});
		return JSON.stringify({
			Rows: plate.Rows,
			Cols: plate.Cols,
			Layers: out
		});
	}

	exportToXLSX() {
		const today = new Date();
		const TRANSFECTION_DATE = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`;
		const TRANSFECTION_SCIENTIST = this.Metadata.TransfectionScientist || '';
		const TRANSFECTION_ID = this.Metadata.ExperimentID || '';
		const output = [];
		let sampleNameIndex = 1;

		this.Layers.forEach(layer => {
			const sameNames = this.Layers.filter(item => item.Name === layer.Name);
			if (sameNames.length > 1) {
				sameNames.forEach((item, itemIndex) => {
					const i = _.findIndex(this.Layers, l => l.Index === item.Index)
					if (i >= 0) {
						this.Layers[i].ExportedName = `${item.Name}_${Editor.alphabet[itemIndex].toLowerCase()}`;
					}
				});
			} else {
				sameNames.forEach(item => item.ExportedName = item.Name);
			}
		})

		this.Layers.forEach((layer) => {
			const TRANSFECTION_PLATE_NAME = layer.ExportedName;
			const TRANSFECTION_CELL_LINE = layer.Metadata.CellLine || '';
			const TRANSFECTION_CELL_LINE_PASSAGE = layer.Metadata.CellLinePassage || 0;
			const TRANSFECTION_REAGENT = layer.Metadata.TransfectionReagent || '';
			const TRANSFECTION_REAGENT_LOT = layer.Metadata.TransfectionReagentLOT || '';
			const TRANSFECTION_END_POINT = (layer.Metadata.TransfectionEndPoint)
				? [layer.Metadata.TransfectionEndPoint, layer.Metadata.TransfectionEndPointUnit].filter(Boolean).join('_')
				: '';

			layer.Wells.forEach(well => {
				const SAMPLE_NAME = (well.Area) ? `${well.Area.Name}_${sampleNameIndex}` : '';
				const TRANSFECTION_POS = `${well.Name}`;
				const TRANSFECTION_CONCENTRATION = (well.Metadata.Concentration)
					? [well.Metadata.Concentration, well.Metadata.ConcentrationUnit].filter(Boolean).join('_')
					: '';
				const TRANSFECTION_CELL_AMOUNT = (well.Metadata.NumberOfCellsPerWell)
					? [well.Metadata.NumberOfCellsPerWell, well.Metadata.NumberOfCellsPerWellUnit].filter(Boolean).join('_')
					: '';
				const TRANSFECTION_REAGENT_AMOUNT = well.Metadata.TransfectionReagentAmount
					?  [well.Metadata.TransfectionReagentAmount, well.Metadata.TransfectionReagentAmountUnit].filter(Boolean).join('_')
					: '';

				output.push({
					TRANSFECTION_DATE, TRANSFECTION_SCIENTIST, TRANSFECTION_ID,
					TRANSFECTION_PLATE_NAME, TRANSFECTION_CELL_LINE, TRANSFECTION_CELL_LINE_PASSAGE,
					TRANSFECTION_REAGENT, TRANSFECTION_REAGENT_AMOUNT, TRANSFECTION_REAGENT_LOT, TRANSFECTION_END_POINT,
					SAMPLE_NAME, TRANSFECTION_POS, TRANSFECTION_CONCENTRATION, TRANSFECTION_CELL_AMOUNT
				});
				sampleNameIndex = sampleNameIndex + 1;
			})
		})

		return output;
	}

	static loadPreview(plate, id) { //Prepare a preview out of the loaded information from plate
		let html = "";
		if(plate) {
			html += "Rows: <b>" + plate.Rows + "</b>; ";
			html += "Cols: <b>" + plate.Cols + "</b><br>";
			html += "Plates: <b>" + plate.Layers.length + "</b>";
		}
		else {html = "<p class=\"Error\">No data</p>"}
		GetId(id).insertAdjacentHTML("beforeend", html);
	}
	static load(plate, data, options) { //Update the provided plate with the plates (layers) data provided
		const {append} = options;
		const startIndex = append ? plate.Layers.length : 0;
		if (data.Metadata) {
			plate.applyMetadata(data.Metadata);
			Editor.Controls.MetadataMainLevel.ExperimentID.setValue(data.Metadata.ExperimentID);
			Editor.Controls.MetadataMainLevel.TransfectionScientist.setSelected(data.Metadata.TransfectionScientist);
		}
		data.Layers.forEach(function(l, dataLayerIndex) {
			const i = startIndex + dataLayerIndex;
			if(i >= plate.Layers.length) {plate.addLayer()} //First plate (layer) is already created, but need to create the others
			Layer.load(plate.Layers[i], l, 1, plate.WellSize, plate.WellMargin);
			if (data.LayersNames) {
				const [currentLayerInfo] = data.LayersNames.filter(item => item.Index === dataLayerIndex);
				if (currentLayerInfo) {
					plate.Layers[i].rename(currentLayerInfo.Name);
					plate.LayerTab.rename(i, currentLayerInfo.Name);
				}
			}
		});
		if (data.LayersMetadata) {
			data.LayersMetadata.forEach((l, layerIndex) => {
				const i = startIndex + layerIndex;
				if (l.Metadata) {
					plate.Layers[i].applyMetadata(l.Metadata);
				}
			})
		}
		if (data.WellsMetadata) {
			data.WellsMetadata.forEach(item => {
				const [currentWell] = plate.Layers[item.Layer + startIndex].Wells.filter(well => well.Index === item.Index);
				currentWell.applyMetadata(item.Metadata);
			})
		}
	}

//*******************
	static resize(plate, r, c) { //Resize the plate to the new dimensions, keeping concentration data if needed
		plate.Layers.forEach(function(l, i) { //For each plate (layer), travel the new dimensions and update the wells arrays
			Layer.resize(l, r, c);
		});
		plate.TypeMap.resize(r, c); //Resize the typeMap by keeping only relevant wells
		plate.Rows = r; //Adjust the plate properties
		plate.Cols = c; //
		plate.update(); //Finally update the drawings
		let R = Editor.Tables.Results; //Now process changes for the results
		R.Array.forEach(function(r) {r.Validated = false}); //Need to recalculate the Min/Max values for the heatmap after resizing: set all results as not validated
		R.update(); //Update changes visually in the tables
		let results = R.Selected;
		if(results.length > 0) {Editor.ResultManager.draw(results[0], {NoPrompt: true})}
	}
	static tagArea(plate, a, I) { //Tag area a in the selected wells
		I.Size = plate.WellSize;
		I.Margin = plate.WellMargin;
		I.Map = plate.TypeMap;
		I.Results = {Tagged: 0, Selected: 0, Ranges: []}
		return new Promise(function(resolve) {
			if(a.Type == "Range" && a.Custom) {
				let id = "Form_CustomRange";
				let control = id + "_RangeIndex";
				let RangeIndex = LinkCtrl.new("Number", {ID: control, Default: a.MaxRange + 1, Min: 1, Label: "Range index", Title: "Indicate here the numbering that should be applied to the tagged wells"});
				Form.open({
					ID: id,
					HTML: "<div id=\"" + control + "\"></div>",
					Title: "Custom numbering",
					Buttons: [
						{Label: "Ok", Click: function() {
							I.RangeIndex = RangeIndex.getValue(); //Get the value of the rangeIndex
							resolve(plate.tagArea(a, I));
							Form.close(id);
						} },
						{Label: "Cancel", Click: function() {
							I.Cancel = true;
							resolve(I);
							Form.close(id);
						} },
					],
					onInit: function() {RangeIndex.init()},
				});
			}
			else {resolve(plate.tagArea(a, I))}
		});
	}
	static flatten(plate) { //Produce an array the size of the plate where the content of each well is flattened across paltes (layers)
		let flat = []; //Output array
		let size = plate.Rows * plate.Cols;
		for(let i=0;i<size;i++) {
			let content = []; //Aggregate the content across plates (layers) in an array
			let ranges = [];
			plate.Layers.forEach(function(l) {
				let item = ""; //The item at this location
				let w = l.Wells[i];
				if(w.Area) {
					if(w.Area.Type == "Range") {
						item = "<span class=\"Resolvable\" well='{\"Index\": " + i + ", \"RangeIndex\": " + w.RangeIndex + "}' rangeName=\"" + w.Area.Name + "\">" + w.Area.Name + " #" + w.RangeIndex + "</span>";
						ranges.push({Range: w.Area, RangeIndex: w.RangeIndex});
					}
					else {item = w.Area.Name}
					if(w.Value !== undefined) {item += " " + Well.dose(w)}
					content.push(item);
				}
			});
			content = content.reduce(function(acc, val) { //Reduce the array into a string
				if(acc.length > 0) {acc += "<br>"}
				return acc += val;
			}, ""); //Initial value is important
			flat.push({HTML: content, Type: plate.TypeMap.Map[i], Ranges: ranges}); //Push the content to the plate-like array
		}
		return flat
	}

	//Methods
	init() {
		const out = GetId(this.Root);
		let html = '';
		html += '<div style="overflow: auto">'; //Options ribbon
		html += '<fieldset style="float: left"><legend>Zoom</legend></fieldset>';
		html += '<fieldset style="float: left"><legend>Options</legend><div id="' + this.Anchors.Options + '"></div></fieldset>';
		html += '<fieldset style="float: left"><legend>Views</legend><div id="' + this.Anchors.Views + '"></div></fieldset>';
		html += '</div>';
		html += '<div id="' + this.Anchors.LayerTab + '" style="margin-top: 10px"></div>'; //Tab container for plates (layers)
		out.innerHTML = html;

		this.LayerTab.init();
		this.Layers[0].init(); //Only one plate (layer) available at the beginning
		Object.values(this.Options).forEach(function (o) {o.init();});

		const buttonCreateLayout = LinkCtrl.buttonBar([{
			Label: 'Add plate',
			Title: 'Add a new plate to the layout',
			Click: function () {this.addLayer();}.bind(this)
		}], true); //Here true is set so that the buttons are added Inline

		const optionsContainer = GetId(this.Anchors.Options);
		optionsContainer.insertAdjacentHTML('beforeend', '&nbsp;');
		optionsContainer.append(buttonCreateLayout);

		const buttonOpenHTMLViewLayout = LinkCtrl.buttonBar([{
			Label: 'HTML',
			Title: 'Click here to view this plate as an html array',
			Click: () => {
				const htmlView = new HTMLView(this);
				htmlView.init();
			}
		}], true);

		const viewsContainer = GetId(this.Anchors.Views);
		viewsContainer.insertAdjacentHTML('beforeend', '&nbsp;');
		viewsContainer.append(buttonOpenHTMLViewLayout);

		const buttonsZoomInOut = LinkCtrl.buttonBar([ //Zoom controls
			{
				Label: '',
				Title: 'Zoom in on the layout, each well will be bigger',
				Icon: {Type: 'ZoomIn'},
				Click: function () {this.zoom(1);}.bind(this)
			},
			{
				Label: '',
				Title: 'Zoom out on the layout, each well will be smaller',
				Icon: {Type: 'ZoomOut'},
				Click: function () {this.zoom(-1);}.bind(this)
			},
		]);
		out.children[0].children[0].append(buttonsZoomInOut);

		this.grid();
		Editor.resetMainMetadataControls();

		return this;
	}
//*************
//PLATE (LAYER) METHODS
//*************
	addLayer() { //Add a new plate (layer) to the plate
		let l = this.LastKey++; //Index of the new plate (layer) to add
		let lay = this.Layers;
		let here = lay.length; //Last index in the array is the one to use for the display in html
		let newLayer = new Layer({Rows: this.Rows, Cols: this.Cols, Index: l, ArrayIndex: here, Plate: this});
		lay.push(newLayer);
		this.LayerTab.addTab({
			Label: newLayer.Name,
			SetActive: true,
			Controls: ["Rename", "Select", "Duplicate", "Delete"],
			Content: {Type: "HTML", Value: Layer.rootHTML(newLayer.Name, newLayer.Root)}
		});
		newLayer.init().grid(this.Grid);
		Editor.ResultManager.layerUpdate(); //Update the plate (layer) control
		return this;
	}
	deleteLayer(l) { //Delete plate (layer) with provided ArrayIndex
		let I = { //Prepare an object to transfer to the clean method
			Map: this.TypeMap,
			Results: {Ranges: []}
		}
		this.Layers[l].cleanTags(I); //Clean tags from this plate (layer) and recover impacted ranges
		I.Results.Ranges.forEach(function(a) { //Update impacted ranges
			this.updateRange(a);
		}, this);
		Editor.Tables.Areas.update(); //Update the table display so that the ranges have correct information
		Editor.Tables.Areas.Array.forEach(function(a) {a.cleanTags(this.Layers[l].Index)}, this); //All areas must now delete any reference to this destroyed plate (layer)
		this.Layers.splice(l, 1); //Remove the plate (layer) from the array
		Editor.ResultManager.layerUpdate(); //Update the plate (layer) control
		return this;
	}
	duplicateLayer(layerIndex, times) { //Copy plate (layer) with provided ArrayIndex t times
		const origin = this.Layers[layerIndex];
		for (let i = 0; i < times; i++) {
			const l = this.LastKey++; //Index of the new plate (layer) to add
			const here = this.Layers.length; //Last index in the array is the one to use for the display in html
			const newLayer = Layer.clone({...origin, Index: l, ArrayIndex: here});
			this.Layers.push(newLayer);
			this.LayerTab.addTab({
				Label: newLayer.Name,
				SetActive: true,
				Controls: ["Rename", "Select", "Duplicate", "Delete"],
				Content: {Type: "HTML", Value: Layer.rootHTML(newLayer.Name, newLayer.Root)}
			});
			newLayer.init().grid(this.Grid);
			this.update(); //Update to display the concentrations and update the range info
			Editor.ResultManager.layerUpdate(); //Update the plate (layer) control
		}
		return this;
	}
	wellAtPointer(e, l) {
		let margin = this.WellMargin;
		let space = this.WellSize + margin;
		let offset = space - 0.5 * margin;
		let col = Math.floor((e.layerX - offset) / space);
		let row = Math.floor((e.layerY - offset) / space);
		if(col > -1 && row > -1 && row < this.Rows && col < this.Cols) {return l.Wells[row * this.Cols + col]} //Return a "true" well object
		else { //Pointer is on a row or col header, return a simplified version of a well
			return {Col: col, Row: row, Layer: l, Index: row * this.Cols + col, Header: true}
		}
	}
//**************
//CANVAS METHODS
//**************
	zoom(e) { //Zoom in or out
		var zoomChange = false;
		if(e < 0) { //Zoom out, reduce size
			if(this.WellSize > 10) {
				this.WellSize -= 10;
				this.WellMargin -= 2;
				zoomChange = true;
			}
		}
		else { //Zoom in, increase size
			if(this.WellSize < 70) {
				this.WellSize += 10;
				this.WellMargin += 2;
				zoomChange = true;
			}
		}
		if(zoomChange) { //Only update if the zoom level as changed
			this.update();
			let results = Editor.Tables.Results.Selected;
			if(results.length > 0 && results[0].Validated == true) {Editor.ResultManager.draw(results[0])}
		}
	}
	update() { //Update all drawings
		var size = this.WellSize;
		var margin = this.WellMargin;
		this.grid();
		if(this.Selecting) { //Interrupt the selection
			this.select(undefined, undefined, {Stop: true});
		}
		this.Layers.forEach(function(L) { //redraw all plates (layers)
			L.content(size, margin);
		}, this);
		return this;
	}
	grid() { //Draw the grid layer at the current zoom level
		let size = this.WellSize;
		let margin = this.WellMargin;
		let c = this.Cols;
		let r = this.Rows;
		let space = size + margin;
		let G = this.Grid;
		let ratio = Editor.pixelRatio;
		G.width = (c + 1) * space * Editor.pixelRatio; //Changing the size will reset the pixels to transparent
		G.height = (r + 1) * space * Editor.pixelRatio;
		let ctx = G.getContext("2d");
		Plate.styleCtx(ctx, "grid");
		ctx.font = "bold " + (Math.floor(margin / 2) * 5 + 5) + "px arial"; //Increment the size by 5px every 2 increments. Parenthesis are mandatory to get correct addition
		for(let i=0;i<c;i++) { //Columns
			let x = (i + 1) * space;
			for(let j=0;j<r;j++) { //Rows
				let y = (j + 1) * space;
				ctx.strokeRect(x, y, size, size);
				if(i == 0) { //Row header
					ctx.fillText(Well.alphabet(j), space / 2, y + size / 2);
				}
			}
			ctx.fillText(i+1, x + size / 2, space / 2); //Column header
		}
		this.Layers.forEach(function(l) { //Apply the new grid to all layers
			l.grid(G);
		});
		this.header(); //Update fixed layer to match the new dimensions
		return this;
	}
	drawHighlight(w) { //Draw the highlight plate (layer) based on zoom level and hovered item w
		let todo = [];
		if(w) { //Proceed with the hovered well, if defined
			let H = this.Highlight;
			let size = this.WellSize;
			let margin = this.WellMargin;
			let space = size + margin;
			let ctx = H.getContext("2d");
			let r = Editor.pixelRatio
			if(w.Row >= this.Rows || w.Col >= this.Cols) {return this} //Outside the plate boundaries
			if(w.Row < 0) {
				if(w.Col < 0) { //Highlight is on the top-left corner
					let h = this.Grid.height;
					let width = this.Grid.width;
					H.width = width;					//
					H.height = h;						// Changing the size will reset the pixels to transparent
					Plate.styleCtx(ctx, "highlight");	// So need to restore the style after resizing
					ctx.strokeRect(space - 2, space - 2, (width / r) - size - 2 * margin + 4, (h / r) - size - 2 * margin + 4);
					todo.push({Image: H, x: 0, y: 0});
					todo.push({Image: this.Header, x: margin / 2, y: margin / 2})
				}
				else { //Highlight Column
					let h = this.Grid.height;
					H.width = (size + 20) * r;			//
					H.height = h;						// Changing the size will reset the pixels to transparent
					Plate.styleCtx(ctx, "highlight");	// So need to restore the style after resizing
					ctx.strokeRect(8, space - 2, size + 4, (h / r) - size - 2 * margin + 4);
					todo.push({Image: H, x: ((w.Col + 1) * space - 10) * r, y: 0});
				}
			}
			else {
				if(w.Col < 0) { //Highlight Row
					let width = this.Grid.width;
					H.height = (size + 20) * r;			//
					H.width = width;					// Changing the size will reset the pixels to transparent
					Plate.styleCtx(ctx, "highlight");	// So need to restore the style after resizing
					ctx.strokeRect(space - 2, 8, (width / r) - size - 2 * margin + 4, size + 4);
					todo.push({Image: H, x: 0, y: ((w.Row + 1) * space - 10) * r});
				}
				else { //Highlight individual well
					H.width = (size + 20) * r;			//
					H.height = (size + 20) * r;			// Changing the size will reset the pixels to transparent
					Plate.styleCtx(ctx, "highlight");	// So need to restore the style after resizing
					ctx.strokeRect(8, 8, size + 4, size + 4);
					todo.push({Image: H, x: (w.x(space) - 10) * r, y: (w.y(space) - 10) * r});
				}
			}
			if(w.Col > -1) {todo.push({Image: this.Header, x: (w.Col + 1) * space * r, y: margin / 2})} //Highlight column header
			if(w.Row > -1) {todo.push({Image: this.Header, x: margin / 2, y: ((w.Row + 1) * space) * r})} //Highlight row header
		}
		return todo;
	}
	highlight(e, w) { //Highlight selected well w for all plates (layers) and display the info popup
		this.Highlighting = w;
		let todo = this.drawHighlight(w);
		this.Layers.forEach(function(l) {
			l.highlight(todo);
		});
		Editor.ResultManager.highlight(todo);
		return this;
	}
	header() { //Draw the header highlight plate (layer) at the current zoom level
		let margin = this.WellMargin;
		let size = this.WellSize;
		let H = this.Header;
		H.width = size * Editor.pixelRatio;  //Changing the size will reset the pixels to transparent
		H.height = size * Editor.pixelRatio; //
		let ctx = H.getContext("2d");
		Plate.styleCtx(ctx, "header");
		ctx.arc(size / 2, size / 2, Math.floor(margin / 2) * 5, 0, 2 * Math.PI);
		ctx.fill();
		return this;
	}
//*****************
//SELECTION METHODS
//*****************
	select(e, coords, I) { //Handle the selection process
		if(I.Start) {
			this.startSelection(e, coords, I.Start);
		}
		if(I.Stop) {
			if(this.Selecting) {
				if(I.Layer !== undefined) {
					let L = this.Layers.find(function(e) {return e.Index == I.Layer});
					if(L !== undefined) {L.select(this.Selecting.Includes, this.WellSize, this.WellMargin)}
				}
				setTimeout(() => {
					/* this.Selecting.Box.remove(); for some reasons blocks the click event propagation,
					so execution is postponed to few ms */
					if (this.Selecting) {
						this.Selecting.Box.remove(); //Remove the 2 HTML canvas elements
						this.Selecting.Select.remove();
					}
					this.Selecting = undefined;
				}, 100)
			}
			GetId(Editor.Anchors.Popup.Select).innerHTML = ""; //Remove the selection information
			if(GetId(Editor.Anchors.Popup.Area).innerHTML.length + GetId(Editor.Anchors.Popup.Conc).innerHTML.length == 0) {this.infoPopup()} //Hide the tooltip if nothing else to show
		}
		if(I.Move) {
			this.moveSelection(e, coords, I.Move);
		}
		return this;
	}
	resetSelection() { //Reset selection for all the plates (layers)
		let size = this.WellSize;
		let margin = this.WellMargin;
		this.Layers.forEach(function(L) {
			L.unselect(size, margin);
		});
		return this;
	}
	startSelection(e, coords, w) { //Start the selection process
		let B = document.createElement("canvas"); //Create 2 new canvas, one is for the selection box, the other is for the highlight of the selected wells
		let width = this.Grid.width;
		B.width = width;			   //
		B.height = this.Grid.height;   //
		B.style.position = "absolute"; // Adjust dimensions and styling of first canvas, box
		B.style.left = 0;			   //
		B.style.top = 0;			   //
		B.style.zIndex = 10; //To be on top of the pile
		B.style.width = (width / Editor.pixelRatio) + "px";
		let S = B.cloneNode(); //Second canvas (select) is cloned from the first
		S.style.zIndex = -1; //To be at the bottom
		S.style.width = (width / Editor.pixelRatio) + "px";
		Plate.styleCtx(B.getContext("2d"), "selectBox");
		let ctx = S.getContext("2d");
		Plate.styleCtx(ctx, "selecting");
		e.target.parentElement.append(B); //Append both canvas to the page
		e.target.parentElement.append(S); //
		this.Selecting = {Start: w, Box: B, Select: S, x: coords.layerX, y: coords.layerY, LastVisited: w, Includes: [w]} //Update the Select object
		this.drawWellsInLasso(ctx, w);
	}
	moveSelection(e, coords, w) {
		var x = this.Selecting.x;
		var y = this.Selecting.y;
		var B = this.Selecting.Box;
		var ctx = B.getContext("2d");
		ctx.clearRect(0, 0, B.width, B.height); //Draw the selection lasso
		ctx.fillRect(x, y, coords.layerX - x, coords.layerY - y);
		ctx.strokeRect(x, y, coords.layerX - x, coords.layerY - y);
		if(w.Index == this.Selecting.LastVisited.Index) {return} //Cursor is still on the same well, no need to update the selection
		else { //Update the selection
			var S = this.Selecting.Select;
			var ctx = S.getContext("2d");
			ctx.clearRect(0, 0, S.width, S.height); //Reset the canvas
			this.drawWellsInLasso(ctx, w); //Draw again
			this.Selecting.LastVisited = w;
		}
	}
	drawWellsInLasso(ctx, w) { //Draw wells in lasso on the canvas context
		let size = this.WellSize;
		let margin = this.WellMargin;
		let start = this.Selecting.Start;
		this.Selecting.Includes = [];
		let startRow = Math.min(start.Row, w.Row);
		let startCol = Math.min(start.Col, w.Col);
		let spanRow = Math.abs(start.Row - w.Row) + 1; //The number of rows in the lasso
		let spanCol = Math.abs(start.Col - w.Col) + 1; //The number of cols in the lasso
		let html = "R <b>";
		if(startRow == -1) { //When a header is selected, extend the selection to the whole row
			spanRow = this.Rows + 1;
			html += this.Rows;
		}
		else {html += spanRow}
		html += " &times; ";
		if(startCol == -1) { //Or the whole column (or both...)
			spanCol = this.Cols + 1;
			html += this.Cols;
		}
		else {html += spanCol}
		GetId(Editor.Anchors.Popup.Select).innerHTML = html + "</b> C";
		let hor = startCol + spanCol;
		let ver = startRow + spanRow;
		let x = (size + margin) * (startCol + 1);
		let y = (size + margin) * (startRow + 1);
		let L = this.Layers.find(function(e) {return e.Index == w.Layer.Index});
		if(L === undefined) {console.warn("Could not find the plate with index " + w.Layer.Index); return} //Could not find the plate (layer)
		for(let i=startCol;i<hor;i++) { //Loop covering the wells under the lasso, col first
			for(let j=startRow;j<ver;j++) { //then row
				if(j == startRow) {y = (size + margin) * (startRow + 1)}
				if(i > -1 && j > -1) {
					this.Selecting.Includes.push(L.Wells[i + j * this.Cols]);
				}
				ctx.fillRect(x - 3, y - 3, size + 6, size + 6);
				y += size + margin;
			}
			x += size + margin;
		}
	}
	infoPopup(e, w, data) { //Display/hide the info popup giving well informations
		let pop = Editor.Anchors.Popup;
		let me = GetId(pop.Root);
		if(e === undefined) {me.style.display = "none"; return this} //Hide if nothing to display
		let show = false;
		if(w.Header) {GetId(pop.Well).innerHTML = ""}
		else { //Well name
			GetId(pop.Well).innerHTML = Well.alphabet(w.Row) + (w.Col + 1);
			show = true;
		}
		let A = w.Area;
		if(A) {
			GetId(pop.Area).innerHTML = "<span class=\"Boxed\">" + TypeMap.symbolForValue(TypeMap.valueForType(A.Type)) + "</span>" + A.Name + " <span id=\"" + pop.ResolvedName + "\"></span>";
			show = true;
		}
		else {GetId(pop.Area).innerHTML = ""}
		if(w.Conc) {
			GetId(pop.Conc).innerHTML = Well.dose(w);
			show = true;
		}
		else {GetId(pop.Conc).innerHTML = ""}
		if(data) {
			GetId(pop.Data).innerHTML = "Resolving value..."
			data.Result.getValue(data.Parameter, w).then(function(value) {
				if(value !== undefined) {GetId(pop.Data).innerHTML = value} //Zero is a falsy value, so a test against "undefined" should be used
				else {GetId(pop.Data).innerHTML = ""}
			}.bind(this));
		}
		else {GetId(pop.Data).innerHTML = ""}
		if(show == false && this.Selecting === undefined) {me.style.display = "none"; return this} //Hide if nothing to display
		me.style.display = "block";
		if(A && A.Type == "Range") {
			GetId(pop.ResolvedName).innerHTML = "(Resolving name...)";
			Area.fetchRangeItem(A, w).then(function(name) { //Fetch the resolved name
				if(this.Highlighting && this.Highlighting.Area) { //Then check if the cursor is still located at the previous location
					if(this.Highlighting.Area.Name == A.Name && this.Highlighting.RangeIndex == w.RangeIndex) { //Display cancelled if name is different or if same name but different rangeIndex
						GetId(pop.ResolvedName).innerHTML = "(" + name + ")";
					}
				}
			}.bind(this));
		}
		return this;
	}
//*****************
//MAPS METHODS
//*****************
	typeMap() { //Show the map of types for the plate
		let id = "TypeMap";
		let map = this.TypeMap.draw();
		Form.open({ //Open a form showing the map
			ID: id,
			HTML: "<div style=\"overflow: auto;margin-right: 5px\">" + map + "</div>",
			Title: "Type map",
			Size: 700,
			Buttons: [
				{Label: "Printable version", Click: function() {Reporter.printable(map)}.bind(this), Title: "Open the map in a new window to allow easy printing or copy/pasting to other applications"},
				{Label: "Close", Icon: {Type: "Cancel", Space: true, Color: "Red"}, Click: function() {Form.close(id)}},
			],
		});
		return this;
	}
	plateMap() { //Show the plates available for the definitions
		let ranges = Area.getRanges();
		if(ranges.length == 0) {Editor.Console.log({Message: "No ranges defined", Gravity: "Error"}); return this}
		Definition.formPlate(ranges);
		return this;
	}
	concMap() { //Show the map of concentrations for the plate, per plate (layer)
		if(this.Layers.length == 0) {return this}
		let id = "ConMap";
		Form.open({ //Open a form showing the map
			ID: id,
			HTML: "<div id=\"" + this.Anchors.LayerSelect + "\" style=\"margin-bottom: 10px\"></div><div style=\"overflow: auto;\"></div>",
			Title: "Concentration map",
			Size: 700,
			Buttons: [
				{Label: "Printable version", Click: function() {
					Reporter.printable(GetId(this.Anchors.LayerSelect).nextSibling.innerHTML);
				}.bind(this), Title: "Open the map in a new window to allow easy printing or copy/pasting to other applications"},
				{Label: "Close", Icon: {Type: "Cancel", Space: true, Color: "Red"}, Click: function() {Form.close(id)}},
			],
			onInit: function() {
				let c = this.Controls.LayerSelect;
				let l = this.Layers.length;
				let list = [];
				for(let i=0;i<l;i++) {list.push(i + 1)} //Update the list of available plates (layers)
				c.List = list;
				c.init().change(c.Value); //Trigger a change to display the map for selected plate (layer)
			}.bind(this),
		});
		return this;
	}
//*****************
//TAGGING METHODS
//*****************
	tagArea(a, I) { //Tag area a in the selected wells
		this.Layers.forEach(function(L) {
			L.tagArea(a, I);
		});
		I.Results.Ranges.forEach(function(range) { //Update impacted ranges
			this.updateRange(range);
		}, this);
		return I.Results;
	}
	updateRange(a) { //Update range information for area a
		a.updateRange(this.WellSize, this.WellMargin);
		return this;
	}
	untag() { //Untag the selected wells
		let I = {
			Size: this.WellSize,
			Margin: this.WellMargin,
			Map: this.TypeMap,
			Results: {Untag: 0, Ranges: []}
		}
		this.Layers.forEach(function(L) { //Process the untag and update object I with the results
			L.untag(I);
		});
		I.Results.Ranges.forEach(function(a) { //Update impacted ranges
			this.updateRange(a);
		}, this);
		return I.Results;
	}
	highlightConflicts(conflicts) { //Highlight well indices passed in the array conflicts
		let size = this.WellSize;
		let margin = this.WellMargin;
		this.Layers.forEach(function(l) {
			l.highlightConflicts(conflicts, size, margin);
		});
		return this;
	}
	tagConc(value, unit) { //Tag the concentration given in the selected wells
		let I = {
			Value: value,
			Digit: 1,
			Unit: unit,
			Selected: 0,
			Size: this.WellSize,
			Margin: this.WellMargin,
			Keep: false,
		}
		this.Layers.forEach(function(l) {
			l.tagConc(I);
		});
		return I.Selected;
	}
	untagConc() { //UnTag the concentration given in the selected wells
		var I = {
			Selected: 0,
			Size: this.WellSize,
			Margin: this.WellMargin,
		}
		this.Layers.forEach(function(l) {
			l.untagConc(I);
		});
		return I.Selected;
	}
	resetConc() { //Reset concentrations for all plates (layers)
		var I = {Size: this.WellSize, Margin: this.WellMargin}
		this.Layers.forEach(function(l) {
			l.resetConc(I);
		});
		return this;
	}
	tagDRC(I) { //Tag the DRC in the selected wells
		I.Size = this.WellSize;
		I.Margin = this.WellMargin;
		I.Keep = false;
		I.Selected = 0;
		this.Layers.forEach(function(l) {
			l.tagDRC(I);
		});
		return I.Selected;
	}
	digit() { //Change the digit
		let digit = 1;
		let size = this.WellSize;
		let margin = this.WellMargin;
		this.Layers.forEach(function(l) {
			l.changeDigit(digit, size, margin);
		});
		return this;
	}
//*****************
//EXPORT METHODS
//*****************
	getConc() { //This method returns an array of unique concentration values, flattened for all plates (layers), organized per unit, with the well indices indicated
		let out = [];
		this.Layers.forEach(function(l) { //For all plates (layers)
			let conc = [];
			l.Wells.forEach(function(w) { //For all wells
				if(w.Value !== undefined) { //If this well has a value registered
					let unit = conc.find(function(e) {return e.Unit == w.Unit});
					if(unit) { //Update an existing unit group
						let val = unit.Values.find(function(e) {return e.Value == w.Value});
						if(val) { //Update an existing value group
							val.Tags.push(w.Index);
						}
						else { //Create a new value group
							unit.Values.push({Value: w.Value, Type: "Conc", Name: w.Unit, Tags: [w.Index]});
						}
					}
					else { //Create a new group for this unit
						conc.push({Unit: w.Unit, Name: w.Unit, Values: [{Value: w.Value, Type: "Conc", Name: w.Unit, Tags: [w.Index]}]}); //Name and Type fields are added for consistency between objects sent to the analyzer
					}
				}
			});
			out = out.concat(conc);
		});
		return out;
	}
	getAsTxt() { //Return a string representing the tab-delimited version of the plate layout

	}

	selectLayer(layerIndex) {
		if (layerIndex >= 0) {
			this.SelectedLayer = layerIndex;
			this.LayerTab.Tabs.forEach((tab, index) => {
				if (index === layerIndex) {
					tab.set("Selected");
				} else {
					tab.set("Unselected");
				}
			});
			Editor.resetPlateMetadataControls();
			const selectedMetadata = this.Layers[layerIndex].getMetadata();
			Object.entries(selectedMetadata).forEach(([key, value]) => {
				if (Editor.Controls.MetadataPlateLevel[key]) {
					if (Editor.Controls.MetadataPlateLevel[key].Type === 'Select') {
						if (value) {
							Editor.Controls.MetadataPlateLevel[key].setSelected(value);
						} else {
							Editor.Controls.MetadataPlateLevel[key].setValue(0);
						}
					} else {
						Editor.Controls.MetadataPlateLevel[key].setValue(value || "");
					}
				}
			})
		}
	}

	renameLayer(index, value) {
		if (index >= 0) {
			const layer = this.Layers[index];
			layer.rename(value);
		}
	}

	applyMetadata(I) {
		if (I.ExperimentID) {
			this.Metadata.ExperimentID = I.ExperimentID;
		}
		if (I.TransfectionScientist) {
			this.Metadata.TransfectionScientist = I.TransfectionScientist;
		}
	}

	applyLayerMetadata(I) {
		if (this.SelectedLayer >= 0) {
			this.Layers[this.SelectedLayer].applyMetadata(I);
		}

		return this.SelectedLayer;
	}
}
