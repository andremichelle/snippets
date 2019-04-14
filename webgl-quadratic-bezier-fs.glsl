precision mediump float;

varying float s;
varying float t;
varying float d;

uniform float offset;
uniform sampler2D u_texture;

void main() {
    float pi = 3.1415927;
    float halfThickness = 25.0;// must be the same in both shaders
    float textureWidth = 2048.0;
    float textureHeight = 128.0;
    float z = -2.0 * asin(s) / pi;
    vec2 uv = vec2(d * textureHeight / (textureWidth * halfThickness * 2.0) - offset, acos(-s) / pi);
    vec3 tex = texture2D(u_texture, uv).rgb;
    vec3 rainbow = vec3(0.5 + 0.25 * sin((t) * 2.0 * pi), 0.5 + 0.25 * sin((t + 1.0 / 3.0) * 2.0 * pi), 0.5 + 0.25 * sin((t + 2.0 / 3.0) * 2.0 * pi));
    float gradient = 1.0 - abs(s) * 0.5;
    gl_FragColor = vec4(rainbow * gradient + tex, 1.0);
}