function VDGraph(attr, parent){
   var vorGraph = this;
   this.graph;
   this.vorpoints = [];
   this.attr = { axis: true, grid: true, showNavigation: false, showCopyright: false };
   var shiftPress = 0;
   Object.assign(this.attr, attr);

   this.domEl = document.createElement('div');
   this.domEl.style = "display: flex; \
                       flex:1;\
                       justify-content: space-evenly;\
                       align-items: stretch;\
                       flex-direction: row";

    if (parent)
        parent.appendChild(this.domEl);
    else
        document.body.appendChild(this.domEl);

    var vordiv = document.createElement('div');
    vordiv.style.flex= "1";
    this.domEl.appendChild(vordiv);
    this.graph = new Graph({interactionType: "pointGraph" },vordiv);

    this.graph.board.on('down', (e) => checkMouse(e));
    
    checkMouse = function(event){
       var coords = vorGraph.graph.getMouseCoords(event);
       if(event.button == 0){
         var point = vorGraph.graph.createPoint(coords, attr);
         point.jxgPoint.on('down',(event)=>{
           if(event.button==2){
               vorGraph.graph.removePoint(point);
           }

         });
         vorGraph.graph.addPoint(point);
        }
    }



}



//VDGraph.prototype.graph.board.on('down',(event)=>{console.log("b")});