class FlowActionsHistory {
  constructor(plate) {
    this.Plate = plate;
    // History: {sampleName:string,	sourceWell:string,	sourcePlate:string	targetWell:string	targetPlate:string	volume:number}[]
    this.History = [];
    this.ActionsCache = [];
    this.List = null;
  }

  init() {
    this.List = new FlowActionsHistoryList(Editor.Plate.Anchors.FlowRecordHistory, this);
    this.List.init(this);

    return this;
  }

  list() {
    return [...this.History];
  }

  calculateWellsFrequency() {
    const separator = '@';
    return _.chain(this.History)
      .map(item => {
        // console.log('_.map', item.targetPlate, item.targetWell);
        return [item.targetPlate, item.targetWell].join(separator);
      })
      .countBy(item => {
        // console.log('_.countBy', item);
        return item;
      })
      .reduce((result, value, key) => {
        // console.log('_.reduce', result, value, key);
        const [plate, well] = key.split(separator);
        return _.merge(result, {[plate]: {[well]: value}});
      }, {})
      .value();
  }

  // sampleName:string,	sourceWell:string, sourcePlate:string, volume:number
  cacheAction({sampleName, sourceWell, sourcePlate, volume}) {
    this.ActionsCache = [
      ...this.ActionsCache,
      {sampleName, sourceWell, sourcePlate, volume}
    ];

    return this;
  }

  // targetWell:string	targetPlate:string
  saveCachedToHistory({targetWell, targetPlate}, clear = false) {
    this.ActionsCache.forEach(item => this.addAction({...item, targetWell, targetPlate}));

    if (clear) {
      this.clearCached();
    }

    return this;
  }

  saveCachedShapeToHistory({targetWell, targetPlate}, index) {
    this.ActionsCache.forEach((item, i) => {
      if (index === i) {
        this.addAction({...item, targetWell, targetPlate})
      }
    })

    return this;
  }

  clearCached() {
    this.ActionsCache = [];
  }

  // action = {sampleName:string,	sourceWell:string,	sourcePlate:string	targetWell:string	targetPlate:string	volume:number}
  addAction(action) {
    const extendedActon = {...action, index: this.History.length};
    this.List.addItem(extendedActon, extendedActon.index);
    this.History = [...this.History, extendedActon];

    return this;
  }

  removeAction(index) {
    this.History = this.History.filter(action => action.index !== index);
    this.List.removeItem(index);

    if (this.Plate) {
      this.Plate.updateWellColors();
    }

    return this;
  }

  reset() {
    this.History.forEach(action => this.List.removeItem(action.index));
    this.History = [];
    this.ActionsCache = [];

    return this;
  }

  exportToCSV() {
    if (this.History.length > 0) {
      const headers = ['SAMPLE_NAME', 'WellPosSource', 'SOURCENAME', 'TargetPos', 'TargetName', 'Volume'];
      const output = [
        headers,
        ...this.History.map(row => ([
          row.sampleName,
          row.sourceWell,
          row.sourcePlate,
          row.targetWell,
          row.targetPlate,
          row.volume
        ]))
      ];

      const content = Excel.generateCSVFileFromArray(output);

      Form.download(content, {
        DataType: 'text/csv',
        FileName: `robot_flow.csv`
      });
    } else {
      Editor.Console.log({Message: 'Nothing to save.', Gravity: 'Error'});
    }

    return this;
  }
}
