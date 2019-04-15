class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

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

const start = (vertexSrc, fragmentSrc) => {
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl2", {preserveDrawingBuffer: true});
    if (null === gl || undefined === gl) {
        alert("Your browser does not support WebGL2 :(");
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    const createShader = (source, type) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (0 === gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error();
        }
        return shader;
    };
    const vs = createShader(vertexSrc, gl.VERTEX_SHADER);
    const fs = createShader(fragmentSrc, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, "p0");
    gl.bindAttribLocation(program, 1, "p1");
    gl.bindAttribLocation(program, 2, "p2");
    gl.bindAttribLocation(program, 3, "tt");
    gl.linkProgram(program);
    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    const matrix = new Float32Array(16);
    const buffer = new Float32Array(0xFFF);
    const glBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW, 0, buffer.length);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // Best quality
    const p0Location = gl.getAttribLocation(program, "p0");
    const p1Location = gl.getAttribLocation(program, "p1");
    const p2Location = gl.getAttribLocation(program, "p2");
    const tLocation = gl.getAttribLocation(program, "tt");
    const matrixLocation = gl.getUniformLocation(program, "matrix");
    const textureLocation = gl.getUniformLocation(program, "u_texture");
    const timeLocation = gl.getUniformLocation(program, "time");
    const w = window.innerWidth;
    const h = window.innerHeight;
    const p0 = new Point(w * 0.1, h * 0.1);
    const p1 = new Point(w * 0.9, h * 0.1);
    const p2 = new Point(w * 0.9, h * 0.9);
    const spanA = document.querySelector("span#A");
    const spanB = document.querySelector("span#B");
    const spanC = document.querySelector("span#C");
    let time = 0;
    const enterFrame = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        let p = 0;
        const n = 100;
        for (let i = 0; i < n; i++) {
            const t = i / (n - 1);
            // left wing
            buffer[p++] = p0.x;
            buffer[p++] = p0.y;
            buffer[p++] = p1.x;
            buffer[p++] = p1.y;
            buffer[p++] = p2.x;
            buffer[p++] = p2.y;
            buffer[p++] = t;
            buffer[p++] = -1.0;
            // right wing
            buffer[p++] = p0.x;
            buffer[p++] = p0.y;
            buffer[p++] = p1.x;
            buffer[p++] = p1.y;
            buffer[p++] = p2.x;
            buffer[p++] = p2.y;
            buffer[p++] = t;
            buffer[p++] = 1.0;
        }
        gl.uniform1i(textureLocation, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, buffer);
        gl.vertexAttribPointer(p0Location, 2, gl.FLOAT, false, 32, 0);
        gl.enableVertexAttribArray(p0Location);
        gl.vertexAttribPointer(p1Location, 2, gl.FLOAT, false, 32, 8);
        gl.enableVertexAttribArray(p1Location);
        gl.vertexAttribPointer(p2Location, 2, gl.FLOAT, false, 32, 16);
        gl.enableVertexAttribArray(p2Location);
        gl.vertexAttribPointer(tLocation, 2, gl.FLOAT, false, 32, 24);
        gl.enableVertexAttribArray(tLocation);
        gl.uniformMatrix4fv(matrixLocation, false, orthogonal(matrix, width, height));
        gl.uniform1f(timeLocation, time);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, p / 8);

        spanA.style.transform = "translate(" + p0.x + "px, " + p0.y + "px)";
        spanB.style.transform = "translate(" + p1.x + "px, " + p1.y + "px)";
        spanC.style.transform = "translate(" + p2.x + "px, " + p2.y + "px)";
        window.requestAnimationFrame(enterFrame);
        time += 0.001;
    };
    const makeDraggable = (points, radius) => {
        const find = (x, y) => {
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                const dx = point.x - x;
                const dy = point.y - y;
                if (Math.sqrt(dx * dx + dy * dy) < radius) {
                    return point;
                }
            }
            return null;
        };
        canvas.onmousedown = event => {
            const mx = event.clientX;
            const my = event.clientY;
            const pt = find(mx, my);
            if (null == pt) {
                return;
            }
            const px = pt.x;
            const py = pt.y;
            const mouseMoveListener = event => {
                pt.x = px + (event.clientX - mx);
                pt.y = py + (event.clientY - my);
            };
            window.addEventListener("mousemove", mouseMoveListener);
            window.addEventListener("mouseup", () => window.removeEventListener("mousemove", mouseMoveListener));
        };
    };
    makeDraggable([p0, p1, p2], 10.0);
    const image = new Image();
    image.src = "texture.png";
    image.addEventListener('load', function () {
        console.log("texture-size", image.width, image.height);
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        enterFrame();
    });
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