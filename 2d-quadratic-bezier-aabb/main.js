class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Bounds {
    constructor(xMin, xMax, yMin, yMax) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
    }
}

const bezierAABB = (p0, p1, p2) => {
    const x0 = p0.x;
    const y0 = p0.y;
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    let t;
    let xMin, xMax, yMin, yMax;
    if (x0 > x2) {
        if (x1 > x2) {
            xMin = x2;
        } else {
            t = -(x1 - x0) / (x2 - 2 * x1 + x0);
            xMin = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2;
        }
    } else {
        if (x1 > x0) {
            xMin = x0;
        } else {
            t = -(x1 - x0) / (x2 - 2 * x1 + x0);
            xMin = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2;
        }
    }
    if (x0 > x2) {
        if (x1 < x0) {
            xMax = x0;
        } else {
            t = -(x1 - x0) / (x2 - 2 * x1 + x0);
            xMax = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2;
        }
    } else {
        if (x1 < x2) {
            xMax = x2;
        } else {
            t = -(x1 - x0) / (x2 - 2 * x1 + x0);
            xMax = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2;
        }
    }
    if (y0 > y2) {
        if (y1 > y2) {
            yMin = y2;
        } else {
            t = -(y1 - y0) / (y2 - 2 * y1 + y0);
            yMin = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2;
        }
    } else {
        if (y1 > y0) {
            yMin = y0;
        } else {
            t = -(y1 - y0) / (y2 - 2 * y1 + y0);
            yMin = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2;
        }
    }
    if (y0 > y2) {
        if (y1 < y0) {
            yMax = y0;
        } else {
            t = -(y1 - y0) / (y2 - 2 * y1 + y0);
            yMax = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2;
        }
    } else {
        if (y2 > y1) {
            yMax = y2;
        } else {
            t = -(y1 - y0) / (y2 - 2 * y1 + y0);
            yMax = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2;
        }
    }
    return new Bounds(xMin, xMax, yMin, yMax);
};

(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const points = [new Point(w * 0.1, h * 0.1), new Point(w * 0.9, h * 0.1), new Point(w * 0.5, h * 0.9)];
    const update = () => {
        document.querySelectorAll("circle")
            .forEach((handler, index) => {
                handler.cx.baseVal.value = points[index].x;
                handler.cy.baseVal.value = points[index].y;
            });
        const p0 = points[0];
        const p1 = points[1];
        const p2 = points[2];
        document.querySelector("path")
            .setAttribute("d", "M" + p0.x + "," + p0.y + "Q" + p1.x + "," + p1.y + "," + p2.x + "," + p2.y + "");
        const bounds = bezierAABB(p0, p1, p2);
        const rectElement = document.querySelector("rect");
        rectElement.x.baseVal.value = bounds.xMin;
        rectElement.y.baseVal.value = bounds.yMin;
        rectElement.width.baseVal.value = bounds.xMax - bounds.xMin;
        rectElement.height.baseVal.value = bounds.yMax - bounds.yMin;
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
        window.onmousedown = event => {
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
                update();
            };
            window.addEventListener("mousemove", mouseMoveListener);
            window.addEventListener("mouseup", () => window.removeEventListener("mousemove", mouseMoveListener));
        };
    };
    makeDraggable(points, 10.0);
    update();
})();