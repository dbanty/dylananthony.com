---
title: "Replacing FastAPI with Rust: Part 3 - Trying Actix"
excerpt: "Development was time consuming, troubleshooting was frustrating, and the end result was fragile and ugly."
coverImage: "/assets/blog/fastapi-rust-3-trying-actix/cover.png"
coverImageAlt: "The Rust mascot 'Ferris the Crab' holds the logos for FastAPI and Rust and is smooshing them together."
date: "2021-01-12"
author:
  name: Dylan Anthony
  picture: "/assets/blog/initials.png"
---

> Cover image created by me using [Ferris the Crab], [the Rust logo], and [the FastAPI logo].

_This post is part of a series. If you haven't already, you may want to read the [previous post] before continuing._

## TL;DR

I got [actix-web] + [Paperclip] working with [AWS SAM]. Development was time consuming, troubleshooting was frustrating, and the end result was fragile and ugly. In future blog posts I will be experimenting with other solutions and hoping for a much nicer result. I'll only return to the actix-web approach if other methods are somehow even worse.

I will say that most of my struggles were related to running actix-web on AWS Lambda. So if that's not a requirement for _you_, it may still be worth looking into this approach.

If you'd like to share in my suffering and (maybe) learn something, read on! If you'd rather wait for future blog posts to point you in a _productive_ direction, I completely understand.

## Setting up [actix-web]

The first bit I tried was following pieces of the [official actix-web tutorial][actix-web docs] in order to get a tiny little web server started locally. This went fine, but was actually a big mistake as that tutorial teaches you to use macros to define endpoints which, at the time of writing, [Paperclip does not support][paperclip macro issue].

## Setting up [Paperclip]

[Paperclip's instructions][paperclip plugin] for using actix were okay, I just wish I hadn't read any actix documentation yet. After a complete rewrite of my existing code, I was able to run the web server locally and produce a v2 OpenAPI document. I used their echo example to validate JSON on the way in and document the output, nice and easy.

## Trying to Test it

I wanted to do my best to keep track of what was working and what I broke as I made changes, and my favorite way to do that is with unit tests! Unfortunately, I couldn't seem to find a good way to unit test endpoints with actix-web. I knew I'd seen testing in ["Zero To Production In Rust"] so I went back and referenced it only to find out the unit testing is (nearly) impossible in actix-web! The author uses integration testing only for their routes which requires spawning a local webserver. That doesn't work at all if I'm not going to be running a web server!

So scratch one requirement for [actix-web], it **does not** have a simple way to test endpoints.

## Processing Requests Without a Webserver

Not to be deterred by the lack of testing (figuring I'd find a way eventually), I moved on to what I thought would be the most difficult task. The [docs for actix-web][actix-web docs] did not provide a way to do this, they only show running an actual web server. So it was time to put my finely honed search-engine skills to work!

In the end I found two methods for achieving this:

1. Run the webserver and forward requests from the lambda handler back to localhost. This felt yucky and like there would be a fair amount of overhead so I dropped that idea quickly.
2. [This GitHub issue][actix-web lambda issue] suggested using some of the testing tools included with [actix-web] to achieve what I was looking for. This is the route I decided to take, though it was probably more effort than it was worth.

I ended up with something that looked roughly like this:

```rust
let service = App::new()
  .wrap_api()
  .service(web::resource("/actix/echo").route(web::post().to(echo_pet)))
  .with_json_spec_at("/actix/openapi.json")
  .build()
  .into_factory()
  .new_service(AppConfig::default())
  .await?;

// Note that I don't actually have a request here,
// for initial testing these params were hard-coded
let req = TestRequest::with_uri(&request.uri().to_string())
    .method(request.method().clone())
    .set_json(request.body())
    .to_request();

let actix_response: ServiceResponse = service.call(req).await?;
```

Not the most elegant of solutions, but it worked. Now seems like a good time, by the way, to take away a point for "MUST have great documentation". While the docs for using [actix-web] as intended were good, I'm far off the beaten path at this point and will only go further. I didn't find any docs at all to help me with this nor later code, and instead spent a lot of time digging through source code and deciphering cryptic compiler errors.

## Using AWS SAM

This _would_ have been the easiest part of the whole experiment if I had found [this blog post][sam blog] right away. I made the mistake of starting with the official docs which, even though they provided a Rust example, really didn't help at all. I then found another blog which got me 99% of the way there, but that last missing 1% meant my code would not compile. Anyway, once I found the good post, adapting it to use [Netlify's Lambda Runtime][netlify_lambda_http] was easy.

Why Netlify's fork and not the official AWS runtime? Basically because it seems like AWS has abandoned their project for now. Netlify has graciously taken up maintenance in the meantime.

## Combining the Lambda Runtime with actix

Getting [actix-web] to run using [netlify_lambda_http] was **very hard** and probably the most frustrating thing I've done in Rust so far. The way to set up a lambda handler is to provide either an async function or a struct that implements the `Handler` trait. Easy enough right? I already had an async function that would take some request data and spit out the `ServiceResponse` so I _should_ just need to convert to and from the proper structures.

As it turns out, the `Future` returned from the async function has to be `Send` (the lambda runtime must do something with threads to manage requests). The outputs of the futures provided by all the test methods I was using were not `Send`. As a result, the compiler spit out hundreds of lines about the nested types that were not `Send`, preventing me from using my async function.

There is probably some standard way to get around this sort of stuff, but I couldn't figure it out, certainly not with messages as cryptic as the ones I was getting. So I turned to a crate I found called [warp_lambda]. That's right, I found a crate that allows you to run [warp] on AWS Lambda. As a reminder, [rweb], the most promising option from a functional standpoint, is based on [warp].

This crate has an implementation for the `Handler` trait which I used to model my own `Handler` trait for an actix-web `Service`. Using my own struct which implemented that trait suddenly made the "this is not `Send`" error messages simple enough to decipher. I was able to get the thing to actually compile, but it required using a few `unwrap()`s on errors which were not `Send`. I could probably go back and figure out how to wrap or map those errors to something simpler to make my implementation less fragile, but I was already annoyed enough at this implementation that I was headed toward [rweb] anyway.

At this point I encountered yet another problem. While I was able to create and run a `Service` in my `Handler`, I had to create it for every single request. Try as I might to decipher the opaque types involved with the _many_ generics used with an actix `App`, I could not satisfy the compiler enough to store this thing in my struct. I didn't run any benchmarks here, but there's no way that re-initializing an entire `App` for each and every request is fast. It would take a ton of testing to make sure it didn't fall over for large applications, which means I couldn't confidently check off the "perform at least as fast as FastAPI" requirement.

## Translating Between Lambda and Actix

On to yet another challenge! As I said, I was already convinced that this actix-web approach was not the best way to go, but I wanted to at least make it work _a little bit_ before giving up.

I'm not going to go into a ton of detail here, but basically I had to spend a lot of time reading actix-web source code in order to figure out how to translate body types, headers, etc. and I only managed to get the bare minimum for my JSON test-endpoints working.

I really have come to appreciate WSGI/ASGI in the Python world. While I've not directly interfaced with it, I know that it sets some standards for how web requests work which means a lot of this manual conversion nonsense is unnecessary. It also means that web frameworks are almost always completely independent of web servers, so most of this hunting around for a way to directly invoke requests would not have been necessary.

## Conclusion

The code works... but barely. If you want to see the end result, I have put it up in a [GitHub Repository][experiments repo] where I also intend to add future experiments in other frameworks. If you haven't gathered as much from all of the text above, this code is fragile, slow, and **in no way recommended for production**. But if you're more experienced (or dedicated) than I am and want to try your hand at making it better, go for it!

Closing the loop on the [previous post], my experience has indicated that none of these requirements are actually met by actix-web + Paperclip for my serverless usecase:

1. _"MUST be easily deployable on AWS Lambda using some infrastructure as code tool (SAM, Serverless, etc.)."_
2. _"MUST perform at least as fast as an equivalent FastAPI application for common CRUD tasks."_
3. _"MUST have a simple way to test endpoints, comparable to pytest with FastAPI."_
4. _"MUST have great documentation."_

Updating the score, this solution only meets 3/8 "MUST" requirements for my FastAPI replacement (potentially 4/8 if the performance hit isn't as bad as I think it will be). This actually puts it below [rweb] which was my runner up in the initial research phase.

## What's Next?

I'm going to dive in and try [rweb]. My biggest near-term concern was the lack of documentation, but no amount of documentation actually helped me with [actix-web] so... why not? Hopefully it will go much better, and I won't have to write my own lambda handler code _or_ OpenAPI 3 structures. Plus now I get to enjoy the (subjectively) nicer syntax of rweb!

---

_Have a question or comment about this post? Leave it in the [discussions] thread on GitHub!_

_Want to be notified when the next part of this series is released? Watch releases in [the GitHub repo]._

_Have an idea or request for a future blog topic? Drop it in the GitHub discussions under [ideas]._

[ferris the crab]: https://www.rustacean.net
[the rust logo]: https://www.rust-lang.org/policies/media-guide
[the fastapi logo]: https://github.com/tiangolo/fastapi
[discussions]: https://github.com/dbanty/dylananthony.com/discussions/18
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
[aws sam]: https://aws.amazon.com/serverless/sam/
[actix-web docs]: https://actix.rs/docs/
[paperclip macro issue]: https://github.com/wafflespeanut/paperclip/issues/63
[paperclip]: https://github.com/wafflespeanut/paperclip
["zero to production in rust"]: https://www.zero2prod.com
[warp_lambda]: https://github.com/aslamplr/warp_lambda
[warp]: https://github.com/seanmonstar/warp
[experiments repo]: https://github.com/dbanty/rust-fastapi-experiments
