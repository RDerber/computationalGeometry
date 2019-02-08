function VDGraph(attr, parent){
   var vorGraph = this;
   this.graph;
   this.vorpoints = [];
   this.attr = { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false };
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




    


}