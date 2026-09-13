<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" id="dynamic-favicon" type="image/x-icon" href="{{ asset('favicon.ico') }}" />
    <title>{{ config('app.name', 'Zinnia Bangladesh - Fashion & Lifestyle') }}</title>
    <meta name="description" content="Traditional and modern Bangladeshi fashion online store with complete CMS, products, tracking, and admin control." />
    <meta property="og:title" content="Zinnia Bangladesh - Fashion & Lifestyle" />
    <meta property="og:description" content="Traditional and modern Bangladeshi fashion online store with complete CMS, products, tracking, and admin control." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    @php
      $cssFiles = glob(public_path('assets/index-*.css'));
      if (!empty($cssFiles)) {
        usort($cssFiles, fn($a, $b) => filemtime($b) - filemtime($a));
      }
      $cssFile = !empty($cssFiles) ? basename($cssFiles[0]) : null;

      $jsFiles = glob(public_path('assets/index-*.js'));
      if (!empty($jsFiles)) {
        usort($jsFiles, fn($a, $b) => filemtime($b) - filemtime($a));
      }
      $jsFile = !empty($jsFiles) ? basename($jsFiles[0]) : null;
    @endphp
    @if ($cssFile)
      <link rel="stylesheet" crossorigin href="{{ asset('assets/' . $cssFile) }}">
    @endif
    @if ($jsFile)
      <script type="module" crossorigin src="{{ asset('assets/' . $jsFile) }}"></script>
    @endif
  </head>
  <body class="bg-[#FCFBF8] text-[#2C2926] antialiased selection:bg-[#8B2628] selection:text-white">
    <div id="root"></div>
  </body>
</html>
