attribute vec2 p0;
attribute vec2 p1;
attribute vec2 p2;
attribute vec2 tt; // [t, side]
uniform mat4 matrix;
varying float s;// -1 ... 1 (v-coord)
varying float t;//  0 ... 1 (bezier-parameter)
varying float d;//  0 ... curve-length (in pixels)

vec2 lerp(vec2 p0, vec2 p1, float t) {
    return (1.0 - t) * p0 + t * p1;
}

vec2 getPoint(vec2 p0, vec2 p1, vec2 p2, float t) {
    return (1.0 - t) * (1.0 - t) * p0 + 2.0 * t * (1.0 - t) * p1 + t * t * p2;
}

vec2 getDerivative(vec2 p0, vec2 p1, vec2 p2, float t) {
    return t * (p0 - 2.0 * p1 + p2) - p0 + p1;
}

vec2 getNormal(vec2 p0, vec2 p1, vec2 p2, float t) {
    vec2 d = getDerivative(p0, p1, p2, t);
    return vec2(-d.y, d.x);
}

float getLength(vec2 p0, vec2 p1, vec2 p2) {
    vec2 a = p0 - 2.0 * p1 + p2;
    vec2 b = 2.0 * p1 - 2.0 * p0;
    float A = 4.0 * dot(a, a);
    float B = 4.0 * dot(a, b);
    float C = dot(b, b);
    float Sabc = 2.0 * sqrt(A + B + C);
    float A_2 = sqrt(A);
    float A_32 = 2.0 * A * A_2;
    float C_2 = 2.0 * sqrt(C);
    float BA = B / A_2;
    return (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4.0 * C * A - B * B) * log((2.0 * A_2 + BA + Sabc) / (BA + C_2))) / (4.0 * A_32);
}

float getDistance(vec2 p0, vec2 p1, vec2 p2, float t) {
    if (t == 0.0) return 0.0;
    vec2 w1 = lerp(lerp(p0, p1, 0.0), lerp(p1, p2, 0.0), t);
    vec2 w2 = getPoint(p0, p1, p2, t);
    return getLength(p0, w1, w2);
}

void main() {
    float halfThickness = 30.0;// must be the same in both shaders
    t = tt.x;
    s = tt.y;
    d = getDistance(p0, p1, p2, tt.x);
    vec2 xy = getPoint(p0, p1, p2, tt.x) + normalize(getNormal(p0, p1, p2, tt.x)) * halfThickness * tt.y;
    gl_Position = matrix * vec4(xy, 0.0, 1.0);
}