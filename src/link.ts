import { Node } from './node';
import * as d3 from "d3";

export class Link implements d3.SimulationLinkDatum<Node> {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;

  // must - defining enforced implementation properties
  source: Node | string | number;
  target: Node | string | number;
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
"Product and Service Delivery" : "grey",
"Integrity Management" : "lightgrey",
"Integration Project Management" : "silver"

};

     return kopColors[this.kop];
    }
}