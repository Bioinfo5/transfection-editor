class FlowActionsHistoryList {
  constructor(root, history) {
    this.Root = root;
    this.History = history;
    this.Anchors = {
      ListContainer: `${root}_ListContainer`
    };
  }

  init() {
    const out = GetId(this.Root);
    let html = `<div>`;
    html += `<div id="${this.Anchors.ListContainer}" class="FlowActionsHistoryListContainer">`;
    html += `</div>`;
    html += `</div>`;

    out.innerHTML = html;
  }

  addItem(item, index) {
    const text = `${item.sourcePlate} ${item.sourceWell} to ${item.targetPlate} ${item.targetWell} with Volume of ${item.volume}`;

    const label = document.createElement('div');
    label.className = 'ListItem_Label';
    label.innerText = text;

    const buttonDelete = document.createElement('div');
    // buttonDelete.innerHTML = '<span class="" />';
    buttonDelete.className = 'ListItem_Btn ListItem_Delete_Btn';
    buttonDelete.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.History.removeAction(index);
    });

    const element = document.createElement('div');
    element.className = 'ListItem';
    element.appendChild(label);
    element.appendChild(buttonDelete);
    element.setAttribute('data-index', index);

    const list = GetId(this.Anchors.ListContainer);
    list.appendChild(element);
  }

  removeItem(index) {
    const list = GetId(this.Anchors.ListContainer);
    const item = Array.from(list.children).find(elt => {
      return parseInt(elt.getAttribute('data-index'), 10) === index;
    });
    if (item) {
      item.remove();
    }
  }
}
