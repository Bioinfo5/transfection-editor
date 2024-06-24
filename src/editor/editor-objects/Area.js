//***************************************************
// AREA object - Common object for samples & controls
//***************************************************
class Area {
	constructor(I) {
		this.Name = I.Name;
		this.Color = I.Color;
		this.Replicates = (I.Replicates || 1);
		this.Direction = (I.Direction || 'Horizontal');
		this.Priority = (I.Priority || 'Row');
		this.Custom = I.Custom;
		this.Definition = undefined;
		this.MaxRange = 0;
		this.DefInfo = 'none';
		this.Tags = []; //Wells tagged with this area, as an array of objects with Plate (Layer) and Wells properties

		return this;
	}

	//Static Methods
	static log(a, l, w) { //Log well w from plate (layer) l in area a
		let size = a.Tags.length;
		if(size == 0) { //Simple case where the array is empty
			a.Tags.push({Layer: l, Wells: [w]});
		}
		else { //Array already has some elements, scan to see if the layer is found
			let index = a.Tags.findIndex(function(t) {return t.Layer.Index == l.Index});
//*******************************************************************************
//Since duplicate tagging on a same layer is removed initially at the well level,
//there is no problem here pushing directly the well without confirmation
			if(index > -1) {a.Tags[index].Wells.push(w)} //Layer found, merge
//*******************************************************************************
			else { //Layer not found, create a new entry
				a.Tags.push({Layer: l, Wells: [w]});
			}
		}
	}
	static unlog(a, l, well) { //Unlog well w from layer l in area a
		let index = a.Tags.findIndex(function(t) {return t.Layer.Index == l.Index});
		if(index > -1) { //Layer found, remove well w
			a.Tags[index].Wells = a.Tags[index].Wells.filter(function(w) {return w.Index != well.Index}); //Exclude the well to untag
		}
	}

	static form(I) { //Open a form to create or edit an area (Mode: create/edit), passing the necessary options
		let id = I.ID;
		let input = id + '_Input';
		let range = id + '_InputRange';
		let rangeOptions = id + '_InputRange_Options';
		let rangeCustom = id + '_InputRange_Custom';
		let title = 'New Area';
		if (I.Edit) {
			title = 'Edit Area';
		}
		let Controls = {
			Name: LinkCtrl.new('Select', {
				ID: input,
				Index: 0,
				Default: 0,
				Lookup: true,
				Label: 'Name',
				Title: 'The name of the area',
				Preserve: true,
				List: DDOptions.sampleNames(),
			}),
			Color: LinkCtrl.new('Color', {
				ID: input,
				Default: I.Color,
				Label: 'Color',
				Title: 'The color that will be used to represent this area',
				Chain: {Index: 1, Last: true},
				NewLine: true,
			}),
		};
		let RangeControls = { //Options for the ranges
			Replicates: LinkCtrl.new('Number', {
				ID: rangeOptions,
				Index: 0,
				Default: 10,
				Label: 'Replicates',
				Title: 'Number of replicates for the range. Should be between 1 and 1536',
				NewLine: true,
				Min: 1,
				Max: 1536
			}),
			Direction: LinkCtrl.new('Radio', {
				ID: rangeOptions,
				Index: 1,
				Default: 0,
				Label: 'Direction',
				Title: 'Direction of the replicates',
				NewLine: true,
				Preserve: true,
				List: ['Horizontal', 'Vertical']
			}),
			Priority: LinkCtrl.new('Radio', {
				ID: rangeOptions,
				Index: 2,
				Default: 0,
				Label: 'Priority',
				Title: 'Wether numbering should be done per rows or per cols',
				NewLine: true,
				Preserve: true,
				List: ['Row', 'Col']
			}),
			Custom: LinkCtrl.new('Checkbox', {
				ID: rangeCustom,
				Index: 3,
				Default: 0,
				Label: 'Custom',
				Change: function (v) {
					let target = GetId(rangeOptions);
					if (!v) { //Warn if leaving custom mode
						const message = 'When leaving custom mode, all exisiting custom numbering will be recomputed using the options specified above';
						target.style.display = 'block';
						target.insertAdjacentHTML(
							'beforeend',
							`<div class="Error" style="padding: 5px; text-align: center">${message}</div>`
						);
					} else {
						if (target.lastChild.nodeName === 'DIV') {
							target.lastChild.remove();
						} //Remove the warning message if it exists
						target.style.display = 'none';
					}
				}, Title: 'Tick to allow customized numbering after each tagging'
			}),
		};

		if (I.Edit) { //Set controls to existing values for edition
			Controls.Name.setValue(Controls.Name.List.findIndex(n => n === I.Area.Name));
		}
		const buttons = [{
			Label: 'Ok',
			Icon: {Type: 'Ok', Space: true, Color: 'Green'},
			Click: function () {I.Ok(Controls, RangeControls);}
		}];
		if (!I.Edit) { //Creation mode, use this button to chain with another area creation
			buttons.push({
				Label: 'Add another',
				Icon: {Type: 'New', Space: true},
				Click: function () {I.Another(Controls, RangeControls);}
			});
		}
		buttons.push({
			Label: 'Cancel',
			Icon: {Type: 'Cancel', Space: true, Color: 'Red'},
			Click: function () {Form.close(id);}
		});
		Form.open({ //Open the form
			ID: id,
			HTML: '<div id="' + input + '"></div><fieldset id="' + range + '" style="display: none; margin-top: 5px"><legend>Numbering</legend><div id="' + rangeOptions + '"></div><div id="' + rangeCustom + '"></div></fieldset>',
			Title: title,
			Buttons: buttons,
			onInit: function () { //Initialize the controls on open
				Object.values(Controls).forEach(function (c) {c.init();});
				Controls.Name.focus();
			}
		});
	}

	static fetchRangeItem(a, w, I) { //Return a promise for the name to display for area a, using its definition if provided
		if(a.Definition) { //Use the definition if defined
			return a.Definition.item(w); //Return a promise
		}
		else { //Use generic name
			let out = "#" + w.RangeIndex;
			if(I && I.OutputName) {out = a.Name + " (" + out + ")"}
			return Promise.resolve(out); //Return a promise automatically fulfilled with the value
		}
	}
	static rangeInfo(range) { //Return a string of info for the range
		if(range.Custom) {range.Other = "Custom"}
		else {
			let arrow = "";
			if(range.Direction == "Horizontal") {arrow = ", &rarr;"}
			else {arrow = ", &darr;"}
			if(range.Priority === undefined || range.Priority == "Row") {arrow += "R"} //The case undefined is for compatibility with legacy versions of saved area
			else {arrow += "C"}
			range.Other = range.Replicates + "&times;" + arrow;
		}
		if(range.MaxRange > 0) {range.Other += "<br>" + range.MaxRange + " counts"}
	}
//SAVE & LOAD METHODS
//******************************************************************************
//References to files cannot be saved and exporting all their content would kill
//the streaming purpose... For this reasons, the definitions and results are not
//saved, only the layout...
//******************************************************************************
	static save(area) { //Return a JSON.stringify version of the area object for saving
		let tags = [];
		area.Tags.forEach(function (tag) { //Tag object, containing the layer and the wells
			let well = [];
			tag.Wells.forEach(function (well) { //Keep only essential info from wells
				well.push(Well.save(well));
			});
			//tags.push({Layer: t.Layer.Index, Wells: well});
			tags.push({Layer: tag.Layer.ArrayIndex, Wells: well});
		});
		return JSON.stringify({
			Name: area.Name,
			Color: area.Color,
			Replicates: area.Replicates,
			Direction: area.Direction,
			Priority: area.Priority,
			Custom: area.Custom,
			Tags: tags,
		});
	}

	static loadPreview(areas, id) { //Prepare a preview out of the loaded information from areas
		let html = '<table class="RespTable"><tr><th>#</th><th>Name</th><th>Color</th><th>Tags</th></tr>';
		if (areas && areas.length > 0) {
			areas.forEach(function (a, i) {
				html += '<tr><td>' + (i + 1) + '</td><td>' + a.Name + '</td>';
				html += '<td><span style="background-color: ' + a.Color + '; border: 1px solid black">&nbsp;&nbsp;&nbsp;&nbsp;</span></td>';
				html += '<td>';
				if (a.Tags) {
					html += a.Tags[0].Wells.length;
				} else {html += 0;}
				html += '</td></tr>';
			});
			html += '</table>';
		} else {html = '<p class="Error">No data</p>';}
		GetId(id).insertAdjacentHTML('beforeend', html);
	}

	static load(table, areaData, plate, plateData, options) { //Load the provided areas data in the provided plate and table
		const {append} = options;
		areaData.forEach(function (area) { //For each area to load
			const targetArea = table.addRow(new Area({Name: area.Name, Color: area.Color}));
			if (plateData) { //Do the tagging if plateData are available to load as well
				const startIndex = (append) ? plate.Layers.length - plateData.Layers.length : 0;
				area.Tags.forEach(function (tag) { //Go throught the array of tag object
					const lay = plate.Layers[startIndex + tag.Layer];
					tag.Wells.forEach(function (w) { //Go through the wells for this layer
						const targetWell = lay.Wells[w.Index]; //The well to tag
						if (targetWell) {
							targetWell.Area = targetArea; //Tag with the area
							Area.log(targetArea, lay, targetWell); //Log the well in the Area Tags
						}
					});
				});
			}
		});
	}

	static resize(areas, plate, row, column) { //Resize the selection of each area to fit within the new dimensions
		areas.forEach(function (area) { //For each area
			area.Tags.forEach(function (tag) { //Go through the selection
				const temp = [];
				tag.Wells.forEach(function (well) {
					if (well.Row < row && well.Col < column) {
						temp.push(well);
					} //Push the well if it is within the new plate boundaries
				});
				tag.Wells = temp; //Update the selection
			});
		});
	}

	static plateDefinition(a, def) { //For the area provided, return an array the size of the plate where each tagged well now contains the value of the definition, provided as an array
		let array = Array(Editor.Plate.Rows * Editor.Plate.Cols).fill(""); //Initialize the array with empty spaces
		a.Tags.forEach(function(t) { //Go through the tag objects
			t.Wells.forEach(function(w) { //For each well on the layer
				let here = w.Index; //Get the location
//**********************************************************************************************************************
//For non-range area, there are no definitions and the rangeIndex always equal 1. So providing a dummy definition array,
//for example [true, true] or [1, 1], allows the recovery of an array of tags that can be easily tested for truthy values
				if(array[here].length == 0) {array[here] = def[w.RangeIndex - 1]} //Append the definition
				else {array[here] += " " + def[w.RangeIndex - 1]} //In case the same well is tagged on two different layers, append the definitions together
//**********************************************************************************************************************
			});
		});

		return array;
	}

	static getControls() { //For the array of area provided in input, returns only the controls as new objects for the reporter
		let pos = [];
		let neg = [];
		return {P: pos, N: neg, Count: pos.length + neg.length};
	}

	static getAreas(array) { //For the array of areas provided in input, returns the object needed by the reporter
		const areas = []; //Array for the areas
		const ranges = []; //For the ranges
		let count = 0;
		array.forEach(function (area) { //Loop the areas
			const tags = Area.taggedWells(area); //Recover a flat array of tags across all layers
			areas.push({Name: area.Name, Tags: tags.W, Conc: tags.C});
			count++;
		});

		return {A: areas, R: ranges, Count: count};
	}

	static getRanges() { //Get and return the array of ranges available for this layout7
		return [];
	}

	static taggedWells(area, I) { //Return a flat array containing the indices (or names) of wells containing this area, across all layers but without duplicates
		let wells = [];
		let concs = [];
		area.Tags.forEach(function (tag) {
			tag.Wells.forEach(function (well) {
				let test = well.Index;
				if (I && I.ByName) {
					test = well.Name;
				}
				if (!wells.includes(test)) {
					wells.push(test);
					concs.push(Well.dose(well));
				} //Push only if new
			});
		});

		return {W: wells, C: concs};
	}

	static setPriority(wells, R, p) { //Reshuffle the array of wells to set the priority on Row or Col, as requested
		let n = wells.length;
		let j = 0;
		let parts = []; //The wells array will be chopped down in smaller parts the size of the replicate (R), or up to the end of a Row/Col
		let toTest = function(i) { //Defines what should be tested to decide how to chop the array
			if(wells[i]) {
				if(p == "Col") {return wells[i].Row}
				else {return wells[i].Col}
			}
			return -1; //If the well is undefined (index goes out of range in the last fragment), returns a value that will always lead to a falsy test
		}
		let position = toTest(0); //Get the row/Col of the first element to initiate the loop
		while(j < n) { //Cut down the array of wells into arrays the size of the replicates, or up to the end of a Row/Col
			let stop = 0;
			let goOn = true;
			while(stop < R && goOn) { //Advance in the array as long as the # of replicates or the end of the row/col is not reached
				let currentPosition = toTest(stop); //Get the current position
				if(currentPosition != position) { //Stop there and redefine the position for the next pieces
					goOn = false;
					position = currentPosition;
				}
				else {stop++}
			}
			if(stop > 0) { //If the number of elements is an exact multiple of the replicates (no leftovers), then there is nothing more to extract and we should just move to the next row/col
				parts.push(wells.splice(0, stop)); //Add the fraction of array to the part array
				j += stop;
			}
		}
		if(p == "Col") {parts.sort(function(a, b) {return a[0].Col - b[0].Col})} //Sort the pieces according to the column index of the first element
		else {parts.sort(function(a, b) {return a[0].Row - b[0].Row})} //Sort the pieces according to the row index of the first element
		return parts.reduce(function(acc, val) {return acc.concat(val)}, []); //Finally concat the pieces back all together
	}
	//Getters
	get Tagged() { //Return the total number of wells tagged for this area
		let total = 0;
		this.Tags.forEach(function(t) {
			total += t.Wells.length;
		});
		return total;
	}

	//Methods
	update(size, margin) { //Update well contents
		this.Tags.forEach(function(tag) { //For each layer
			let ctx = tag.Layer.Contents.getContext("2d");
			tag.Wells.forEach(function(well) { //Update each well
				well.content(ctx, size, margin);
			});
		});
	}

	updateRange(size, margin) { //Update range numbers and well contents
		let i = 0;
		let R = this.Replicates;
		let range = 0;
		let mode = (this.Direction + " " + this.Priority); //Four different ways to update the numbering
		this.Tags.sort(function(a, b) {return a.Layer.Index - b.Layer.Index}); //Sort by layer, smallest to biggest
		this.Tags.forEach(function(t) { //For each layer
			if(this.Custom) { //Gather the highest rangeIndex from all available tags
				t.Wells.forEach(function(w) {
					range = Math.max(range, w.RangeIndex);
				});
			}
			else {
				if(this.Direction == "Horizontal") {
					t.Wells.sort(function(a, b) {return a.Index - b.Index}); //Sort per well Index for pure horizontal mode
					if(R > 1 && this.Priority == "Col") {t.Wells = Area.setPriority(t.Wells, R, "Col")} //Need to reshuffle the array to prioritize columns; no need to bother in case there is only one replicate, priority will not affect the order
				}
				else {
					t.Wells.sort(function(a, b) {return ((a.Col - b.Col) || (a.Row - b.Row))});
					if(R > 1 && this.Priority == "Row") {t.Wells = Area.setPriority(t.Wells, R, "Row")} //Need reshuffling to prioritize the rows
				}
				let ctx = t.Layer.Contents.getContext("2d");
				t.Wells.forEach(function(w) { //Update each well. After sorting, simply apply the indices as they come
					range = Math.floor(i / R) + 1;
					w.RangeIndex = range;
					w.content(ctx, size, margin);
					i++;
				});
			}
		}, this);
		this.MaxRange = range;
		if(this.Definition) {this.Definition.update()} //Update definition data if needed
		Area.rangeInfo(this);
		return this;
	}
	removeTags(plate) { //Remove the tags for this area
		let map = plate.Map;
		let size = plate.WellSize;
		let margin = plate.WellMargin;
		this.Tags.forEach(function(o) { //For each object defined in the tag array
			let ctx = o.Layer.Contents.getContext("2d"); //Retrieve the context for the layer
			let index = o.Layer.Index; //Index of the layer
			o.Wells.forEach(function(w) { //For each tagged wells on this layer
				plate.TypeMap.unlog(w.Index, index); //Update the map of types
				w.Area = undefined; //Remove the tag
				w.content(ctx, size, margin); //Redraw the content
			});
		});
		return this;
	}
	removeDefinition() { //Remove the definition for this area
		this.Definition = undefined;
		this.DefInfo = "none";
		return this;
	}
	cleanTags(layerIndex) { //Clean the tags that belongs to the layer with Index l
		let here = this.Tags.findIndex(function(t) {return t.Layer.Index == layerIndex});
		if(here > -1) {this.Tags.splice(here, 1)}
		return this;
	}
}
