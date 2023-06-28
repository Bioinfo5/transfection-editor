class Excel {
  static fit_to_column = (data) => {
    const [headers] = data;
    const offset_ch = 5;
    return headers.map(item => item.length + offset_ch).map(wch => ({wch}))
  };

  static style_cells_content_center = (ws) => {
    Object.keys(ws).map(item => {
      if (item !== '!cols' && item !== '!ref') {
        return ws[item].s = {
          alignment: {
            horizontal: 'center'
          }
        };
      } else {
        return null
      }
    });
  };

  static generateExcelFileFromArray = (data) => {
    /* create  new worksheet from data and static title */
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = Excel.fit_to_column(data);
    Excel.style_cells_content_center(ws);

    /* build new workbook */
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws);

    /* write file */
    return XLSX.write(wb, {type: "array", bookType: "xlsx"});
  };
}
