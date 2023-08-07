class DDOptions {
  constructor() {}

  static async init() {
    this.MetadataDDOptions = {
      transfectionScientist: [],
      cellLine: [],
      transfectionReagent: [],
      concentrationUnit: [],
      transfectionReagentAmountUnit: [],
    };
    this.Error = false;
    try {
      const response = await fetch('dist/metadata-dd-options.json');
      const result = await response.json();
      this.MetadataDDOptions.transfectionScientist = (result) ? result.transfection_scientist : [];
      this.MetadataDDOptions.cellLine = (result) ? result.cell_line : [];
      this.MetadataDDOptions.transfectionReagent = (result) ? result.transfection_reagent : [];
      this.MetadataDDOptions.concentrationUnit = (result) ? result.concentration_units : [];
      this.MetadataDDOptions.transfectionReagentAmountUnit = (result) ? result.transfection_reagent_amount_units : [];
    } catch (e) {
      this.Error = true;
    }
  };

  static transfectionScientistOptions() {
    return ['Please select', ...this.MetadataDDOptions.transfectionScientist];
  }

  static cellLineOptions() {
    return ['Please select', ...this.MetadataDDOptions.cellLine];
  }

  static transfectionReagentOptions() {
    return ['Please select', ...this.MetadataDDOptions.transfectionReagent];
  }

  static ConcentrationUnitOptions() {
    return [...this.MetadataDDOptions.concentrationUnit];
  }

  static TransfectionReagentAmountUnitOptions() {
    return [...this.MetadataDDOptions.transfectionReagentAmountUnit];
  }
}
