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
			Layout: 'Horizontal',
			Tabs: [
				{
					Label: 'Layout',
					Active: true,
					Content: {
						Type: 'HTML',
						Value: '<div id="' + this.Anchors.Main.Plate + '"><p>Choose a plate format or load a layout to start</p></div>'
					}
				},
			]
		});
		this.Tables = {
			Areas: new RespTable({
				ID: this.Anchors.Menu.Areas,
				Fields: ["Name", "Color"],
				Preserve: true,
				FullWidth: true,
				RowNumbers: true,
				onDelete: function(a) {this.deleteArea(a)}.bind(this)
			}),
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
				Unit: LinkCtrl.new("Select", {ID: this.Anchors.Menu.Conc, Title: "Unit for the concentration", Default: 2, Lookup: true, Label: "Unit", ControlLeft: true, Chain: {Index: 1, Last: true}, List: Unit.list({Name: true})}),
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
					Lookup: true,
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
					Lookup: true,
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
				TransfectionEndPoint: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Transfection End-Point",
					Min: 0,
					Default: "",
					Label: "Transfection End-Point",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 5, Last: false}
				}),
				TransfectionEndPointUnit: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Transfection End-Point Units",
					Min: 0,
					Default: 0,
					Label: "",
					List: DDOptions.TransfectionEndPointUnitOptions(),
					Preserve: true,
					NewLine: false,
					Chain: {Index: 6, Last: false}
				}),
				UpdateTransfectionEndPoint: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 7, Last: true}
				}),
				ViabilityPercentage: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Viability percentage",
					Min: 0,
					Max: 100,
					Default: "",
					Label: "Viability percentage",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 8, Last: false}
				}),
				ViabilityPercentageUnit: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Viability percentage Units",
					Min: 0,
					Default: 0,
					Label: "",
					List: DDOptions.ViabilityPercentageUnitOptions(),
					Preserve: true,
					NewLine: false,
					Chain: {Index: 9, Last: false}
				}),
				UpdateViabilityPercentage: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 10, Last: true}
				}),
				SeedingMedium: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Seeding medium",
					Default: "",
					Label: "Seeding medium",
					Preserve: true,
					NewLine: true,
					Chain: {Index: 11, Last: true}
				}),
				TransfectionMedium: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Transfection medium",
					Default: "",
					Label: "Transfection medium",
					Preserve: true,
					NewLine: true,
					Chain: {Index: 12, Last: true}
				}),
				NumberOfCellsPer10CmPlate: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Number Of Cells Per 10cm Plate",
					Min: 0,
					Default: "",
					Label: "Number Of Cells Per 10cm Plate",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 13, Last: false}
				}),
				NumberOfCellsPer10CmPlateUnit: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Title: "Number Of Cells Per 10cm Plate Units",
					Min: 0,
					Default: 0,
					Label: "",
					List: DDOptions.NumberOfCellsPer10CmPlateUnitOptions(),
					Preserve: true,
					NewLine: false,
					Chain: {Index: 14, Last: false}
				}),
				UpdateNumberOfCellsPer10CmPlate: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataPlateLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 15, Last: true}
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
				NumberOfCellsPerWellUnit: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Number of cells per well Units",
					Min: 0,
					Default: 0,
					Label: "",
					List: DDOptions.NumberOfCellsPerWellUnitOptions(),
					Preserve: true,
					NewLine: false,
					Chain: {Index: 2, Last: false}
				}),
				UpdateNumberOfCellsPerWell: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 3, Last: true}
				}),
				Concentration: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Concentration",
					Min: 0,
					Default: "",
					Label: "Concentration",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 4, Last: false}
				}),
				ConcentrationUnit: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Concentration Units",
					Min: 0,
					Default: 0,
					Label: "",
					List: DDOptions.ConcentrationUnitOptions(),
					Preserve: true,
					NewLine: false,
					Chain: {Index: 5, Last: false}
				}),
				UpdateConcentration: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 6, Last: true}
				}),
				DZReagent: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Label: "DZ Reagent",
					Default: 0,
					Lookup: true,
					Preserve: true,
					Title: "DZ Reagent",
					List: DDOptions.transfectionReagentOptions(),
					NewLine: true,
					Chain: {Index: 7, Last: true}
				}),
				DZReagentLOT: LinkCtrl.new("Text", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Label: "DZ Reagent LOT",
					Default: "",
					Preserve: true,
					Title: "DZ Reagent LOT",
					NewLine: true,
					Chain: {Index: 8, Last: true}
				}),
				PlasmidReagent: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Label: "Plasmid Reagent",
					Default: 0,
					Lookup: true,
					Preserve: true,
					Title: "Plasmid Reagent",
					List: DDOptions.transfectionReagentOptions(),
					NewLine: true,
					Chain: {Index: 9, Last: true}
				}),
				PlasmidReagentLOT: LinkCtrl.new("Text", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Label: "Plasmid Reagent LOT",
					Default: "",
					Preserve: true,
					Title: "Plasmid Reagent LOT",
					NewLine: true,
					Chain: {Index: 10, Last: true}
				}),
				TransfectionReagentAmount: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Transfection Reagent Amount",
					Min: 0,
					Default: "",
					Label: "Transfection Reagent Amount",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 11, Last: false}
				}),
				TransfectionReagentAmountUnit: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Transfection Reagent Amount Units",
					Min: 0,
					Default: 0,
					Label: "",
					List: DDOptions.TransfectionReagentAmountUnitOptions(),
					Preserve: true,
					NewLine: false,
					Chain: {Index: 12, Last: false}
				}),
				UpdateTransfectionReagentAmount: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: false,
					Chain: {Index: 13, Last: true}
				}),
				Treatment: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Label: "Treatment",
					Default: 0,
					Lookup: true,
					Preserve: true,
					Title: "Treatment in well",
					List: DDOptions.treatmentInWell(),
					NewLine: false,
					Chain: {Index: 14, Last: true},
				}),
				UpdateTreatment: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 15, Last: true}
				}),
				Plasmid1: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Label: "Plasmid 1",
					Default: 0,
					Lookup: true,
					Preserve: true,
					Title: "Plasmid 1",
					List: DDOptions.plasmidInWell(),
					NewLine: false,
					Chain: {Index: 16, Last: true},
				}),
				UpdatePlasmid1: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 17, Last: true}
				}),
				Plasmid1Concentration: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Plasmid 1 Concentration",
					Min: 0,
					Default: "",
					Label: "Plasmid 1 Concentration",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 18, Last: false}
				}),
				Plasmid1ConcentrationUnit: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Plasmid 1 Concentration Units",
					Min: 0,
					Default: 0,
					Label: "",
					List: DDOptions.PlasmidInWellConcentrationUnitOptions(),
					Preserve: true,
					NewLine: false,
					Chain: {Index: 19, Last: false}
				}),
				UpdatePlasmid1ConcentrationUnit: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 20, Last: true}
				}),
				Plasmid2: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Label: "Plasmid 2",
					Default: 0,
					Lookup: true,
					Preserve: true,
					Title: "Plasmid 2",
					List: DDOptions.plasmidInWell(),
					NewLine: false,
					Chain: {Index: 21, Last: true},
				}),
				UpdatePlasmid2: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 22, Last: true}
				}),
				Plasmid2Concentration: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Plasmid 2 Concentration",
					Min: 0,
					Default: "",
					Label: "Plasmid 2 Concentration",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 23, Last: false}
				}),
				Plasmid2ConcentrationUnit: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Plasmid 2 Concentration Units",
					Min: 0,
					Default: 0,
					Label: "",
					List: DDOptions.PlasmidInWellConcentrationUnitOptions(),
					Preserve: true,
					NewLine: false,
					Chain: {Index: 24, Last: false}
				}),
				UpdatePlasmid2ConcentrationUnit: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 25, Last: true}
				}),
				Plasmid3: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Label: "Plasmid 3",
					Default: 0,
					Lookup: true,
					Preserve: true,
					Title: "Plasmid 3",
					List: DDOptions.plasmidInWell(),
					NewLine: false,
					Chain: {Index: 26, Last: true},
				}),
				UpdatePlasmid3: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 27, Last: true}
				}),
				Plasmid3Concentration: LinkCtrl.new("Number", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Plasmid 3 Concentration",
					Min: 0,
					Default: "",
					Label: "Plasmid 3 Concentration",
					Preserve: true,
					NewLine: false,
					Chain: {Index: 28, Last: false}
				}),
				Plasmid3ConcentrationUnit: LinkCtrl.new("Select", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Title: "Plasmid 3 Concentration Units",
					Min: 0,
					Default: 0,
					Label: "",
					List: DDOptions.PlasmidInWellConcentrationUnitOptions(),
					Preserve: true,
					NewLine: false,
					Chain: {Index: 29, Last: false}
				}),
				UpdatePlasmid3ConcentrationUnit: LinkCtrl.new("Checkbox", {
					ID: this.Anchors.Menu.MetadataWellLevel,
					Default: true,
					Label: "",
					Title: "",
					NewLine: true,
					Chain: {Index: 30, Last: true}
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
			{Label: "Select wells", Title: "Select wells of relevant type", Icon: {Type: "Select", Space: true},  Click: function() {this.selectRelevantWells()}.bind(this)},
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
		} else {
			const data = this.Plate.exportToXLSX()
			const save = this.exportToXLSX(data);
			const today = new Date();
			const dateStamp = `${today.getDate().toString().padStart(2, '0')}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getFullYear()}`
			const transfectionId = this.Plate.Metadata.ExperimentID;
			Form.download(save, {DataType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", FileName: `${dateStamp}_${transfectionId}_TRANSFECTION_FILE.xlsx`});
			return this;
		}
	}

	static exportToXLSX(data) {
		const dataArray = [
			[
				'SAMPLE_NAME',
				'TRANSFECTION_POS',
				'TRANSFECTION_CONCENTRATION',
				'TRANSFECTION_CELL_AMOUNT',
				'TRANSFECTION_REAGENT_AMOUNT',
				'TREATMENT',
				'TRANSFECTION_PLATE_NAME',
				'TRANSFECTION_CELL_LINE',
				'TRANSFECTION_CELL_LINE_PASSAGE',
				'DZ_REAGENT',
				'DZ_REAGENT_LOT',
				'PLASMID_REAGENT',
				'PLASMID_REAGENT_LOT',
				'TRANSFECTION_END_POINT',
				'VIABILITY_PERCENTAGE',
				'SEEDING_MEDIUM',
				'TRANSFECTION_MEDIUM',
				'NUMBER_OF_CEllS_PER_10_CM_PLATE',
				'TRANSFECTION_ID',
				'TRANSFECTION_SCIENTIST',
				'TRANSFECTION_DATE',
				'PLASMID_1',
				'PLASMID_1_CONCENTRATION',
				'PLASMID_2',
				'PLASMID_2_CONCENTRATION',
				'PLASMID_3',
				'PLASMID_3_CONCENTRATION',
			],
			...data.map(item => [
				item.SAMPLE_NAME,
				item.TRANSFECTION_POS,
				item.TRANSFECTION_CONCENTRATION,
				item.TRANSFECTION_CELL_AMOUNT,
				item.TRANSFECTION_REAGENT_AMOUNT,
				item.TREATMENT,
				item.TRANSFECTION_PLATE_NAME,
				item.TRANSFECTION_CELL_LINE,
				item.TRANSFECTION_CELL_LINE_PASSAGE,
				item.DZ_REAGENT,
				item.DZ_REAGENT_LOT,
				item.PLASMID_REAGENT,
				item.PLASMID_REAGENT_LOT,
				item.TRANSFECTION_END_POINT,
				item.VIABILITY_PERCENTAGE,
				item.SEEDING_MEDIUM,
				item.TRANSFECTION_MEDIUM,
				item.NUMBER_OF_CEllS_PER_10_CM_PLATE,
				item.TRANSFECTION_ID,
				item.TRANSFECTION_SCIENTIST,
				item.TRANSFECTION_DATE,
				item.PLASMID_1,
				item.PLASMID_1_CONCENTRATION,
				item.PLASMID_2,
				item.PLASMID_2_CONCENTRATION,
				item.PLASMID_3,
				item.PLASMID_3_CONCENTRATION,
			])
		]

		return Excel.generateExcelFileFromArray(dataArray);
	}

	static isPlateValid() {
		let isValid = true;
		let reasons = [];

		if (!this.Plate.Metadata.ExperimentID
			|| (!this.Plate.Metadata.TransfectionScientist && this.Plate.Metadata.TransfectionScientist !== 0)
		) {
			isValid = false;
			reasons.push("Transfection metadata should be filled");
		}

		this.Plate.Layers.forEach(layer => {
			if (
				!layer.Metadata.CellLine
				|| !layer.Metadata.CellLinePassage
				|| !layer.Metadata.TransfectionEndPoint
				|| !layer.Metadata.ViabilityPercentage
				|| !layer.Metadata.SeedingMedium
				|| !layer.Metadata.TransfectionMedium
				|| !layer.Metadata.NumberOfCellsPer10CmPlate
			) {
				isValid = false;
				reasons.push(`Plate ${layer.Name} metadata should be filled`);
			}
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

	static isSamplesInExcelFileValid(data) {
		const samplesList = data
			.map(item => item.SAMPLE_NAME)
			.map(item => {
				let name = item ? item.slice(0, 9) : '';
				return name.endsWith('_') ? name.slice(0, 8) : name
			});
		const uniqSamplesList = samplesList.filter((item, i) => i === samplesList.indexOf(item));
		const samplesValidationErrors = uniqSamplesList
			.map(item => {
				if (!(DDOptions.sampleNames().includes(item))) return item
			})
			.filter(Boolean);
		if (samplesValidationErrors.length > 0) {
			const message = samplesValidationErrors.join(', ');
			alert(`${message} not in samples list!`);
			return false
		} else return true
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

			return this.isSamplesInExcelFileValid(xlData)
				? {type: 'transfection-file', data: this.transformMetadataJSONToSave(xlData)}
				: null;
		} else {
			const xlData = sheet_name_list
				.map((item) => {
					return XLSX.utils.sheet_to_json(workbook.Sheets[item]);
				});
			const {Rows, Cols} = this.getBasePlateRanges(workbook);

			return this.isSamplesInExcelFileValid(xlData)
				? {type: 'base-plate', data: this.transformJSONToSave(xlData, sheet_name_list, {Rows, Cols})}
				: null;
		}
	}

	static isMetadataIncluded(file) {
		const exportedFileHeaders = [
			'SAMPLE_NAME',
			'TRANSFECTION_POS',
			'TRANSFECTION_CONCENTRATION',
			'TRANSFECTION_CELL_AMOUNT',
			'TRANSFECTION_PLATE_NAME',
			'TRANSFECTION_CELL_LINE',
			'TRANSFECTION_CELL_LINE_PASSAGE',
			'DZ_REAGENT',
			'DZ_REAGENT_LOT',
			'PLASMID_REAGENT',
			'PLASMID_REAGENT_LOT',
			'TRANSFECTION_REAGENT_AMOUNT',
			'TRANSFECTION_END_POINT',
			'VIABILITY_PERCENTAGE',
			'TRANSFECTION_ID',
			'TRANSFECTION_SCIENTIST',
			'TRANSFECTION_DATE',
			'NUMBER_OF_CEllS_PER_10_CM_PLATE'
		];

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
				SAMPLE_NAME: _.replace(SAMPLE_NAME, /_\d+$/i, ''),
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
			.value();
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

			const [transfectionEndPoint, transfectionEndPointUnit] = row.TRANSFECTION_END_POINT.toString().split('_');
			const [viabilityPercentage, viabilityPercentageUnit] = (row.VIABILITY_PERCENTAGE)
				? row.VIABILITY_PERCENTAGE.toString().split('_')
				: ['', ''];
			const [numberOfCellsPer10CmPlate, numberOfCellsPer10CmPlateUnit] = row.NUMBER_OF_CEllS_PER_10_CM_PLATE
				? row.NUMBER_OF_CEllS_PER_10_CM_PLATE.toString().split('_')
				: ['', ''];

			return {
				Index: row.TRANSFECTION_PLATE_INDEX,
				Metadata: {
					CellLine: row.TRANSFECTION_CELL_LINE,
					CellLinePassage: row.TRANSFECTION_CELL_LINE_PASSAGE.toString(),
					TransfectionEndPoint: transfectionEndPoint,
					TransfectionEndPointUnit: transfectionEndPointUnit,
					ViabilityPercentage: viabilityPercentage,
					ViabilityPercentageUnit: viabilityPercentageUnit,
					SeedingMedium: row.SEEDING_MEDIUM,
					TransfectionMedium: row.TRANSFECTION_MEDIUM,
					NumberOfCellsPer10CmPlate: numberOfCellsPer10CmPlate,
					NumberOfCellsPer10CmPlateUnit: numberOfCellsPer10CmPlateUnit,
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
			const [numberOfCellsPerWell, numberOfCellsPerWellUnit] = item.TRANSFECTION_CELL_AMOUNT.toString().split('_');
			const [concentration, concentrationUnit] = item.TRANSFECTION_CONCENTRATION.toString().split('_');
			const dzReagent = item.DZ_REAGENT;
			const dzReagentLOT = item.DZ_REAGENT_LOT;
			const plasmidReagent = item.PLASMID_REAGENT;
			const plasmidReagentLOT = item.PLASMID_REAGENT_LOT;
			const [transfectionReagentAmount, transfectionReagentAmountUnit] = item.TRANSFECTION_REAGENT_AMOUNT.toString().split('_');
			const treatment = item.TREATMENT;
			const plasmid1 = item.PLASMID_1;
			const [plasmid1Concentration, plasmid1ConcentrationUnit] = item.PLASMID_1_CONCENTRATION.toString().split('_');
			const plasmid2 = item.PLASMID_2;
			const [plasmid2Concentration, plasmid2ConcentrationUnit] = item.PLASMID_2_CONCENTRATION.toString().split('_');
			const plasmid3 = item.PLASMID_3;
			const [plasmid3Concentration, plasmid3ConcentrationUnit] = item.PLASMID_3_CONCENTRATION.toString().split('_');

			return {
				Layer: item.TRANSFECTION_PLATE_INDEX,
				Index: well.Index,
				Metadata: {
					NumberOfCellsPerWell: numberOfCellsPerWell,
					NumberOfCellsPerWellUnit: numberOfCellsPerWellUnit,
					Concentration: concentration,
					ConcentrationUnit: concentrationUnit,
					DZReagent: dzReagent,
					DZReagentLOT: dzReagentLOT,
					PlasmidReagent: plasmidReagent,
					PlasmidReagentLOT: plasmidReagentLOT,
					TransfectionReagentAmount: transfectionReagentAmount,
					TransfectionReagentAmountUnit: transfectionReagentAmountUnit,
					Treatment: treatment,
					Plasmid1: plasmid1,
					Plasmid1Concentration: plasmid1Concentration,
					Plasmid1ConcentrationUnit: plasmid1ConcentrationUnit,
					Plasmid2: plasmid2,
					Plasmid2Concentration: plasmid2Concentration,
					Plasmid2ConcentrationUnit: plasmid2ConcentrationUnit,
					Plasmid3: plasmid3,
					Plasmid3Concentration: plasmid3Concentration,
					Plasmid3ConcentrationUnit: plasmid3ConcentrationUnit,
				}
			}
		});
	}

	static mapMetadataAreas(data, {Rows, Cols}) {
		const uniqAreaNames = this.getUniqAreaNames(data);

		return uniqAreaNames.map((areaName, index) => {
			const layerIndexes = this.getUniqLayerIndexes(data, areaName);

			return {
				Name: areaName,
				Color: areaName ? CSSCOLORS.list('boxColors')[index] : 'white',
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
				.map((area, index) => {
					return {
						Name: area,
						Color: CSSCOLORS.list('boxColors')[index],
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
		const id = 'Form_NewArea';
		Area.form({
			ID: id,
			Color: CSSCOLORS.fetch(this.Tables.Areas.Length), //Initial color when opening the form
			Ok: function (Controls, RangeControls) { //What to do when ok is clicked
				if (this.addArea(Controls, RangeControls)) {
					Form.close(id);
				}
			}.bind(this),
			Another: function (Controls, RangeControls) { //The user wants more
				if (this.addArea(Controls, RangeControls)) {
					Controls.Name.setValue('').focus(); //Give the focus back to the text to avoid mouse dragging
					Controls.Color.setValue(CSSCOLORS.fetch(this.Tables.Areas.Length));
				}
			}.bind(this),
		});
		return this;
	}

	static addArea(Control) { //Check and create a new area with the options provided
		if (Control.Name.Value === 0) {
			alert('Area name must be selected');
			return false;
		}

		const name = Control.Name.Selected;
		if (this.Tables.Areas.hasElement('Name', name)) {
			alert('This name has already been defined, please choose another one');
			return false;
		}

		const color = Control.Color.getValue();
		this.Tables.Areas.addRow(new Area({Name: name, Color: color}));

		return true;
	}

	static editArea() { //Edit the selected area
		const selected = this.Tables.Areas.Selected;
		if (selected.length === 0) {
			this.Console.log({Message: 'No area selected', Gravity: 'Error'});
			return this;
		}

		const id = 'Form_EditArea';
		const [area] = selected;
		Area.form({
			ID: id,
			Edit: true,
			Area: area,
			Color: area.Color, //Initial color when opening the form
			Ok: function (Controls) { //What to do when ok is clicked
				const name = Controls.Name.Selected;
				if (area.Name !== name) { //The name has changed, check unicity
					if (this.Tables.Areas.hasElement('Name', name)) {
						alert('This name has already been defined, please choose another one');
						return;
					}
				}
				if (Controls.Name.Value === 0) {
					alert('Area name must be selected');
					return false;
				}
				Pairing.rename(area.Name, name); //Rename within Pairing object
				area.Name = name;
				area.Color = Controls.Color.getValue();
				if (this.Plate) {
					area.update(this.Plate.WellSize, this.Plate.WellMargin);
				} //Update well display if necessary
				this.Tables.Areas.update();
				Pairing.update(this.ResultManager.Anchors.Pairing); //Update pairing info for result displayed
				Form.close(id);
			}.bind(this),
		});
		return this;
	}

	static tagArea() { //Tag the selected area in the selection
		if (!this.Plate) {
			return this;
		}

		const selected = this.Tables.Areas.Selected;
		if (selected.length === 0) {
			this.Console.log({Message: 'No area selected', Gravity: 'Error'});
			return this;
		}

		Plate.tagArea(this.Plate, selected[0], {Lock: true, Strict: true})
			.then(function (result) { //Tag and return a feedback object
				if (result.Cancel) {
					return this;
				} //Custom tag was cancelled

				if (result.Selected === 0) {
					this.Console.log({Message: 'No wells selected', Gravity: 'Error'});
					return this;
				}

				if (result.Tagged < result.Selected) { //Not all wells were tagged
					if (result.Tagged === 0) { //Nothing was tagged
						this.Console.log({
							Message: 'None of the selected wells (' + result.Selected + ') were tagged',
							Gravity: 'Error'
						});
					} else { //Less than expected
						this.Console.log({
							Message: 'Only ' + result.Tagged + ' selected wells (out of ' + result.Selected + ') were tagged',
							Gravity: 'Warning'
						});
					}
					return this;
				}

				if (result.Tagged === result.Selected) { //Case both equal to 0 excluded above
					this.Console.log({Message: result.Tagged + ' wells tagged', Gravity: 'Success'});
				}
				this.Tables.Areas.update(); //Update the table
			}.bind(this));

		return this;
	}

	static untagArea() {
		if (!this.Plate) {
			return this;
		}

		const result = this.Plate.untag();
		if (result.Untag === 0) {
			this.Console.log({Message: 'No wells selected', Gravity: 'Error'});
			return this;
		}

		this.Tables.Areas.update();
		this.Console.log({Message: result.Untag + ' wells untagged', Gravity: 'Success'});
		return this;
	}

	static untagAllArea(I) {
		if (!this.Plate) {
			return this;
		}

		const areas = this.Tables.Areas;
		if (areas.Length > 0) {
			this.warn('tag', I).then(() => {
				areas.Array.forEach((a) => { //For each area defined
					a.removeTags(this.Plate); //Remove tags
					a.Tags = []; //Reset the tag arrays
				});
				areas.update(); //Update the areas table to reflect any changes in ranges
				this.Console.log({Message: 'All wells untagged', Gravity: 'Success'});
			}, function () {});
		} else {
			this.Console.log({Message: 'No area defined', Gravity: 'Warning'});
		}
		return this;
	}

	static deleteArea(a) { //Delete selected area a
		if (this.Plate) {
			a.removeTags(this.Plate);
		}
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

	static selectRelevantWells() { //Select relevant area type wells
		const areas = this.Tables.Areas.Array;
		if (areas.length > 0) {
			const selectedArea = areas.filter(item => Boolean(item.Selected));
			const selectedTags = selectedArea[0].Tags;
			this.Plate.SelectedLayers = selectedTags.map(item => item.Layer.Index)
			const selectedWells = selectedTags.map(item => item.Wells);
			const plateLayers = this.Plate.Layers;
			plateLayers.map((item, index) => {
				item.Selected = selectedWells[index]
			})
		}

		return this
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
			const plateMetadata = this.Plate.Metadata;
			plateMetadata.ExperimentID = this.Controls.MetadataMainLevel.ExperimentID.getValue();
			plateMetadata.TransfectionScientist = this.Controls.MetadataMainLevel.TransfectionScientist.Selected;

			this.Plate.applyMetadata('main');

			this.Console.log({Message: 'Main metadata updated with following values:', Gravity: "Success"});
			if (this.Controls.MetadataMainLevel.ExperimentID.Value) {
				this.Console.log({Message: `Experiment ID: ${plateMetadata.ExperimentID}`, Gravity: "Success"});
			}
			if (this.Controls.MetadataMainLevel.TransfectionScientist.Value > 0) {
				this.Console.log({Message: `Transfection Scientist: ${plateMetadata.TransfectionScientist}`, Gravity: "Success"});
			}
		} else {
			this.Console.log({Message: "No plate created", Gravity: "Error"})
		}
	}

	static applyPlateMetadata() {
		if (this.Plate) {
			const values = {
				CellLinePassage: this.Controls.MetadataPlateLevel.CellLinePassage.getValue(),
				TransfectionEndPoint: this.Controls.MetadataPlateLevel.TransfectionEndPoint.getValue(),
				ViabilityPercentage: this.Controls.MetadataPlateLevel.ViabilityPercentage.getValue(),
				SeedingMedium: this.Controls.MetadataPlateLevel.SeedingMedium.getValue(),
				TransfectionMedium: this.Controls.MetadataPlateLevel.TransfectionMedium.getValue(),
				NumberOfCellsPer10CmPlate: this.Controls.MetadataPlateLevel.NumberOfCellsPer10CmPlate.getValue(),
			};
			if (this.Controls.MetadataPlateLevel.CellLine.Value > 0) {
				values.CellLine = this.Controls.MetadataPlateLevel.CellLine.Selected
			}
			if (this.Controls.MetadataPlateLevel.UpdateTransfectionEndPoint.Value) {
				values.TransfectionEndPointUnit = this.Controls.MetadataPlateLevel.TransfectionEndPointUnit.Selected
			}
			if (this.Controls.MetadataPlateLevel.UpdateViabilityPercentage.Value) {
				values.ViabilityPercentageUnit = this.Controls.MetadataPlateLevel.ViabilityPercentageUnit.Selected
			}
			if (this.Controls.MetadataPlateLevel.UpdateNumberOfCellsPer10CmPlate.Value) {
				values.NumberOfCellsPer10CmPlateUnit = this.Controls.MetadataPlateLevel.NumberOfCellsPer10CmPlateUnit.Selected
			}
			const updatedPlateNames = this.Plate.applyLayerMetadata(values);

			if (updatedPlateNames.length >= 0) {
				const updatedPlates = updatedPlateNames.join(', ');
				Editor.Console.log({Message: `${updatedPlates} metadata updated with following values:`, Gravity: "Success"});
				if (values.CellLine) {
					Editor.Console.log({Message: `Cell Line: ${values.CellLine}`, Gravity: "Success"});
				}
				if (values.CellLinePassage) {
					Editor.Console.log({Message: `Cell Line Passage: ${values.CellLinePassage}`, Gravity: "Success"});
				}
				if (values.TransfectionEndPoint) {
					Editor.Console.log({Message: `Transfection End Point: ${[values.TransfectionEndPoint, values.TransfectionEndPointUnit].filter(Boolean).join(' ')}`, Gravity: "Success"});
				}
				if (values.ViabilityPercentage) {
					Editor.Console.log({Message: `Viability percentage: ${[values.ViabilityPercentage, values.ViabilityPercentageUnit].filter(Boolean).join(' ')}`, Gravity: "Success"});
				}
				if (values.SeedingMedium) {
					Editor.Console.log({Message: `Seeding medium: ${values.SeedingMedium}`, Gravity: "Success"});
				}
				if (values.TransfectionMedium) {
					Editor.Console.log({Message: `Transfection medium: ${values.TransfectionMedium}`, Gravity: "Success"});
				}
				if (values.NumberOfCellsPer10CmPlate) {
					Editor.Console.log({Message: `Number Of Cells Per 10 Cm Plate: ${[values.NumberOfCellsPer10CmPlate, values.NumberOfCellsPer10CmPlateUnit].filter(Boolean).join(' ')}`, Gravity: "Success"});
				}
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
				values.NumberOfCellsPerWellUnit = this.Controls.MetadataWellLevel.NumberOfCellsPerWellUnit.Selected;
			}
			if (this.Controls.MetadataWellLevel.UpdateConcentration.Value) {
				values.Concentration = this.Controls.MetadataWellLevel.Concentration.getValue();
				values.ConcentrationUnit = this.Controls.MetadataWellLevel.ConcentrationUnit.Selected;
			}
			if (this.Controls.MetadataWellLevel.DZReagent.Value) {
				if (this.Controls.MetadataWellLevel.DZReagent.Selected === 'Please select') {
					values.DZReagent = '';
				} else {
					values.DZReagent = this.Controls.MetadataWellLevel.DZReagent.Selected;
				}
			}
			if (this.Controls.MetadataWellLevel.DZReagentLOT.Value) {
				values.DZReagentLOT = this.Controls.MetadataWellLevel.DZReagentLOT.getValue()
			}
			if (this.Controls.MetadataWellLevel.PlasmidReagent.Value) {
				if (this.Controls.MetadataWellLevel.PlasmidReagent.Selected === 'Please select') {
					values.PlasmidReagent = '';
				} else {
					values.PlasmidReagent = this.Controls.MetadataWellLevel.PlasmidReagent.Selected;
				}
			}
			if (this.Controls.MetadataWellLevel.PlasmidReagentLOT.Value) {
				values.PlasmidReagentLOT = this.Controls.MetadataWellLevel.PlasmidReagentLOT.getValue()
			}
			if (this.Controls.MetadataWellLevel.UpdateTransfectionReagentAmount.Value) {
				values.TransfectionReagentAmount = this.Controls.MetadataWellLevel.TransfectionReagentAmount.getValue();
				values.TransfectionReagentAmountUnit = this.Controls.MetadataWellLevel.TransfectionReagentAmountUnit.Selected;
			}
			if (this.Controls.MetadataWellLevel.UpdateTreatment.Value) {
				if (this.Controls.MetadataWellLevel.Treatment.Selected === 'Please select') {
					values.Treatment = '';
				} else {
					values.Treatment = this.Controls.MetadataWellLevel.Treatment.Selected;
				}
			}
			if (this.Controls.MetadataWellLevel.UpdatePlasmid1.Value) {
				if (this.Controls.MetadataWellLevel.Plasmid1.Selected === 'Please select') {
					values.Plasmid1 = '';
				} else {
					values.Plasmid1 = this.Controls.MetadataWellLevel.Plasmid1.Selected;
				}
			}
			if (this.Controls.MetadataWellLevel.UpdatePlasmid1ConcentrationUnit.Value) {
				values.Plasmid1Concentration = this.Controls.MetadataWellLevel.Plasmid1Concentration.getValue();
				values.Plasmid1ConcentrationUnit = this.Controls.MetadataWellLevel.Plasmid1ConcentrationUnit.Selected;
			}
			if (this.Controls.MetadataWellLevel.UpdatePlasmid2.Value) {
				if (this.Controls.MetadataWellLevel.Plasmid2.Selected === 'Please select') {
					values.Plasmid2 = '';
				} else {
					values.Plasmid2 = this.Controls.MetadataWellLevel.Plasmid2.Selected;
				}
			}
			if (this.Controls.MetadataWellLevel.UpdatePlasmid2ConcentrationUnit.Value) {
				values.Plasmid2Concentration = this.Controls.MetadataWellLevel.Plasmid2Concentration.getValue();
				values.Plasmid2ConcentrationUnit = this.Controls.MetadataWellLevel.Plasmid2ConcentrationUnit.Selected;
			}
			if (this.Controls.MetadataWellLevel.UpdatePlasmid3.Value) {
				if (this.Controls.MetadataWellLevel.Plasmid3.Selected === 'Please select') {
					values.Plasmid3 = '';
				} else {
					values.Plasmid3 = this.Controls.MetadataWellLevel.Plasmid3.Selected;
				}
			}
			if (this.Controls.MetadataWellLevel.UpdatePlasmid3ConcentrationUnit.Value) {
				values.Plasmid3Concentration = this.Controls.MetadataWellLevel.Plasmid3Concentration.getValue();
				values.Plasmid3ConcentrationUnit = this.Controls.MetadataWellLevel.Plasmid3ConcentrationUnit.Selected;
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
				if (this.Controls.MetadataWellLevel.UpdateConcentration.Value) {
					this.Console.log({Message: `Concentration: ${[values.Concentration, values.ConcentrationUnit].filter(Boolean).join(' ')}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.DZReagent.Value) {
					Editor.Console.log({Message: `DZ Reagent: ${values.DZReagent}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.DZReagentLOT.Value) {
					Editor.Console.log({Message: `DZ Reagent LOT: ${values.DZReagentLOT}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.PlasmidReagent.Value) {
					Editor.Console.log({Message: `Plasmid Reagent: ${values.PlasmidReagent}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.PlasmidReagentLOT.Value) {
					Editor.Console.log({Message: `Plasmid Reagent LOT: ${values.PlasmidReagentLOT}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdateTransfectionReagentAmount.Value) {
					Editor.Console.log({Message: `Transfection Reagent Amount: ${[values.TransfectionReagentAmount, values.TransfectionReagentAmountUnit].filter(Boolean).join(' ')}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdateTreatment.Value) {
					Editor.Console.log({Message: `Treatment: ${values.Treatment}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdatePlasmid1.Value) {
					Editor.Console.log({Message: `Plasmid 1: ${values.Plasmid1}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdatePlasmid1ConcentrationUnit.Value) {
					Editor.Console.log({Message: `Plasmid 1 Concentration: ${[values.Plasmid1Concentration, values.Plasmid1ConcentrationUnit].filter(Boolean). join(' ')}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdatePlasmid2.Value) {
					Editor.Console.log({Message: `Plasmid 2: ${values.Plasmid2}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdatePlasmid2ConcentrationUnit.Value) {
					Editor.Console.log({Message: `Plasmid 2 Concentration: ${[values.Plasmid2Concentration, values.Plasmid2ConcentrationUnit].filter(Boolean). join(' ')}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdatePlasmid3.Value) {
					Editor.Console.log({Message: `Plasmid 3: ${values.Plasmid3}`, Gravity: "Success"});
				}
				if (this.Controls.MetadataWellLevel.UpdatePlasmid3ConcentrationUnit.Value) {
					Editor.Console.log({Message: `Plasmid 3 Concentration: ${[values.Plasmid3Concentration, values.Plasmid3ConcentrationUnit].filter(Boolean). join(' ')}`, Gravity: "Success"});
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
		this.Controls.MetadataPlateLevel.TransfectionEndPoint.setValue("");
		this.Controls.MetadataPlateLevel.TransfectionEndPointUnit.setValue(0);
		this.Controls.MetadataPlateLevel.ViabilityPercentage.setValue("");
		this.Controls.MetadataPlateLevel.ViabilityPercentageUnit.setValue(0);
		this.Controls.MetadataPlateLevel.SeedingMedium.setValue("");
		this.Controls.MetadataPlateLevel.TransfectionMedium.setValue("");
		this.Controls.MetadataPlateLevel.NumberOfCellsPer10CmPlate.setValue("");
		this.Controls.MetadataPlateLevel.NumberOfCellsPer10CmPlateUnit.setValue(0);
	}

	static resetWellMetadataControls() {
		this.Controls.MetadataWellLevel.NumberOfCellsPerWell.setValue("");
		this.Controls.MetadataWellLevel.NumberOfCellsPerWellUnit.setValue(0);
		this.Controls.MetadataWellLevel.Concentration.setValue("");
		this.Controls.MetadataWellLevel.DZReagent.setValue(0);
		this.Controls.MetadataWellLevel.DZReagentLOT.setValue("");
		this.Controls.MetadataWellLevel.PlasmidReagent.setValue(0);
		this.Controls.MetadataWellLevel.PlasmidReagentLOT.setValue("");
		this.Controls.MetadataWellLevel.ConcentrationUnit.setValue(0);
		this.Controls.MetadataWellLevel.TransfectionReagentAmount.setValue("");
		this.Controls.MetadataWellLevel.TransfectionReagentAmountUnit.setValue(0);
		this.Controls.MetadataWellLevel.Treatment.setValue(0);
		this.Controls.MetadataWellLevel.Plasmid1.setValue(0);
		this.Controls.MetadataWellLevel.Plasmid1Concentration.setValue("");
		this.Controls.MetadataWellLevel.Plasmid1ConcentrationUnit.setValue(0);
		this.Controls.MetadataWellLevel.Plasmid2.setValue(0);
		this.Controls.MetadataWellLevel.Plasmid2Concentration.setValue("");
		this.Controls.MetadataWellLevel.Plasmid2ConcentrationUnit.setValue(0);
		this.Controls.MetadataWellLevel.Plasmid3.setValue(0);
		this.Controls.MetadataWellLevel.Plasmid3Concentration.setValue("");
		this.Controls.MetadataWellLevel.Plasmid3ConcentrationUnit.setValue(0);
	}
}
