// Check browser Comapatibity for webgl
export class InitializeWebgl{
    constructor(canvas=document.querySelector("canvas")){
        this.lib=canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    get gl(){
        return this.Compatibility();
    }
    Compatibility(){
        if(!this.lib){
            console.error("WebGL not supported by the browser...")
            const RESPOSE=confirm("WebGL ❌ , Click Ok to verify that you have webGL ")
            if(RESPOSE)
                window.location.replace("https://get.webgl.org/")
            else{
                alert("WebGL is not working...")
            }
            return null;
        }
        return this.lib;
    }
}