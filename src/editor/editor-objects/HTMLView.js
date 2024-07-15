class HTMLView {
  constructor(plate) {
    this.id = 'Form_GetAsHTML';
    this.controls = this.id + '_Controls';
    this.output = this.id + '_Output';
    this.metadataDisplayState = {
      plate: {
        cellLine: false,
        cellLinePassage: false,
        transfectionEndPoint: false,
        viabilityPercentage: false,
        seedingMedium: false,
        transfectionMedium: false,
        numberOfCellsPer10CmPlate: false,
      },
      well: {
        cellsPerWell: true,
        concentration: true,
        dzReagent: true,
        dzReagentLOT: true,
        plasmidReagent: true,
        plasmidReagentLOT: true,
        dzReagentAmount: true,
        plasmidReagentAmount: true,
        treatment: true,
        plasmid1: true,
        plasmid1Concentration: true,
        plasmid1ConcentrationUnit: true,
        plasmid2: true,
        plasmid2Concentration: true,
        plasmid2ConcentrationUnit: true,
        plasmid3: true,
        plasmid3Concentration: true,
        plasmid3ConcentrationUnit: true,
      }
    };

    this.Plate = plate;
  }

  init() {
    //HTMLView.getAsHTML(l) - This will get the html for unresolved items and run the promises to get the content for ranges
    let dataList = [...this.Plate.Layers];
    const layerSelectControls = Editor.Plate.Layers.map(layer => {
      return LinkCtrl.new('Checkbox', {
          ID: `plate_checkbox-${layer.Index}`,
          Default: true,
          Label: layer.Name,
          NewLine: true,
          Change: function (checked) {
            if (checked) {
              dataList = [...dataList, layer];
            } else {
              dataList = dataList.filter((layerItem) => layerItem.Index !== layer.Index);
            }
            this.updateOutput(dataList, this.metadataDisplayState);
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
          Default: this.metadataDisplayState.plate.cellLine,
          Label: 'Cell line',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.cellLine = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `plate_metadata_checkbox-cellLinePassage`,
          Default: this.metadataDisplayState.plate.cellLinePassage,
          Label: 'Cell Line Passage',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.cellLinePassage = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `plate_metadata_checkbox-transfectionEndPoint`,
          Default: this.metadataDisplayState.plate.transfectionEndPoint,
          Label: 'Transfection End-Point',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.transfectionEndPoint = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `plate_metadata_checkbox-viabilityPercentage`,
          Default: this.metadataDisplayState.plate.viabilityPercentage,
          Label: 'Viability percentage',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.viabilityPercentage = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `plate_metadata_checkbox-seedingMedium`,
          Default: this.metadataDisplayState.plate.seedingMedium,
          Label: 'Seeding medium',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.seedingMedium = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `plate_metadata_checkbox-transfectionMedium`,
          Default: this.metadataDisplayState.plate.transfectionMedium,
          Label: 'Transfection medium',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.transfectionMedium = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `plate_metadata_checkbox-numberOfCellsPer10CmPlate`,
          Default: this.metadataDisplayState.plate.numberOfCellsPer10CmPlate,
          Label: 'Number Of Cells Per 10Cm Plate',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.numberOfCellsPer10CmPlate = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
    ];
    const layerMetadataControlsContainers = `<span id="plate_metadata_checkbox-cellLine"></span>`
      + `<span id="plate_metadata_checkbox-cellLinePassage"></span>`
      + `<span id="plate_metadata_checkbox-transfectionEndPoint"></span>`
      + `<span id="plate_metadata_checkbox-viabilityPercentage"></span>`
      + `<span id="plate_metadata_checkbox-seedingMedium"></span>`
      + `<span id="plate_metadata_checkbox-transfectionMedium"></span>`
      + `<span id="plate_metadata_checkbox-numberOfCellsPer10CmPlate"></span>`;

    const wellMetadataControls = [
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-cellsPerWell`,
          Default: this.metadataDisplayState.well.cellsPerWell,
          Label: 'Number of Cells per Well',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.cellsPerWell = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-concentration`,
          Default: this.metadataDisplayState.well.concentration,
          Label: 'Concentration',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.concentration = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-dzReagent`,
          Default: this.metadataDisplayState.well.dzReagent,
          Label: 'DZ Reagent',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.dzReagent = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-dzReagentLOT`,
          Default: this.metadataDisplayState.well.dzReagentLOT,
          Label: 'DZ Reagent LOT',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.dzReagentLOT = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-plasmidReagent`,
          Default: this.metadataDisplayState.well.dzReagent,
          Label: 'Plasmid Reagent',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.plasmidReagent = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-plasmidReagentLOT`,
          Default: this.metadataDisplayState.well.plasmidReagentLOT,
          Label: 'Plasmid Reagent LOT',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.plasmidReagentLOT = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-dzReagentAmount`,
          Default: this.metadataDisplayState.well.dzReagentAmount,
          Label: 'DZ Reagent Amount',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.dzReagentAmount = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-plasmidReagentAmount`,
          Default: this.metadataDisplayState.well.plasmidReagentAmount,
          Label: 'Plasmid Reagent Amount',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.plasmidReagentAmount = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-treatment`,
          Default: this.metadataDisplayState.well.treatment,
          Label: 'Treatment',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.treatment = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the treatment value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-plasmid1`,
          Default: this.metadataDisplayState.well.plasmid1,
          Label: 'Plasmid 1',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.plasmid1 = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the plasmid 1 value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-Plasmid1Concentration`,
          Default: this.metadataDisplayState.well.plasmid1Concentration,
          Label: 'Plasmid 1 concentration',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.plasmid1Concentration = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the plasmid 1 concentration value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-plasmid2`,
          Default: this.metadataDisplayState.well.plasmid2,
          Label: 'Plasmid 2',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.plasmid2 = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the plasmid 2 value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-Plasmid2Concentration`,
          Default: this.metadataDisplayState.well.plasmid2Concentration,
          Label: 'Plasmid 2 concentration',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.plasmid2Concentration = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the plasmid 1 concentration value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-plasmid3`,
          Default: this.metadataDisplayState.well.plasmid3,
          Label: 'Plasmid 3',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.plasmid3 = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the plasmid 1 value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `well_metadata_checkbox-Plasmid3Concentration`,
          Default: this.metadataDisplayState.well.plasmid3Concentration,
          Label: 'Plasmid 3 concentration',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.plasmid3Concentration = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the plasmid 1 concentration value'
        }
      ),
    ];
    const wellMetadataControlsContainers = `<span id="well_metadata_checkbox-cellsPerWell"></span>`
      + `<span id="well_metadata_checkbox-concentration"></span>`
      + `<span id="well_metadata_checkbox-dzReagent"></span>`
      + `<span id="well_metadata_checkbox-dzReagentLOT"></span>`
      + `<span id="well_metadata_checkbox-plasmidReagent"></span>`
      + `<span id="well_metadata_checkbox-plasmidReagentLOT"></span>`
      + `<span id="well_metadata_checkbox-dzReagentAmount"></span>`
      + `<span id="well_metadata_checkbox-plasmidReagentAmount"></span>`
      + `<span id="well_metadata_checkbox-treatment"></span>`
      + `<span id="well_metadata_checkbox-plasmid1"></span>`
      + `<span id="well_metadata_checkbox-Plasmid1Concentration"></span>`
      + `<span id="well_metadata_checkbox-plasmid2"></span>`
      + `<span id="well_metadata_checkbox-plasmid2Concentration"></span>`
      + `<span id="well_metadata_checkbox-plasmid3"></span>`
      + `<span id="well_metadata_checkbox-plasmid3Concentration"></span>`;

    Form.open({ //Open an empty form with waiting message
      ID: this.id,
      HTML: '<div id="' + this.controls + '" style="margin: 10px">'
        + '<p class="Error">Resolving names, please wait...</p></div>'
        + '<div style="display: flex;">' + layerSelectControlsContainers + '</div>'
        + '<div><h4>Show plate metadata</h4>' + layerMetadataControlsContainers + '</div>'
        + '<div><h4>Show well metadata</h4>' + wellMetadataControlsContainers + '</div>'
        + '<div id=' + this.output + ' style="overflow: auto"></div>',
      Size: 1000,
      Title: 'Plate as HTML',
      Buttons: [
        {
          Label: 'Printable Version',
          Click: () => Reporter.printable(GetId(this.output).innerHTML),
          Title: 'Display the plate in a new window to allow easy printing or copy/pasting to other applications'
        },
        {
          Label: 'Close',
          Icon: {Type: 'Cancel', Space: true, Color: 'Red'},
          Click: () => Form.close(this.id),
        },
      ],
      onInit: () => {
        [
          ...layerSelectControls,
          ...layerMetadataControls,
          ...wellMetadataControls,
        ].forEach(control => control.init());
        this.updateOutput(dataList, this.metadataDisplayState);
      }
    });

    Promise.all(
      dataList
        .map((layer) => {
          return [layer, HTMLView.getAsHTML(layer, this.metadataDisplayState)];
        })
        .map(([, data]) => data.Promises)
        .flat()
    )
      .then((values) => { //Wait for promises to resolve, then process the values
        if (values.length == 0) {
          GetId(this.controls).remove();
          return;
        } //There are no ranges/definitions, so no need of controls and we can leave here
        const rows = this.Plate.Rows;
        const cols = this.Plate.Cols;
        const table = GetId(this.output).children[1]; //The table with the plate (layer) data
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
              if (!resolved) {span.setAttribute('resolved', span.getAttribute('generic'));} //This well has no resolvable definitions, its resolved name should be same as the generic name
            }
          }
        }

        const ctrl = LinkCtrl.new('Checkbox', {
          ID: this.controls,
          Label: 'Show resolved Names',
          Default: false,
          Change: function (v) { //The control allowing switching from generic to resolved names
            const coll = GetId(this.output).getElementsByClassName('Resolved_Definition'); //Get the switchable elements
            const n = coll.length;
            for (let k = 0; k < n; k++) { //Travel the collection to switch the names
              if (v) {coll[k].innerHTML = coll[k].getAttribute('resolved');} else {coll[k].innerHTML = coll[k].getAttribute('generic');}
            }
          },
          Title: 'Tick to show the resolved names instead of the generic names for the ranges'
        });
        ctrl.init(); //Display the control
      });
  }

  updateOutput(dataList, metadataDisplayState) {
    document.getElementById(this.output).innerHTML = dataList
      .sort((prevLayer, nextLayer) => {
        if (prevLayer.Index > nextLayer.Index) return 1;
        else if (prevLayer.Index < nextLayer.Index) return -1;
        else return 0;
      })
      .map((layer) => {
        return [layer, HTMLView.getAsHTML(layer, metadataDisplayState)];
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
          + ((metadataDisplayState.plate.transfectionEndPoint)
              ? '<div>Transfection end-point: ' + ([layer.Metadata.TransfectionEndPoint, layer.Metadata.TransfectionEndPointUnit].filter(Boolean).join(' ') || '') + '</div>'
            : '')
          + ((metadataDisplayState.plate.viabilityPercentage)
            ? '<div>Viability percentage: ' + ([layer.Metadata.ViabilityPercentage, layer.Metadata.ViabilityPercentageUnit].filter(Boolean).join(' ') || '') + '</div>'
            : '')
          + ((metadataDisplayState.plate.seedingMedium)
            ? '<div>Seeding medium: ' + (layer.Metadata.SeedingMedium || '') + '</div>'
            : '')
          + ((metadataDisplayState.plate.transfectionMedium)
            ? '<div>Transfection medium: ' + (layer.Metadata.TransfectionMedium || '') + '</div>'
            : '')
          + ((metadataDisplayState.plate.numberOfCellsPer10CmPlate)
            ? '<div>Number of cells per 10cm plate: ' + (layer.Metadata.NumberOfCellsPer10CmPlate || '') + '</div>'
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
      })
      .join('<br/>');
  };

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
        let metadataDZReagent = '';
        let metadataDZReagentLOT = '';
        let metadataPlasmidReagent = '';
        let metadataPlasmidReagentLOT = '';
        let metadataDZReagentAmount = '';
        let metadataPlasmidReagentAmount = '';
        let metadataTreatment = '';
        let metadataPlasmid1 = '';
        let metadataPlasmid1Concentration = '';
        let metadataPlasmid2 = '';
        let metadataPlasmid2Concentration = '';
        let metadataPlasmid3 = '';
        let metadataPlasmid3Concentration = '';
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
          if (metadataDisplayState.well.cellsPerWell && well.Metadata.NumberOfCellsPerWell) {
            metadataNumberOfCellsPerWell = `<div style="white-space: nowrap;"><span>Cells per well: </span><span>${[well.Metadata.NumberOfCellsPerWell, well.Metadata.NumberOfCellsPerWellUnit].filter(Boolean).join(' ') || ''}</span></div>`;
          }
          if (metadataDisplayState.well.concentration && well.Metadata.Concentration) {
            metadataConcentration = `<div style="white-space: nowrap;"><span>Concentration: </span><span>${[well.Metadata.Concentration, well.Metadata.ConcentrationUnit].filter(Boolean).join(' ') || ''}</span></div>`;
          }
          if (metadataDisplayState.well.dzReagent) {
            metadataDZReagent = `<div style="white-space: nowrap;"><span>DZ reagent: </span><span>${well.Metadata.DZReagent || ''}</span></div>`;
          }
          if (metadataDisplayState.well.dzReagentLOT) {
            metadataDZReagentLOT = `<div style="white-space: nowrap;"><span>DZ reagent LOT: </span><span>${well.Metadata.DZReagentLOT || ''}</span></div>`;
          }
          if (metadataDisplayState.well.plasmidReagent) {
            metadataPlasmidReagent = `<div style="white-space: nowrap;"><span>Plasmid reagent: </span><span>${well.Metadata.PlasmidReagent || ''}</span></div>`;
          }
          if (metadataDisplayState.well.plasmidReagentLOT) {
            metadataPlasmidReagentLOT = `<div style="white-space: nowrap;"><span>Plasmid reagent LOT: </span><span>${well.Metadata.PlasmidReagentLOT || ''}</span></div>`;
          }
          if (metadataDisplayState.well.dzReagentAmount && well.Metadata.DZReagentAmount) {
            metadataDZReagentAmount = `<div style="white-space: nowrap;"><span>DZ Reagent amount: </span><span>${[well.Metadata.DZReagentAmount, well.Metadata.DZReagentAmountUnit].filter(Boolean).join(' ') || ''}</span></div>`;
          }
          if (metadataDisplayState.well.plasmidReagentAmount && well.Metadata.PlasmidReagentAmount) {
            metadataPlasmidReagentAmount = `<div style="white-space: nowrap;"><span>Plasmid Reagent amount: </span><span>${[well.Metadata.PlasmidReagentAmount, well.Metadata.PlasmidReagentAmountUnit].filter(Boolean).join(' ') || ''}</span></div>`;
          }
          if (metadataDisplayState.well.treatment && well.Metadata.Treatment) {
            metadataTreatment = `<div style="white-space: nowrap;"><span>Treatment: </span><span>${well.Metadata.Treatment || ''}</span></div>`;
          }
          if (metadataDisplayState.well.plasmid1 && well.Metadata.Plasmid1) {
            metadataPlasmid1 = `<div style="white-space: nowrap;"><span>Plasmid 1: </span><span>${well.Metadata.Plasmid1 || ''}</span></div>`;
          }
          if (metadataDisplayState.well.plasmid1Concentration && well.Metadata.Plasmid1Concentration) {
            metadataPlasmid1Concentration = `<div style="white-space: nowrap;"><span>Plasmid 1 Concentration: </span><span>${[well.Metadata.Plasmid1Concentration, well.Metadata.Plasmid1ConcentrationUnit].filter(Boolean).join(' ') || ''}</span></div>`;
          }
          if (metadataDisplayState.well.plasmid2 && well.Metadata.Plasmid2) {
            metadataPlasmid2 = `<div style="white-space: nowrap;"><span>Plasmid 2: </span><span>${well.Metadata.Plasmid2 || ''}</span></div>`;
          }
          if (metadataDisplayState.well.plasmid2Concentration && well.Metadata.Plasmid2Concentration) {
            metadataPlasmid2Concentration = `<div style="white-space: nowrap;"><span>Plasmid 2 Concentration: </span><span>${[well.Metadata.Plasmid2Concentration, well.Metadata.Plasmid2ConcentrationUnit].filter(Boolean).join(' ') || ''}</span></div>`;
          }
          if (metadataDisplayState.well.plasmid3 && well.Metadata.Plasmid3) {
            metadataPlasmid3 = `<div style="white-space: nowrap;"><span>Plasmid 3: </span><span>${well.Metadata.Plasmid3 || ''}</span></div>`;
          }
          if (metadataDisplayState.well.plasmid3Concentration && well.Metadata.Plasmid3Concentration) {
            metadataPlasmid3Concentration = `<div style="white-space: nowrap;"><span>Plasmid 3 Concentration: </span><span>${[well.Metadata.Plasmid3Concentration, well.Metadata.Plasmid3ConcentrationUnit].filter(Boolean).join(' ') || ''}</span></div>`;
          }
        }
        html += '<td style="background-color:' + bgColor
          + '; color: ' + color
          + '; padding: 0.2em; border: 1px solid black">'
          + name
          + '<br>'
          + metadataNumberOfCellsPerWell
          + metadataConcentration
          + metadataDZReagent
          + metadataDZReagentLOT
          + metadataPlasmidReagent
          + metadataPlasmidReagentLOT
          + metadataDZReagentAmount
          + metadataPlasmidReagentAmount
          + metadataTreatment
          + metadataPlasmid1
          + metadataPlasmid1Concentration
          + metadataPlasmid2
          + metadataPlasmid2Concentration
          + metadataPlasmid3
          + metadataPlasmid3Concentration
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
}
