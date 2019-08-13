import { Node } from './node';
import * as d3 from "d3";

export class Link implements d3.SimulationLinkDatum<Node> {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;

  // must - defining enforced implementation properties
  source: Node;
  target: Node;
  kop: string;



  constructor(source, target, kop) {
    this.source = source;
    this.target = target;
    this.kop = kop;
   
  }

   get color() {
      //let index = Math.floor(APP_CONFIG.SPECTRUM.length * this.normal());
     // return APP_CONFIG.SPECTRUM[index];


var kopColors = {
"Logistics Management" : "red",
"Investment and Project Management": "blue",
"Procure to Pay" : "orange",
"Financial Accounting to Reporting" : "green",
"Inventory Management and Distribution" : "yellow",
"Supply Planning": "cyan",
"M&S Management and Distribution" : "black",
"Warehouse Management" : "blue",
"Source to Contract" : "red",
"Sales Planning" : "brown",
"Workforce Development and Engagement" : "tan",
"Workforce Planning and Productivity" : "darkblue",
"Asset Maintenance and Sustaining" : "lightblue",
"Asset Management" : "darkgreen",
"Operational Financial Planning" : "lightgreen",
"Product and Service Delivery" : "#9cc",
"Integrity Management" : "#999",
"Integration Project Management" : "#66f"

};

     return kopColors[this.kop];
    }
}