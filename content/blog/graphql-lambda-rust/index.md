+++
title = "Running GraphQL on Lambda with Rust"
date = "2021-04-20"
aliases = ["/posts/graphql-lambda-rust"]

[extra]
featured_image = "cover.png"
featured_image_alt = "The Rust mascot 'Ferris the Crab' sits beneath the logos for GraphQL and AWS Lambda. Text beneath the images states 'GraphQL on Lambda with Rust'"
excerpt = "I've been pleasantly surprised so far at how easy it's been to write a GraphQL API using Rust."

[taxonomies]
tags = ["Rust", "GraphQL", "serverless"]
+++

> Cover image created by me using [Ferris the Crab], [the GraphQL logo], and [the AWS Lambda logo].

---

Taking a break from OpenAPI for a bit, I decided to explore the primary alternative for web API development—GraphQL. I've been pleasantly surprised so far at how easy it's been to write a GraphQL API using Rust, _much_ easier than doing so with the OpenAPI tools I've tested so far.

## The Options

There are two real contenders for GraphQL crates: [async-graphql] and [Juniper]. Having read briefly through both sets of documentation, [async-graphql] seemed like the more feature-rich and well-documented option, so that's what I went with. If you'd like me to take a look at Juniper and do an in-depth comparison, please leave a note [in the discussion thread][discussion]!

The good news is that both solutions are fairly feature-complete using stable Rust, and neither is tightly coupled to a web server! You'll know that this is perfect for my use-cases if you've read [my previous posts][fastapi-rust-research] where I repeatedly jumped through hoops shoe-horning a web server into a serverless environment.

## The Setup

As I mentioned, I went with [async-graphql] as the primary crate to build my experiment with. I used a similar AWS CDK setup as in [my previous post][fastapi-rust-lambda] since it was the easiest and most robust way to both test Rust lambdas locally and to deploy them to AWS.

> Interested in seeing how to apply this CDK setup to Python applications? Upvote [this idea thread][python cdk idea].

I used [cargo-make] to orchestrate a bunch of tasks (I highly recommend you check it out if you find yourself using `Makefile`s with Rust). Postgres via `docker-compose` is my go-to database, though you can easily swap in MySQL or MSSQL since I'm using [SQLx] to run queries. Throw in a bit of [tracing] following the examples of the fantastic [Zero to Production in Rust] book, and we've got ourselves a pretty solid development platform for building our API.

## The Code

You can explore the codebase yourself by looking at [this repo][examples repo], but here's quick rundown. The code consists of two main pieces: the handler and the API.

The handler is the same sort of thing I've written for [previous posts][actix post]—it's the bridge between the `lamedh_` crates (for interfacing with AWS Lambda) and [async-graphql]. All of that is in its own `handler.rs` file, so it could be easily split out into a crate in the future. It's a bit messy with all the generic-handling, but if you were to couple it to your specific schema then the code would look a lot cleaner.

> Would you be interested in a lamedh + async-graphql crate so you don't have to write your own handler? Let me know [in the discussion thread][discussion].

The API code is fairly simple, for the most part you can just follow [the docs][async-graphql]. There are a few things that I struggled to find the answers to—and a few things I haven't yet solved—but generally you just start writing structs and resolver functions, and your GraphQL API comes to life.

> I'm considering putting together a full tutorial on how to build a GraphQL API with Rust and host it with serverless technologies. It would cover auth, subscriptions via websockets, authenticating the GraphiQL UI, the works. If that's something you want, drop a note in [the discussion thread][discussion] and tell me how much, if anything, you'd be willing to pay for such a resource.

## Conclusion

Building a GraphQL API in Rust using AWS Lambda to host it is _way easier_ than trying to build the equivalent with OpenAPI. The main problem is the lack of an end-to-end guide covering everything you need to know. The `async-graphql` docs are great, but terse (as are the `SQLx` docs), so more are needed to make this setup more accessible. There are of course some major differences between GraphQL and OpenAPI (upvote [this idea][graphql vs openapi] if you want a full comparison), so you'd have to be sold on GraphQL already to use this solution. All of that said, this is definitely my favorite solution for making APIs with Rust that I've tried so far.

---

_Was this post super helpful to you? [Tip me on GitHub][github one time]._

_Have a question or comment about this post? Leave it in the [discussion] thread on GitHub!_

_Want to be notified of future posts? Watch releases in [the GitHub repo] or [follow me on Twitter][twitter]._

_Have an idea or request for a future blog topic? Drop it in the GitHub discussions under [ideas]._

[ferris the crab]: https://www.rustacean.net
[the graphql logo]: https://github.com/graphql/artwork
[the aws lambda logo]: https://aws.amazon.com/architecture/icons/
[async-graphql]: https://async-graphql.github.io/async-graphql/en/index.html
[juniper]: https://github.com/graphql-rust/juniper
[fastapi-rust-research]: https://dylananthony.com/posts/fastapi-rust-2-research
[fastapi-rust-lambda]: https://dylananthony.com/posts/fastapi-rust-6-aws-lambda
[python cdk idea]: https://github.com/dbanty/dylananthony.com/discussions/36
[cargo-make]: https://sagiegurari.github.io/cargo-make/
[sqlx]: https://docs.rs/crate/sqlx/0.5.1
[tracing]: https://docs.rs/tracing/0.1.25/tracing/
[zero to production in rust]: https://www.zero2prod.com
[examples repo]: https://github.com/dbanty/rust-lambda-graphql-example
[actix post]: https://dylananthony.com/posts/fastapi-rust-3-trying-actix
[graphql vs openapi]: https://github.com/dbanty/dylananthony.com/discussions/55
[github one time]: https://github.com/sponsors/dbanty?frequency=one-time&sponsor=dbanty
[ideas]: https://github.com/dbanty/dylananthony.com/discussions/categories/ideas
[the github repo]: https://github.com/dbanty/dylananthony.com
[twitter]: https://twitter.com/TBDylan
[discussion]: https://github.com/dbanty/dylananthony.com/discussions/56
