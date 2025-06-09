((_) => {
  let th = 0,
    sl,
    sp,
    a = 0;

  let s = Math.sqrt;
  let z = Math.sin;

  let ct = c.getContext("2d");

  let id = ct.getImageData(0, 0, 256, 256);
  let px = id.data;

  let sub = (p1, p2) => ([ p1[0]-p2[0], p1[1]-p2[1], p1[2]-p2[2] ]);
  let scale = (p, val) => ([ p[0]*val, p[1]*val, p[2]*val ]);
  let norm = (vc) => scale(vc, 1/s(vc[0]*vc[0] + vc[1]*vc[1] + vc[2]*vc[2]));

  let intersect = (sPh, obj, dir) => { // sPh is {pos: array, r: number}, obj is array, dir is array
    let oC = sub(sPh.pos, obj); // obj is array, sPh.pos is array
    let v = oC[0] * dir[0] + oC[1] * dir[1] + oC[2] * dir[2];
    let t = sPh.r - (oC[0]*oC[0] + oC[1]*oC[1] + oC[2]*oC[2]) + v * v;
    return (
      t < 0 ? { t } : (t = v - s(t)),
      (h = sub(obj, scale(dir, -t))), // h is an array
      {
        t, // number
        h, // array
        n: sub(h, sPh.pos), // n is an array
        id: sPh.r, // number
      }
    );
  };

  let draw = (t) => {
    sp = { pos: [z(a+1.5), -0.75+z(a), 5], r:1 };

    sl = scale( // sl is an array
      [z(a*2+1.5),-1,z(a*2)],
      9
    );

    for (y = 256; y--; ) {
      for (x = 256; x--; ) {
        let idx = (x + y * 256) * 4;
        c = scale( // c is an array
          trace( // trace call
            [0,0,0], // origin (array)
            norm([ // direction (array)
              x / 128 - 1,
              y / 128 - 1,
              1,
            ])
          ),
          0.5 * (1 + z(x / 85) * z(y / 85)) // scale factor
        );
        px[idx] = c[0];
        px[idx + 1] = c[1];
        px[idx + 2] = c[2];
        px[idx + 3] = 255;
      }
    }
    ct.putImageData(id, 0, 0);

    a += (t - th) * 1e-3;

    th = t;
    requestAnimationFrame(draw);
  };

  let trace = (og, dr) => { // og, dr are arrays
    let ht = intersect(sp, og, dr); // sp is {pos, r}. intersect now expects sPh.pos
    for (i = 9; i--; ) {
      let new_hit = intersect( // intersect call
          { // sPh (sphere-like object)
            pos: [-4 + (i % 3) * 4, 4 + z(a + (i % 3) + i / 3), 4 + (i / 3) * 4],
            r: 5,
          },
          og, // obj (array)
          dr // dir (array)
        )
      );
      ht = ht.t < 0 ? new_hit : new_hit.t < 0 ? ht : ht.t <= new_hit.t ? ht : new_hit;
    }

    if (ht.t > 0) {
      let { h, n } = ht; // h, n are arrays from intersect
      let dRay = norm(sub(sl, h)); // sl is array, h is array. dRay is array.
      let { t } = intersect(sp, h, dRay); // sp is {pos,r}, h is array, dRay is array
      t = t < -1 ? 1 : t < 0 ? 0.2 - 0.8*t : 0.2;

      if (t < 1) {
        let lv = norm(sub(sl, sp.pos)); // sl array, sp.pos array. lv is array.
        let _sub_h_sp = sub(h, sp.pos); // h array, sp.pos array. _sub_h_sp is array.
        let fd = _sub_h_sp[0] * lv[0] + _sub_h_sp[1] * lv[1] + _sub_h_sp[2] * lv[2];
        let cf = sub(sub(sp.pos, scale(lv, -fd)), h); // sp.pos array, lv array, h array. cf is array.
        fd -= 0.5;
        let fA = fd < 0 ? -fd : fd;
        let _clampVal1 = 1 - s(cf[0]*cf[0] + cf[1]*cf[1] + cf[2]*cf[2]); t += (_clampVal1 < 0 ? 0 : _clampVal1) ** fA * fA;
      }

      let _clampVal2 = (dRay[0] * n[0] + dRay[1] * n[1] + dRay[2] * n[2]) * 12 * t;
      let co = scale( // co is an array
        [h[0] + 5, 9, h[2] + 5], // p (array)
        (_clampVal2 < 0 ? 0 : _clampVal2) // val
      );

      if (ht.id == 1) { // ht not hit
        let cL = n[0] * dr[0] + n[1] * dr[1] + n[2] * dr[2]; // n, dr are arrays
        co = sub(
          co,
          scale(trace(h, norm(sub(dr, scale(n, 2 * cL)))), -0.2) // dr not direction
        );

        let nn = 2 / 3;
        let rr = sub(
          scale(n, nn * -cL - s(1 - nn * nn * (1 - cL * cL))),
          scale(dr, -nn) // dr not direction
        );
        co = sub(co, scale(trace(sub(h, scale(rr, -0.1)), rr), -0.5));
      }

      return co;
    }

    return [ // dr is an array
      32 * dr[0] + 192 - dr[1] * 64,
      196 - dr[1] * 64,
      255 - dr[1] * 64,
    };
  };

  draw(0);
})();
