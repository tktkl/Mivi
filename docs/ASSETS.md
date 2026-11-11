# Mivi 原创视觉素材

素材由内置 imagegen 工具生成，之后仅使用 Sharp 转为 WebP。网站不连接图像服务。原始图片保留在生成工具的输出目录中；生产用 WebP 全部保存在 `site/assets/images/`。

两张海报图集各包含 4 列 × 3 行的 12 幅画面。`catalog.js` 中的 `atlas` 和 `art` 分别选择图集与从左到右、从上到下编号 0–11 的画面。海报文字由 HTML 渲染；无需切图，整张图集会被浏览器复用。

## 重新编码

```sh
npm ci
node scripts/prepare-images.mjs hero.png films.png series.png
```

## 原始生成提示词

### hero.webp

```text
Use case: stylized-concept. Asset type: a single cinematic widescreen background image for Mivi, a private movie library homepage. Create an original photorealistic science-fiction film still, 16:9 landscape: an isolated tiny astronaut in a weathered pale spacesuit, standing on the right third of an immense rust-orange desert dune, gazing toward a huge shadowed rocky alien planet and monumental folded sandstone cliffs. Thin dust haze, amber sidelight, dark charcoal and copper palette with subdued teal shadows, spectacular scale, expensive analog 70mm cinematography, fine film grain. The astronaut is small within the immense landscape, upper right and center have majestic interesting terrain, the left third has subdued dark landscape for white HTML text overlay. Make a beautiful believable dramatic film still, understated and atmospheric, not illustration. Edge to edge image. NO text, lettering, logos, watermarks, UI, borders, grid, existing characters, existing movie references. No bright white sky. Wide landscape image.
```

### films.webp

```text
Use case: stylized-concept. Asset type: one movie-poster texture atlas to be used as a single CSS sprite sheet. Create exactly 12 separate original cinematic poster artworks in a perfectly aligned edge-to-edge 4 COLUMN by 3 ROW regular GRID. Each cell is exactly the same size and has portrait 2:3 proportions, so overall image aspect ratio is 8:9. Absolutely ZERO gutters, ZERO margins, ZERO borders, no tilt, no frames. Each artwork is a richly detailed professional photographic cinematic composition without any text. Row 1 from left: 1 tiny astronaut on rust orange desert with immense dark cliffs; 2 a deep blue whale beneath ocean surface with ray of light; 3 lone woman with umbrella on rainy moody green noir street; 4 a circular space station above luminous planet. Row 2: 5 steam train at night with amber headlight and snowy station; 6 an ancient misty green forest with small explorer; 7 small propeller plane over warm ocean at sunset; 8 isolated northern village in blue snow with warm window lights. Row 3: 9 mountain climber below monumental snow peaks; 10 vibrant purple and magenta neon cyberpunk rainy metropolis; 11 lighthouse above teal stormy sea and dark cliffs; 12 woman in white summer dress on Mediterranean coastal road at golden hour. Each panel should look like high quality original film key art. Diversity of scene, atmosphere and color, analog film grain, premium movie library aesthetic. Poster compositions centered, rich tonal contrast. Keep bottom of each cell dark enough for HTML title overlay. NO typography, NO letters, NO numbers, NO movie titles, NO logos, NO watermarks, NO existing movies or characters. Deliver the entire grid as ONE atlas image, precisely equal width columns and equal height rows, all 12 panels present.
```

### series.webp

```text
Use case: stylized-concept. Asset type: one cinematic TV and documentary poster texture atlas, consumed as one CSS sprite sheet. Exactly 12 original portrait photographic cinematic artworks in a perfectly aligned edge-to-edge 4 COLUMN by 3 ROW regular GRID; each cell is portrait 2:3, overall canvas aspect ratio 8:9. NO gutters, NO margins, NO borders, no tilt, no frames. Precisely equal cell sizes. Row1 left to right: 1 misty old Shanghai alley with lone detective and warm shop lamps; 2 lone rider traveling through dramatic red canyon desert; 3 eerie clean retrofuturistic architecture with a tiny human silhouette; 4 an isolated cozy alpine hotel during blue-hour snowfall. Row2: 5 dramatic Mediterranean coastline village with rich emerald sea; 6 aircraft wing and red navigation light through blue night clouds; 7 a cabin deep in mountainous foggy forest; 8 a woman reading a letter in a sunlit old-fashioned apartment. Row3: 9 African elephant with golden dust at sunset, premium nature documentary photography; 10 translucent jellyfish glowing deep cobalt underwater, deep sea documentary; 11 beautiful vivid microscopic organic forms under scientific microscope, macro documentary; 12 green aurora above snow peaks and tiny silhouetted pine trees reflected in a lake, night sky documentary. Photorealistic sophisticated poster key art, film grain, beautiful and varied controlled color palettes, premium media-library visual quality, centered subjects with readable silhouettes. Lower edges should be darker for HTML titles. NO text, NO typography, NO letters, NO numbers, NO movie titles, NO logos or watermarks, NO existing movies or characters. All 12 panels must be visible as a single perfectly regular atlas image.
```
