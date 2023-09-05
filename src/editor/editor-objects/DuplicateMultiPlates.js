class DuplicateMultiPlates {
  constructor(plate) {
    this.id = 'Form_Duplicate_Selected_Plates';
    this.controls = this.id + '_Controls';

    this.Plate = plate;
  }

  init() {
    let dataList = [...this.Plate.Layers];
    const id = "Form_DuplicateTab";
    const inputId = "Form_DuplicateTab_Input";
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
          }.bind(this),
          Title: 'Check to display the plate'
        }
      );
    });
    const layerSelectControlsContainers = Editor.Plate.Layers.map(layer => {
      return `<div id="plate_checkbox-${layer.Index}"></div>`;
    }).join('');

    const copy = (layerIndex, times) => { //Copy plate (layer) with provided ArrayIndex t times
      const origin = this.Plate.Layers[layerIndex];
      for (let i = 0; i < times; i++) {
        const l = this.Plate.LastKey++; //Index of the new plate (layer) to add
        const here = this.Plate.Layers.length; //Last index in the array is the one to use for the display in html
        const newLayer = Layer.clone({...origin, Index: l, ArrayIndex: here});
        this.Plate.Layers.push(newLayer);
        this.Plate.LayerTab.addTab({
          Label: newLayer.Name,
          SetActive: true,
          Controls: ["Rename", "Select", "Duplicate", "Delete"],
          Content: {Type: "HTML", Value: Layer.rootHTML(newLayer.Name, newLayer.Root)}
        });
        newLayer.init().grid(this.Plate.Grid);
        this.Plate.update(); //Update to display the concentrations and update the range info
        Editor.ResultManager.layerUpdate(); //Update the plate (layer) control
      }
      return this;
    }

    Form.open({
      ID: id,
      HTML: "<div style=\"text-align: center\">"
        + "<p style=\"color: black;\">This will duplicate selected tabs and all its contents.</p>"
        + "<p>Select tabs to duplicate.</p>"
        + "<div style=\"display: flex; flex-wrap: wrap; justify-content: center;\">" + layerSelectControlsContainers + "</div>"
        + "<p>Enter the number of copies you want.</p>"
        + "<input id=" + inputId + " type=\"number\" class=\"LinkCtrl_Number\" style=\"margin-bottom: 1em\" value=\"1\">"
        + "</div>",
      Title: "Confirm duplication",
      Buttons: [
        {
          Label: "Ok", Click: function () {
            const input = document.getElementById(inputId);
            if (input.value) {
              layerSelectControls.map((item, index) => {
                if (item.Value) {
                  copy(index, parseInt(input.value, 10));
                }
              })
            }
            Form.close(id);
          }
        },
        {
          Label: "Cancel", Click: function () {
            Form.close(id)
          }
        }
      ],
      Size: 500,
      onInit: () => {
        const input = document.getElementById(inputId);
        const minLimit = 1;
        const maxLimit = 50;
        const handleLimit = function () {
          if (this.value < minLimit) {
            this.value = minLimit;
          } else if (this.value > maxLimit) {
            this.value = maxLimit;
          }
        }
        input.addEventListener('blur', handleLimit);
        input.addEventListener('change', handleLimit);
        [...layerSelectControls].forEach(control => control.init());
      }
    });

    return this
  }
}