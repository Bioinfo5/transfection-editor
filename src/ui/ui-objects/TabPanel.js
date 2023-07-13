//**************************************************************************
// TABPANEL object - A tab object used and controlled by a TabControl object
//**************************************************************************
class TabPanel {
	constructor(I) {
		this.Key = I.Key; //Unique index for the. Note that this is NOT the index in the parent array
		this.Parent = I.Parent; //The parent TabControl object
		this.Label = (I.Label || ""); //Label displayed by the header
		this.Active = (I.Active || false); //Whether this panel is active
		this.Disabled = (I.Disabled || false); //Whether this panel is disabled
		this.Controls = (I.Controls || []); //Controls available for this panel. Possible values are ["Form", "Edit", "Move", "Delete"], in whatever order
		this.Content = I.Content; //Content to be displayed inside the tab while active. It should be provided as an object with Type and Value properties
		this.Selected = false;
		var root = this.Parent.ID;
		this.Anchors = {
			Header: root + "_TabHeader_" + this.Key,
			Content: root + "_TabContent_" + this.Key,
		}
		this.initContentInternal(); //Initialize the contents. This is in case DOM needs to be copied before being destroyed by autoInit of the parent
		return this;
	}
	//Methods
	classHeader() { //Return a string for the classes that should be applied to the header, given current panel properties
		let classes = "LinkCtrl LinkCtrl_RoundT";
		if(this.Active) {classes += " LinkCtrl_Active"} //Active class has priority over the rest
		else {
			if(this.Disabled) {classes += " LinkCtrl_Disabled"}
			else {classes += " LinkCtrl_Resting"}
		}
		if(this.Selected) {classes += " LinkCtrl_Selected"}
		return classes;
	}
	/*classControl() { //Return a string for the classes that should be applied to the control of this header, given current panel properties
		var classes = "LinkCtrl_Icon";
		if(this.Active) {classes += " LinkCtrl_IconActive"} //Active class has priority over the rest
		else {
			if(this.Disabled) {classes += " LinkCtrl_IconDisabled"}
			else {classes += " LinkCtrl_IconResting"}
		}
		return classes;
	}*/
	initHeader() { //Returns the html for this tab header
		var html = "<span ";
		html += "id=\"" + this.Anchors.Header + "\" ";
		html += "class=\"" + this.classHeader() + "\" ";
		html += "tabKey=\"" + this.Key + "\" style=\"font-size: 1em; white-space: pre\">" + this.Label;
		if(this.Controls.length > 0) {html += this.appendControls()} //Add the controls if they are desired
		html += "</span> "; //Single whitespace between each header (in case another one follows)
		return html;
	}
	appendControls() { //Prepare the html of the controls usable to edit this tab
		let html = "";
		this.Controls.forEach(function(c) {
			let o = {Type: c, Active: this.Active, Space: true, Attributes:[{Name: "tabKey", Value: this.Key}, {Name: "tabAction", Value: c}]};
			if(!this.Disabled) {
				switch(c) {
					case "Setting": o.Title = "Click here to see the settings for this tab"; break;
					case "Edit": o.Title = "Click here to edit the tab"; break;
					case "Move": o.Title = "Click here to move this tab at the desired position"; break;
					case "Delete": o.Title = "Click here to delete this tab"; break;
					case "Duplicate": o.Title = "Click here to duplicate this tab"; break;
					case "Select": o.Title = "Click here to select this tab"; break;
					case "Rename": o.Title = "Click here to rename this tab"; break;
				}
			}
			html += LinkCtrl.icon(o);
		}, this);
		return html;
	}
	initContent() { //Return the html for the contents of this tab
		let html = "";
		let style = "none"; //Hide content of inactive tabs
		if(this.Active) {style = "block"}
		if(!this.Parent.Stack) {style += "; float: left"}
		html += '<div id="' + this.Anchors.Content + '" class="LinkCtrl_TabPanel" data-tabKey="'
			+ this.Key
			+ '" style="display: ' + style + '">';
		html += this.initContentInternal();
		html += "</div>";
		return html;
	}
	initContentInternal() {
		let c = this.Content;
		if(c === undefined) {return ""}
		switch(c.Type) {
			case "HTML": return c.Value; //The content is plain HTML
			case "DOM": //The content is written in the DOM, at the provided ID
				if(c.Value) { //If the ID exists
					let dom = GetId(c.Value); //Get the DOM element
					if(dom !== null && dom !== undefined) { //If this indeed exists
						let html = dom.innerHTML; //copy the content
						this.Content = {Type: "HTML", Value: html} //Update the tab object with its new content
						dom.remove(); //Bye bye
						return html; //Output the content
					}
				}
				return ""; //Nothing was found at the given location
			default: return ""; //Unknown Type requested
		}
	}
	updateState() { //Update the state of this tab, based on current properties. This only fully updates the header, content will just be made visible or hidden
		var header = GetId(this.Anchors.Header); //Update the state of the header
		if(!(header === null || header === undefined)) { //If the html exists
			header.className = this.classHeader(); //Update the class of the header
			if(this.Controls.length > 0) { //If some control exists, they also need to have their state updated. This includes inactivating the title for disabled panels, so the easiest is to prepare the html anew
				header.innerHTML = this.Label + "&nbsp;" + this.appendControls();
			}
			else {
				header.innerHTML = this.Label; //If the panel has changed name, this should also be reflected here
			}
		}
		var content = GetId(this.Anchors.Content); //Update the state of the content
		if(!(content === null || content === undefined)) { //If the html exists
			if(this.Active) {content.style.display = "block"} //Make the content visible / hidden
			else {content.style.display = "none"}
		}
	}
	updateContent(C) { //Update the content of the Tab with the new one provided, both at the object and html level. This will remove any previous content!
		this.Content = C;
		var content = GetId(this.Anchors.Content);
		if(!(content === null || content === undefined)) { //If the html exists
			content.innerHTML = this.initContentInternal();
		}
	}
	set(as) { //Set the tab at the desired state(s). Multiple Keywords, space delimited, can be provided
		const keywords = as.split(" "); //Array of keywords
		keywords.forEach(function(k) { //Loop the keywords
			switch(k) {
				case "Active":
					this.Active = true;
					break;
				case "Resting":
					this.Active = false;
					this.Selected = false;
					break;
				case "Selected":
					if (this.Active) this.Selected = true;
					break;
				case "Unselected":
					this.Selected = false;
					break;
				case "Disabled":
					this.Disabled = true;
					break;
				case "Enabled":
					this.Disabled = false;
					break;
				default: break;
			}
		}, this);
		this.updateState();
		return this;
	}
	fold() { //Hide or reveal the content for this panel
		var content = GetId(this.Anchors.Content); //Update the state of the content
		if(!(content === null || content === undefined)) { //If the html exists
			if(content.style.display == "none") {content.style.display = "block"} //Make the content visible / hidden
			else {content.style.display = "none"}
		}
	}
	delete() {
		var header = GetId(this.Anchors.Header);
		if(!(header === null || header === undefined)) {//Remove the html if it exists
			if(this.Parent.Layout == "Vertical") {header.nextElementSibling.remove()}
			header.remove()
		}
		var content = GetId(this.Anchors.Content);
		if(!(content === null || content === undefined)) {content.remove()} //Remove the html if it exists
	}
	rename(name) { //Update the name of the tab using the new text provided
		this.Label = name; //Update property
		this.updateState(); //Update display
	}
}

