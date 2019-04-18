const orthogonal = (floats, width, height) => {
    floats[0] = 2.0 / width;
    floats[1] = 0.0;
    floats[2] = 0.0;
    floats[3] = 0.0;
    floats[4] = 0.0;
    floats[5] = 2.0 / -height;
    floats[6] = 0.0;
    floats[7] = 0.0;
    floats[8] = 0.0;
    floats[9] = 0.0;
    floats[10] = -1.0;
    floats[11] = 0.0;
    floats[12] = -1.0;
    floats[13] = 1.0;
    floats[14] = -1.0;
    floats[15] = 1.0;
    return floats;
};

const matrix = new Float32Array(16);
const buffer = new Float32Array(0xFFF);

const createShader = (gl, source, type) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (0 === gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error();
    }
    return shader;
};

const start = (vertexSrc, fragmentSrc) => {
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl2", {preserveDrawingBuffer: true});
    if (null === gl || undefined === gl) {
        alert("Your browser does not support WebGL2 :(");
        return;
    }
    let vs, fs, program, glBuffer, xyLocation, matrixLocation;
    const createContext = () => {
        vs = createShader(gl, vertexSrc, gl.VERTEX_SHADER);
        fs = createShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);
        program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.bindAttribLocation(program, 0, "xy");
        gl.linkProgram(program);
        gl.detachShader(program, vs);
        gl.detachShader(program, fs);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        glBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW, 0, buffer.length);
        xyLocation = gl.getAttribLocation(program, "xy");
        matrixLocation = gl.getUniformLocation(program, "matrix");
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
    };
    createContext();
    const WEBGL_lose_context = gl.getExtension('WEBGL_lose_context');
    canvas.addEventListener("webglcontextlost", function (e) {
        console.log("context lost");
        e.preventDefault();
    }, false);

    canvas.addEventListener("webglcontextrestored", function () {
        console.log("context restored");
        createContext();
    }, false);
    const button = document.querySelector("button");
    button.textContent = "Lose Context";
    button.onclick = () => {
        let contextLost = gl.isContextLost();
        if (contextLost) {
            WEBGL_lose_context.restoreContext();
            button.textContent = "Lose Context";
        } else {
            WEBGL_lose_context.loseContext();
            button.textContent = "Restore Context";
        }
    };

    let time = 0;
    const enterFrame = () => {
        if (gl.isContextLost()) {
            window.requestAnimationFrame(enterFrame);
            return;
        }
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        const cx = width / 2 + Math.sin(time) * 64.0;
        const cy = height / 2;
        let p = 0;
        buffer[p++] = cx - 32;
        buffer[p++] = cy - 32;
        buffer[p++] = cx + 32;
        buffer[p++] = cy - 32;
        buffer[p++] = cx - 32;
        buffer[p++] = cy + 32;
        buffer[p++] = cx + 32;
        buffer[p++] = cy + 32;
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, buffer);
        gl.vertexAttribPointer(xyLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(xyLocation);
        gl.uniformMatrix4fv(matrixLocation, false, orthogonal(matrix, width, height));
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        window.requestAnimationFrame(enterFrame);
        time += 0.1;
    };
    window.requestAnimationFrame(enterFrame);
};
Promise.all([
    fetch("vs.glsl"),
    fetch("fs.glsl")
]).then(resources => {
    return Promise.all([
        resources[0].text(),
        resources[1].text()
    ]);
}).then(sources => {
    start(sources[0], sources[1]);
});