((_) => {
  let then = 0,
    scenel,
    sphere,
    angle = 0;

  let s = Math.sqrt;
  let z = Math.sin;

  let context = c.getContext("2d");

  let imageData = context.getImageData(0, 0, 256, 256);
  let pixels = imageData.data;

  let sub = ({ x, y, z }, { x: u, y: v, z: w }) => ({
    x: x - u,
    y: y - v,
    z: z - w,
  });
  let dot = ({ x, y, z }, { x: u, y: v, z: w }) => x * u + y * v + z * w;
  let scale = ({ x, y, z }, t) => ({ x: x * t, y: y * t, z: z * t });
  let norm = (v) => scale(v, 1 / s(dot(v, v)));
  let clamp = (t) => (t < 0 ? 0 : t);

  let intersect = (sp, o, d) => {
    let otc = sub(sp, o);
    let v = dot(otc, d);
    let t = sp.r - dot(otc, otc) + v * v;
    return (
      t < 0 ? { t } : (t = v - s(t)),
      (h = sub(o, scale(d, -t))),
      {
        t,
        h,
        n: sub(h, sp),
        id: sp.r,
      }
    );
  };

  let draw = (ts) => {
    sphere = {
      x: z(angle + 1.5),
      y: -0.75 + z(angle),
      z: 5,
      r: 1,
    };

    scenel = scale(
      {
        x: z(angle * 2 + 1.5),
        y: -1,
        z: z(angle * 2),
      },
      9
    );

    for (y = 256; y--; ) {
      for (x = 256; x--; ) {
        let index = (x + y * 256) * 4;
        c = scale(
          trace(
            {
              x: 0,
              y: 0,
              z: 0,
            },
            norm({
              x: x / 128 - 1,
              y: y / 128 - 1,
              z: 1,
            })
          ),
          0.5 + 0.5 * (z(x / 85) * z(y / 85))
        );
        pixels[index] = c.x;
        pixels[index + 1] = c.y;
        pixels[index + 2] = c.z;
        pixels[index + 3] = 255;
      }
    }
    context.putImageData(imageData, 0, 0);

    angle += (ts - then) * 1e-3;

    then = ts;
    requestAnimationFrame(draw);
  };

  let compare2 = (a, b) => (a.t < 0 ? b : b.t < 0 ? a : a.t <= b.t ? a : b);

  let trace = (origin, direction) => {
    let hit = intersect(sphere, origin, direction);
    for (i = 9; i--; )
      hit = compare2(
        hit,
        intersect(
          {
            x: -4 + (i % 3) * 4,
            y: 4 + z(angle + (i % 3) + i / 3),
            z: 4 + (i / 3) * 4,
            r: 5,
          },
          origin,
          direction
        )
      );

    if (hit.t > 0) {
      let { h, n } = hit;
      let dirRay = norm(sub(scenel, h));
      let { t } = intersect(sphere, h, dirRay);
      t = t < -1 ? 1 : t < 0 ? 0.2 + 0.8 * -t : 0.2;

      if (t < 1) {
        let lightVector = norm(sub(scenel, sphere));
        let focalAxisDist = dot(sub(h, sphere), lightVector);
        let cOFDHP = sub(sub(sphere, scale(lightVector, -focalAxisDist)), h);
        focalAxisDist -= 0.5;
        let fad = focalAxisDist < 0 ? -focalAxisDist : focalAxisDist;
        t += clamp(1 - s(dot(cOFDHP, cOFDHP))) ** fad * fad;
      }

      let col = scale(
        { x: h.x + 5, y: 9, z: h.z + 5 },
        clamp(dot(dirRay, n) * 12 * t)
      );

      if (hit.id == 1) {
        let cl = dot(n, direction);
        col = sub(
          col,
          scale(trace(h, norm(sub(direction, scale(n, 2 * cl)))), -0.2)
        );

        let nn = 2 / 3;
        let rr = sub(
          scale(n, nn * -cl - s(1 - nn * nn * (1 - cl * cl))),
          scale(direction, -nn)
        );
        col = sub(col, scale(trace(sub(h, scale(rr, -0.1)), rr), -0.5));
      }

      return col;
    }

    return {
      x: 32 * direction.x + 192 - direction.y * 64,
      y: 196 - direction.y * 64,
      z: 255 - direction.y * 64,
    };
  };

  draw(0);
})();
