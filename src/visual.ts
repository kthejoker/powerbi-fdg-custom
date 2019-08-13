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
export interface Relationship {
    Source: string;
    Target: string;
    Level: string;
    TLevel: string;
    Kop: string;
}

//"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
import * as d3 from "d3";
import { Node } from './node';
import { Link } from './link';
//import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private g: d3.Selection<SVGElement, unknown, HTMLElement, any>;
    private margin = { top: 20, right: 20, bottom: 200, left: 70 };
    private dataView: DataView;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;
        /*
            this.updateCount = 0;
             if (typeof document !== "undefined") {
                const new_p: HTMLElement = document.createElement("p");
                new_p.appendChild(document.createTextNode("Update count:"));
                const new_em: HTMLElement = document.createElement("em");
                this.textNode = document.createTextNode(this.updateCount.toString());
                new_em.appendChild(this.textNode);
                new_p.appendChild(new_em);
                this.target.appendChild(new_p);
            }
    
            // get the data
    
            //------------------------------------------>> START Simple Test <<--------------------------------------------------
            var captionArea = document.createElement("div");
            captionArea.innerHTML = "This is a title test";
    
            options.element.appendChild(captionArea);
            this.target = document.createElement("div");
            options.element.appendChild(this.target);
    */
        /*var captionArea2 = document.createElement("div");
        captionArea2.innerHTML = "This is a title test2";
        options.element.appendChild(captionArea2);*/

        //------------------------------------------>> END Simple Test <<---------------------------------------------------

        //------------------------------------------>> START svg <<---------------------------------------------------------

        //Declarations

        var nodeName;
        var lvl;

        var m1fociY = 150; //M1
        var m2fociY = 250; //M2
        var m3fociY = 500; //M3
        var m4fociY = 650; //M4
        var m5fociY = 800; //M5

        //var d3: any;
        //var links: any;

        /*var captionArea2 = document.createElement("div");
        captionArea2.innerHTML = "This is a title test 2";
        options.element.appendChild(captionArea2);*/

        this.svg = d3.select(options.element)
            .append('svg')
            .attr("width", "100%").attr("height", '100%')
            .classed('svgClass', true);

        this.g = this.svg.append("g")
            .classed('gClass', true);

        /*
        #1 force simulated 
        */
        var width = 900,
            height = 800;


        /*
                       
                // Set the range
                var v = d3.scale.linear().range([0, 90]);
        
                // Scale the range of the data
                v.domain([0, d3.max(links, function (d) { return d.value; })]);
        
                // build the arrow.
                svg.append("svg:defs").selectAll("marker")
                    .data(["end"])      // Different link/path types can be defined here
                    .enter().append("svg:marker")    // This section adds in the arrows
                    .attr("id", String)
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 20)
                    .attr("refY", -1.5)
                    .attr("markerWidth", 9)
                    .attr("markerHeight", 9)
                    .attr("orient", "auto")
                    .append("svg:path")
                    .attr("d", "M0,-5L10,0L0,5");
        
                  
                    // add the curvy lines
                    function tick() {
                        path.attr("d", function (d) {
                            var dx = d.target.x - d.source.x,
                                dy = d.target.y - d.source.y,
                                dr = Math.sqrt(dx * dx + dy * dy);
                            return "M" +
                                d.source.x + "," +
                                d.source.y + "A" +
                                dr + "," + dr + " 0 0,1 " +
                                d.target.x + "," +
                                d.target.y;
                        });
        
                        node
                            .attr("transform", function (d) {
                                return "translate(" + d.x + "," + d.y + ")";
                            });
                    }
                           
                    */



        //------------------------------------------>> END svg <<---------------------------------------------------------
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);

        if (typeof this.textNode !== "undefined") {
            this.textNode.textContent = (this.updateCount++).toString();
        }

        //Clean the current visualization
        this.reset();

        //This example just shows: Custom Prop is Object
        //this.target.innerHTML = "Custom Prop is " + this.target;

        //set dataview
        this.dataView = options.dataViews[0];

        let links = Visual.converter(options);

        // var nodesa = [ {"name": "Chile"}, {"name": "khale@infusion.com"} ];
        //var nodesb = nodesa.map(x => new Node(x.name));

        var links2 = links.map(x => new Link(x.Source, x.Target, x.Kop));
        links2 = links2.filter(item => item.target["name"] != "null") ;
        links2 = links2.filter(item => item.target != "null") ;
        console.log('links2', links2);

        var sources3 = links.map(x => new Node( x.Source, x.Level ) );
       // var nodesm3 = sources3;
        var targets3 = links.map(x =>  new Node( x.Target, x.TLevel ));
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
        console.log('nodesm4', nodesm4);
var nodesm = nodesm5;
       // var nodesm = nodesm4.map(x => new Node(x["Source"], x["Level"]));
        console.log('nodesm', nodesm);

        // var sources = links.map(x => new Node (x.Source));
        // var targets = links.map(x => new Node (x.Target));
        //var nodesm = sources.concat(targets.filter(function (item) {
        //     return sources.indexOf(item) < 0;
        // }));


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
            .force('charge', d3.forceManyBody().strength(-350)
            .distanceMin(2).distanceMax(270))
            //.force("y",function(d){ if(d["name"].indexOf("M1") > -1){ return 30; }else{return 100;} })
            ;

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links2)
            .join("line")
            .attr("stroke-width", 3)
            .attr('stroke', function(d) { return d.color; });
            ;

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodesm)
            .join("circle")
            .attr("r", 12)
            .attr("fill", "red")
            //.attr("x",100)
            //.attr("cy", function (d) {
               // if (d.name.indexOf("M1") > -1) {
                //if (1 == 0) {
                 //   console.log('value', d3.select(this).attr("cy"), 'name', d.name);
               //     return 200;
                    // return Number(d3.select(this).attr("cy")) - 200;
               // }
               /*
                if (d.name.indexOf("M2") > -1) {
                    return 300;
                }
                if (d.name.indexOf("M3") > -1) {
                    return 400;
                }
                if (d.name.indexOf("M4") > -1) {
                    return 500;
                }
                if (d.name.indexOf("M5") > -1) {
                    return 600;
                }
                else {    
                    */                
              //      return d.y;//(d3.select(this).attr("cy"));
                //}
           // }
           // )

            ;

        //nodesm.forEach(function(d) { d.y = d.x * 5; });


        //Add tooltips in circles
        node.append("title")
            .text(d => d.name);
        console.log('node', node);

        //Add text box in circles
        var textg = svg.append("g");
        
        var text = textg.selectAll("text")
            .data(force.nodes())
            .enter().append("text")
            .attr("x", 10) //distance between the circle and the text
            .attr("y", ".31em") //".31em"
            .attr("dy", ".31em")
           // .attr("dy", d => d.y)
            .text(function (d) { return d.name; });

            textg.selectAll("text").call(wrap, 145);

        force.on("tick", () => {



            node
                .attr("cx", d => d.x) //d.x
                .attr("cy", d => d.y) //d.y
                /*.attr("fy",function(d){
                    if (d.name.indexOf("M2") > -1) {
                    //if (1 == 0) {
                     //   console.log('value', d3.select(this).attr("cy"), 'name', d.name);
                        return 100;
                        // return Number(d3.select(this).attr("cy")) - 200;
                    }
                    else {
                        return null;//(d3.select(this).attr("cy"));
                    }
                })*/

              /*  //Position of Circles according with levels M1 at the top
                .attr("cy", function (d) {
                    if (d.name.indexOf("M1") > -1) {
                    //if (1 == 0) {
                     //   console.log('value', d3.select(this).attr("cy"), 'name', d.name);
                        return 200;
                        // return Number(d3.select(this).attr("cy")) - 200;
                    }
                    if (d.name.indexOf("M2") > -1) {
                        return 300;
                    }
                    if (d.name.indexOf("M3") > -1) {
                        return 400;
                    }
                    if (d.name.indexOf("M4") > -1) {
                        return 500;
                    }
                    if (d.name.indexOf("M5") > -1) {
                        return 600;
                    }
                    else {
                        
                        return d.y;//(d3.select(this).attr("cy"));
                    }

                })*/

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
                   /* if (d.source["name"].indexOf("M2") > -1) {
                        return d.source['y'] - 200;
                    }
                    else {
                        return d.source['y'];
                    }*/
                  //  if (d.source["name"].indexOf("M1") > -1) {
                   //         return 200;
                   //     }
                      /*  if (d.source["name"].indexOf("M2") > -1) {
                            return 300;
                        }
                        if (d.source["name"].indexOf("M3") > -1) {
                            return 400;
                        }
                        if (d.source["name"].indexOf("M4") > -1) {
                            return 500;
                        }
                        if (d.source["name"].indexOf("M5") > -1) {
                            return 600;
                        }
                        else {
                            */
                            return d.source['y'];//(d3.select(this).attr("cy"));
                        //}

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
                   /* if (d.target["name"].indexOf("M2") > -1) {
                        return 300;
                    }
                    if (d.target["name"].indexOf("M3") > -1) {
                        return 400;
                    }
                    if (d.target["name"].indexOf("M4") > -1) {
                        return 500;
                    }
                    if (d.target["name"].indexOf("M5") > -1) {
                        return 600;
                    }
                    else {
                        */
                        return d.target['y'];//(d3.select(this).attr("cy"));
                   // }

                    
                });

            text
                .attr("transform", transform) //This is to add the labels in the circles
                //.call(wrap, 85);

               

        });

        function wrap(text, width) {
            text.each(function() {
                console.log('selector', d3.select(this));
              console.log('raw text', d3.select(this).text());
              console.log(d3.select(this).text().split(/\s+/));
              var text = d3.select(this),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line = [],
                  lineNumber = 0,
                  lineHeight = .45, // ems
                  y = text.attr("y"),
                  dy = parseFloat(text.attr("dy")), //; //,
                  tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                  console.log('word list', words);
                  
              while (word = words.pop()) {
                  console.log(word);
                line.push(word);
                tspan.text(line.join(" "));
                console.log('computed length', tspan.node().getComputedTextLength());
                if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  console.log('new dy', ++lineNumber * lineHeight + dy);
                  tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                  console.log(word);
                }
              }
             
            });
           
          }

        function transform(d) {

           /* if (d.name.indexOf("M1") > -1){
                return  "translate(" + d.x + "," + (Number(d.y) - 200).toString() + ")";
            }*/
            /*
            var y=0;

           // if (d.name.indexOf("M1") > -1) {
           //     y = 200;
           // }
            if (d.name.indexOf("M2") > -1) {
                y = 300;
            }
            if (d.name.indexOf("M3") > -1) {
                y = 400;
            }
            if (d.name.indexOf("M4") > -1) {
                y = 500;
            }
            if (d.name.indexOf("M5") > -1) {
                y = 600;
            }*/
            //else {
            //    y= d.y;//(d3.select(this).attr("cy"));
            //}

           // return "translate(" + d.x + "," + y + ")";

            return "translate(" + d.x + "," + d.y + ")";
        }


        /* 
             links.forEach(function (link) {
     
                 count = count + 20;
         
                 g.append("text").text(link.Source)
                     .attr("x", 50)
                     .attr("y", count)
                     .attr("font-size", "24px")
                     .attr("fill", "black");
                 
                 // add the links and the arrows
                 var path = svg.append("svg:g").selectAll("path")
                 .data(links2)
                 .enter().append("svg:path")
                 //.attr("class", function (d) { return "link " + d.type; })
                 .attr("marker-end", "url(#end)");
     
                 // define the nodes
                 var node = svg.selectAll(".node")
                 .data(force.nodes())
                 .enter().append("g")
                 .attr("class", "node")
                 ;
     
                 // add the nodes
                 node.append("circle")
                     .attr("r",25);
     
                 //node.append("text").text(function (d) { return d.source });
     
                
     
                 /*
     
                                 .attr("class", function (d) {
                                     if (d.name.indexOf("M1") > -1) {
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
                                 })
                                 .attr("r", function (d) {
                                     if (d.name.indexOf("M1") > -1) {
                                         return 25;
                                     }
                                     else if (d.name.indexOf("M2") > -1) {
                                         return 20;
                                     }
                                     else if (d.name.indexOf("M3") > -1) {
                                         return 15;
                                     }
                                     else if (d.name.indexOf("M4") > -1) {
                                         return 12;
                                     }
                                     else if (d.name.indexOf("M5") > -1) {
                                         return 8;
                                     }
                                     else return 15;
                                 })
                                 .attr("y", function (d) {
                                     var newY;
                                     if (d.name.indexOf("M1") > -1) {
                                         newY = m1fociY;
                                     }
                                     else if (d.name.indexOf("M2") > -1) {
                                         newY = m2fociY;
                                     }
                                     else if (d.name.indexOf("M3") > -1) {
                                         newY = m3fociY;
                                     }
                                     else if (d.name.indexOf("M4") > -1) {
                                         newY = m4fociY;
                                     }
                                     else if (d.name.indexOf("M5") > -1) {
                                         newY = m5fociY;
                                     }
                                     else {
                                         newY = m5fociY;
                                     }
                                     return newY;
                                 })
                                 .style("fill",
                                     function (d) {
                                         return color(d.name);
                                     }
                                 );
                             // add the text
                             node.append("text")
                                 .attr("class", function (d) {
                                     if (d.name.indexOf("M1") > -1) {
                                         return "m1-text-title";
                                     }
                                     else if (d.name.indexOf("M2") > -1) {
                                         return "m2-text-title";
                                     }
                                     else if (d.name.indexOf("M3") > -1) {
                                         return "m3-text-title";
                                     }
                                     else if (d.name.indexOf("M4") > -1) {
                                         return "m4-text-title";
                                     }
                                     else if (d.name.indexOf("M5") > -1) {
                                         return "m5-text-title";
                                     }
                                     else {
                                         return "m3-text-title";
                                     }
                                 })
                                 .attr("x", function (d) {
                                     if (d.name.indexOf("M1") > -1) {
                                         return 40;
                                     }
                                     else if (d.name.indexOf("M2") > -1) {
                                         return 35;
                                     }
                                     else if (d.name.indexOf("M3") > -1) {
                                         return 25;
                                     }
                                     else if (d.name.indexOf("M4") > -1) {
                                         return 20;
                                     }
                                     else if (d.name.indexOf("M5") > -1) {
                                         return 15;
                                     }
                                     else return 15;
                                 })
                                 .attr("dy", function (d) {
                                     if (d.name.indexOf("M1") > -1) {
                                         return "1.0em";
                                     }
                                     else if (d.name.indexOf("M2") > -1) {
                                         return ".85em";
                                     }
                                     else if (d.name.indexOf("M3") > -1) {
                                         return ".75em";
                                     }
                                     else if (d.name.indexOf("M4") > -1) {
                                         return ".70em";
                                     }
                                     else if (d.name.indexOf("M5") > -1) {
                                         return ".65em";
                                     }
                                     else return ".65em";
                                 })
                                 .text(function (d) { return d.name })
                 
                 //
                 
                 
     
                 console.log('link.Source',link.Source);
     
     
             });
     */

      /*  this.g.append("text").text("static test name")
            .attr("x", 50)
            .attr("y", 150)
            .attr("font-size", "24px")
            .attr("fill", "black");*/

        //this.g.append("classed")
    }

    private reset(): void {
        if (this.svg.empty()) {
            return;
        }
        this.svg
            .selectAll("*")
            .remove();
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    public static converter(options: VisualUpdateOptions): Relationship[] {

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
        )
            return resultData;

        let rows = options.dataViews[0].categorical.categories[0].values;
        let cols = options.dataViews[0].categorical.categories[1].values;
        let levels = options.dataViews[0].categorical.categories[2].values;
        let tlevels = options.dataViews[0].categorical.categories[3].values;
        let kops = options.dataViews[0].categorical.categories[4].values;
        //debugger;
        //let rows = options.dataViews[0].table.rows;

        console.log('rows', rows);
        console.log('cols', cols);
        console.log('levels', levels);

        //convert from ['x', y] to [{"x":x, "y": y}]
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            //console.log(cols[i].toString());
            resultData.push({
                Source: row.toString(),
                Target: String(cols[i]),
                Level: levels[i].toString(),
                TLevel: String(tlevels[i]),
                Kop: String(kops[i])
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