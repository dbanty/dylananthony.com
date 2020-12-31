---
title: "Replacing FastAPI with Rust: Part 2 - Research"
excerpt: "Explore a few of the existing options in the Rust ecosystem to see how close we can get to our FastAPI replacement"
coverImage: "/assets/blog/fastapi-rust-2-research/cover.png"
coverImageAlt: "The Rust mascot 'Ferris the Crab' holds the logos for FastAPI and Rust and is smooshing them together."
date: "2020-12-30"
author:
  name: Dylan Anthony
  picture: "/assets/blog/initials.png"
---

> Cover image created by me using [Ferris the Crab], [the Rust logo], and [the FastAPI logo].

_This post is part of a series. If you haven't already, you may want to read the [previous post] before continuing._

## Intro

After the first post (which was very accurately dubbed a "teaser" in [a comment on Dev.to][teaser comment]) I was really itching to keep talking about this project. So without further ado, here is part 2! This time around we're going to explore a few of the existing options in the Rust ecosystem to see how close we can get to our FastAPI replacement.

## [rweb]: The Promising Upstart

The very first project I came across when searching for the FastAPI of Rust was [rweb]. This is a relatively new project (just under a year old at time of writing) which seems to share a lot of similarities with our framework-to-beat. Much like FastAPI adds on some OpenAPI features to Starlette, rweb builds on top of the framework [warp].

### Where it Shines

Users of FastAPI will feel immediately at home looking at the example code:

```rust
#[get("/search")]
fn search(_product: Query<SearchOption>) -> Json<Vec<Product>> {
    // ...
    // This returns 200 with application/json
}
```

Easy peasy, you declare your path, method, input type/location, output type/location and you're off to the races. This method and its associated types will get documented in an OpenAPI v3 format _and_ automatically validated! Your doc comments for your function will even become the description of the path operation. Very FastAPI-esque.

### Where it Falls Short

Aside from a few missing OpenAPI types (e.g. cookies), [rweb] seems like a relatively complete solution. The biggest flaw, in my opinion, just from reading a bit, is around project maintenance. Recent releases are not documented in GitHub and indeed there seems to be no changelog at all. There are also out of date milestones and issues which have gone several months with no reply from the maintainer.

To their credit, the maintainer did accept a pull request from me to fix a slight typo in the README within the same day, so they're definitely paying attention. However, if I want to replace a framework like FastAPI for production workloads, I want to have confidence that the community will address any major issues if they come up.

The other big indicator to me that the community isn't where I'd ideally like it to be is the relatively limited documentation. The project is billed as a complete framework which just happens to build on top of [warp], but the documentation seems to expect that you already know how to use [warp]. It was also quite difficult for me to gauge how many OpenAPI features are covered from the documentation or glean any clues as to whether it can be hosted easily in AWS Lambda.

Let me be clear, maintaining an open source project is _hard_ and _time consuming_. Putting your code out there for other people to use is something to be celebrated and encouraged. My comments above are in no way meant to be a knock on [rweb] or its collaborators, just a transparent account of why I'm hesitant to use it for company projects.

### Will I Use It?

A solid _maybe_. The product seems great, and if the code functions as well as the brief examples indicate, this is the best option from a code perspective (oops, spoilers!). Given my concerns about the community, I would have to be comfortable forking and maintaining my own version of this framework in the event that I need features and can't wait months for a PR to be reviewed. Even if that's not the case, I'll certainly have to write much more complete documentation for my teammates to be able to use this project effectively. I'm not mortally opposed to any of that, but I'd rather avoid it if I can.

## [Rocket]: The Lib I Want to Like

Oh [Rocket], you playful muse. I've watched you ascend from the first time I learned of Rust; yet each time I reach for you my heart sinks more. This research project of mine lead me to [okapi], an extension to add one of the only requirements you're missing: OpenAPI documentation. And yet, I have to pass once again. While most of the Rust ecosystem blazes toward async, you inch toward it too slowly. Perhaps next time I search for a web framework our paths will align, but until then, I must follow a different orbit.

## [Paperclip]: The Sensible Option

[Paperclip] is a project to provide various forms of OpenAPI tooling to the Rust ecosystem. Particularly relevant to our mission is a [plugin][paperclip plugin] for [actix-web].

### Pros

[actix-web] is easily to most well known and well documented web framework for Rust, so that's a pretty good start. What's more, it is a very active project, already making progress toward Tokio 1.0 (while at last check Rocket was still pursuing Tokio 0.2 integration). It also comes with built in support for input validation and output serialization via Rust's go-to library [serde]. That means all [Paperclip] has to do is document those same functions and structures, which it does!

[Paperclip] seems to be quite an active project seeking to build OpenAPI functionality on top of [actix-web] by using the plugin system the latter provides. The project is well documented, and even has its own Discord server for chatting about development.

### Cons

The biggest issue with [Paperclip] is that it only currently supports OpenAPI v2. There is work in progress to add v3 support, but it's just that: in progress. This means that if I really want to supplant FastAPI with this actix-web w/ Paperclip combo, I'm going to have to write my own v3 implementation. There is a [GitHub Issue](https://github.com/wafflespeanut/paperclip/issues/177) which talks about the intended strategy for achieving this being somehow based on converting a v2 spec to v3. I'm not sure how possible this will be considering there are some important features missing from v2. It makes more sense to me for this to be a different feature via cargo flag (or at least a different module).

Subjectively, the code required to use this project is also uglier than [rweb]. Here's the example from their website (minus some comments):

```rust
#[api_v2_operation]
async fn echo_pet(body: Json<Pet>) -> Result<Json<Pet>, ()> {
    Ok(body)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new()
        .wrap_api()
        .service(
            web::resource("/pets")
                .route(web::post().to(echo_pet))
        )
        .with_json_spec_at("/api/spec")
        .build()
    ).bind("127.0.0.1:8080")?
    .run().await
}
```

The main difference here is that you have to use a macro to get the endpoint documented which is _separate from_ the binding of the endpoint to the application. Then the assigning of a path and method happens elsewhere, not where the function is declared. There can certainly be arguments made for this more explicit, non-macro style... but it's definitely different than what a Python developer would be used to with FastAPI.

### Is This the One?

_Probably_. I think that Paperclip + actix-web seems like the most promising candidate. I'm really not opposed to writing the OpenAPI v3 construction myself as I've worked with the structure a fair bit in my [openapi-python-client] project (shameless plug).

## Conclusion and Next Steps

In the next blog post in this series, I'm going to take [actix-web] and [Paperclip] for a test drive! Hopefully I can have myself an OpenAPI v2 API hosted on Lambda as a proof of concept. The level of difficulty of that task should help inform my decision as a whole... and whether I need to give [rweb] more of a chance.

---

_Have a question or comment about this post? Leave it in the [discussions] thread on GitHub!_

_Want to be notified when the next part of this series is released? Watch releases in [the GitHub repo]._

[ferris the crab]: https://www.rustacean.net
[the rust logo]: https://www.rust-lang.org/policies/media-guide
[the fastapi logo]: https://github.com/tiangolo/fastapi
[discussions]: https://github.com/dbanty/dylananthony.com/discussions/11
[ideas]: https://github.com/dbanty/dylananthony.com/discussions/categories/ideas
[the github repo]: https://github.com/dbanty/dylananthony.com
[previous post]: https://dylananthony.com/posts/fastapi-rust-1-intro
[teaser comment]: https://dev.to/patarapolw/comment/19m15
[rweb]: https://github.com/kdy1/rweb
[warp]: https://github.com/seanmonstar/warp
[rocket]: https://github.com/SergioBenitez/Rocket
[okapi]: https://github.com/GREsau/okapi
[paperclip]: https://github.com/wafflespeanut/paperclip
[paperclip plugin]: https://paperclip.waffles.space/actix-plugin.html
[actix-web]: https://github.com/actix/actix-web
[openapi-python-client]: https://github.com/triaxtec/openapi-python-client
[serde]: https://serde.rs
