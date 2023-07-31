//******************************************************
//EDITOR object - Root object for handling of plates
//******************************************************
class Editor {
	constructor() {}
	static alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	//Static Methods
	static init() { //Initialize the editor. This generates all the controls and buttons
		this.Root = "Editor";
		this.pixelRatio = 2; //Provides better resolution for the canvas
		this.pushLimit = 5000; //Limit of rows to accumulate in the PushLayout method
		let menuRoot = this.Root + "_Menu";
		let mainRoot = this.Root + "_Main";
		let popupRoot = this.Root + "_Popup";
		this.Anchors = {
			Menu: {
				Root: menuRoot,
				Areas: menuRoot + "Areas",
				AreaOptions: menuRoot + "AreaOptions",
				Results: menuRoot + "Results",
				Plate: menuRoot + "Plate",
				Layout: menuRoot + "Layout",
				Conc: menuRoot + "Concentration",
				DRC: menuRoot + "Conc_DRC",
				Analysis: menuRoot + "Analysis",
				MetadataMainLevel: menuRoot + "MetadataMainLevel",
				MetadataMainLevelExperimentID: menuRoot + "MetadataMainLevelExperimentID",
				MetadataMainLevelTransfectionScientist: menuRoot + "MetadataMainLevelTransfectionScientist",
				MetadataPlateLevel: menuRoot + "MetadataPlateLevel",
				MetadataWellLevel: menuRoot + "MetadataWellLevel",
			},
			Main: {
				Root: mainRoot,
				Plate: mainRoot + "Plate",
				Results: mainRoot + "Results",
			},
			Popup: {
				Root: popupRoot,
				Well: popupRoot + "Well",
				Area: popupRoot + "Area",
				Conc: popupRoot + "Conc",
				Select: popupRoot + "Select",
				Data: popupRoot + "Data",
				ResolvedName: popupRoot + "ResolvedName",
			}
		}
		let html = "<div id=\"" + this.Anchors.Popup.Well + "\" style=\"font-weight: bold\"></div>"; //Well information
		html += "<div id=\"" + this.Anchors.Popup.Area + "\"></div>"; //Area information
		html += "<div id=\"" + this.Anchors.Popup.Conc + "\"></div>"; //Conc information
		html += "<div id=\"" + this.Anchors.Popup.Select + "\"></div>"; //Selection information
		html += "<div id=\"" + this.Anchors.Popup.Data + "\"></div>"; //Parameter value information
		GetId(this.Anchors.Popup.Root).innerHTML = html; //Populate the inner html of the popup
		this.Menu = new TabControl({
			ID: this.Anchors.Menu.Root,
			Multiple: true,
			Stack: true,
			Layout: "Menu",
			Tabs: [
				{
					Label: "Plate", Active: true, Content: {
						Type: "HTML",
						Value: "<fieldset><div id=\"" + this.Anchors.Menu.Plate + "\"></div></fieldset><fieldset id=\"" + this.Anchors.Menu.Layout + "\"><legend>Options</legend></fieldset>",
					}
				},
				{
					Label: "Wells", Content: {
						Type: "HTML",
						Value: "<fieldset></fieldset><fieldset id=\"" + this.Anchors.Menu.Areas + "\"><legend>Wells available</legend></fieldset>",
					}
				},
				{
					Label: "Metadata",
					Content: {
						Type: "HTML", Value: "<fieldset id=\"" + this.Anchors.Menu.MetadataMainLevel + "\"><legend>Transfection</legend></fieldset>"
							+ "<fieldset id=\"" + this.Anchors.Menu.MetadataPlateLevel + "\"><legend>Plate</legend></fieldset>"
							+ "<fieldset id=\"" + this.Anchors.Menu.MetadataWellLevel + "\"><legend>Well</legend></fieldset>"
					}
				},
			],
		});
		this.Main = new TabControl({
			ID: this.Anchors.Main.Root,
			Multiple: true,
			Layout: "Menu",
			Tabs: [
				{Label: "Layout", Active: true, Content: {Type: "HTML", Value: "<div id=\"" + this.Anchors.Main.Plate + "\"><p>Choose a plate format or load a layout to start</p></div>"} },
			]
		});
		this.Tables = {
			Areas: new RespTable({ID: this.Anchors.Menu.Areas, Fields: ["Type", "Name", "Color", "Other"], Preserve: true, FullWidth: true, RowNumbers: true,
				onDelete: function(a) {this.deleteArea(a)}.bind(this)}),
			Results: new RespTable({ID: this.Anchors.Menu.Results, Fields: ["Name", "Size", "Info", "Validated"], Headers: ["Name", "Size", "Parameters", "&check;"], Preserve: true, FullWidth: true, RowNumbers: true,
				onDelete: function(r) {this.deleteResult(r)}.bind(this),
				onSelect: function(newSelect, oldSelect, newIndices, oldIndices) { //Redraw when necessary
					if(oldSelect[0]) { //Something already selected
						if(newIndices[0] != oldIndices[0] || newSelect[0].Validated == false) {this.ResultManager.draw(newSelect[0])} //If a different result is selected, redraw. If the result was not validated, redraw as well
					}
					else {this.ResultManager.draw(newSelect[0])}
				}.bind(this),
				//onUpdate: function() {this.report()}.bind(this),
			}),
		}
		this.Controls = {
			Plate: {
				Rows: LinkCtrl.new("Number", {ID: this.Anchors.Menu.Plate, Title: "Number of rows", Min: 1, Max: 48, Default: 4, Label: "Rows", Chain: {Index: 0}}),
				Cols: LinkCtrl.new("Number", {ID: this.Anchors.Menu.Plate, Title: "Number of columns", Min: 1, Max: 48, Default: 6, Label: "Columns", Chain: {Index: 1, Last: true}}),
			},
			Concentration: {
				Value: LinkCtrl.new("Number", {ID: this.Anchors.Menu.Conc, Title: "Value for the concentration", Min: 0, Default: 20, Label: "Value", Preserve: true, Chain: {Index: 0}}),
				Unit: LinkCtrl.new("Select", {ID: this.Anchors.Menu.Conc, Title: "Unit for the concentration", Default: 2, Label: "Unit", ControlLeft: true, Chain: {Index: 1, Last: true}, List: Unit.list({Name: true})}),
				Doses: LinkCtrl.new("Number", {ID: this.Anchors.Menu.DRC, Title: "Total number of doses in the dose-response curve", Min: 0, Default: 10, Label: "Doses", Preserve: true, Chain: {Index: 0}}),
				Rep: LinkCtrl.new("Number", {ID: this.Anchors.Menu.DRC, Title: "How many times the same dose should be replicated side-by-side", Min: 0, Default: 1, Label: "Replicates", ControlLeft: true, Chain: {Index: 1, Last: true}}),
				Operator: LinkCtrl.new("Select", {ID: this.Anchors.Menu.DRC, Title: "Mathematical operator to use for calculation of the next dose", Chain: {Index: 2, NewLine: true}, Default: 0, Label: "Operator", List:["/", "×", "+", "×10^"]}),
				Factor: LinkCtrl.new("Number", {ID: this.Anchors.Menu.DRC, Title: "Number to use with the operator for calculation of the next dose", Chain: {Index: 3, Last: true}, Default: 2, Label: "Factor", ControlLeft: true}),
				Direction: LinkCtrl.new("Radio", {ID: this.Anchors.Menu.DRC, Label: "Direction", Title: "Direction of the dose-response", Default: 0, Chain: {Index: 4, NewLine: true}, List: ["Horizontal", "Vertical"]}),
			},
			Result: {},
			Analysis: {},
			MetadataMainLevel: {
				ExperimentID: LinkCtrl.new("Text", {
					ID: this.Anchors.Menu.MetadataMainLevel,
					Label: "Experiment ID",
					Default: "",
					Preserve: true,
					Title: "Experiment ID",
					NewLine: true
				}),
				TransfectionScientist: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataMainLevel,
					Label: "Transfection Scientist",
					Default: 0,
					Preserve: true,
					Title: "Transfection Scientist",
					List: DDOptions.transfectionScientistOptions(),
					NewLine: true,
					Chain: {Index: 1, Last: true}
				}),
			},
			MetadataPlateLevel: {
				CellLine: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Label: "Cell line",
					Default: 0,
					Preserve: true,
					Title: "Cell line",
					List: DDOptions.cellLineOptions(),
					NewLine: true,
					Chain: {Index: 1, Last: true},
				}),
				CellLinePassage: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Cell Line Passage",
					Min: 0,
					Default: "",
					Label: "Cell Line Passage",
					Preserve: true,
					NewLine: true,
					Chain: {Index: 2, Last: true}
				}),
				TransfectionReagent: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Label: "Transfection Reagent",
					Default: 0,
					Preserve: true,
					Title: "Transfection Reagent",
					List: DDOptions.transfectionReagentOptions(),
					NewLine: true,
					Chain: {Index: 3, Last: true}
				}),
				TransfectionReagentLOT: LinkCtrl.new("Text", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Label: "Transfection Reagent LOT",
					Default: "",
					Preserve: true,
					Title: "Transfection Reagent LOT",
					NewLine: true,
					Chain: {Index: 4, Last: true}
				}),
				TransfectionEndPoint: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Transfection End-Point",
					Min: 0,
					Default: "",
					Label: "Transfection End-Point",
					Preserve: true,
					NewLine: true,
					Chain: {Index: 5, Last: true}
				}),
			},
			MetadataWellLevel: {
				NumberOfCellsPerWell: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Number of Cells per Well",
					Min: 0,
					Default: "",
					Label: "Number of Cells per Well",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 1, Last: false}
				}),
				UpdateNumberOfCellsPerWell: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 2, Last: true}
				}),
				Concentration: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Concentration",
					Min: 0,
					Default: "",
					Label: "Concentration",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 3, Last: false}
				}),
				UpdateConcentration: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 4, Last: true}
				}),
				TransfectionReagentAmount: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Transfection Reagent Amount",
					Min: 0,
					Default: "",
					Label: "Transfection Reagent Amount",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 5, Last: false}
				}),
				UpdateTransfectionReagentAmount: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 6, Last: true}
				}),
			}
		}
		this.Console = new EditorConsole("Console");
		this.ResultManager = new ResultManager(this.Anchors.Main.Results, this.Tables.Results);
		this.Menu.init();
		this.Main.init();
		Object.values(this.Tables).forEach(function(t) {t.init()});
		Object.values(this.Controls).forEach(function(c) {
			Object.values(c).forEach(function(l) {l.init()});
		});
		GetId(this.Anchors.Menu.Plate).prepend(LinkCtrl.buttonBar([
			{Label: "96 wells", Title: "Create the layout for a 96-well plate (8 Rows × 12 Columns)", Click: function() {this.newPlate(8, 12)}.bind(this)},
			{Label: "384 wells", Title: "Create the layout for a 384-well plate (16 Rows × 24 Columns)", Click: function() {this.newPlate(16, 24)}.bind(this)},
			{Label: "1536 wells", Title: "Create the layout for a 1536-well plate (32 Rows × 48 Columns)", Click: function() {this.newPlate(32, 48)}.bind(this)},
			{Label: "Custom", Title: "Create the layout for a plate with the number of Rows and Columns as specified", Click: function() {
				var r = this.Controls.Plate.Rows.getValue();
				var c = this.Controls.Plate.Cols.getValue();
				this.newPlate(r, c);
			}.bind(this)},
		]));
		GetId(this.Anchors.Menu.Layout).append(LinkCtrl.buttonBar([
			{Label: "Load", Title: "Load a layout from file", Icon: {Type: "Load", Space: true}, Click: function() {this.load()}.bind(this)},
			{Label: "Save", Title: "Save the current layout", Icon: {Type: "Save", Space: true}, Click: function() {this.saveXLSX()}.bind(this)},
			{Label: "Reset", Title: "Reset the entire project: areas, tags, concentrations and results will be removed", Icon: {Type: "Reset", Space: true}, Click: function() {
				this.warn().then(function() {this.reset()}.bind(this), function() {});
			}.bind(this)},
		]));
		GetId(this.Anchors.Menu.Areas).previousSibling.append(LinkCtrl.buttonBar([
			{Label: "Definitions", Title: "Edit definitions for available ranges", Click: function() {this.definitions()}.bind(this)},
			{Label: "Edit", Title: "Edit the selected area", Icon: {Type: "Edit", Space: true}, Click: function() {this.editArea()}.bind(this)},
			{Label: "New", Title: "Create a new area", Icon: {Type: "New", Space: true}, Click: function() {this.newArea()}.bind(this)},
		]));
		GetId(this.Anchors.Menu.Areas).previousSibling.append(LinkCtrl.buttonBar([
			{Label: "Untag all", Title: "Remove tagged areas for the whole plate", Click: function() {this.untagAllArea()}.bind(this)},
			{Label: "Untag", Title: "Remove tagged areas from the selection", Click: function() {this.untagArea()}.bind(this)},
			{Label: "Tag", Title: "Tag the selected area in the selection", Icon: {Type: "Tag", Space: true},  Click: function() {this.tagArea()}.bind(this)},
		]));
		GetId(this.Anchors.Menu.MetadataMainLevel).append(LinkCtrl.buttonBar([{
			Label: "Apply",
			Title: "Apply values to the main scope",
			Click: function () {this.applyMetadata("main")}.bind(this)
		}]));
		GetId(this.Anchors.Menu.MetadataPlateLevel).append(LinkCtrl.buttonBar([{
			Label: "Apply",
			Title: "Apply values to the plate scope",
			Click: function () {this.applyMetadata("plate")}.bind(this)
		}]));
		GetId(this.Anchors.Menu.MetadataWellLevel).append(LinkCtrl.buttonBar([{
			Label: "Apply",
			Title: "Apply values to the selected wells scope",
			Click: function () {this.applyMetadata("well")}.bind(this)
		}]));
		return this;
	}
//**********************
// PLATE-RELATED METHODS
//**********************
	static warn(that, I) { //A form that will warn the user before doing something irreversible and potentially damaging
		if(this.Plate === undefined && this.Tables.Areas.Array.length == 0 && this.Tables.Results.Array.length == 0) {return Promise.resolve()}
		if(I && I.Silent) {return Promise.resolve()} //Skip the warning if it has already been shown and approved before
		let id = "Form_Warning";
		let msg = "This will reset the entire project.<br>All tags, areas, definitions and results will be discarded.";
		let title = "Reset layout";
		switch(that) {
			case "tag": msg = "This will remove all tags for all plates (layers) on the plate."; title = "Reset tags"; break;
			case "conc": msg = "This will remove all concentration data for all plates (layers) on the plate."; title = "Reset concentrations"; break;
		}
		return new Promise(function (resolve, reject) {
			Form.open({
				ID: id,
				HTML: "<div style=\"text-align: center\"><p>" + msg + "</p><p class=\"Error\">Are you sure you want to continue ?</p></div>",
				Title: title,
				Buttons: [
					{Label: "Reset", Click: function() {Form.close(id); resolve()}},
					{Label: "Cancel", Icon: {Type: "Cancel", Space: true, Color: "Red"}, Click: function() {Form.close(id); reject()}}
				]
			});
		});
	}
	static reset() { //Reset the whole thing, or part of it
		this.Plate = undefined; //Reset the plate
		this.Main.init(); //Reset the plate visualization panel
		Object.values(this.Tables).forEach(function(t) {t.empty()}); //Reset the areas and results tables
		this.Console.log({Message: "Project reset", Gravity: "Success", Reset: true});
	}
	static newPlate(r, c, options = {}) { //Create a new plate
		if(this.Plate) { //A plate already exist
			if(this.Plate.Rows != r || this.Plate.Cols != c) { //Confirmation before resizing
				let id = "Form_Resize";
				let idArea = id + "_RadioArea";
				let idConc = id + "_RadioConc";
				let RadioArea = LinkCtrl.new("Radio", {ID: idArea, Default: 0, Preserve: true, List: ["Keep", "Discard"], Title: "Keep will maintain area tagging data for the wells still available in the new plate"});
				let RadioConc = LinkCtrl.new("Radio", {ID: idConc, Default: 0, Preserve: true, List: ["Keep", "Discard"], Title: "Keep will maintain concentration values for the wells still available in the new plate"});
				let html = "<div style=\"text-align: center\"><p>This will resize your plate to the new dimensions.<br>Select what should be done with previously entered data:</p></div>";
				html += "<fieldset id=\"" + idArea + "\"><legend>Area data</legend></fieldset>";
				html += "<fieldset id=\"" + idConc + "\"><legend>Concentration data</legend></fieldset>";
				html += "<div class=\"Error\" style=\"text-align: center\"><p>Data for wells outside the new plate dimensions will be discarded</p></div>";
				Form.open({
					ID: id,
					HTML: html,
					Title: "Resize plate",
					Buttons: [
						{Label: "Resize", Click: function() {
							this.resize(r, c, RadioArea.Selected, RadioConc.Selected);
							Form.close(id);
						}.bind(this)},
						{Label: "Cancel", Icon: {Type: "Cancel", Space: true, Color: "Red"}, Click: function() {Form.close(id);}}
					],
					onInit: function() {
						RadioArea.init();
						RadioConc.init();
					}
				});
			}
			else {this.Console.log({Message: "No changes in plate dimensions", Gravity: "Warning"})}
		}
		else { //No plate was defined, create it
			this.Plate = new Plate(this.Anchors.Main.Plate, r, c, options);
			this.Plate.init();
			this.Menu.closeAll().jumpTo(1);
		}
		return this;
	}
	static resize(r, c, KeepArea, KeepConc) { //Resize the layout to the new dimensions. Keep or erase previous Area/Conc data
		if(KeepArea == "Discard") {this.untagAllArea({Silent: true})}
		else { //Keep the area data
			if(r <= this.Plate.Rows && c <= this.Plate.Cols) { //In case of downsizing, crop exceeding wells and update the ranges
				Area.resize(this.Tables.Areas.Array, this.Plate, r, c);
				this.Tables.Areas.update(); //Update display to reflect changes
			}
		}
		if(KeepConc == "Discard") {this.resetConc({Silent: true})}
		Plate.resize(this.Plate, r, c);
		this.Console.log({Message: "Plate dimensions changed", Gravity: "Success", Reset: true});
		return this;
	}
	static save() { //Save the layout
		let save = "["; //Layout is saved as a JSON.stringified array of 2 elts, a plate and areas definitions
		save += Plate.save(this.Plate) + ",";
		let areas = "[";
		let hasArea = false;
		this.Tables.Areas.Array.forEach(function(a, index) { //Save the areas
			if(index > 0) {areas += ","}
			areas += Area.save(a);
			hasArea = true;
		});
		save += areas + "]]";
		if(hasArea == false && this.Plate === undefined) {this.Console.log({Message: "Nothing to save", Gravity: "Warning"}); return this} //No area + no plate = nothing to save
		Form.download(save, {DataType: "text/json;charset=utf-8", FileName: "Layout.save"});
		return this;
	}

	static saveXLSX() { //Save the layout
		if(!this.Plate) {
			this.Console.log({Message: "Nothing to save", Gravity: "Warning"});
			return this;
		} //No area + no plate = nothing to save
		const [isValid, reasons] = this.isPlateValid();
		if (!isValid) {
			reasons.forEach(reason => this.Console.log({Message: reason, Gravity: "Error"}));
			return this;
		}
		const data = this.Plate.exportToXLSX()
		const save = this.exportToXLSX(data);
		Form.download(save, {DataType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", FileName: "TRANSFECTION_FILE.xlsx"});
		return this;
	}

	static exportToXLSX(data) {
		const dataArray = [
			[
				'SAMPLE_NAME',
				'TRANSFECTION_POS',
				'TRANSFECTION_CONCENTRATION',
				'TRANSFECTION_CELL_AMOUNT',
				'TRANSFECTION_REAGENT_AMOUNT',
				'TRANSFECTION_PLATE_NAME',
				'TRANSFECTION_CELL_LINE',
				'TRANSFECTION_CELL_LINE_PASSAGE',
				'TRANSFECTION_REAGENT',
				'TRANSFECTION_REAGENT_LOT',
				'TRANSFECTION_END_POINT',
				'TRANSFECTION_ID',
				'TRANSFECTION_SCIENTIST',
				'TRANSFECTION_DATE',
			],
			...data.map(item => [
				item.SAMPLE_NAME,
				item.TRANSFECTION_POS,
				item.TRANSFECTION_CONCENTRATION,
				item.TRANSFECTION_CELL_AMOUNT,
				item.TRANSFECTION_REAGENT_AMOUNT,
				item.TRANSFECTION_PLATE_NAME,
				item.TRANSFECTION_CELL_LINE,
				item.TRANSFECTION_CELL_LINE_PASSAGE,
				item.TRANSFECTION_REAGENT,
				item.TRANSFECTION_REAGENT_LOT,
				item.TRANSFECTION_END_POINT,
				item.TRANSFECTION_ID,
				item.TRANSFECTION_SCIENTIST,
				item.TRANSFECTION_DATE,
			])
		]

		return Excel.generateExcelFileFromArray(dataArray);
	}

	static isPlateValid() {
		let isValid = true;
		let reasons = [];

		if (
			!this.Plate.Metadata.ExperimentID
			|| !this.Plate.Metadata.TransfectionScientist
		) {
			isValid = false;
			reasons.push("Transfection metadata should be filled");
		}

		this.Plate.Layers.forEach(layer => {
			if (
				!layer.Metadata.CellLine
				|| isNaN(layer.Metadata.CellLinePassage)
				|| !layer.Metadata.TransfectionReagent
				|| !layer.Metadata.TransfectionReagentLOT
				|| isNaN(layer.Metadata.TransfectionEndPoint)
			) {
				isValid = false;
				reasons.push(`Plate ${layer.Name} metadata should be filled`);
			}

			layer.Wells.forEach(well => {
				if (
					well.Area
					&& (
						isNaN(well.Metadata.NumberOfCellsPerWell)
						|| isNaN(well.Metadata.Concentration)
						|| isNaN(well.Metadata.TransfectionReagentAmount)
					)
				) {
					isValid = false;
					reasons.push(`Well ${well.Name} metadata should be filled`)
				}
			})
		})

		return [isValid, reasons];
	}

	static load() { //Load a layout from file
		const id = "Form_Load";
		const FileCtrl = LinkCtrl.new("File", {
			ID: id + "_FileSelect",
			Default: "",
			Label: "Layout file",
			Title: "Click to select the file containing the layout definition",
			Accept: ".save, .xls, .xlsx"
		});
		const CheckboxResetData = LinkCtrl.new("Checkbox", {
			ID: `load_checkbox_${id}`,
			Default: !Boolean(Editor.Plate),
			Label: 'Reset existing plates',
			NewLine: true,
			Title: "Check to replace existing plates with loaded data",
			Disabled: !Boolean(Editor.Plate),
		});

		Form.open({
			ID: id,
			HTML: "<div id=\"" + CheckboxResetData.ID + "\"></div><p>Select the Layout file to load</p><div id=\"" + FileCtrl.ID + "\"></div>",
			Title: "Load layout",
			Buttons: [
				{
					Label: "Next",
					Click: function () {
						let files = FileCtrl.getValue();
						if (files.length === 0) {
							alert("No valid input found");
							return this
						}
						if (files.length > 0) { //Process files
							const [file] = files;
							const reader = new FileReader();
							const isExcelFile = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
								|| file.type === 'application/vnd.ms-excel';

							if (isExcelFile) {
								reader.onload = function (e) {
									const {type, data} = Editor.parseExcelFile(e.target.result);
									this.loadPreview(data, {reset: Editor.shouldToReset(type, CheckboxResetData.Value)});
								}.bind(this);
								reader.readAsArrayBuffer(file);
							} else {
								reader.onload = function (e) {
									this.loadPreview(e.target.result, {reset: CheckboxResetData.Value});
								}.bind(this);
								reader.readAsText(file);
							}
						}
						Form.close(id);
					}.bind(this)
				},
				{
					Label: "Cancel",
					Icon: {Type: "Cancel", Space: true, Color: "Red"},
					Click: function () {
						Form.close(id)
					}
				}
			],
			onInit: function () {
				FileCtrl.init();
				CheckboxResetData.init();
			},
		});
		return this;
	}

	static shouldToReset(type, checked) {
		if (type === 'transfection-file') {
			return true;
		} else {
			return checked;
		}
	}

	static parseExcelFile(file) {
		const workbook = XLSX.read(file);
		const sheet_name_list = workbook.SheetNames;

		if (this.isMetadataIncluded(file)) {
			const xlData = sheet_name_list
				.map((item) => {
					return XLSX.utils.sheet_to_json(workbook.Sheets[item]);
				})
				.flat();

			return {type: 'transfection-file', data: this.transformMetadataJSONToSave(xlData)};
		} else {
			const xlData = sheet_name_list
				.map((item) => {
					return XLSX.utils.sheet_to_json(workbook.Sheets[item]);
				});
			const {Rows, Cols} = this.getBasePlateRanges(workbook);

			return {type: 'base-plate', data: this.transformJSONToSave(xlData, sheet_name_list, {Rows, Cols})};
		}
	}

	static isMetadataIncluded(file) {
		const exportedFileHeaders = ['SAMPLE_NAME', 'TRANSFECTION_POS', 'TRANSFECTION_CONCENTRATION', 'TRANSFECTION_CELL_AMOUNT', 'TRANSFECTION_PLATE_NAME', 'TRANSFECTION_CELL_LINE', 'TRANSFECTION_CELL_LINE_PASSAGE', 'TRANSFECTION_REAGENT', 'TRANSFECTION_REAGENT_AMOUNT', 'TRANSFECTION_REAGENT_LOT', 'TRANSFECTION_END_POINT', 'TRANSFECTION_ID', 'TRANSFECTION_SCIENTIST', 'TRANSFECTION_DATE'];

		const workbook = XLSX.read(file);
		const firstSheet = workbook.SheetNames[0];
		const data = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
		const headers = Object.keys(data[0]);

		return _.some(headers, item => (exportedFileHeaders.includes(item)));
	}

	static getBasePlateRanges(workbook) {
		let Rows = 0;
		let Cols = 0;
		workbook.SheetNames.forEach(item => {
			const worksheet = workbook.Sheets[item];
			const range = XLSX.utils.decode_range(worksheet['!ref']);
			Rows = Math.max(Rows, range.e.r - range.s.r);
			Cols = Math.max(Cols, range.e.c - range.s.c);
		});

		return {Rows, Cols};
	}

	static transformMetadataJSONToSave(rawData) {
		const data = this.prepareData(rawData);
		const [Rows, Cols] = this.getMetadataFileRowsAndColumnsCount(data);
		const result = [
			{
				Rows,
				Cols,
				Digits: 1,
				Layers: [...this.mapLayers(data)],
				LayersMetadata: this.mapLayersMetadata(data),
				LayersNames: this.mapLayersNames(data),
				WellsMetadata: this.mapWellsMetadata(data, {Rows, Cols}),
				Metadata: {
					ExperimentID: data[0].TRANSFECTION_ID,
					TransfectionScientist: data[0].TRANSFECTION_SCIENTIST,
				}
			},
			[...this.mapMetadataAreas(data, {Rows, Cols})]
		];

		return JSON.stringify(result);
	}

	static getMetadataFileRowsAndColumnsCount(data = []) {
		const mappedData = _.chain(data)
			.map(item => item.TRANSFECTION_POS)
			.map(pos => {
				const letters = pos.match(/[a-z]{1,2}/i); //Parse well name from string. Accept both AX and A0X formats
				const digits = pos.match(/[0-9]{1,3}/);   //
				const col = parseInt(digits, 10) - 1; //will remove trailing 0 if any (case A0X format)
				const row = Well.rowIndex(letters);
				return {col, row}
			})
			.value();
		const columns = _.chain(mappedData)
			.map(item => item.col + 1)
			.max()
			.value();
		const rows = _.chain(mappedData)
			.map(item => item.row + 1)
			.max()
			.value();

		return [rows, columns];
	}

	static prepareData(data) {
		const originalPlateNames = data
			.filter((obj, index) => data.findIndex((item) => item.TRANSFECTION_PLATE_NAME === obj.TRANSFECTION_PLATE_NAME) === index)
			.map(item => item.TRANSFECTION_PLATE_NAME);

		return data.map((item) => {
			const {SAMPLE_NAME, TRANSFECTION_PLATE_NAME, ...rest} = item;

			return {
				...rest,
				SAMPLE_NAME: _.replace(SAMPLE_NAME, /_\d{1,2}$/i, ''),
				TRANSFECTION_PLATE_NAME: _.replace(TRANSFECTION_PLATE_NAME, /_\w$/i, ''),
				TRANSFECTION_PLATE_INDEX: parseInt(originalPlateNames.findIndex(item => item === TRANSFECTION_PLATE_NAME), 10),
			}
		})
	}

	static getUniqLayerNames(data) {
		return _.chain(data)
			.map(item => item.TRANSFECTION_PLATE_NAME)
			.uniq()
			.value();
	}

	static getUniqLayerIndexes(data) {
		return _.chain(data)
			.map(item => item.TRANSFECTION_PLATE_INDEX)
			.uniq()
			.value();;
	}

	static getUniqLayerIndexesByArea(data, area) {
		return _.chain(data)
			.filter(item => item.SAMPLE_NAME === area)
			.map(item => item.TRANSFECTION_PLATE_INDEX)
			.uniq()
			.value();
	}

	static getUniqLayerNamesByArea(data, area) {
		return _.chain(data)
			.filter(item => item.SAMPLE_NAME === area)
			.map(item => item.TRANSFECTION_PLATE_NAME)
			.uniq()
			.value();
	}

	static getUniqAreaNames(data) {
		return _.chain(data)
			.map(item => item.SAMPLE_NAME)
			.uniq()
			.value();
	}

	static mapLayers(data) {
		return _.chain(data)
			.map(item => item.TRANSFECTION_PLATE_INDEX)
			.uniq()
			.map(() => [])
			.value();
	}

	static mapLayersMetadata(data) {
		const layerIndexes = this.getUniqLayerIndexes(data);
		return _.map(layerIndexes, layerIndex => {
			const row = _.chain(data)
				.filter(item => item.TRANSFECTION_PLATE_INDEX === layerIndex)
				.first()
				.value();
			return {
				Index: row.TRANSFECTION_PLATE_INDEX,
				Metadata: {
					CellLine: row.TRANSFECTION_CELL_LINE,
					CellLinePassage: row.TRANSFECTION_CELL_LINE_PASSAGE,
					TransfectionReagent: row.TRANSFECTION_REAGENT,
					TransfectionReagentLOT: row.TRANSFECTION_REAGENT_LOT,
					TransfectionEndPoint: row.TRANSFECTION_END_POINT,
				}
			}
		});
	}

	static mapLayersNames(data) {
		const layerIndexes = this.getUniqLayerIndexes(data);

		return _.map(layerIndexes, layerIndex => {
			const row = _.chain(data)
				.filter(item => item.TRANSFECTION_PLATE_INDEX === layerIndex)
				.first()
				.value();
			return {
				Index: row.TRANSFECTION_PLATE_INDEX,
				Name: row.TRANSFECTION_PLATE_NAME
			}
		});
	}

	static mapWellsMetadata(data, {Rows, Cols}) {
		return _.map(data, item => {
			const well = Well.parseIndex(item.TRANSFECTION_POS, {Rows, Cols});
			return {
				Layer: item.TRANSFECTION_PLATE_INDEX,
				Index: well.Index,
				Metadata: {
					NumberOfCellsPerWell: item.TRANSFECTION_CELL_AMOUNT,
					Concentration: item.TRANSFECTION_CONCENTRATION,
					TransfectionReagentAmount: item.TRANSFECTION_REAGENT_AMOUNT,
				}
			}
		});
	}

	static mapMetadataAreas(data, {Rows, Cols}) {
		const uniqAreaNames = this.getUniqAreaNames(data);

		return uniqAreaNames.map((areaName) => {
			const layerIndexes = this.getUniqLayerIndexes(data, areaName);

			return {
				Name: areaName,
				Color: areaName ? this.randomizeAreaColor() : 'white',
				Type: "Sample",
				Replicates: 1,
				Direction: "Horizontal",
				Priority: "Row",
				Tags: [
					...layerIndexes.map((layerIndex) => {
						const Wells = _.chain(data)
							.filter(item => item.TRANSFECTION_PLATE_INDEX === layerIndex)
							.filter(item => item.SAMPLE_NAME === areaName)
							.map(item => {
								const well = Well.parseIndex(item.TRANSFECTION_POS, {Rows, Cols});
								if (well) {
									return {
										Index: well.Index,
										RangeIndex: 1,
									}
								}
							})
							.filter(Boolean)
							.value();

						const [item] = data.filter(item => item.TRANSFECTION_PLATE_INDEX === layerIndex);

						return {
							Layer: item.TRANSFECTION_PLATE_INDEX,
							Wells
						}
					})
				]
			}
		})
			.filter(area => area.Name !== 'undefined')
			.filter(area => area.Name !== '');
	}

	static transformJSONToSave(data, sheets = [], {Rows, Cols}) {
		const result = [
			{
				Rows,
				Cols,
				KeepSelected: true,
				Digits: 1,
				Layers: [
					...sheets.map(() => [])
				],
				LayersNames: [...sheets],
			},
			[...this.mapPagesToAreas(data, {Rows, Cols})]
		];
		return JSON.stringify(result);
	}

	static mapPagesToAreas(pages, {Rows, Cols}) {
		const areas = pages.map((data, pageIndex) => {
			// build a flat map of file representing what area contain each index
			const indexesMap = {};
			let index = 0;

			for (let i = 0; i < Rows; i++) {
				for (let j = 1; j < Cols + 1; j++) { // offset by 1 column to remove a column of letter indexes
					if (data[i]) {
						indexesMap[index] = data[i][j];
					}
					index += 1;
				}
			}

			// build a flat map of areas representing what indexes contain each area
			const areasMap = {};

			for (const [index, area] of Object.entries(indexesMap)) {
				areasMap[area] = (areasMap[area]) ? [...areasMap[area], index] : [index];
			}

			return Object.keys(areasMap)
				.map((area) => {
					return {
						Name: area,
						Color: Editor.randomizeAreaColor(),
						Type: 'Sample',
						Replicates: 1,
						Direction: 'Horizontal',
						Priority: 'Row',
						Tags: [
							{
								Layer: pageIndex,
								Wells: [
									...areasMap[area].map(indexStr => ({
										Index: parseInt(indexStr, 10),
										RangeIndex: 1
									})),
								]
							}
						]
					};
				})
				.filter(area => area.Name !== 'undefined')
				.filter(area => area.Name !== '');
		})
			.flat();

		const result = [];
		areas.forEach((area) => {
			// merge duplicated results
			const existedAreaIndex = _.findIndex(result, item => item.Name === area.Name);
			if (existedAreaIndex === -1) {
				result.push(area);
			} else {
				area.Tags.forEach(tag => {
					const existedTagIndex = _.findIndex(result[existedAreaIndex].Tags, item => _.some(area.Tags, {Layer: item.Layer}));
					if (existedTagIndex === -1) {
						result[existedAreaIndex].Tags.push(tag);
					}
				})
			}
		})

		return result;
	}

	static randomizeAreaColor() {
		if (!this.ColorsList || this.ColorsList.length === 0) {
			this.ColorsList = [...CSSCOLORS.list()];
		}

		const [randomColor] = this.ColorsList.splice(
			Math.floor(Math.random() * this.ColorsList.length),
			1
		);
		return randomColor;
	}

	static loadPreview(data, options = {}) { //Load provided data, for preview
		const {reset} = options;
		const id = 'Form_LoadPreview';
		const idPlate = id + '_Plate';
		const idAreas = id + '_Areas';

		let loadedData = undefined;
		try {
			loadedData = JSON.parse(data);
		} catch (error) {
			this.Console.log({Message: 'Unable to load the layout. <i>' + error + '</i>', Gravity: 'Error'});
			return this;
		}
		const [plate, areas] = loadedData;

		const previewAreas = () => {//show original samples colors
			return areas.map((item) => {
				const existedItem = this.Tables && this.Tables.Areas.Array.find(existed => existed.Name === item.Name);

				if (existedItem) {
					return existedItem;
				} else {
					return item;
				}
			})
		}

		if (!reset) {
			if (Editor.Plate && (plate.Rows !== Editor.Plate.Rows || plate.Cols !== Editor.Plate.Cols)) {
				this.Console.log({Message: 'Can\'t add imported plates. Sizes of existed plates and imported ones should be the same.', Gravity: 'Error'});
				Form.close(id);
				return this;
			}
		}

		Form.open({
			ID: id,
			HTML: '<fieldset id="' + idPlate + '"><legend>Plate data</legend></fieldset><fieldset id="' + idAreas + '"><legend>Areas data</legend></fieldset>',
			Title: 'Layout preview',
			Buttons: [
				{
					Label: 'Load', Click: function () {
						if (reset) {
							this.warn()
								.then(function () { //Confirmation for reset, then load data
									this.reset();
									this.loadData(plate, areas, options);
								}.bind(this));
						} else {
							this.loadData(plate, areas, options);
						}
						Form.close(id);
					}.bind(this)
				},
				{Label: 'Cancel', Icon: {Type: 'Cancel', Space: true, Color: 'Red'}, Click: function () {Form.close(id);}}
			],
			onInit: function () {
				Plate.loadPreview(plate, idPlate, reset);
				Area.loadPreview(previewAreas(), idAreas, reset);
			},
		});
	}

	static loadData(plate, areas, options = {}) { //Load the plate and areas data. Make sure the layout has been reset before using
		const {reset} = options;
		if (plate) { //Load plate data if present
			if (reset) {
				this.newPlate(plate.Rows, plate.Cols, options);
			}
			Plate.load(this.Plate, plate, {append: !reset});
		}
		if (areas && areas.length > 0) {
			Area.load(this.Tables.Areas, areas, this.Plate, plate, {append: !reset});
			this.Tables.Areas.update(); //Update the table to reflect any changes in the ranges
		}
		this.Plate.update(); //Update to display the concentrations and update the range info
		this.Menu.closeAll().jumpTo(1);
		this.Console.log({Message: 'Layout successfully loaded', Gravity: 'Success', Reset: true});
		return this;
	}

//*********************
// AREA-RELATED METHODS
//*********************
	static newArea() { //Open the form with options to create a new area
		var id = "Form_NewArea";
		Area.form({
			ID: id,
			Color: CSSCOLORS.fetch(this.Tables.Areas.Length), //Initial color when opening the form
			Ok: function(Controls, RangeControls) { //What to do when ok is clicked
				if(this.addArea(Controls, RangeControls)) {Form.close(id)}
			}.bind(this),
			Another: function(Controls, RangeControls) { //The user wants more
				if(this.addArea(Controls, RangeControls)) {
					Controls.Name.setValue("").focus(); //Give the focus back to the text to avoid mouse dragging
					Controls.Color.setValue(CSSCOLORS.fetch(this.Tables.Areas.Length));
				}
			}.bind(this),
		});
		return this;
	}
	static addArea(C, R) { //Check and create a new area with the options provided
		let name = C.Name.getValue();
		if(name.length == 0) {alert("Area name must be at least 1 character"); return false}
		if(this.Tables.Areas.hasElement("Name", name)) {alert("This name has already been defined, please choose another one"); return false}
		let color = C.Color.getValue();
		let type = C.Type.Selected;
		if(type == "Range") {
			let rep = R.Replicates.getValue();
			if(rep < 1 || rep > 1536) {alert("Replicates for range must be a valid integer between 1 and 1536"); return false}
			let dir = R.Direction.Selected;
			let priority = R.Priority.Selected;
			let custom = R.Custom.getValue();
			this.Tables.Areas.addRow(new Area({Name: name, Color: color, Type: type, Replicates: rep, Direction: dir, Priority: priority, Custom: custom}));
			return true;
		}
		this.Tables.Areas.addRow(new Area({Name: name, Color: color, Type: type}));
		return true;
	}
	static editArea() { //Edit the selected area
		var sel = this.Tables.Areas.Selected;
		if(sel.length == 0) {this.Console.log({Message: "No area selected", Gravity: "Error"}); return this}
		var id = "Form_EditArea";
		var a = sel[0];
		Area.form({
			ID: id,
			Edit: true,
			Area: a,
			Color: a.Color, //Initial color when opening the form
			Ok: function(Controls, RangeControls) { //What to do when ok is clicked
				let name = Controls.Name.getValue();
				if(a.Name != name) { //The name has changed, check unicity
					if(this.Tables.Areas.hasElement("Name", name)) {alert("This name has already been defined, please choose another one"); return}
				}
				if(name.length == 0) {alert("Area name must be at least 1 character"); return}
				Pairing.rename(a.Name, name); //Rename within Pairing object
				a.Name = name;
				a.Color = Controls.Color.getValue();
				if(a.Type == "Range") { //Update values for ranges
					a.Replicates = RangeControls.Replicates.getValue();
					a.Direction = RangeControls.Direction.Selected;
					a.Priority = RangeControls.Priority.Selected;
					a.Custom = RangeControls.Custom.getValue();
					Area.rangeInfo(a);
				}
				if(this.Plate) {a.update(this.Plate.WellSize, this.Plate.WellMargin)} //Update well display if necessary
				this.Tables.Areas.update();
				Pairing.update(this.ResultManager.Anchors.Pairing); //Update pairing info for result displayed
				Form.close(id);
			}.bind(this),
		});
		return this;
	}
	static tagArea() { //Tag the selected area in the selection
		if(this.Plate === undefined) {return this}
		var a = this.Tables.Areas.Selected;
		if(a.length == 0) {this.Console.log({Message: "No area selected", Gravity: "Error"}); return this}
		Plate.tagArea(this.Plate, a[0], {Lock: true, Strict: true}).then(function(R) { //Tag and return a feedback object
			if(R.Cancel) {return this} //Custom tag was cancelled
			if(R.Selected == 0) {this.Console.log({Message: "No wells selected", Gravity: "Error"}); return this}
			if(a[0].Type == "Range") {this.Plate.updateRange(a[0])} //Update range information if needed
			if(R.Tagged < R.Selected) { //Not all wells were tagged
				if(R.Tagged == 0) { //Nothing was tagged
					this.Console.log({Message: "None of the selected wells (" + R.Selected + ") were tagged", Gravity: "Error"});
				}
				else { //Less than expected
					this.Console.log({Message: "Only " + R.Tagged + " selected wells (out of " + R.Selected + ") were tagged", Gravity: "Warning"});
				}
				return this;
			}
			if(R.Tagged == R.Selected) { //Case both equal to 0 excluded above
				this.Console.log({Message: R.Tagged + " wells tagged", Gravity: "Success"});
			}
			this.Tables.Areas.update(); //Update the table
		}.bind(this));
		return this;
	}
	static untagArea() {
		if(this.Plate === undefined) {return this}
		let R = this.Plate.untag();
		if(R.Untag == 0) {this.Console.log({Message: "No wells selected", Gravity: "Error"}); return this}
		this.Tables.Areas.update();
		this.Console.log({Message: R.Untag + " wells untagged", Gravity: "Success"});
		return this;
	}
	static untagAllArea(I) {
		if(this.Plate === undefined) {return this}
		let A = this.Tables.Areas;
		let plate = this.Plate;
		if(A.Length > 0) {
			this.warn("tag", I).then(function() {
				A.Array.forEach(function(a) { //For each area defined
					a.removeTags(plate); //Remove tags
					a.Tags = []; //Reset the tag arrays
					if(a.Type == "Range") {
						a.MaxRange = 0; //Reset the ranges
						Area.rangeInfo(a); //Update info
					}
				});
				A.update(); //Update the areas table to reflect any changes in ranges
				this.Console.log({Message: "All wells untagged", Gravity: "Success"});
			}.bind(this), function() {});
		}
		else {this.Console.log({Message: "No area defined", Gravity: "Warning"})}
		return this;
	}
	static deleteArea(a) { //Delete selected area a
		if(this.Plate) {a.removeTags(this.Plate)}
		return this;
	}
	static strictMode(bool) { //Switch strict mode ON or OFF
		if(this.Plate === undefined) {return this}
		if(bool) { //Check for conflicts and prevent switching if any
			let conflicts = TypeMap.getConflicts(this.Plate.TypeMap);
			if(conflicts.length > 0) {
				this.Controls.Area.Strict.setValue(false); //Prevent switch
				this.Plate.highlightConflicts(conflicts);
				this.Console.log({Message: "Conflicts detected! Must be resolved before activating strict mode", Gravity: "Error"});
			}
		}
		return this;
	}
//***************************
// DEFINITION-RELATED METHODS
//***************************
	static definitions() { //Edition of the definitions
		let ranges = Area.getRanges();
		if(ranges.length == 0) {this.Console.log({Message: "No ranges defined", Gravity: "Error"}); return this}
		Definition.formEdit(ranges);
		return this;
	}
//******************************
// CONCENTRATION-RELATED METHODS
//******************************
	static tagConc() { //Tag the concentration in the selected wells
		if(this.Plate === undefined) {return this}
		let S = this.Plate.tagConc(this.Controls.Concentration.Value.getValue(), this.Controls.Concentration.Unit.Selected); //Tag and return a feedback object
		if(S == 0) {this.Console.log({Message: "No wells selected", Gravity: "Error"}); return this}
		else {this.Console.log({Message: "Concentration added in " + S + " wells", Gravity: "Success"})}
		return this;
	}
	static untagConc() { //Untag the concentration in the selected wells
		if(this.Plate === undefined) {return this}
		let S = this.Plate.untagConc(); //Tag and return a feedback object
		if(S == 0) {this.Console.log({Message: "No wells selected", Gravity: "Error"}); return this}
		else {this.Console.log({Message: "Concentration removed in " + S + " wells", Gravity: "Success"})}
		return this;
	}
	static resetConc(I) { //Reset concentrations for the entire plate
		if(this.Plate === undefined) {return this}
		this.warn("conc", I).then(function() {
			this.Plate.resetConc();
		}.bind(this), function() {});
	}
	static tagDRC() { //Tag the specified DRC in the selected wells
		if(this.Plate === undefined) {return this}
		let c = this.Controls.Concentration;
		let op = c.Operator.Selected;
		op = op.replace("×", "*"); //× is good for display but not for math...
		op = op.replace("^", "**"); //^ is good for display but not for math...
		let I = {
			Value: c.Value.getValue(),
			Unit: c.Unit.Selected,
			Doses: c.Doses.getValue(),
			Rep: c.Rep.getValue(),
			Operator: op,
			Factor: c.Factor.getValue(),
			Direction: c.Direction.Selected,
		}
		let S = this.Plate.tagDRC(I);
		if(S == 0) {this.Console.log({Message: "No wells selected", Gravity: "Error"}); return this}
		else {this.Console.log({Message: "DRC added in " + S + " wells", Gravity: "Success"})}
		return this;
	}
//************************
// RESULTS-RELATED METHODS
//************************
	static newResult() { //Add a result file
		Form_Import.open({Chain: true, OnClose: function(data) {
			let results = [];
			data.forEach(function(d) {
				results.push(new Result(d));
			}.bind(this));
			this.ResultManager.mapParameters(results, true); //The second argument (BackToImport) allow the Form_Import to remain open
			this.Main.jumpTo(1); //Open the data panel
		}.bind(this)});
		return this;
	}
	static editResult() { //Edit Parsing options and parameter selection
		this.ResultManager.mapParameters();
		return this;
	}
	static deleteResult(r) { //Delete selected result
		this.ResultManager.deleteResult(r);
		return this;
	}
	static pushLayout() { //Merge selected result files with layout data
		let selected = this.Tables.Results.Selected;
		if(this.Plate) {
			if(selected.length > 0) {this.ResultManager.pushLayout(selected[0], this.Plate.Layers.length)}
			else {this.Console.log({Message: "No result file selected", Gravity: "Error"})}
		}
		else {this.Console.log({Message: "No plate defined", Gravity: "Error"})}
		return this;
	}
	static pairing() { //Pairing of result and definition plates
		let definitions = Area.getRanges({HasDefinition: true}); //Ranges with definition
		let results = this.Tables.Results.Array.filter(function(r) { //Get the results.
			if(r.Validated) { //Only validated results
				r["Plate Count"] = r.PlatesID.length; //Create or update the Plate Count property
				return true;
			}
			else return false;
		});
		if(definitions.length == 0 || results.length == 0) {this.Console.log({Message: "At least one definition and one validated result files are required for pairing", Gravity: "Error"}); return this}
		Pairing.form(results, definitions); //Open the form for pairing
		return this;
	}
//*************************
// ANALYSIS-RELATED METHODS
//*************************
	static report(type) { //Update the window.Results data and Open the desired report page
		let results = this.Tables.Results.Array.filter(function(r) {return r.Validated}); //Only validated results
		window.Results = results;
		//if(type === undefined) {return this} //No need to do more in that case
		if(this.Plate === undefined) {this.Console.log({Message: "No plate defined", Gravity: "Error"}); return this} //Check that a plate exist
		if(results.length == 0) {this.Console.log({Message: "No result file available", Gravity: "Error"}); return this} //Check that results exist
		switch(type) { //Open the desired report page
			case "zFactor": return this.zFactor();
			case "aggregate": return this.aggregate();
			case "grouped": return this.grouped();
			case "hits": return this.hits();
		}
	}
	static zFactor() { //Compute and report z-factor across all plates
		let controls = Area.getControls(this.Tables.Areas.Array);
		if(controls.Count == 0) {this.Console.log({Message: "No controls defined in the current layout", Gravity: "Error"}); return this}
		Reporter.zFactor(controls);
		return this;
	}
	static aggregate() { //Compute and report stats for aggregated areas (column analysis)
		let areas = Area.getAreas(this.Tables.Areas.Array);
		if(areas.Count == 0) {this.Console.log({Message: "No areas defined in the current layout", Gravity: "Error"}); return this}
		Reporter.aggregate(areas);
		return this;
	}
	static grouped() { //Features for grouped analysis
		let areas = Area.getAreas(this.Tables.Areas.Array);
		if(areas.Count == 0) {this.Console.log({Message: "No areas defined in the current layout", Gravity: "Error"}); return this}
		let conc = this.Plate.getConc(); //Loop the plate to get the conc categorized per unit
		Reporter.grouped(areas, conc);
		return this;
	}
	static hits() { //Compute and report hits above the threshold for all plates
		let controls = Area.getControls(this.Tables.Areas.Array);
		if(controls.Count == 0) {this.Console.log({Message: "No controls defined in the current layout", Gravity: "Error"}); return this}
		let areas = Area.getAreas(this.Tables.Areas.Array);
		if(areas.Count == 0) {this.Console.log({Message: "No areas defined in the current layout", Gravity: "Error"}); return this}
		Reporter.hits(controls, areas, Plate.flatten(this.Plate));
		return this;
	}

	static applyMetadata(scope) {
		switch (scope) {
			case 'well':
				this.applyWellMetadata();
				break;
			case 'plate':
				this.applyPlateMetadata();
				break;
			case 'main':
			default:
				this.applyMainMetadata();
				break;
		}
	}

	static applyMainMetadata() {
		if (this.Plate) {
			const values = {
				ExperimentID:  this.Controls.MetadataMainLevel.ExperimentID.getValue(),
			};
			if (this.Controls.MetadataMainLevel.TransfectionScientist.Value > 0) {
				values.TransfectionScientist = this.Controls.MetadataMainLevel.TransfectionScientist.Selected;
			}
			this.Plate.applyMetadata(values);

			this.Console.log({Message: 'Main metadata updated with following values:', Gravity: "Success"});
			this.Console.log({Message: `Experiment ID: ${this.Plate.Metadata.ExperimentID}`, Gravity: "Success"});
			if (this.Controls.MetadataMainLevel.TransfectionScientist.Value > 0) {
				this.Console.log({Message: `Transfection Scientist: ${this.Plate.Metadata.TransfectionScientist}`, Gravity: "Success"});
			}
		} else {
			this.Console.log({Message: "No plate created", Gravity: "Error"})
		}
	}

	static applyPlateMetadata() {
		if (this.Plate) {
			const values = {
				CellLinePassage: this.Controls.MetadataPlateLevel.CellLinePassage.getValue(),
				TransfectionReagentLOT: this.Controls.MetadataPlateLevel.TransfectionReagentLOT.getValue(),
				TransfectionEndPoint: this.Controls.MetadataPlateLevel.TransfectionEndPoint.getValue(),
			};
			if (this.Controls.MetadataPlateLevel.CellLine.Value > 0) {
				values.CellLine = this.Controls.MetadataPlateLevel.CellLine.Selected
			}
			if (this.Controls.MetadataPlateLevel.TransfectionReagent.Value > 0) {
				values.TransfectionReagent = this.Controls.MetadataPlateLevel.TransfectionReagent.Selected
			}
			const updatedPlateID = this.Plate.applyLayerMetadata(values);

			if (updatedPlateID >= 0) {
				Editor.Console.log({Message: `Plate ${updatedPlateID + 1} metadata updated with following values:`, Gravity: "Success"});
				if (values.CellLine) {
					Editor.Console.log({Message: `Cell Line: ${values.CellLine}`, Gravity: "Success"});
				}
				Editor.Console.log({Message: `Cell Line Passage: ${values.CellLinePassage}`, Gravity: "Success"});
				if (values.TransfectionReagent) {
					Editor.Console.log({Message: `Transfection Reagent: ${values.TransfectionReagent}`, Gravity: "Success"});
				}
				Editor.Console.log({Message: `Transfection Reagent LOT: ${values.TransfectionReagentLOT}`, Gravity: "Success"});
				Editor.Console.log({Message: `Transfection End Point: ${values.TransfectionEndPoint}`, Gravity: "Success"});
			} else {
				this.Console.log({Message: "No plate selected", Gravity: "Error"})
			}
		} else {
			this.Console.log({Message: "No plate created", Gravity: "Error"})
		}
	}

	static applyWellMetadata() {
		if (this.Plate) {
			const values = {};
			if (this.Controls.MetadataWellLevel.UpdateNumberOfCellsPerWell.Value) {
				values.NumberOfCellsPerWell = this.Controls.MetadataWellLevel.NumberOfCellsPerWell.getValue();
			}
			if (this.Controls.MetadataWellLevel.UpdateConcentration.Value) {
				values.Concentration = this.Controls.MetadataWellLevel.Concentration.getValue();
			}
			if (this.Controls.MetadataWellLevel.UpdateTransfectionReagentAmount.Value) {
				values.TransfectionReagentAmount = this.Controls.MetadataWellLevel.TransfectionReagentAmount.getValue();
			}
			let totalUpdated = 0;
			let totalEmpty = 0;

			this.Plate.Layers.forEach(layer => {
				const [updated, empty] = layer.applyWellsMetadata(values);
				if (updated) {totalUpdated += updated;}
				if (empty) {totalEmpty += empty;}
			});

			if (totalUpdated > 0) {
				this.Console.log({Message: `Metadata of ${totalUpdated} well${(totalUpdated > 1) ? 's' : ''} updated with following values:`, Gravity: "Success"});
				if (this.Controls.MetadataWellLevel.UpdateNumberOfCellsPerWell.Value) {
					this.Console.log({Message: `Number of Cells per Well: ${values.NumberOfCellsPerWell}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdateConcentration.Value) {
					this.Console.log({Message: `Concentration: ${values.Concentration}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdateTransfectionReagentAmount.Value) {
					Editor.Console.log({Message: `Transfection Reagent Amount: ${values.TransfectionReagentAmount}`, Gravity: "Success"});
				}
			}
			if (totalEmpty > 0) {
				this.Console.log({Message: `Metadata of ${totalEmpty} empty well${(totalEmpty > 1) ? 's' : ''} was not updated`, Gravity: "Warning"});
			}
			if (totalUpdated === 0 && totalEmpty === 0) {
				this.Console.log({Message: "No well selected", Gravity: "Error"});
			}
		} else {
			this.Console.log({Message: "No plate created", Gravity: "Error"});
		}
	}

	static resetMainMetadataControls() {
		this.Controls.MetadataMainLevel.ExperimentID.setValue("");
		this.Controls.MetadataMainLevel.TransfectionScientist.setValue(0);
	}

	static resetPlateMetadataControls() {
		this.Controls.MetadataPlateLevel.CellLine.setValue(0);
		this.Controls.MetadataPlateLevel.CellLinePassage.setValue("");
		this.Controls.MetadataPlateLevel.TransfectionReagent.setValue(0);
		this.Controls.MetadataPlateLevel.TransfectionReagentLOT.setValue("");
		this.Controls.MetadataPlateLevel.TransfectionEndPoint.setValue("");
	}

	static resetWellMetadataControls() {
		this.Controls.MetadataWellLevel.NumberOfCellsPerWell.setValue("");
		this.Controls.MetadataWellLevel.Concentration.setValue("");
		this.Controls.MetadataWellLevel.TransfectionReagentAmount.setValue("");
	}
}
