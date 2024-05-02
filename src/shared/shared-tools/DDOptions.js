class DDOptions {
  constructor() {}

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
      const url = `${AppConfig.API.URL}/${AppConfig.API.metadata_options}` // 'https://1etx.admin.api.botlee.com/api/plateEditor/metadataOptions'
      const apiResponse = await fetch(url);
      const options = await apiResponse.json();
      this.MetadataDDOptions.transfectionScientist = (options) ? options.transfection_scientist : [];
      this.MetadataDDOptions.cellLine = (options) ? options.cell_line : [];
      this.MetadataDDOptions.transfectionReagent = (options) ? options.transfection_reagent : [];
      this.MetadataDDOptions.sampleNames = (options) ? options.sample_names : [];
      this.MetadataDDOptions.treatmentInWell = (options) ? options.treatment_in_well : [];

      const fileResponse = await fetch('dist/dd-options.json');
      const units = await fileResponse.json();
      this.MetadataDDOptions.transfectionEndPointUnit = (units) ? units.transfection_end_point_units : [];
      this.MetadataDDOptions.viabilityPercentageUnit = (units) ? units.viability_percentage_units : [];
      this.MetadataDDOptions.numberOfCellsPerWellUnit = (units) ? units.number_of_cells_per_well_units : [];
      this.MetadataDDOptions.concentrationUnit = (units) ? units.concentration_units : [];
      this.MetadataDDOptions.transfectionReagentAmountUnit = (units) ? units.transfection_reagent_amount_units : [];
    } catch (e) {
      alert('Error while receiving metadata options');
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

  static sampleNames() {
    return ['Please select', ...this.MetadataDDOptions.sampleNames];
  }

  static treatmentInWell() {
    return ['Please select', ...this.MetadataDDOptions.treatmentInWell];
  }

  static TransfectionEndPointUnitOptions() {
    return [...this.MetadataDDOptions.transfectionEndPointUnit];
  }

  static ViabilityPercentageUnitOptions() {
    return [...this.MetadataDDOptions.viabilityPercentageUnit];
  }

  static NumberOfCellsPerWellUnitOptions() {
    return [...this.MetadataDDOptions.numberOfCellsPerWellUnit];
  }

  static ConcentrationUnitOptions() {
    return [...this.MetadataDDOptions.concentrationUnit];
  }

  static TransfectionReagentAmountUnitOptions() {
    return [...this.MetadataDDOptions.transfectionReagentAmountUnit];
  }
}
