Snap.plugin( function( Snap, Element, Paper, global ) {
    function makeClip(ss, cc, sss, clipType) {
        var clipper = new ClipperLib.Clipper(),
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

        // Must simplify before offsetting, to get offsetting right in certain cases.
        // Other operations (boolean ones) doesn't need this.
        // This is needed when offsetting polygons that have self-intersecting parts ( eg. 5-point star needs this )
        simplify = false;
        if (simplify) {
            // Simplifying is only needed when offsetting original polys, because results of boolean operations are already simplified.
            // Note! if clip polygon is the same as subject polygon then it seems that simplifying is needed also for result of boolean operation (ie. solution).
            if (offsettablePoly === 'subject') {
                offsetResult = clipper.SimplifyPolygons(offsetResult, subj.fillType);
            }
            if (offsettablePoly === 'clip') {
                offsetResult = clipper.SimplifyPolygons(offsetResult, clip.fillType);
            }
            if (offsettablePoly === 'solution') {
                offsetResult = clipper.SimplifyPolygons(offsetResult, clip.fillType);
                if (subj.fillType !== clip.fillType) {
                    console.log('Subject filltype and Clip filltype are different. We used Clip filltype in SimplifyPolygons().');
                }
            }
        }

        // Actual offset operation
        if (delta) {
            clipper.Clear();
            var paramDelta = _.round(delta, 3);
            var paramMiterLimit = _.round(miterLimit, 3);
            offsetResult = clipper.OffsetPolygons(offsetResult, paramDelta, joinType, paramMiterLimit, autoFix);
        }
        return offsetResult;
    }

    function getClipperPolygons(el) {
        /*
        read all 'path' element from a Snap.Element and create ClipperPolygons from each path's 'd' attribute
        */
        var polygons = [];
        el.selectAll('path').forEach(p => {
            polygons.push(SVGPathToClipperPolygons(p.attr('d')));
        });
        polygons = polygons.flat();

        return polygons;
    }

    function SVGPathToClipperPolygons(d) {
        var arr = Snap.parsePathString(d.trim()); // parse str to array
        arr = Snap.path.toAbsolute(arr);          // mahvstcsqz -> uppercase
        var str = _.flatten(arr).join(' '),
            paths = str.replace(/M/g, '|M').split('|'),
            polygons = [],
            polygon;

        paths.filter(path => path.trim() !== '').forEach(path => {
            arr = Snap.parsePathString(path.trim());
            arr.forEach(a => {
                a[0] = a[0].toUpperCase();
            });
            polygon = [];
            var x = 0,
                y = 0,
                pt = {},
                subPathStart = {x: '', y: ''};
            arr.filter(a => a[0] === 'M' || a[0] === 'L' || a[0] === 'Z').forEach(a => {
                var char = a[0];
                if (char !== 'Z') {
                    for (var j = 1; j < a.length; j = j + 2) {
                        if (char === 'V') y = a[j];
                        else if (char === 'H') x = a[j];
                        else {
                            x = a[j];
                            y = a[j + 1];
                        }
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
        var path = '',
            i, j, d;
        for (i = 0; i < poly.length; i++) {
            d = '';
            for (j = 0; j < poly[i].length; j++) {
                if (j === 0) {
                    d += 'M';
                } else {
                    d += 'L';
                }
                d += (poly[i][j].X) + ', ' + (poly[i][j].Y);
            }
            d += 'Z';
            path += d;
        }
        if (path.trim() === 'Z') path = '';

        return path;
    }

    Element.prototype.getAllPaths = function() {
        return clipperPolygonsToSVGPath(this.getClipperPolygons());
    };
    Element.prototype.getClipperPolygons = function() {
        return getClipperPolygons(this);
    };

    Element.prototype.intersectClip = function(clip) {
        return clipperPolygonsToSVGPath(makeClip(getClipperPolygons(this), getClipperPolygons(clip), [[]], 0));
    }
    Element.prototype.unionClip = function(clip) {
        return clipperPolygonsToSVGPath(makeClip(getClipperPolygons(this), getClipperPolygons(clip), [[]], 1));
    };
    Element.prototype.differenceClip = function(clip) {
        return clipperPolygonsToSVGPath(makeClip(getClipperPolygons(this), getClipperPolygons(clip), [[]], 2));
    };
    Element.prototype.xorClip = function(clip) {
        return clipperPolygonsToSVGPath(makeClip(getClipperPolygons(this), getClipperPolygons(clip), [[]], 3));
    }
});
