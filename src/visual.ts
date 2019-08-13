/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/


//"use strict";


import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost; 
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import ISelectionManager = powerbi.extensibility.ISelectionManager; 
import ISelectionId = powerbi.extensibility.ISelectionId;
import ISelectionIdBuilder = powerbi.extensibility.ISelectionIdBuilder;

export interface Relationship {
    Source: string;
    Target: string;
    Level: string;
    TLevel: string;
    SFunction: string;
    TFunction: string;
    Kop: string;
    selectionId: ISelectionId;
    isBranch: string;
}

import { VisualSettings } from "./settings";
import * as d3 from "d3";
//import Selection = d3.Selection;
import { Node } from './node';
import { Link } from './link';
import { hostname } from "os";
//import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private host: IVisualHost;
    private svg: d3.Selection<SVGSVGElement, any, HTMLElement, any>;
    private g: d3.Selection<SVGElement, any, HTMLElement, any>;
    private margin = { top: 20, right: 20, bottom: 20, left: 20 };
    private dataView: DataView;

    private curvatureOfLinks: number = 0.5;
    private selectionManager: ISelectionManager;
    private selectionIdBuilder: ISelectionIdBuilder;

    private getUniqueValues(value, index, self) {
        return self.indexOf(value) === index;
    }

   // private root: Selection<any, any, any, any>;

    private static ClassName: string = "slbrelationship"; 

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;

       this.host = options.host;
        this.selectionIdBuilder = options.host.createSelectionIdBuilder();
        this.selectionManager = options.host.createSelectionManager();
        
        this.svg = d3.select(options.element)
            .append('svg')
            .attr("width", "100%").attr("height", '100%')
            //.attr("viewBox", [0, 0, 800, 800])
            .classed(Visual.ClassName, true);
console.log('running');

     

        this.g = this.svg.append("g")
            .classed('gClass', true);
            //.call(d3.behavior.zoom().on("zoom", function () {
           //     this.svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
           //   }));

           this.svg.call(d3.zoom()
           .extent([[0, 0], [600, 600]])
           .scaleExtent([.5, 8])
           .on("zoom", zoomed));

   let g =this.g;
   
           function zoomed() {
            const {transform} = d3.event;
            console.log('zooming ...');
            console.log('transform',  d3.event.transform);
            //g.attr("transform", d => `translate(${transform.apply(d)})`);
            g.attr("transform", d3.event.transform);
          }

    }

    public update(options: VisualUpdateOptions) {
        this.settings =Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);

        //Clean the current visualization
        this.reset();

        //set dataview
        this.dataView = options.dataViews[0];

        let links = Visual.converter(options, this.host);


        var links2 = links.filter(i => i.Target != "null").map(x => new Link(x.Source, x.Target, x.Kop));
      //  links2 = links2.filter(item => item.target["name"] != "null") ;
      //  links2 = links2.filter(item => item.target != "null") ;
        console.log('links2', links2);

        var sources3 = links.map(x => new Node( x.Source, x.Level, x.selectionId, x.isBranch, x.SFunction) );
       // var nodesm3 = sources3;
        var targets3 = links.map(x =>  new Node( x.Target, x.TLevel, x.selectionId, x.isBranch, x.TFunction));
       var nodesm3 = sources3.concat(targets3.filter(function (item) {
            return !sources3.some(function (f) {
                return f.name === item.name && f.lvl === item.lvl;
            });
        }));

        var nodesm5 = nodesm3.filter((n,index) => {
            return index === nodesm3.findIndex(obj => {
              return n.name === obj.name && n.lvl === obj.lvl;
            });
          });

          nodesm5 = nodesm5.filter(item => item.name != "null");

        var nodesm4 = Array.from(new Set(nodesm3));
        //console.log('nodesm4', nodesm4);
var nodesm = nodesm5;
       // var nodesm = nodesm4.map(x => new Node(x["Source"], x["Level"]));
        //console.log('nodesm', nodesm);

/*
        function getSvgPath(link: Link): string {
            let x0: number,
                x1: number,
                xi: (t: number) => number,
                x2: number,
                x3: number,
                y0: number,
                y1: number;

            if (link.target.x < link.source.x) {
                x0 = link.source.x;
                x1 = link.target.x;// + link.target.width;
            } else {
                x0 = link.source.x;// + link.source.width;
                x1 = link.target.x;
            }

            xi = d3.interpolateNumber(x0, x1);
            x2 = xi(this.curvatureOfLinks);
            x3 = xi(1 - this.curvatureOfLinks);
            y0 = link.source.y; //+ link.source.dy + link.height / SankeyDiagram.MiddleFactor;
            y1 = link.target.y; //+ link.dyDestination //+ link.height / SankeyDiagram.MiddleFactor;

            return `M ${x0} ${y0} C ${x2} ${y0}, ${x3} ${y1}, ${x1} ${y1}`;
        } */

        // console.log('nodes b',nodesb);
        var g = this.g;
        var svg = this.svg;
        var count = 0;
        var force = d3.forceSimulation(nodesm)
            .force('link', d3.forceLink(links2)
               // .distance(200) //Distance between circles
                .id(d => d['name'])
            )
            .force("center", d3.forceCenter(parseInt(svg.style("width")) / 2, parseInt(svg.style("height")) / 2))
            .force('charge', d3.forceManyBody().strength(() => {return -20000 / Math.log(nodesm.length) ;})
            .distanceMin(2).distanceMax(270))
            //.force("y",function(d){ if(d["name"].indexOf("M1") > -1){ return 30; }else{return 100;} })
            .stop();
            ;

        const link = g
            //.attr("stroke", "#999")
            .attr("stroke-opacity", 0.5)
            .selectAll("line")
            .data(links2)
            .join("line")
            .attr("stroke-width", 2.5)
            .attr('stroke', function(d) { return d.color; });
            ;

            link.append("title").text( function(d) { return d.kop;});

           /* const linkpath = svg.append("g")
            .attr("stroke-opacity", 1)
            .selectAll("line")
            .data(links2)
            .join("line")
            .attr("stroke-width", 3)
            .attr('stroke', function(d) { return d.color; });
            ;
*/




const kopList = Array.from(new Set(links2)).map(k => k.kop);
        console.log('KOP List', kopList);

       //Get unique values
        var KOPLegend = kopList.filter(this.getUniqueValues);
        console.log('KOPLegend', KOPLegend);

        //Color List
        var kopColors = {
            "Logistics Management": "red",
            "Investment and Project Management": "blue",
            "Procure to Pay": "orange",
            "Financial Accounting to Reporting": "green",
            "Inventory Management and Distribution": "yellow",
            "Supply Planning": "cyan",
            "M&S Management and Distribution": "black",
            "Warehouse Management": "blue",
            "Source to Contract": "red",
            "Sales Planning": "brown",
            "Workforce Development and Engagement": "tan",
            "Workforce Planning and Productivity": "darkblue",
            "Asset Maintenance and Sustaining": "lightblue",
            "Asset Management": "darkgreen",
            "Operational Financial Planning": "lightgreen",
            "Product and Service Delivery": "#9cc",
            "Integrity Management": "#999",
            "Integration Project Management": "#66f"
        };

        // Add legend step 1 : adding legend variable
        var funcColors = {
            "FIN": "red",
            "IM": "blue",
            "SUP": "orange",
            "OPRM": "green",
            "SP": "yellow",
            "PSD": "cyan",
            "TLM": "black",
            "REM": "blue",
            "FDE": "red",
            "HR": "brown"};

            var businessWorkflows = {
                "FDE": "#8dbe50",
                "FIN": "#ffc426",
                "HR": "#ffc426",
                "IM": "#d9d9d9",
                "IT": "#038d7f",
                "OPRM": "#8177b7",
                "PSD": "#f68720",
                "REM": "#038d7f",
                "SP": "#039fc2",
                "SUP": "#ffc426",
                "TLM": "#038d7f",
                "null": "#999"
            };
    



            link.append("title").text( function(d) { return d.kop;}); 

            let selectionManager = this.selectionManager;
        const node  = g         
            .selectAll("circle")
            .data(nodesm)

            .join("circle")
            .attr("stroke", d => d.isBranch ? "#9ff5d6" : "#fff")
            .attr("stroke-width", d => d.isBranch ? 3 : 1.5)
            .attr("r", d => d.r(nodesm.length))
            .attr("fill", d => d.isBranch ? "#fff" : businessWorkflows[d.func] )
            .on('click', function(d) {
                
               console.log('click!');
               console.log('selecting', d.selectionId);
               selectionManager.select(d.selectionId);
               
           
               (<Event>d3.event).stopPropagation();
           });
            ;



        //nodesm.forEach(function(d) { d.y = d.x * 5; });


        //Add tooltips in circles
        node.append("title")
            .text(d => d.name + " " + d.func);
        console.log('node', node);

        //Add text box in circles
        var textg = g.append("g");
        var textg2 = g.append("g");
        
        var text = textg.selectAll("text")
            .data(force.nodes())
            .enter().append("text")
            .attr("font-size", function(d) { if ( force.nodes.length > 50 ) {return "8px"}; 
            if (force.nodes.length > 20 ) { return "10px"}
            if (force.nodes.length > 7 ) { return "12px"}
            return "14px";
        })
            .attr("dx", 0 ) // d => d.r(-1) *-1 ) //distance between the circle and the text
            .attr("y", 0) //".31em"
            .attr("dy", d => d.r(-1) + 10)
                     
           // .attr("dy", d => d.y)
            .text(function (d) { return d.name; });


            var text2 = textg2.selectAll("text")
            .data(force.nodes())
            .enter().append("text")
            .attr("font-size", function(d) { if ( force.nodes.length > 50 ) {return "8px"}; 
            if (force.nodes.length > 20 ) { return "10px"}
            if (force.nodes.length > 7 ) { return "12px"}
            return "14px";
        })
            .attr("dx",-7 ) // d => d.r(-1) *-1 ) //distance between the circle and the text
            .attr("y", 0) //".31em"
            .attr("dy", 4)
                     
           // .attr("dy", d => d.y)
            .text(function (d) { return "12"; });

            textg.selectAll("text").call(wrap, 200);

            force.tick(300);

        //force.on("tick", () => {



            node
                .attr("cx", d => d.x) //d.x
                .attr("cy", d => d.y) //d.y
         

                .attr("class", function (d) {
                    if (d.name.indexOf("M1") > -1) {
                        //console.log('test nodes M1');
                        return "circle-m1";
                    }
                    else if (d.name.indexOf("M2") > -1) {
                        return "circle-m2";
                    }
                    else if (d.name.indexOf("M3") > -1) {
                        return "circle-m3";
                    }
                    else if (d.name.indexOf("M4") > -1) {
                        return "circle-m4";
                    }
                    else if (d.name.indexOf("M5") > -1) {
                        return "circle-m5";
                    }
                    else return "circle-m5";

                });
            link
                .attr("x1", function (d) { if (d.source['x']) return d.source['x']; })
                //.attr("y1", d => d.source['y'])
                .attr("x2", d => d.target['x'])
                //.attr("y2", d => d.target['y'])

                .attr("y1", function (d) {
                            return d.source['y'];//(d3.select(this).attr("cy"));

                })

                .attr("y2", function (d) {
                   /* if (d.target["name"].indexOf("M2") > -1) {
                        return d.target['y'] - 200;
                    }
                    else {
                        return d.target['y'];
                    }*/
                   // if (d.target["name"].indexOf("M1") > -1) {
                  //      return 200;
                  //  }
                 
                        return d.target['y'];//(d3.select(this).attr("cy"));
                   // }

                    
                });

            text
                .attr("transform", transform) //This is to add the labels in the circles
                text2
                .attr("transform", transform)
                //.call(wrap, 85);

               
               // g.attr("transform","scale(0.2)")

console.log('bbox',(g.node() as SVGSVGElement).getBBox());
        //});

        var legend = svg.append("g")
           
            //.attr("x", w - 65)
            //.attr("y", 50)
            .attr("height", 100)
            .attr("width", 100)
            .classed("legend", true)
            .attr('transform', 'translate(5,5)'); //Position of legend

            var legendrect = legend.append("rect").attr("height", 100)
            .attr("width", 100).attr("fill", "white").attr("stroke", "#333").attr("stroke-width", .2);

            var legendrectg = svg.append("g").attr("class", "legend").attr("height", 100)
            .attr("width", 100).attr('transform', 'translate(10, 10)');

            
        // Add legend step 2: adding icon identifier
        legendrectg.selectAll('rect')
        
            .data(KOPLegend)
            .enter()
            .append("rect")
            .attr("x", 0) //w - 65
            .attr("y", function (d, i) { return i * 14; })
            .attr("width", 20)
            .attr("height", 5)
            .style("fill", function (d) {
                var color = kopColors[KOPLegend[(KOPLegend.indexOf(d))].toString()];
                return color;
            })
            ;
        // Add legend step 3: adding text label
        legendrectg.selectAll('text')
            .data(KOPLegend)
            .enter()
            .append("text")
            //.append("text").text(function (d) { return d.kop; })
            .attr("x", 25) //w - 52
            .attr("font-size", "10px")
            .attr("y", function (d, i) { return i * 14 + 7; })
            .text(function (d) {
                var text = KOPLegend[(KOPLegend.indexOf(d))];
                return text;
            });

            legendrect.attr("width", legendrectg.node().getBBox().width + 10);
            legendrect.attr("height", legendrectg.node().getBBox().height + 10);
            //legendrect.attr("dx", legendrectg.node().getBBox().left -5);
            //legendrect.attr("dy", legendrectg.node().getBBox().top -5);

        //END KOP Legend


        function wrap(text, width2) {
            text.each(function() {
                var width = (parseFloat(d3.select(this).attr("dy")) - 10 )*2.5;
            
              var text = d3.select(this),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line = [],
                  lineNumber = 0,
                  lineHeight = parseInt(text.attr("font-size")), // ems
                  dx = text.attr("dx"),
                  y = "0px", // text.attr("y"),
                  dy = parseFloat(text.attr("dy")), //; //,
                  tspan = text.text(null).append("tspan").attr("text-anchor","middle").attr("x",0).attr("dx", dx).attr("y", y).attr("dy", dy + "px");
                 
              while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = text.append("tspan").attr("dx", dx).attr("text-anchor","middle").attr("x",0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "px").text(word);
                }
              }
             
            });
           
          }

        function transform(d) {
            return "translate(" + d.x + "," + d.y + ")";
        }

     
    }

    private reset(): void {
        if (this.g.empty()) {
            return;
        }
        this.g
            .selectAll("*")
            .remove();

            this.svg.selectAll(".legend").remove();
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    public static converter(options: VisualUpdateOptions, host: IVisualHost): Relationship[] {

        let resultData: Relationship[] = [];
console.log('converting');
        console.log('dataviews', options.dataViews[0]);
        if (!options.dataViews[0]
            || !options.dataViews[0]
            || !options.dataViews[0].categorical
            || !options.dataViews[0].categorical.categories
            || !options.dataViews[0].categorical.categories[0].source
            || !options.dataViews[0].categorical.categories[1].source
            || !options.dataViews[0].categorical.categories[2].source
            || !options.dataViews[0].categorical.categories[3].source
            || !options.dataViews[0].categorical.categories[4].source
            || !options.dataViews[0].categorical.categories[5].source
            || !options.dataViews[0].categorical.categories[6].source
            || !options.dataViews[0].categorical.categories[7].source
        )
            return resultData;

        let rows = options.dataViews[0].categorical.categories[0].values;
        let cols = options.dataViews[0].categorical.categories[1].values;
        let levels = options.dataViews[0].categorical.categories[2].values;
        let tlevels = options.dataViews[0].categorical.categories[3].values;
        let kops = options.dataViews[0].categorical.categories[4].values;
        let branches = options.dataViews[0].categorical.categories[5].values;
        let sfuncs = options.dataViews[0].categorical.categories[6].values;
        let tfuncs = options.dataViews[0].categorical.categories[7].values;

        //debugger;

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];

            console.log(branches[i]);
            console.log(  row.toString() );
            console.log(branches[i] == row.toString());

            //console.log(cols[i].toString());
            resultData.push({
                Source: row.toString(),
                Target: String(cols[i]),
                Level: levels[i].toString(),
                TLevel: String(tlevels[i]),
                Kop: String(kops[i]),
                isBranch: String(branches[i]),
                SFunction: String(sfuncs[i]),
                TFunction : String(tfuncs[i]),
                selectionId:  host.createSelectionIdBuilder()
                .withCategory(options.dataViews[0].categorical.categories[0], i)
                .createSelectionId()
            });
        }
        console.log('resultData ', resultData);
        return resultData;

    }


    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}