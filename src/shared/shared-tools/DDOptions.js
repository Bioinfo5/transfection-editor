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
      plasmidInWell: [],
      numberOfCellsPer10CmPlate: [],
      //units
      transfectionEndPointUnit: [],
      viabilityPercentageUnit: [],
      numberOfCellsPerWellUnit: [],
      concentrationUnit: [],
      dzReagentAmountUnit: [],
      plasmidReagentAmountUnit: [],
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
      this.MetadataDDOptions.plasmidInWell = (options) ? options.plasmid_in_well : [];

      const fileResponse = await fetch('dist/dd-options.json');
      const units = await fileResponse.json();
      this.MetadataDDOptions.transfectionEndPointUnit = (units) ? units.transfection_end_point_units : [];
      this.MetadataDDOptions.viabilityPercentageUnit = (units) ? units.viability_percentage_units : [];
      this.MetadataDDOptions.numberOfCellsPerWellUnit = (units) ? units.number_of_cells_per_well_units : [];
      this.MetadataDDOptions.concentrationUnit = (units) ? units.concentration_units : [];
      this.MetadataDDOptions.dzReagentAmountUnit = (units) ? units.dz_reagent_amount_units : [];
      this.MetadataDDOptions.plasmidReagentAmountUnit = (units) ? units.plasmid_reagent_amount_units : [];
      this.MetadataDDOptions.plasmidInWellConcentrationUnit = (units) ? units.plasmid_in_well_concentration_units : [];
      this.MetadataDDOptions.numberOfCellsPer10CmPlateUnit = (units) ? units.number_of_cells_per_10_cm_plate_units : [];
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

  static plasmidInWell() {
    return ['Please select', ...this.MetadataDDOptions.plasmidInWell];
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

  static DZReagentAmountUnitOptions() {
    return [...this.MetadataDDOptions.dzReagentAmountUnit];
  }

  static PlasmidReagentAmountUnitOptions() {
    return [...this.MetadataDDOptions.plasmidReagentAmountUnit];
  }

  static PlasmidInWellConcentrationUnitOptions() {
    return [...this.MetadataDDOptions.plasmidInWellConcentrationUnit];
  }

  static NumberOfCellsPer10CmPlateUnitOptions() {
    return [...this.MetadataDDOptions.numberOfCellsPer10CmPlateUnit];
  }
}
