var canvas;
var gl; // A global variable for the WebGL context

var shaderProgram;

var floorVBO;
var floorIBO;

var gridVBO;
var gridIBO;

var mouseDown;
var lastMouseX;
var lastMouseY;

var angle = 31.0;


function start() {
    canvas = document.getElementById("glcanvas");

    // Initialize the GL context
    gl = initWebGL(canvas);

    // Only continue if WebGL is available and working
    if (!gl) {
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    // Near things obscure far things
    gl.depthFunc(gl.LEQUAL);
    // Clear the color as well as the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    initShaders();

    initFloorBuffers();
    initGridBuffers();

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    setInterval(drawScene, 15);
}

function initFloorBuffers() {
    var vertices = [
        // Front face
            -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0,
        1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0
    ];

    var indices = [
        0,1,2, 0,2,3
    ];

    floorVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    floorIBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,floorIBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),gl.STATIC_DRAW);
}

function initGridBuffers() {

    var vertices = [

            -0.9, 0.35, 0, //A 0
            -0.35, 0.35, 0, //B 1
            -0.35, 0.9, 0, //C 2
            -0.31, 0.9, 0, //D 3
            -0.31, 0.35, 0, //E 4
        0.31, 0.35, 0, //F 5
        0.31, 0.9, 0, //G 6
        0.35, 0.9, 0, //H 7
        0.35, 0.35, 0, //I 8
        0.9, 0.35, 0, //J 9
        0.9, 0.31, 0, //K 10
        0.35, 0.31, 0, //L 11
        0.35, -0.31, 0, //M 12
        0.9, -0.31, 0, //N 13
        0.9, -0.35, 0, //O 14
        0.35, -0.35, 0, //P 15
        0.35, -0.9, 0, //Q 16
        0.31, -0.9, 0, //R 17
        0.31, -0.35, 0, //S 18
            -0.31, -0.35, 0, //T 19
            -0.31, -0.9, 0, //U 20
            -0.35, -0.9, 0, //V 21
            -0.35, -0.35, 0, //W 22
            -0.9, -0.35, 0, //X 23
            -0.9, -0.31, 0, //Y 24
            -0.35, -0.31, 0, //Z 25
            -0.35, +0.31, 0, //AA 26
            -0.9, +0.31, 0, //AB 27
            -0.31, 0.31, 0, //AC 28
        0.31, 0.31, 0, //AD 29
        0.31, -0.31, 0, //AE 30
            -0.31, -0.31, 0 //AF 31

    ];

    var indices = [

        0,1,26,  //A B AA
        0,26,27, //A AA AB
        2,3,4, //C D E
        2,4,1, //C E B
        6,7,8, //  G H I
        6,8,5, // G I F
        8,10,11, // I K L
        8,9,10,// I J K
        12,14,15, //M O P
        12,13,14,//M N O
        18,17,16, //S R Q
        15,16,18, //P Q S
        22,20,21,//W U V
        19,20,22, //T U W
        24,22,23, //Y W X
        24,25,22,//Y Z W
        1,4,31, //B E AF
        1,19,22,//B T W
        4,5,29,//E F AD
        4,29,28,//E AD AC
        5,8,12,//F I M
        5,15,18,//F P S
        31,30,18, //AF AE S
        31,18,19,//AF S T
    ];

    gridVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gridVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gridIBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gridIBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),gl.STATIC_DRAW);
}


function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER);

    perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

    loadIdentity();
    mvTranslate([-0.0, 0.0, -6.0]);
    //mvRotate(angle, [0, 0, 1]);

    drawFloor();
    drawGrid();
}

function drawFloor() {
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVBO);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIBO);

    setMatrixUniforms();
    setColourUniform([1,0,0,1]);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function drawGrid() {
    gl.bindBuffer(gl.ARRAY_BUFFER, gridVBO);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gridIBO);

    setColourUniform([1,1,1,0.5]);

    gl.drawElements(gl.TRIANGLES, 72, gl.UNSIGNED_SHORT, 0);

}

function initWebGL(canvas) {
    gl = null;

    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }

    return gl;
}

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Create the shader program

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shader));
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
}

function getShader(gl, id, type) {
    var shaderScript, theSource, currentChild, shader;

    shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    theSource = shaderScript.text;

    if (!type) {
        if (shaderScript.type == "x-shader/x-fragment") {
            type = gl.FRAGMENT_SHADER;
        } else if (shaderScript.type == "x-shader/x-vertex") {
            type = gl.VERTEX_SHADER;
        } else {
            // Unknown shader type
            return null;
        }
    }
    shader = gl.createShader(type);

    gl.shaderSource(shader, theSource);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }

    var newX = event.clientX;
    var newY = event.clientY;

    angle += (newX - lastMouseX) / 10.0;

}

//
// Matrix utility functions
//

function loadIdentity() {
    mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
    multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

function setColourUniform(colour) {
    var uniformColour = gl.getUniformLocation(shaderProgram, "uColour");
    gl.uniform4fv(uniformColour, colour);
}

function mvPushMatrix(m) {
    if (m) {
        mvMatrixStack.push(m.dup());
        mvMatrix = m.dup();
    } else {
        mvMatrixStack.push(mvMatrix.dup());
    }
}

function mvPopMatrix() {
    if (!mvMatrixStack.length) {
        throw("Can't pop from an empty matrix stack.");
    }

    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
}

function mvRotate(angle, v) {
    var inRadians = angle * Math.PI / 180.0;

    var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
}
