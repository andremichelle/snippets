attribute vec2 xy;
uniform mat4 matrix;

void main() {
    gl_Position = matrix * vec4(xy, 0.0, 1.0);
}