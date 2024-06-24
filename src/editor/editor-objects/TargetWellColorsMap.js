class TargetWellColorsMap {
  static WellSourcesCountColorsMap = {
    '1': CSSCOLORS.list('boxColors')[0],
    '2': CSSCOLORS.list('boxColors')[1],
    '3': CSSCOLORS.list('boxColors')[2],
    '4': CSSCOLORS.list('boxColors')[3],
    '>5': CSSCOLORS.list('boxColors')[4],
  };

  static getLegendHTML() {
    return Object.entries(TargetWellColorsMap.WellSourcesCountColorsMap).map(([key, color]) => {
      let html = '<div class="WellColorMap_item">';
      html += '<div class="WellColorMap_color" style="background-color: #' + color + '"></div>';
      html += '<div class="WellColorMap_name">' + key + '</div>';
      html += '</div>';
      return html;
    }).join('');
  }

  static getColor(count) {
    switch (count) {
      case 1:
      case 2:
      case 3:
      case 4:
        return TargetWellColorsMap.WellSourcesCountColorsMap[count.toString()];
      case 5:
      default:
        return TargetWellColorsMap.WellSourcesCountColorsMap['>5'];
    }
  }
}
