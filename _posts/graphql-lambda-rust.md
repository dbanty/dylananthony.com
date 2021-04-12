---
title: "Running GraphQL on Lambda with Rust"
excerpt: ""
coverImage: "/assets/blog/graphql-lambda-rust/cover.png"
coverImageAlt: "The Rust mascot 'Ferris the Crab' sits beneath the logos for GraphQL and AWS Lambda. Text beneath the images states 'GraphQL on Lambda with Rust'"
date: "2021-04-11"
author:
  name: Dylan Anthony
  picture: "/assets/blog/initials.png"
---

> Cover image created by me using [Ferris the Crab], [the GraphQL logo], and [the AWS Lambda logo].

---

Taking a break from OpenAPI for a bit, I decided to explore the primary alternative for web API development—GraphQL. I've been pleasantly surprised so far at how easy it's been to write a GraphQL API using Rust, _much_ easier than doing so with the OpenAPI tools I've tested so far.

## The Options

There are two real contenders for GraphQL crates: [async-graphql] and [Juniper]. Having read briefly through both sets of documentation, [async-graphql] seemed like the more feature-rich and better-documented option, so that's what I went with. If someone has experience with Juniper and thinks it might be a better choice, please leave a note [in the discussion thread][discussion]!

The good news is that both solutions are fairly feature-complete using stable Rust and neither is tightly coupled to a web server! You'll know this is perfect for my use-cases if you've read [my previous posts][fastapi-rust-research] where I repeatedly jumped through hoops shoe-horning a web server into a serverless environment.

## The Setup

As I mentioned, I went with [async-graphql] as the primary crate to build my experiment with. I used a similar AWS CDK setup as in [my previous post][fastapi-rust-lambda] since it was the easiest and most robust way to both test Rust lambdas locally and to deploy them to AWS.

> Interested in seeing how to apply this CDK setup to Python applications? Upvote [this idea thread][python cdk idea].

---

_Was this post super helpful to you? [Tip me on GitHub][github one time]._

_Have a question or comment about this post? Leave it in the [discussion] thread on GitHub!_

_Want to be notified when the next part of this series is released? Watch releases in [the GitHub repo] or [follow me on Twitter][twitter]._

_Have an idea or request for a future blog topic? Drop it in the GitHub discussions under [ideas]._

[ferris the crab]: https://www.rustacean.net
[the graphql logo]: https://github.com/graphql/artwork
[the aws lambda logo]: https://aws.amazon.com/architecture/icons/
[async-graphql]: https://github.com/async-graphql/async-graphql
[juniper]: https://github.com/graphql-rust/juniper
[fastapi-rust-research]: https://dylananthony.com/posts/fastapi-rust-2-research
[fastapi-rust-lambda]: https://dylananthony.com/posts/fastapi-rust-6-aws-lambda
[python cdk idea]: https://github.com/dbanty/dylananthony.com/discussions/36
[github one time]: https://github.com/sponsors/dbanty?frequency=one-time&sponsor=dbanty
[ideas]: https://github.com/dbanty/dylananthony.com/discussions/categories/ideas
[the github repo]: https://github.com/dbanty/dylananthony.com
[twitter]: https://twitter.com/TBDylan
[discussion]: https://github.com/dbanty/dylananthony.com/discussions/29
