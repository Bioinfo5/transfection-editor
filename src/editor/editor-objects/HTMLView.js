class HTMLView {
  constructor(plate) {
    this.id = 'Form_GetAsHTML';
    this.controls = this.id + '_Controls';
    this.output = this.id + '_Output';
    this.metadataDisplayState = {
      plate: {
        cellLine: false,
        cellLinePassage: false,
        transfectionReagent: false,
        transfectionReagentLOT: false,
        transfectionEndPoint: false,
        viabilityPercentage: false,
        seedingMedian: false,
        transfectionMedian: false,
      },
      well: {
        cellsPerWell: true,
        concentration: true,
        transfectionReagentAmount: true,
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
          ID: `plate_metadata_checkbox-transfectionReagent`,
          Default: this.metadataDisplayState.plate.transfectionReagent,
          Label: 'Transfection Reagent',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.transfectionReagent = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `plate_metadata_checkbox-transfectionReagentLOT`,
          Default: this.metadataDisplayState.plate.transfectionReagentLOT,
          Label: 'Transfection Reagent LOT',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.transfectionReagentLOT = checked;
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
          ID: `plate_metadata_checkbox-seedingMedian`,
          Default: this.metadataDisplayState.plate.seedingMedian,
          Label: 'Seeding median',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.seedingMedian = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
      LinkCtrl.new('Checkbox', {
          ID: `plate_metadata_checkbox-transfectionMedian`,
          Default: this.metadataDisplayState.plate.transfectionMedian,
          Label: 'Transfection median',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.plate.transfectionMedian = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
    ];
    const layerMetadataControlsContainers = `<span id="plate_metadata_checkbox-cellLine"></span>`
      + `<span id="plate_metadata_checkbox-cellLinePassage"></span>`
      + `<span id="plate_metadata_checkbox-transfectionReagent"></span>`
      + `<span id="plate_metadata_checkbox-transfectionReagentLOT"></span>`
      + `<span id="plate_metadata_checkbox-transfectionEndPoint"></span>`
      + `<span id="plate_metadata_checkbox-viabilityPercentage"></span>`
      + `<span id="plate_metadata_checkbox-seedingMedian"></span>`
      + `<span id="plate_metadata_checkbox-transfectionMedian"></span>`;

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
          ID: `well_metadata_checkbox-transfectionReagentAmount`,
          Default: this.metadataDisplayState.well.transfectionReagentAmount,
          Label: 'Transfection Reagent Amount',
          NewLine: false,
          Change: function (checked) {
            this.metadataDisplayState.well.transfectionReagentAmount = checked;
            this.updateOutput(dataList, this.metadataDisplayState);
          }.bind(this),
          Title: 'Check to display the cell line value'
        }
      ),
    ];
    const wellMetadataControlsContainers = `<span id="well_metadata_checkbox-cellsPerWell"></span>`
      + `<span id="well_metadata_checkbox-concentration"></span>`
      + `<span id="well_metadata_checkbox-transfectionReagentAmount"></span>`;

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
          + ((metadataDisplayState.plate.transfectionReagent)
            ? '<div>Transfection reagent: ' + (layer.Metadata.TransfectionReagent || '') + '</div>'
            : '')
          + ((metadataDisplayState.plate.transfectionReagentLOT)
            ? '<div>Transfection reagent LOT: ' + (layer.Metadata.TransfectionReagentLOT || '') + '</div>'
            : '')
          + ((metadataDisplayState.plate.transfectionEndPoint)
              ? '<div>Transfection end-point: ' + ([layer.Metadata.TransfectionEndPoint, layer.Metadata.TransfectionEndPointUnit].filter(Boolean).join(' ') || '') + '</div>'
            : '')
          + ((metadataDisplayState.plate.viabilityPercentage)
            ? '<div>Viability percentage: ' + ([layer.Metadata.ViabilityPercentage, layer.Metadata.ViabilityPercentageUnit].filter(Boolean).join(' ') || '') + '</div>'
            : '')
          + ((metadataDisplayState.plate.seedingMedian)
            ? '<div>Seeding median: ' + ([layer.Metadata.SeedingMedian, layer.Metadata.SeedingMedianUnit].filter(Boolean).join(' ') || '') + '</div>'
            : '')
          + ((metadataDisplayState.plate.transfectionMedian)
            ? '<div>Transfection median: ' + ([layer.Metadata.TransfectionMedian, layer.Metadata.TransfectionMedianUnit].filter(Boolean).join(' ') || '') + '</div>'
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
          if (metadataDisplayState.well.cellsPerWell && well.Metadata.NumberOfCellsPerWell) {
            metadataNumberOfCellsPerWell = `<div style="white-space: nowrap;"><span>Cells per well: </span><span>${[well.Metadata.NumberOfCellsPerWell, well.Metadata.NumberOfCellsPerWellUnit].filter(Boolean).join(' ') || ''}</span></div>`;
          }
          if (metadataDisplayState.well.concentration && well.Metadata.Concentration) {
            metadataConcentration = `<div style="white-space: nowrap;"><span>Concentration: </span><span>${[well.Metadata.Concentration, well.Metadata.ConcentrationUnit].filter(Boolean).join(' ') || ''}</span></div>`;
          }
          if (metadataDisplayState.well.transfectionReagentAmount && well.Metadata.TransfectionReagentAmount) {
            metadataTransfectionReagentAmount = `<div style="white-space: nowrap;"><span>Reagent amount: </span><span>${[well.Metadata.TransfectionReagentAmount, well.Metadata.TransfectionReagentAmountUnit].filter(Boolean).join(' ') || ''}</span></div>`;
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
}
