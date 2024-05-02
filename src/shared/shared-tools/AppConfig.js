class AppConfig {
  constructor() {
    this.API = {}
  }

  static async init() {
    this.MetadataDDOptions = {
      //dd options
      transfectionScientist: [],
      cellLine: [],
      transfectionReagent: [],
      sampleNames: [],
      treatmentInWell: [],
      //units
      transfectionEndPointUnit: [],
      viabilityPercentageUnit: [],
      numberOfCellsPerWellUnit: [],
      concentrationUnit: [],
      transfectionReagentAmountUnit: [],
    };
    this.Error = false;
    try {
      const fileResponse = await fetch('dist/config.json');
      const config = await fileResponse.json();
      this.API = {...config.API};
    } catch (e) {
      alert('Error while receiving metadata options');
      this.Error = true;
    }
  };
}
