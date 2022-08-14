# SnapToJsClipper

This is a [Snap.svg](http://snapsvg.io) plugin providing an interface to
the [Javascript clipper](https://sourceforge.net/projects/jsclipper/) library.

# Dependencies

This plugin has only one explicit dependency: [Javascript clipper](https://sourceforge.net/projects/jsclipper/). It has
been developed and tested with version `5.0.2.1` (download
it [here](https://sourceforge.net/projects/jsclipper/files/Javascript_Clipper_5.0.2.1.zip/download)) and is _not_
compatible with version `6.0.x.y` yet!

Note that `Javascript clipper` uses `Snap.svg`'s predecessor `Raphael` internally; in order to increase performance and
to reduce reduncancy, one could think of re-writing `Javascript clipper` using `Snap.svg` only.

## Usage

This plugin extends the API of each `Snap.Element` with the functions `unionClip()`, `intersectClip()`
, `differenceClip()` and `xorClip()`. The input parameter for all functions is another `Snap.Element` which may or may
not have a nested structure.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>Javascript Demo for snapToClipper Snap Plugin</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/1.2.1/lodash.min.js"></script>
    <script src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53148/snap.svg-min.js"></script>
    <script src="path/to/clipper.js"></script>
    <script src="path/to/snapToClipper.js"></script>
</head>
<body>
<!-- some svg content -->
<script>
    var subj = Snap('#subj-id'),
        clip = Snap('#clip-id');

    var unionClipPath = subj.unionClip(clip);
    var intersectClipPath = subj.intersectClip(clip);
    var differenceClipPath = subj.differenceClip(clip);
    var xorClipPath = subj.xorClip(clip);
    
    /* output to screen via Snap.path() call (cf. below) */
</script>
</body>
</html>
```

**Note:** Except for the `Xor` clip, the roles of `subj` and `clip` are interchangeable.

## Example

**Disclaimer:** SVG files in this example are taken
from [https://freesvg.org/black-cat-cut-file](https://freesvg.org/black-cat-cut-file)
and [https://freesvg.org/penguin-silhouette-monochrome-art](https://freesvg.org/penguin-silhouette-monochrome-art).

### Input

![](img/input.svg)

### Union

```js
Snap.path(subj.unionClip(clip));
```

![](img/union.svg)

### Intersect

```js
Snap.path(subj.intersect(clip));
```

![](img/intersect.svg)

### Difference `cat - penguin`

```js
Snap.path(subj.differenceClip(clip));
```

![](img/difference_c-p.svg)

### Difference `penguin - cat`

```js
Snap.path(clip.differenceClip(subj));
```

![](img/difference_p-c.svg)

### Xor

```js
Snap.path(subj.xorClip(clip));
```

![](img/xor.svg)
