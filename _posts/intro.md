---
title: "An intro to this blog using... this blog"
excerpt: ""
coverImage: "/assets/blog/intro/cover.png"
coverImageAlt: "A diagram showing the flow of Markdown in Next.js to GitHub Actions vis git push where Prettier is run, and finally to Vercel via autodeploy."
date: "2020-12-27"
author:
  name: Dylan Anthony
  picture: "/assets/blog/initials.png"
---

## Why?

After I decided I wanted to write some blog content again, I had to decide whether to make my own website or just stick
with [Dev.to] as I have done in the past. Clearly I decided to create my own website (thus this post), but why? Here are
the reasons:

1. I wanted to store all my blog posts in source control. I write them in Markdown which is an easy enough format to
   control, and I'm very much used to GitHub for storing my data for programming projects, so why not use GitHub to store
   the markdown of my blog posts? If I'm already storing my markdown in GitHub, I'm not too far off from having my
   own hosted blog.
2. I already have my own domain for email (so I'm not permanently reliant on something like gmail, even if I decide to
   use it as a back end), and I've been looking for a reason to use the domain for something else (a website) too.
3. Pretty much all the advice I've read from writers that I respect says that even if you do post on another site, you
   should always provide a canonical link back to your site to drive traffic because even if you don't need a direct
   line now, you'll want it some day. If I don't respect the advice of people on the internet who know their trade,
   what exactly am I doing here?

## Requirements

The "Lead Software Engineer" in me has to make sure I have a clear set of goals before embarking on a new project, and
my personal blog is no different. So here they are:

1. Content must be written in Markdown. I already know Markdown from all the technical documentation I do in my day-to-day,
   most other platforms I would consider writing on (e.g. [Dev.to]) use Markdown, it's an easy format to track in change
   control (unlike, say, MS Word), and I know there are great tools for converting it to HTML.
2. Hosting must be free because incurring yet another monthly cost for a side project which doesn't yield any clear
   returns just doesn't sound great.
3. CI/CD must be relatively painless to set up.
4. It must use tech I'm already familiar with; I have enough learning topics queued up to not add yet another. Also, the
   reason I'm starting blogging again is that I have a series I want to write, I don't want to delay that too long.
5. It should be very customizable, but also very easy to get started. I will likely want to take the website further in
   the future, tweaking styling, adding more sections beyond the blog, etc. For right now though, I only want to get
   a nice blog up and running quickly. So there should be an easy-to-use framework to get started with minimal effort,
   but built on a platform that's easy to expand in the future.

## The Tech I Chose

1. **Markdown**: as indicated by the requirements this choice was made before I even started investigating options. See
   requirement number 1 for some reasons why.
2. **GitHub**: This is the source control host I'm most familiar with and seems to be set up for the longest term success.
3. **GitHub Actions**: Requirement 3 basically drove this. I could set up CircleCI which I'm more familiar with, but
   it's more steps than GitHub Actions and more complexity to the project.
4. **Next.js**: Front end tech I'm already familiar with (requirement 4) would either be Angular or Next.js. I would
   pick Next.js over Angular for any new project for a whole host of reasons, not the least of which is the excellent
   documentation which even includes [this Markdown blog example][blog starter] which I got started with. Of course
   Next.js, being React with more features, also easily solves requirement 5.
5. **Vercel**: I could write an entire blog just about how amazing Vercel is. To put it concisely: they are by far the
   single most painless hosting solution I have ever found **by far**. If you're using Next.js, they are a no-brainer,
   and they are **free** for small projects. This means they handily meet requirements 2 & 3.
6. **TypeScript**: Maintainability and correctness of code is **always** a requirement of everything I write, and
   TypeScript is such a huge upgrade over JavaScript in that area that I will pretty much never choose to write vanilla
   JavaScript. I _was_ going to save TypeScript conversion from the [starter example][blog starter] for a later date...
   until I spent a half hour debugging a typo in a prop name >.>.
7. **Prettier**: I just love auto formatters. Prettier will take care of my TypeScript and my Markdown, so why not add
   it in?
8. **Tailwind**: I love Tailwind, and would have ended up using it eventually for customizing the rest of the site...
   but the only reason I'm including it in the initial blog-only version is because it came with the [example][blog starter].

## A Brief Tutorial

Here are the steps I took to get the site to where it is today:

1. Use Yarn to make me a copy of [the example][blog starter].
2. Create a repo in GitHub and push (the [GitHub CLI](https://cli.github.com) makes this easier).
3. Add my project to Vercel which, being as amazing as it is, took about 5 minutes. Now I have continuous delivery,
   so I can manually check the results of every change after this.
4. Update all the dependencies.
5. Upgrade to Yarn 2 (unnecessary, but it comes with more dependable builds which I like).
6. Resolve a couple Tailwind warnings.
7. Add explicit alt text to cover images instead of the generic text included. It's nice to actually describe what's
   going on in the images.
8. Add and run Prettier, along with a GitHub workflow to check on every push.
9. Yank the default blog content / author info and add some of my own in an empty version of this post.
10. Convert to TypeScript while debugging alt text of the image for my new shell of a post.
11. Write this post

## Retrospective

Okay so how did it go? Would I do anything differently? Basically "great" and "no". I might change my mind and update
this in a month, but for now I'm super satisfied with the results. Check out https://dylananthony.com to see what it
looks like. It took me a couple of hours all told to get it put together which I think is a worthy investment, granted I
was already familiar with all the tech involved so there was minimal Googling required. I probably should have looked
around for a TypeScript variant of the example already to reduce that time even further, but I wasn't initially planning
on using TypeScript at launch.

## What's Next?

1. More blog posts! As I mentioned, the whole reason I wanted to get this off the ground quickly is because there's a
   new blog series I'm working on. Now that this initial version of my site is done, I want to get right into that. I
   expect most of my readers will still be on [Dev.to] so I'm not too concerned with making the site look nicer just yet.
2. I know I did some hokey stuff that [eslint] will complain about whenever I add it, so eventually I'll have to add it
   and fix those complaints.
3. CD to other platforms? I have seen a couple of people talk about automatically cross-posting to [Dev.to] or [Medium]
   and I plan on posting my new series to both of those. So perhaps once it becomes too tedious to do so manually I'll
   look into some form of CD. I imagine I'll want to make some manual tweaks anyway though so... we'll see.
4. Custom styling on my website! Right now it's very basic, using pretty much the exact same thing as the starter
   template. I'll definitely want to make it more "me" eventually, but again, after this blog post.
5. Some sort of notifications? _If_ I start getting traffic to my personal site, _maybe_ I'll create an RSS feed or
   mailing list somehow. Like I said I expect 99% of traffic to just be on [Dev.to] or [Medium] so this feature is a
   long way off.

## Conclusion

If you want to have your own website to host blogs on, Next.js on Vercel seems like a great choice. I am in no way,
shape, or form a professional writer, front end engineer, or designer, so take everything I have said with that grain of
salt. What I _am_ is a professional DevOps engineer who has tried several tech stacks for hosting websites,
so I am pretty confident in my claim that what Vercel offers is truly amazing.

## Meta Conclusion

That's the sort of content you can expect from me in future blog posts! I'm going to try to accomplish some goal using
software then tell you how it went and _hopefully_ provide some useful takeaways. I'll do my best to point out my
confidence in or experience with different tech, so I won't lead you astray. I'm also always open to suggestions,
comments, or corrections which you can leave [in the repo for this website][repo]. I will likely post most blog posts on
[Dev.to] and/or [Medium], but will always post **all** content on my website first.

[dev.to]: https://dev.to
[blog starter]: https://github.com/vercel/next.js/tree/canary/examples/blog-starter
[eslint]: https://eslint.org
[medium]: https://medium.com
[repo]: https://github.com/dbanty/dylananthony.com
