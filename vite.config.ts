import type { UserConfig, Transform } from "vite";

let asepriteTransform: Transform = {
  // Vite already intercepts JSON files and turns them into ES modules
  // so using .atlas as a hacky workaround.
  test: ctx => /\.atlas$/.test(ctx.path),

  transform: ctx => {
    let sheet = JSON.parse(ctx.code);
    let atlas = {};

    for (let slice of sheet.meta.slices) {
      let key = slice.keys[0];

      atlas[slice.name] = {
        bounds: key.bounds,
        pivot: key.pivot
      };
    }

    return `export default ${JSON.stringify(atlas)}`;
  }
};

const config: UserConfig = {
  transforms: [asepriteTransform],
};

export default config;
