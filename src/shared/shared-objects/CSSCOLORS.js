class CSSCOLORS {
	constructor() {}
	static list(type) {
		const boxColors = [
			"#ef6e3c", "#0971f0", "#9b5c2a", "#b2b4f0",
			"#3b8c2a", "#f50422", "#250662", "#060e27",
			"#0f525f", "#c4fd57", "#3f16d9", "#21d52e",
			"#e08c56", "#28fcfd", "#36486a", "#d02e29",
			"#41d158", "#fb21a3", "#566ca0", "#15b9ee",
			"#c9d730", "#30cc49",	"#3d6751", "#fb4c03",
			"#640fc1", "#d3493a", "#1ae6db", "#289812",
			"#3e464c", "#a84a8f",	"#51aed9", "#5bb32d",
			"#21538e", "#89d534",	"#d36647", "#fc7e41",
			"#0023b8", "#c188a2", "#67eb4b", "#b308d3",
			"#af3101", "#71b1f4", "#c4d647", "#11dec1",
			"#ea24a3", "#79352c", "#521250", "#df514a",
			"#c79ed2", "#e33e52", "#21538e", "#539397",
			"#1bb699", "#6b2e5f", "#0023b8", "#3b8c2a",
			"#d36647", "#7fb411",	"#986b53", "#f50422",
			"#79352c", "#521250", "#c79ed2", "#983f7a",
			"#3f8473", "#421f79", "#7a3d93", "#635f6d",
			"#0f5997", "#409188", "#911e20", "#f1ae16",
			"#1350ce", "#10e5b1", "#cb2582", "#ce00be",
			"#32d5d6", "#608572", "#c79bc2", "#00f87c",
			"#77772a", "#6995ba", "#fc6b57", "#983f7a",
			"#8fd883", "#96e591", "#f07815", "#d00043",
			"#b47162", "#1ec227", "#4f0f6f", "#1d1d58",
			"#947002", "#bde052", "#911e7e",
			"#406df9", "#615af0", "#2a3434", "#4a543f",
			"#a8b8d4", "#00efd4", "#7ad236",
			"#ac7c0a", "#2f1179", "#dd93fd",
			"#7260d8", "#1deaa7", "#06f43a", "#823c59",
			"#e3d94c", "#dc1c06", "#f53b2a",
			"#b46238", "#2dfff6", "#a82b89", "#1a8011",
			"#436a9f", "#1a806a", "#4cf09d",
			"#63b598", "#ce7d78", "#ea9e70", "#a48a9e",
			"#648177", "#0d5ac1", "#4b5bdc", "#0cd36d",
			"#f205e6", "#1c0365", "#14a9ad", "#4ca2f9",
			"#a4e43f", "#d298e2", "#6119d0",
			"#d2737d", "#c0a43c", "#f2510e", "#651be6",
			"#79806e", "#61da5e", "#cd2f00",
			"#9348af", "#01ac53", "#c5a4fb", "#996635",
			"#b11573", "#4bb473", "#75d89e",
			"#2f3f94", "#2f7b99", "#da967d", "#34891f",
			"#b0d87b", "#ca4751", "#7e50a8","#fa06ec",
			"#1bb699", "#6b2e5f",	"#996c48", "#9ab9b7",
			"#06e052","#e3a481", "#0eb621", "#fc458e",
			"#b2db15", "#aa226d", "#792ed8",
			"#73872a", "#520d3a", "#a5b3d9",
			"#935b6d", "#513d98", "#aead3a",
			"#cb5bea", "#228916", "#ac3e1b",
			"#f697c1", "#ba96ce", "#679c9d", "#c6c42c",
			"#5d2c52", "#48b41b", "#e1cf3b",
			"#5be4f0", "#57c4d8", "#a4d17a", "#be608b",
			"#96b00c", "#088baf", "#f158bf",
			"#e145ba", "#ee91e3", "#05d371", "#5426e0",
			"#4834d0", "#802234", "#6749e8",
			"#e23dd0", "#d3486d", "#00f7f9", "#474893",
			"#3cec35", "#1c65cb", "#5d1d0c",
			"#2d7d2a", "#ff3420", "#5cdd87", "#a259a4",
			"#e4ac44", "#1bede6", "#8798a4",
			"#d7790f", "#b2c24f", "#76fc1b", "#608fa4",
			"#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
			"#f812b3", "#8d6c2f",	"#d3277a", "#2ca1ae",
		];
		switch(type) {
			case "RGB": return [ //RGB values
				[135,206,250],[144,238,144],[255,182,193],[221,160,221],[240,230,140],[211,211,211],[255,255,240],[224,255,255],[255,240,245],[127,255,212],
				[255,218,185],[176,224,230],[176,196,222],[255,160,122],[169,169,169],[218,112,214],[255,255,224],[250,250,210],[255,239,213],[173,255, 47],
				[255,255,  0],[  0,255,255],[255,228,181],[102,205,170],[240,255,255],[240,128,128],[245,255,250],[255,192,203],[188,143,143],[255,250,205],
				[127,255,  0],[255,250,240],[255,228,196],[255,250,250],[255,255,255],[152,251,152],[238,232,170],[220,220,220],[216,191,216],[ 64,224,208],
				[248,248,255],[175,238,238],[240,255,240],[255,248,220],[245,222,179],[  0,255,  0],[240,248,255],[124,252,  0],[255,215,  0],[255,245,238],
				[230,230,250],[245,245,245],[173,216,230],[210,180,140],[253,245,230],[250,128,114],[ 32,178,170],[245,245,220],[255,140,  0],[  0,191,255],
				[ 50,205, 50],[255,235,205],[  0,250,154],[135,206,235],[250,240,230],[192,192,192],[154,205, 50],[250,235,215],[189,183,107],[255,105,180],
				[218,165, 32],[255,228,225],[255,222,173],[  0,255,127],[222,184,135],[255,165,  0],[238,130,238],[143,188,143],[244,164, 96],[  0,206,209],
				[255,127, 80],[ 60,179,113],[233,150,122],[ 72,209,204],[255, 99, 71],[100,149,237],[205,133, 63],[ 95,158,160],[219,112,147],[255,  0,255],
				[ 30,144,255],[184,134, 11],[255, 69,  0],[210,105, 30],[255, 20,147],[119,136,153],[147,112,219],[107,142, 35],[186, 85,211],[128,128,128],
				[205, 92, 92],[255,  0,  0],[112,128,144],[ 70,130,180],[  0,139,139],[123,104,238],[128,128,  0],[ 46,139, 87],[ 34,139, 34],[  0,128,128],
				[ 65,105,225],[220, 20, 60],[  0,128,  0],[106, 90,205],[199, 21,133],[105,105,105],[160, 82, 45],[153, 50,204],[ 85,107, 47],[138, 43,226],
				[148,  0,211],[178, 34, 34],[165, 42, 42],[139, 69, 19],[  0,100,  0],[139,  0,139],[  0,  0,255],[ 47, 79, 79],[ 72, 61,139],[128,  0,128],
				[139,  0,  0],[128,  0,  0],[  0,  0,205],[ 75,  0,130],[ 25, 25,112],[  0,  0,139],[  0,  0,128],[  0,  0,  0]
			]
			case "RGBSimple": return [
				[  0,  0,255],[  0,128,  0],[128,  0,  0],[255,165,  0],[238,130,238],[128,128,  0],[128,  0,128],[  0,139,139],[255,  0,  0],[128,128,128],
				[255,  0,255],[ 70,130,180],[154,205, 50],[250,128,114],[ 72, 61,139],[  0,  0,  0]
			]
			case "Hexa": return [ //Corresponding hexadecimal values
				"87CEFA","90EE90","FFB6C1","DDA0DD","F0E68C","D3D3D3","FFFFF0","E0FFFF","FFF0F5","7FFFD4","FFDAB9","B0E0E6","B0C4DE","FFA07A","A9A9A9","DA70D6","FFFFE0","FAFAD2","FFEFD5","ADFF2F",
				"FFFF00","00FFFF","FFE4B5","66CDAA","F0FFFF","F08080","F5FFFA","FFC0CB","BC8F8F","FFFACD","7FFF00","FFFAF0","FFE4C4","FFFAFA","FFFFFF","98FB98","EEE8AA","DCDCDC","D8BFD8","40E0D0",
				"F8F8FF","AFEEEE","F0FFF0","FFF8DC","F5DEB3","00FF00","F0F8FF","7CFC00","FFD700","FFF5EE","E6E6FA","F5F5F5","ADD8E6","D2B48C","FDF5E6","FA8072","20B2AA","F5F5DC","FF8C00","00BFFF",
				"32CD32","FFEBCD","00FA9A","87CEEB","FAF0E6","C0C0C0","9ACD32","FAEBD7","BDB76B","FF69B4","DAA520","FFE4E1","FFDEAD","00FF7F","DEB887","FFA500","EE82EE","8FBC8F","F4A460","00CED1",
				"FF7F50","3CB371","E9967A","48D1CC","FF6347","6495ED","CD853F","5F9EA0","DB7093","FF00FF","1E90FF","B8860B","FF4500","D2691E","FF1493","778899","9370DB","6B8E23","BA55D3","808080",
				"CD5C5C","FF0000","708090","4682B4","008B8B","7B68EE","808000","2E8B57","228B22","008080","4169E1","DC143C","008000","6A5ACD","C71585","696969","A0522D","9932CC","556B2F","8A2BE2",
				"9400D3","B22222","A52A2A","8B4513","006400","8B008B","0000FF","2F4F4F","483D8B","800080","8B0000","800000","0000CD","4B0082","191970","00008B","000080","000000"
			];
			case "HexaSimple": return [
				"0000FF","008000","800000","FFA500","EE82EE","808000","800080","008B8B","FF0000","808080","FF00FF","4682B4","9ACD32","FA8072","483D8B","000000"
			];
			case "Simple": return [ //Alternative array of 16 unique, css lvl3, shuffled basic colors
				"blue","green","maroon","orange","violet","olive","purple","darkcyan","red","gray","magenta","steelblue","yellowgreen","salmon","darkslateblue","black"
			];
			case "WellSourcesCountMap": return [
				"2D728F",
				"3B8EA5",
				"F5EE9E",
				"F49E4C",
				"AB3428",
			]
			case "boxColors":
			default:
				return boxColors
		}
	}
	static cutOff(I) { //The cutoff value to determine black/white font
		if(I && I.Luminescence) {return 0.17913} //Higher: black; Lower: white; this threshold ensures highest contrast ratios (min 4.58)
		return 109; //Indices 1 to 109 = black font, higher = white font
	}
	static fetch(i, type) { //Return the color corresponding to index i
		var source = this.list(type);
		var l = source.length;
		return source[i%l];
	}
	static fetchIndex(color, type) { //Return the index corresponding to the color name
		var source = this.list(type);
		return source.findIndex(function(c) {return c == color});
	}
	static fetchRGB(color, returnAsTxt) { //Return the rgb color corresponding to the color name provided. Specify in options the list and whether to return as an array of three numbers [R, G, B] or a css-compatible text string
		let source = this.list("boxColors");
		let index = this.fetchIndex(color);
		let out = source[index];
		if(returnAsTxt) {return "rgb(" + out[0] + "," + out[1] + "," + out[2] + ")"} //CSS-compatible string for rgb color
		else {return out} //Return the array
	}
	static font(name, type) { //Return the font color for the color name provided, within the desired list
		if(type !== undefined && type == "RGB_Unnamed") { //For colors without names (generic rgb)
			let rgb = name.match(/\d+/g); //Creates an array of RGB values out of the string
			let corr = rgb.map(function(v) { //Compute RGB to determine color luminance, see https://www.w3.org/TR/WCAG20/#relativeluminancedef
				let c = v/255;
				if(c <= 0.03928) {return c / 12.92}
				else {return Math.pow((c + 0.055) / 1.055, 2.4)}
			});
			let L = 0.2126 * corr[0] + 0.7152 * corr[1] + 0.0722 * corr[2];
			if(L < this.cutOff({Luminescence: true})) {return "white"}
			else {return "black"}
		}
		let source = this.list(type);
		let index = source.findIndex(function(c) {return (c == name)});
		if(index > -1) {
			let cut = this.cutOff();
			if(index < cut) {return "black"}
			else {return "white"}
		}
		else return "black"; //Default value if the color is not found in the list
	}
	static heatmap(c, min, max, colors) { //Return the heatmap color for the value c, normalized between min and max, following rgb color gradient given as 2d array [min[R, G, B], middle[R, G, B], max[R, G, B]]
		if(min == max) {return "rgb(" + colors[1][0] + ", " + colors[1][1] + ", " + colors[1][2] + ")"} //Only one value, return the middle color
		if(c <= min) {c = min}
		if(c >= max) {c = max}
		c = (c - min) / (max - min); //normalize value
		if(c == 0.5) {return "rgb(" + colors[1][0] + ", " + colors[1][1] + ", " + colors[1][2] + ")"} //Easy
		if(c < 0.5) { //First part of the gradient
			var r = colors[0][0] + (colors[1][0] - colors[0][0]) * 2 * c;
			var g = colors[0][1] + (colors[1][1] - colors[0][1]) * 2 * c;
			var b = colors[0][2] + (colors[1][2] - colors[0][2]) * 2 * c;
		}
		if(c > 0.5) { //Second part of the gradient
			var r = colors[1][0] + (colors[2][0] - colors[1][0]) * 2 * (c - 0.5);
			var g = colors[1][1] + (colors[2][1] - colors[1][1]) * 2 * (c - 0.5);
			var b = colors[1][2] + (colors[2][2] - colors[1][2]) * 2 * (c - 0.5);
		}
		return "rgb(" + Math.round(r) + ", " + Math.round(g) + ", " + Math.round(b) + ")";
	}
	static HMtemplates() { //Return an array of array of colors to be used as template for 3-coloured heatmaps
		return [ //Array of Low-Medium-High colors to use as templates
			["lightblue", "white", "tomato"],
			["blue", "white", "red"],
			["lightgreen", "khaki", "tomato"],
			["lightgreen", "white", "tomato"],
			["green", "black", "red"],
			["black", "yellow", "white"],
			["black", "blue", "white"],
		];
	}
}
