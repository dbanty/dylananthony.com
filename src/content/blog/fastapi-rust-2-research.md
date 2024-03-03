---
title: "Replacing FastAPI with Rust: Part 2 - Research"
date: "2021-01-01"
image: "fastapi-rust-2-research.png"
imageAlt: "The Rust mascot 'Ferris the Crab' holds the logos for FastAPI and Rust and is smooshing them together."
discussion: 11
tags: ["Rust", "FastAPI", "OpenAPI"]
---

> Cover image created by me using [Ferris the Crab], [the Rust logo], and [the FastAPI logo].

_This post is part of a series. If you haven't already, you may want to read the [previous post] before continuing._

## Intro

After the first post (which was very accurately dubbed a "teaser" in [a comment on Dev.to][teaser comment]), I was really itching to keep talking about this project. So without further ado, here is part 2! This time around we're going to explore a few of the existing options in the Rust ecosystem to see how close we can get to our FastAPI replacement.

## [rweb]: The Promising Upstart

The very first project I came across when searching for the FastAPI of Rust was [rweb]. This is a relatively new project (just under a year old at time of writing) which seems to share a lot of similarities with our framework-to-beat. Much like FastAPI adds features to Starlette, rweb builds on top of the framework [warp].

### Where it Shines

Users of FastAPI will feel immediately at home looking at the example code:

```rust
#[get("/search")]
fn search(_product: Query<SearchOption>) -> Json<Vec<Product>> {
    // ...
    // This returns 200 with application/json
}
```

You have a macro (comparable in this context to a Python decorator) which defines the HTTP method and path of the operation. Then you declare the function which does the work, the arguments to which are inputs to the endpoint and the return type is the output. You can declare the location of inputs (`Query`), format of output (`Json`), and structure of the data for both. This method and its associated types will get documented in an OpenAPI v3 format _and_ automatically validated! Your doc comments for your function will even become the description of the path operation. Very FastAPI-esque.

### Where it Falls Short

Aside from a few missing OpenAPI types (e.g. cookies), [rweb] seems like a relatively complete solution. The biggest flaw, in what I can tell from reading documentation, is around project maintenance. Recent releases are not documented in GitHub and indeed there seems to be no changelog at all. There are also out of date milestones and issues which have gone several months with no reply from the maintainer.

To their credit, the maintainer did accept a pull request from me to fix a slight typo in the README within the same day, so they're definitely paying attention. However, if I want to replace a framework like FastAPI for production workloads, I want to have confidence that the community will address any major issues if they come up.

Another concern is the relatively limited documentation. Very few projects will come close to the quality of FastAPI's documentation, but [rweb's][rweb docs] are particularly terse. What is documented typically provides a series of code examples, often with little or no explanation.

Let me be clear, maintaining an open source project is _hard_ and _time consuming_. Putting your code out there for other people to use is something to be celebrated and encouraged. My comments above are in no way meant to be a knock on [rweb] or its collaborators, just a transparent account of why I'm hesitant to use it for company projects.

### Will I Use It?

Let's look back at the requirements from [part 1][previous post]:

1. _"MUST be written in Rust."_ Check! We wouldn't be looking at it if it weren't.
2. _"MUST automatically produce an OpenAPI v3 document from the Rust code and comments."_ Also check!
3. _"MUST be easily deployable on AWS Lambda using some infrastructure as code tool (SAM, Serverless, etc.)."_ I couldn't find any examples or documentation for deploying an [rweb] app this way, so it's not going to be _easy_. I did find one comment on a GitHub issue for [warp] that may be useful, but it'll take some work.
4. _"MUST perform at least as fast as an equivalent FastAPI application for common CRUD tasks."_ Yes? The [tech empower] benchmarks (same ones FastAPI lists on its website) actually show warp performing _worse_ than FastAPI at multiple queries on "physical hardware", but still better on the Cloud. So that feels like a yes from what we can tell.
5. _"MUST interact with a relational database (MySQL or Postgres)."_ Yes, [warp] uses Tokio (so presumably [rweb] does too) which is the most popular Rust async runtime, and one I can use with my preferred SQL library [sqlx].
6. _"MUST have a simple way to test endpoints, comparable to pytest with FastAPI."_ I haven't tried it, but [warp] includes a testing module, so this should be fine.
7. _"MUST have great documentation."_ Nope.
8. _"SHOULD have automatically hosted documentation which allows direct interaction with the API."_ Also no.

That means it meets 5 out of 7 "MUST" requirements, leaving me to figure out running on AWS Lambda and writing a complete user's guide. There is, however, an 8th "MUST" requirement that has surfaced from my research: "MUST have stable, active maintenance." I'm looking to replace some production workloads with whatever my choice is, which means I need to be confident that an update to the library won't break everything unexpectedly and that security vulnerabilities, if found, will be fixed quickly. Based on what I've seen, [rweb] does not meet this requirement.

All of that is to say [rweb] is a possible solution, but not a likely one. The product seems great, and if the code functions as well as the brief examples indicate, this is the best option from a code perspective (oops, spoilers!). Given my concerns about the community, I would have to be comfortable forking and maintaining my own version of this framework in the event that I need changes and can't wait months for a PR to be reviewed. Even if that's not the case, I'll certainly have to write much more complete documentation for my teammates to be able to use this project effectively. I'm not mortally opposed to any of that, but I'd rather avoid it if I can.

## [Rocket]: The Lib I Want to Like

Oh [Rocket], you playful muse. I've watched you ascend from my early Rust days; yet each time I reach for you my heart sinks more. This research project of mine led me to [okapi], an extension for OpenAPI documentation. And yet, I have to pass once again. While most of the Rust ecosystem blazes toward async, you inch toward it too slowly. Perhaps next time I search for a web framework our paths will align, but until then, I must follow a different orbit.

## [Paperclip]: The Sensible Option

[Paperclip] is a project to provide various forms of OpenAPI tooling to the Rust ecosystem. Particularly relevant to our mission is a [plugin][paperclip plugin] for [actix-web].

### Pros

[actix-web] is easily to most well known, well documented, and well used web framework for Rust. What's more, it is a very active project, already making progress toward Tokio 1.0 (while at last check Rocket was still pursuing Tokio 0.2 integration). It also comes with built in support for input validation and output serialization via Rust's go-to library [serde]. That means all [Paperclip] has to do is document those same functions and structures, which it does!

[Paperclip] seems to be quite an active project seeking to build OpenAPI functionality on top of [actix-web] by using the plugin system the latter provides. The project is well documented, and even has its own Discord server for chatting about development.

### Cons

The biggest issue with [Paperclip] is that it only currently supports OpenAPI v2. There is work in progress to add v3 support, but it's just that: in progress. This means that if I really want to supplant FastAPI with this actix-web w/ Paperclip combo, I'm going to have to write my own v3 implementation. There is a [GitHub Issue](https://github.com/wafflespeanut/paperclip/issues/177) which talks about the intended strategy for achieving this being somehow based on converting a v2 spec to v3. I'm not sure how possible this will be considering there are some important features missing from v2. It makes more sense to me for this to be a different feature via cargo flag (or at least a different module).

Subjectively, the code required to use this project is also uglier than [rweb]. Here's an example from their website:

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

Let's check the scoreboard again:

1. _"MUST be written in Rust."_ Yup!
2. _"MUST automatically produce an OpenAPI v3 document from the Rust code and comments."_ Sadly, no. We'll get v2 for free but have to write our own v3 variant.
3. _"MUST be easily deployable on AWS Lambda using some infrastructure as code tool (SAM, Serverless, etc.)."_ I _was_ able to find some examples and sample projects deploying actix-web to Lambda. It will still require some tinkering but I have a pretty solid foundation. So tentatively yes.
4. _"MUST perform at least as fast as an equivalent FastAPI application for common CRUD tasks."_ Yes! [actix-web] is usually one of the top few entries [tech empower] benchmarks. Assuming [Paperclip] doesn't add a massive amount of overhead, it should be significantly faster than FastAPI.
5. _"MUST interact with a relational database (MySQL or Postgres)."_ Yes again! There are, in fact, several documented examples of using [sqlx] with [actix-web] which I've seen around the internet.
6. _"MUST have a simple way to test endpoints, comparable to pytest with FastAPI."_ Yup!
7. _"MUST have great documentation."_ Yes! Both [actix-web] and [Paperclip] have quite good documentation. I would even put [actix-web] in the "great" category.
8. _"MUST have stable, active maintenance."_ It sure seems like it!
9. _"SHOULD have automatically hosted documentation which allows direct interaction with the API."_ Not yet, but work is actually in progress on this.

Tallying up the results, we get 7/8 "MUST" requirements met. I think that Paperclip + actix-web seems like the most promising candidate. I'm really not opposed to writing the OpenAPI v3 construction myself as I've worked with the structure a fair bit in my [openapi-python-client] project (shameless plug).

## Conclusion and Next Steps

In the next blog post in this series, I'm going to take [actix-web] and [Paperclip] for a test drive! Hopefully I can have myself an OpenAPI v2 API hosted on Lambda as a proof of concept. The level of difficulty of that task should help inform my decision as a whole... and whether I need to give [rweb] more of a chance.

---

_This post is part of a series and the [next part] is already available!_

[ferris the crab]: https://www.rustacean.net
[the rust logo]: https://www.rust-lang.org/policies/media-guide
[the fastapi logo]: https://github.com/tiangolo/fastapi
[ideas]: https://github.com/dbanty/dylananthony.com/discussions/categories/ideas
[previous post]: https://dylananthony.com/posts/fastapi-rust-1-intro
[teaser comment]: https://dev.to/patarapolw/comment/19m15
[rweb]: https://github.com/kdy1/rweb
[rweb docs]: https://docs.rs/rweb/0.5.4/rweb/
[warp]: https://github.com/seanmonstar/warp
[rocket]: https://github.com/SergioBenitez/Rocket
[okapi]: https://github.com/GREsau/okapi
[paperclip]: https://github.com/wafflespeanut/paperclip
[paperclip plugin]: https://paperclip.waffles.space/actix-plugin.html
[actix-web]: https://github.com/actix/actix-web
[openapi-python-client]: https://github.com/triaxtec/openapi-python-client
[serde]: https://serde.rs
[tech empower]: https://www.techempower.com/benchmarks/#section=data-r19&hw=cl&test=query&f=zik0zj-zik0zj-zik0zj-zik0zj-zik0zj-zik0zj-yyku7z-ziimf3-zik0zj-zik0zj-71
[sqlx]: https://github.com/launchbadge/sqlx
[next part]: https://dylananthony.com/posts/fastapi-rust-3-trying-actix
