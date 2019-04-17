precision mediump float;

varying float s; // across [-1,1]
varying float t; // bezier distance on curve [0,1]
varying float d; // linear distance on curve

uniform float time;
uniform sampler2D u_texture;

void main() {
    float pi = 3.1415927;
    float halfThickness = 30.0;// must be the same in both shaders
    float textureWidth = 2048.0;
    float textureHeight = 128.0;
    float z = -2.0 * asin(s) / pi;
    vec2 uv = vec2(d * textureHeight / (textureWidth * halfThickness * 4.0) + time * 2.0, acos(-s) / pi - time * 5.0);
    vec3 tex = texture2D(u_texture, uv).rgb;
    float nz = sqrt(1.0 - s * s);
    gl_FragColor = vec4(nz * tex, 1.0);
}