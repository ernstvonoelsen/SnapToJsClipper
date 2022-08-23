/*
 * Copyright 2022 ernst von OelsenTNG Technology Consulting GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Snap.plugin(function (Snap, Element, Paper, global) {
    function makeClip(ss, cc, sss, clipType) {
        let clipper = new ClipperLib.Clipper(),
            offsetResult = new ClipperLib.Polygons(),
            subj = {fillType: 1},
            clip = {fillType: 1},
            delta = null,
            miterLimit = 2.0,
            joinType = 0;

        clipper.Clear();
        clipper.AddPolygons(ss, ClipperLib.PolyType.ptSubject);
        clipper.AddPolygons(cc, ClipperLib.PolyType.ptClip);
        clipper.Execute(clipType, offsetResult, subj.fillType, clip.fillType);

        // Actual offset operation
        if (delta) {
            clipper.Clear();
            const paramDelta = _.round(delta, 3);
            const paramMiterLimit = _.round(miterLimit, 3);
            offsetResult = clipper.OffsetPolygons(offsetResult, paramDelta, joinType, paramMiterLimit, autoFix);
        }
        return offsetResult;
    }

    function getClipperPolygons(el) {
        /*
        read all 'path' element from a Snap.Element and create ClipperPolygons from each path's 'd' attribute
        */
        let polygons = [];
        el.selectAll('path').forEach(p => {
            polygons.push(SVGPathToClipperPolygons(p.attr('d')));
        });
        polygons = polygons.flat();

        return polygons;
    }

    function SVGPathToClipperPolygons(d) {
        let arr = Snap.parsePathString(d.trim());
        arr = Snap.path.toAbsolute(arr);

        let str = _.flatten(arr).join(' '),
            paths = str.replace(/M/g, '|M').split('|'),
            polygons = [];

        paths.filter(path => path.trim() !== '').forEach(path => {
            arr = Snap.parsePathString(path.trim());

            let x = 0,
                y = 0,
                pt = {},
                subPathStart = {x: '', y: ''},
                polygon = [];

            arr.filter(a => a[0] === 'M' || a[0] === 'L' || a[0] === 'Z').forEach(a => {
                const char = a[0];
                if (char !== 'Z') {
                    x = a[1];
                    y = a[2];
                    pt = {
                        X: null,
                        Y: null
                    };
                    if (typeof x !== 'undefined' && !isNaN(Number(x))) pt.X = Number(x);
                    if (typeof y !== 'undefined' && !isNaN(Number(y))) pt.Y = Number(y);
                    if (pt.X !== null && pt.Y !== null) {
                        polygon.push(pt);
                    } else {
                        return false;
                    }
                }
                if ((char !== 'Z' && subPathStart.x === '') || char === 'M') {
                    subPathStart.x = x;
                    subPathStart.y = y;
                }
                if (char === 'Z') {
                    x = subPathStart.x;
                    y = subPathStart.y;
                }
            });
            polygons.push(polygon);
        });

        return polygons;
    }

    function clipperPolygonsToSVGPath(poly) {
        /*
        convert ClipperPolygons to SVG Path strings
         */
        let path = '', d;
        poly.forEach(p => {
            d = 'M' + (p[0].X) + ', ' + (p[0].Y);
            p.slice(1, p.length + 1).forEach(c => {
                d += 'L' + (c.X) + ', ' + (c.Y);
            });
            d += 'Z';
            path += d;
        });
        if (path.trim() === 'Z') path = '';

        return path;
    }

    Element.prototype.getAllPaths = function () {
        return clipperPolygonsToSVGPath(this.getClipperPolygons());
    };
    Element.prototype.getClipperPolygons = function () {
        return getClipperPolygons(this);
    };

    Element.prototype.intersectClip = function (clip) {
        return clipperPolygonsToSVGPath(makeClip(getClipperPolygons(this), getClipperPolygons(clip), [[]], 0));
    }
    Element.prototype.unionClip = function (clip) {
        return clipperPolygonsToSVGPath(makeClip(getClipperPolygons(this), getClipperPolygons(clip), [[]], 1));
    };
    Element.prototype.differenceClip = function (clip) {
        return clipperPolygonsToSVGPath(makeClip(getClipperPolygons(this), getClipperPolygons(clip), [[]], 2));
    };
    Element.prototype.xorClip = function (clip) {
        return clipperPolygonsToSVGPath(makeClip(getClipperPolygons(this), getClipperPolygons(clip), [[]], 3));
    }
});
