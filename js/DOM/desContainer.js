function desContainer(img,text,parent){
    
    this.domEl = document.createElement('div');
    this.domEl.style.display = "flex";

    parent.appendChild(this.domEl);

    var div_icon = document.createElement('div');
    div_icon.style.display = "block";
    div_icon.style.width = "20px";
    div_icon.style.height = "20px";
    //div_icon.style.backgroundColor = "red";
    div_icon.style.backgroundImage = "url('../icon/"+img+"')";
    div_icon.style.backgroundRepeat = "no-repeat";
    div_icon.style.backgroundSize = "50%,50%";
    div_icon.style.backgroundPosition = "center";


    var div_text = document.createElement('div');
    div_text.style.display = "block";
    div_text.style.width = "250px";
    div_text.style.fontFamily = "Serif";
    div_text.style.fontSize = "15px";
    div_text.style.textAlign = "left";
    div_text.appendChild(document.createTextNode(text));

    this.domEl.appendChild(div_icon);
    this.domEl.appendChild(div_text);
}