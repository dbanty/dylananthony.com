---
title: "Replacing FastAPI with Rust: Part 3 - Trying Actix"
excerpt: "I suffer so you don't have to"
coverImage: "/assets/blog/fastapi-rust-3-trying-actix/cover.png"
coverImageAlt: "The Rust mascot 'Ferris the Crab' holds the logos for FastAPI and Rust and is smooshing them together."
date: "2021-01-09"
author:
  name: Dylan Anthony
  picture: "/assets/blog/initials.png"
---

> Cover image created by me using [Ferris the Crab], [the Rust logo], and [the FastAPI logo].

_This post is part of a series. If you haven't already, you may want to read the [previous post] before continuing._

Ironically, after taking much, _much_ longer to produce this blog post than any of the previous ones, I expect it to be the shortest yet. But that's sort of the idea right? I suffer so you don't have to.

## What Went Well?

1. It was pretty easy to set up [actix-web] locally by following their official instructions.
2. [Paperclip's instructions][paperclip plugin] for using actix were okay, I just wish I hadn't read any actix documentation yet. Paperclip doesn't support the macro-method of declaring actix endpoints, so I wasted a bit of time chasing that down.
3. Creating an API-gateway-triggered lambda using AWS SAM was fairly straightforward, and running it offline worked just fine. Just be warned that build times will take **forever**. [This blog post][sam blog] was the most useful resource in getting that working.

## What Went Poorly?

Getting [actix-web] to run using the [netlify_lambda_http] crate did not work. At all. This stinks because it's the easiest way to make Rust code work in a lambda. The short version of why it didn't work is that I followed [this recommendation][actix-web lambda issue] for running requests against actix without spawning a web server. This produces a `Service` which you have to `.await` calls on. Unfortunately the `Service` is not `Send` which is a requirement for the async function you pass to the lambda handler.

Am I confident I could make this work if I didn't use the [netlify_lambda_http] and instead wrote my own lambda handler code from scratch? Yes. But I'm also frustrated after hours of trying to get this working- so I'm going to move on.

As a side note, the testing story for actix-web isn't nearly as nice as it seemed. Turns out that in order to unit test anything you have to basically recreate the routing logic, which means you aren't testing your routing logic. It seems this is due to some poor API design around the `App`. Having encountered irritating limitations with `Service` while trying to invoke requests directly leaves me overall quite disappointed in this most-popular of frameworks.

## What's Next?

I'm going to dive in and try [rweb]. My biggest near-term concern was the lack of documentation, but no amount of documentation actually helped me with [actix-web] so... why not? Hopefully it will go much better and I won't have to write my own lambda handler code _or_ OpenAPI 3 structures.

---

_Have a question or comment about this post? Leave it in the [discussions] thread on GitHub!_

_Want to be notified when the next part of this series is released? Watch releases in [the GitHub repo]._

[ferris the crab]: https://www.rustacean.net
[the rust logo]: https://www.rust-lang.org/policies/media-guide
[the fastapi logo]: https://github.com/tiangolo/fastapi
[discussions]: https://github.com/dbanty/dylananthony.com/discussions/11
[ideas]: https://github.com/dbanty/dylananthony.com/discussions/categories/ideas
[the github repo]: https://github.com/dbanty/dylananthony.com
[previous post]: https://dylananthony.com/posts/fastapi-rust-2-research
[teaser comment]: https://dev.to/patarapolw/comment/19m15
[rweb]: https://github.com/kdy1/rweb
[paperclip plugin]: https://paperclip.waffles.space/actix-plugin.html
[actix-web]: https://github.com/actix/actix-web
[sam blog]: https://dev.to/netguru/commentable-rs-building-a-serverless-comment-system-in-rust-5egb
[netlify_lambda_http]: https://docs.rs/netlify_lambda_http/0.2.0/netlify_lambda_http/
[actix-web lambda issue]: https://github.com/actix/actix-web/issues/768
