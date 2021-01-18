---
title: "Replacing FastAPI with Rust: Part 4 - A Solution"
excerpt: "I've finally decided on a framework to use."
coverImage: "/assets/blog/fastapi-rust-4-trying-actix/cover.png"
coverImageAlt: "I've finally decided on a framework to use."
date: "2021-01-17"
author:
  name: Dylan Anthony
  picture: "/assets/blog/initials.png"
---

> Cover image created by me using [Ferris the Crab], [the Rust logo], and [the FastAPI logo].

_This post is part of a series. If you haven't already, you may want to read the [previous post] before continuing._

---

After investigating a few more options, I've finally decided on a framework to use. Now I'm going to walk you step by step through how I got there.

## [rweb]

This framework was ranked second of the three I considered in [part 2] of this blog series. As a short reminder, this framework is build around [warp] and seems to provide most of the features I'm looking for. My main reservations are about the maintenance and community around this project.

I started out by copying and pasting the example from the docs and trying to run it. I noticed right off the bat that the version included in the example is much older than the latest released version, so I went ahead and updated that. Attempting to run the example produced a series of issues:

1. The example doesn't include the `tokio` "macros" feature or `serde` as a dependency, both of which were required. Easy enough to fix.
2. `rweb` requires `rweb-macros` which requires a different version of `rweb-openapi` than `rweb` itself does, so you get two different copies of that. I assume this was just a failure to update internal versions on release at some point.
3. CLion (my editor of choice) highlights a syntax error because of the way endpoints are registered. Basically, it seems like the macros transform the functions into something completely different. You then call the functions to register them, but CLion is expecting you to pass the input params (e.g. json body) to the function which you aren't doing.
4. The code doesn't compile because it was using a module of `syn` which was documented as internal only and do not use. The maintainers of `syn` changed the name of that module to make it even more clear that it was internal only which broke `rweb`. There are a few sub-issues here:
   1. rweb was using an internal module of `syn` which it should not have been.
   2. Someone reported this issue and the maintainer basically said it wasn't broken and closed the issue. It required some additional prodding from both myself and the issue opener for the maintainer to fix the problem.

All of this basically confirmed my fears about rweb. The maintenance and stability of the project are not good enough for me to be comfortable relying on it. By the time the maintainer fixed the issue, I'd already investigated two other frameworks and decided on one.

## [DropShot]

Someone sent me a DM on Twitter recommending I take a look at this project. It's certainly very interesting, though also very young. It seems like this projects goals may align with my own though it would take some work to get there. Specifically, right now there is no supported way to make offline direct requests as I need for a serverless environment. I'll definitely be keeping my eyes on this in the future though.

## [Rocket]

Yes, Rocket. The framework I pretty much immediately discounted in [part 2]. I'm not too proud to admit I was wrong. Between my frustrations with other frameworks and a glowing review [on Dev.to][rocket comment] I had to at least try it. The results were... fantastic.

Okay so this solution doesn't resolve either of my main misgivings about Rocket because it uses the released 0.4 version. The code still requires nightly rust and still does not support async, but both of these have already been resolved on Rocket's "master" branch and therefore will be present in the 0.5.0 release. Then it's just a matter of updating supporting packages.

Getting this all to work was a breath of fresh air compared to previous attempts, so here's the step by step.

I started by copying the official JSON example and tweaking it to have the same pet echo behavior I used in my actix experiment. The code basically looked like this:

```rust
#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
#[macro_use]
extern crate serde_derive;

use rocket_contrib::json::Json;

#[derive(Serialize, Deserialize)]
struct Pet {
    name: String,
    id: Option<i64>,
}

#[post(”/echo”, format = “json”, data = “<pet>”)]
fn echo(pet: Json<Pet>) -> Json<Pet> {
    pet
}

fn main() {
    rocket::ignite().mount(“/rocket”, routes![echo]).launch();
}
```

Pretty simple. That code handles validation, serialization, and deserialization just fine so now I just need to add in AWS Lambda support and OpenAPI documentation.

## AWS Lambda Support

For AWS Lambda support, I used [rocket_lamb]. This uses the official released AWS runtime which is based on an older version of Tokio, so it will take some work to update it for Rocket 0.5 once it's ready. There was one issue I encountered while running this, but the maintainer responded within a day, and it turns out it was an issue with AWS SAM, not [rocket_lamb]. So all I had to do to make my code with with `sam invoke start-api` was to:

1. Downgrade to aws-sam-cli 1.12.0 to avoid the bug
2. `cargo add rocket_lamb`
3. Add `use rocket_lamb::RocketExt;` with the rest of my imports.
4. Add `.lambda()` before `.launch()` in main.

That's it! So easy! And this crate clearly has a responsive and helpful maintainer, great!

## OpenAPI Documentation

[okapi] was clearly the way to go here and also happens to have the same maintainer as [rocket_lamb]. This process was also super simple:

1. Add `okapi`, `rocket_okapi`, and `schemars` (0.7) as dependencies.
2. Copy a couple of things from the example in the README
3. There is no step three

Now I have a self-documenting API compatible with AWS Lambda with very minimal work on my part. [okapi] even comes with a functional (if a bit outdated) Swagger UI, just like FastAPI does!

## Requirements Check

Let's check in with our list of requirements for a FastAPI solution and see where we're at.

1. _"MUST be written in Rust."_ Yup!
2. _"MUST automatically produce an OpenAPI v3 document from the Rust code and comments."_ Yes!
3. _"MUST be easily deployable on AWS Lambda using some infrastructure as code tool (SAM, Serverless, etc.)."_ Actually yes, the only one so far!
4. _"MUST perform at least as fast as an equivalent FastAPI application for common CRUD tasks."_ Tentatively? TechEmpower has it showing a little better in some cases and worse in others, but switching to Tokio in 0.5 is bound change this one way or another.
5. _"MUST interact with a relational database (MySQL or Postgres)."_ Yes, even though the method will likely change with 0.5.
6. _"MUST have a simple way to test endpoints, comparable to pytest with FastAPI."_ The basic tests were quite simple! Much better than what I was able to achieve with actix-web.
7. _"MUST have great documentation."_ I was able to get my basic examples working by just reading the docs, so I'm giving this one a yes as well.
8. _"MUST have stable, active maintenance."_ The Rocket community is definitely active in developing 0.5, and the maintainer of [rocket_lamb] was quite responsive, so yes.
9. _"SHOULD have automatically hosted documentation which allows direct interaction with the API."_ Yes! The version of Swagger UI is a bit old but it works!

If you tally it up, this solution meets every single one of my framework requirements, even the optional one!

## Conclusion

I'm using Rocket! It was way too easy to get all of this working to pass it up. There will certainly be work to do to get [rocket_lamb] and [okapi] ready for Rocket 0.5, but my experience so far has left me very confident!

I'm not completely sure what the next step for me will be. I could try actually deploying a test function using Rocket to a real cloud provider. I could also dig into those two Rocket companion libraries and see how hard it is to update them to work with Rocket's "master" branch. If you have a suggestion, leave it in the [ideas] section of this blog's GitHub repo.

By the way, if you want to check out the Rocket code I ended up with, it's available in the [experiments repo] alongside the actix code from the [previous post].

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
[previous post]: https://dylananthony.com/posts/fastapi-rust-3-trying-actix
[part 2]: https://dylananthony.com/posts/fastapi-rust-2-research
[rweb]: https://github.com/kdy1/rweb
[netlify_lambda_http]: https://docs.rs/netlify_lambda_http/0.2.0/netlify_lambda_http/
[aws sam]: https://aws.amazon.com/serverless/sam/
[experiments repo]: https://github.com/dbanty/rust-fastapi-experiments
[warp]: https://docs.rs/warp/0.2.5/warp/
[dropshot]: https://docs.rs/dropshot/0.3.0/dropshot/
[rocket]: https://rocket.rs
[rocket comment]: https://dev.to/follpvosten/comment/1ae8c
[rocket_lamb]: https://github.com/GREsau/rocket-lamb
[okapi]: https://github.com/GREsau/okapi
