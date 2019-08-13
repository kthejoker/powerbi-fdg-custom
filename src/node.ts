import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.extensibility.ISelectionId;
import { selection } from "d3";

export class Node implements d3.SimulationNodeDatum {
    // optional - defining optional implementation properties - required for relevant typing assistance
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
  
    name: string;
    lvl: string;
    linkCount: number = 0;
    selectionId: ISelectionId;
    isBranch: boolean;

      constructor(name, lvl, selectionId, branch) {
      this.name = name;
      this.lvl = lvl;
      this.selectionId = selectionId;
      this.isBranch = branch == name;
      var rnd = Math.random() * 60 - 30;

      var fixedvertical = 0;

      if (fixedvertical) {

      if (this.lvl == "M1") {
        this.fy = 30;
      }

      if (this.lvl == "M2") {
        this.fy = 150 + rnd;
      }

      if (this.lvl == "M3") {
        this.fy = 270 + rnd;
      }

      if (this.lvl == "M4") {
        this.fy = 390 + rnd;
      }

      if (this.lvl == "M5") {
        this.fy = 510 + rnd;
      }

    }
    }
  
   // constructor(name, lvl) {
     /*
    constructor(name) {
      this.name = name;
      this.lvl = this.name.substring(0,2);
      if (this.lvl == "M1") {
        this.fy = 100;
      }

      if (this.lvl == "M2") {
        this.fy = 200;
      }

      if (this.lvl == "M3") {
        this.fy = 300;
      }

      if (this.lvl == "M4") {
        this.fy = 400;
      }

      if (this.lvl == "M5") {
        this.fy = 500;
      }
    }
    */
  
    normal = () => {
    //  return Math.sqrt(this.linkCount / APP_CONFIG.N);
    return 2;
    }
  
    public r(scale) {
return 50 *  1 / Math.log(scale);
    }
  
    get fontSize() {
      return (30 * this.normal() + 10) + 'px';
    }
  
    get color() {
      //let index = Math.floor(APP_CONFIG.SPECTRUM.length * this.normal());
     // return APP_CONFIG.SPECTRUM[index];
     return "red";
    }
  }