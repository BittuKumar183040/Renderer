// import { InitializeWebgl } from "./package/InitializeWebgl";
// main method should be async because it fetching data from api...

// const JsonLoader=async(loc)=>{
//     var obj="initial";
//     await fetch(loc)
//      .then(res => res.json())
//      .then(data => {
//         obj=data
//      })
//      .catch((error)=>{
//         console.error(error + "data not found");
//         return null;
//      })
//     return obj;
// }
class InitializeWebgl{
    constructor(canvas=document.querySelector("canvas")){
        this.lib=canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    get gl(){
        return this.Compatibility();
    }
    get canvas(){
        return this.canvas
    }
    Compatibility(){
        if(!this.lib){
            console.error("WebGL not supported by the browser...")
            const RESPOSE=confirm("WebGL ❌ , Click Ok to verify that you have webGL Supported Browser")
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
// Build the plot Data as the class components which used to draw shapes....
class PlotData{
    #vertCode=
        'attribute vec3 coordinate;'+
        'void main(void)'+
        '{'+
        'gl_Position = vec4(coordinate, 1.0);'+
        'gl_PointSize = 5.0;' +
        '}';
    #fragCode=
        'precision highp float;'+
        'uniform vec4 color;'+
        'void main(void)'+
        '{'+
            'gl_FragColor=color;'+
        '}';
    constructor(gl,vertices, vertColor=[[0,0,0,1]]){
        this.gl=gl;
        this.vertices=vertices;
        this.vertColor=vertColor;
        this.vertBuffer=gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
    }

    createShader=(type, source)=>{
        var shader=this.gl.createShader(type);
        this.gl.shaderSource((shader), source);
        this.gl.compileShader(shader)
        if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
            return shader;
        }
        console.log(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
    }

    createProgram=(vertexShader, fragmentShader)=>{
        var program=this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
            return program;
        }
        console.log(this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
    }

    // build a program using vertics and fragment shader
    Program(){
        var vertShader=this.createShader(this.gl.VERTEX_SHADER, this.#vertCode);
        var fragShader=this.createShader(this.gl.FRAGMENT_SHADER,this.#fragCode);
        var shaderProgram=this.createProgram(vertShader, fragShader);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer)
        this.gl.useProgram(shaderProgram)
        
        // setting the value for vector 4 color variable in fragCode

        var fragColor=this.gl.getUniformLocation(shaderProgram, "color")
        this.gl.uniform4fv(fragColor, this.vertColor)

        // setting the coordinate variable in vertCode
        var coord = this.gl.getAttribLocation(shaderProgram, "coordinate");
        this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray((coord))
    }
    Draw(point=true, edge=true, poligon=true){
        this.Program()
        this.gl.enable(this.gl.DEPTH_TEST);
        if(point)
            this.gl.drawArrays(this.gl.POINTS, 0, this.vertices.length/2);
        if(edge)
            this.gl.drawArrays(this.gl.LINES, 0, this.vertices.length/2);
        if(poligon)
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length/3);
    }
    // DrawPoint(size=5.0){
    //     this.Program()
    // }
}

class ViewportEvents {
    constructor(canvas){
        this.canvas=canvas
    }
    getTransformMatrix() {
        const translation = [100, 100];
        const rotation = Math.PI / 4;
        const scaling = [2, 2];
        
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        
        const matrix = [
            scaling[0] * cos, scaling[1] * -sin, 0,
            scaling[0] * sin, scaling[1] * cos, 0,
            translation[0], translation[1], 1
        ];
        return matrix;
    } 
    transformPoint(point, matrix) {
        const x = point[0] * matrix[0] + point[1] * matrix[3] + matrix[6];
        const y = point[0] * matrix[1] + point[1] * matrix[4] + matrix[7];
        return [x, y];
    }
      
    checkPoint(){
            this.canvas.addEventListener('mousedown', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const transformMatrix = this.getTransformMatrix();
            const transformedPoint = this.transformPoint([x, y], transformMatrix);
            console.log(transformedPoint)
            const ray = getRay(transformedPoint);
            const intersection = getIntersection(ray);
            if (intersection) {
              // do something with the intersection, e.g. highlight the point or display a tooltip
            }
          });
    }

}


// ------------------------------------------
const Scene=(gl, canvas, data)=>{
    // console.log(data)
    const OFFSET=30;
    canvas.width=window.innerWidth - OFFSET;
    canvas.height=window.innerHeight - OFFSET;
    gl.viewport(0, 0, canvas.width, canvas.height);

    data.scene.map((data,idx)=>{
            const plotter=new PlotData(gl,data.cord, data.color)
            plotter.Draw(true,true,true)
     })
     const event=new ViewportEvents(canvas);
     event.checkPoint();

}

const main=()=>{
    const canvas=document.querySelector("#mycanvas");
    const inputElement=document.querySelector("#data");

    const load=new InitializeWebgl(canvas);
    const gl=load.gl;

    if(localStorage.getItem("data")){
        Scene(gl,canvas,JSON.parse(localStorage.getItem("data")))
    }

    


    // const data=await JsonLoader("./mesh.json");
    inputElement.addEventListener("change",function () {
        if (this.files && this.files[0]) {
            var myFile = this.files[0];
            let ignore = myFile.name===localStorage.getItem("name") &&
                        myFile.size+''===localStorage.getItem("size") 
            ? true : false
            if(!ignore){
                var reader = new FileReader();
                reader.readAsBinaryString(myFile);
                reader.addEventListener('load',function (e) {
                    localStorage.setItem('name',myFile.name)
                    localStorage.setItem('size',myFile.size)
                    localStorage.setItem('data',e.target.result)
                    Scene(gl,canvas,JSON.parse(e.target.result))
                    return ;
                });
            }
            else{
                Scene(gl,canvas,JSON.parse(localStorage.getItem("data")))
            }
        
        }
    
    });
}
main();