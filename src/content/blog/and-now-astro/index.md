---
title: "Making my blog more climate-friendly with Astro"
date: "2024-03-04"
description: "Rewriting my personal website with Astro to make it more climate-friendly."
image: "./cover.jpeg"
imageAlt: "A happy little cartoon laptop surrounded by trees and flowers"
tags: ["TypeScript", "web", "writing"]
discussion: 211
---

It's been two years since I last [rewrote my personal website](/blog/new-year-new-website), so naturally it's time
to do it again! The immediate motivation was simple: my website stopped building with an inscrutable error message.
Rather than taking the time to learn more about Zola and what could be causing the issue, I figured I would switch to
something with a bit more community support: Astro.

## Why Astro?

I recently created a [new documentation website for Knope](https://knope.tech) using the _incredible_
[Starlight theme for Astro](https://starlight.astro.build/getting-started/).
The developer experience, community resources,
and performance of the site were all so good that I knew I wanted to build more with Astro, so it was the natural choice
for this rewrite.

## But... climate-friendly?

Yes, climate-friendly! There's this neat tool called [Website Carbon](https://www.websitecarbon.com/) that estimates the
carbon emissions of a website.
Here are the results for my old website:

![
  A screenshot of websitecarbon.com. There is a scale from A+ (best) to F (worst), and my website gets a B.
  This is cleaner than 79% of other websites, with the global average being between E and F.
  Below the scale, the website states "Only 0.20g of CO2 is produced every time someone visits this webpage"
](./old-site-carbon.png)

A B is pretty good, better than 79% of other websites, apparently. But... "good" is never good enough for me, especially
when it comes to climate change.
So, how does the Astro version of my website compare? I used almost identical styles, markup, and content and I hosted it
in exactly the same way. Here are the results:

![
  Another screenshot of websitecarbon.com, this time my website gets an A+.
  This is cleaner than 95% of other websites.
  Below the scale, the website states "Only 0.06g of CO2 is produced every time someone visits this webpage"
](./new-site-carbon.png)

A 70% reduction in carbon emissions! Now _that's_ something to be proud of. But... how? What is it about the
Astro site that makes it better for the environment?
Primarily, it's reduced data transfer. Check it out, here's the network view from my old site:

![
  A screenshot of the network view in Safari. There are 15 requests, totaling 920.5KB transferred.
](./old-site-network.png)

And here's the network view from the Astro site:

![
  A screenshot of the network view in Safari. There are 9 requests, totaling 93.2KB transferred.
](./new-site-network.png)

On first load, the Astro site is 90% smaller than the Zola site! There are two reasons for this, first, Astro is
lazy loading the images that are "below the fold", so it doesn't download data until it's needed. Not only that, look
what happens when we scroll all the way down and load _everything_ (even more than the Zola site had loaded):

![A screenshot of network stats summary in Safari. There are now 19 requests, totaling 246.1KB transferred.](./new-site-after-load.png)

The Astro site is still 73% smaller than the Zola site! If we look a little closer, we can see why: every individual
image is smaller. I'll be honest, I don't know what Astro is doing to make this possible, but to my eyes there's no noticeable
difference in quality, and that's incredible!

## What about clean energy?

My website is hosted on a combination of Netlify and Cloudflare, and both have strong commitments to sustainability.
However, all the clean energy that is produced will be used, so even though _my_ energy is coming from a sustainable source,
using less of it will still reduce carbon emissions.

I like to think of it like the solar panels on my house.
They produce electricity as long as the sun is up, and on most (non-cloudy)
days, they produce more than we use. So what happens to the excess? It flows back into the grid and helps power my neighbors'
homes, replacing energy that may have come from fossil fuels otherwise.
The energy I consume is not generating carbon emissions, but by consuming less I'm still reducing the overall emissions.
It's the same with my website, and yours! So, even if your site is powered by renewable sources, it's still worth trying
to reduce the energy consumption (by reducing data transfer).

## How hard was it?

Like I said, I'm not a frontend developer, so changing up my website was very intimidating. Luckily, Astro makes
things relatively easy.
The Astro CLI gave me a blog template that worked great as a starting point. Next, I copied over my Markdown files and images.
The only changes I had to make were to the frontmatter.
For styling, my old site was using Tailwind, and there's an Astro plugin for that
(much easier than it was to add Tailwind to Zola). Really, the hardest part was figuring out how to translate the
jinja-like templates of the old site into Astro components. To be honest, the toughest part of _that_ was understanding
the templates of the old site, since I found Astro's syntax much easier to work with.

All-in-all, it took me a couple of afternoons to fully translate my site to Astro, and I'm extremely happy with the result.
There are some minor style differences, but making it look identical wasn't the goal, I just wanted to preserve the
general design and content.

## Should everyone switch to Astro?

Probably not 😅. But, I think it's worth checking on the carbon impact of the websites you maintain to see if there's
a clear path to improve them.
Astro is definitely a good choice for new projects, or if you're planning on rewriting anyway.
If you _do_ find a great way to make your site more sustainable, I'd love to hear about it!
