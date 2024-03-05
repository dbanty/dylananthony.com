---
title: "New Year, New Website"
date: "2022-01-01"
image: "./new-year-new-website.png"
imageAlt: "A frame shows Drake puts his hand up to block the text 'Writing a blog website that looks nice but uses a ton of JavaScript' in the ugly Comic Sans font. Drake doesn't like that. Another frame shows Drake pointing and smiling at 'Writing a blog website using a static generator' written in nice Helvetica Neue font. Drake likes this option."
discussion: 194
tags: ["web", "writing"]
---

> Cover image created by adding text to [this image](https://i.redd.it/4wmp5smh0ld41.jpg).

---

I really like blogging. Sharing my discoveries and thoughts with anyone interested is one of a few ways I give back to the developer community. Having a topic also gives me an objective—and learning with an objective is the only way I can learn anything. So why haven't I posted in over eight months? That's what I hope to answer here, as well as share the ideas I've had for picking back up where I left off.

When debugging any problem, the first question to ask is "what changed?" The system (that is, the way my blogs get produced) is wildly complex, but I've come up with three components to look at:

1. The Content—has there been a significant change in the topics I want to write about?
2. The Writer—have I changed? Do I have less motivation to blog?
3. The Process—did something change about how I write, which holds me back?

The answer is, of course, yes to all of the above, so let's dig in one by one.

# The Content

The old adage says, "write what you know," and I sure have. I had the goal in my day job to develop the best web APIs possible, which meant using the best tooling available. I wanted to write an OpenAPI server in Rust and host it on serverless technologies, so I explored all the options I could find in that space for a while. However, I pretty quickly ran out of options, with none of them entirely fulfilling my needs.

To make matters worse, although some of the solutions came close, none of them would be ready in time to use for the project I had in mind. As a result, my motivation to write about them quickly decreased. So the content wasn't technically changing, but its relevance to me was.

However, this wasn't the case for the whole of my eight—month hiatus. I worked on a side project that needed a new web server, so I decided to try hosting it on Microsoft Azure. The experience ended up being pretty terrible, but I never brought myself to finish any of the blog drafts about it. Recently, a new OpenAPI web server framework for Rust has appeared—Poem. It's an incredible new entry that seems to satisfy most of my needs and could be a real contender for the "FastAPI of Rust" crown—but still no blog post.

What gives? Clearly, even though the content was an issue early on, it's not the only thing that's put a pause on my writing.

# The Writer

As I hinted earlier, my priorities have definitely shifted over the year. It started with changing projects at my old job and accelerated when I switched companies entirely. Not working on Rust-based APIs during the day definitely lowered my motivation to write on the topic, but it wasn't the only cause.

I'm not sure enough to diagnose this, but switching jobs also reduced how much I work on side projects and contribute to open source. It could be that I'm more satisfied in my day-to-day work and don't need to seek out additional accomplishments. On the other hand, it could be that the increased code-writing of the new position leaves me with less energy to do it after hours. Either way, I think the solution here is to write on topics that require less coding in advance.

# The Process

Here it is, the moment you've all been waiting for; why did I rewrite my website? I write my blog posts in Markdown, and that hasn't changed. It's a lovely, straightforward format that is supported by Dev.to (one of the places I post) as well as my note-taking app. What has changed is the way I convert that Markdown into a website for your viewing pleasure (and a place to point canonical links).

I used to use Next.js with many addons so complex that I can't describe them. I can, however, explain how that complexity caused me pain and made me much less likely to post.

First, it's essential to understand that I cannot leave things out of date. Am I leaving performance on the table and thereby wasting energy every time my site builds or loads? Is my site horribly broken for some users because of a bug? Is there some security vulnerability that could actually impact my readers even though my site is essentially static? These questions constantly plague me as long as dependencies are out of date. I did not have time to read and comprehend the dozens of updates per month that Renovate indicated were available. Beyond that, my JavaScript package manager of choice—Yarn—just didn't work with some dependencies (e.g., the latest TypeScript and Next.js). Switching to `npm` would be too painful, so I had to test every dependency update manually, which, again, I simply couldn't justify the time investment for. Plus, an update to one dependency would often break a seemingly unrelated part of my website, and I'd have no idea why or how to fix it.

Another problem with my website that I couldn't ignore was JavaScript itself. Even though my content is static, my combination of tools could not convert it into plain HTML and CSS. This, again, meant wasted energy every time someone loaded the site, and their browser had to download and run some useless code. These aren't big problems; the performance difference is insignificant on modern machines. Still, it _felt awful_ to have a bunch of _stuff_ happening that didn't need to happen.

What I wanted was a way to convert my Markdown into pure HTML and CSS. I wanted the syntax highlighting for my code blocks to not be done on the fly with JavaScript but instead rendered once at build time and shipped as styled text. And most of all, I wanted _way fewer_ dependencies, ideally while avoiding the `npm` ecosystem altogether. I got all of that with Zola.

Zola is now the only dependency I need. It takes my Markdown content and converts it into a purely static (HTML and CSS) website. The documentation is excellent, the build process is speedy (4x faster on Vercel than Next.js builds were), and I'll never again have to dread a backlog of updates. It does come with some downsides, like not having Tailwind, but it's well worth the tradeoff for the relief I feel. The whole conversion process only took me a handful of hours, and most of that was deciding on a theme to start with.

# Conclusion

Many reasons can (and did) cause burnout, and many little changes can help relieve it. Will my combination of changes get me back to posting again regularly? Only time will tell. One thing is for sure though, taking the time to "debug" my own burnout sure did make me feel better about it. I hope to talk to you all again soon.
