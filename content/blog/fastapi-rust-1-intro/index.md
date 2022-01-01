+++
title = "Replacing FastAPI with Rust: Part 1 - Intro"
date = "2020-12-29"
aliases = ["/posts/fastapi-rust-1-intro"]

[extra]
excerpt = "I'll either come away with the new best way to produce APIs, or even more evidence of how amazing FastAPI is."
featured_image = "cover.png"
featured_image_alt = "The Rust mascot 'Ferris the Crab' holds the logos for FastAPI and Rust and is smooshing them together."

[taxonomies]
tags = ["Rust", "FastAPI", "OpenAPI"]
+++

> Cover image created by me using [Ferris the Crab], [the Rust logo], and [the FastAPI logo].

## What is this Series?

I am going to produce a series of blog posts attempting to create a method for replacing FastAPI applications with Rust for my particular use case. I don't know what this will lead to just yet; it may end up being a tutorial, it may end up being a development log as I create the pieces of the ecosystem that are missing, it may end up being only one more post if I find something that magically solves all my issues.

Check out the requirements section below for _exactly_ what I'm trying to achieve!

## Some Background

I have been using FastAPI as my go-to back end framework for a little over a year now and it's _almost_ perfect. In my opinion, FastAPI is the **best** way to create an API **in any language**. I regularly look around the ecosystem for
competitors worth trying and haven't found anything compelling enough to try... yet.

For those of you not acquainted, [FastAPI] is a Python web framework for creating OpenAPI documented REST APIs. You can do a lot more with it too, but that's my primary use case, and the one that matters to this blog series. The key features (to me) are:

1. Automatic documentation via OpenAPI, which lets you do things like [generate Python code][openapi-python-client] that knows how to talk to your API.
2. [A documentation UI][swagger ui] allowing users to easily understand and interact with the API directly.
3. Input validation via [Pydantic], the same tool used to generate the schemas in documentation. Basically you just annotate your endpoint with inputs/outputs and they are documented _and_ validated.
4. Easy to test using something like pytest due to some fantastic included tools and the flexibility of dependency injection.
5. [Fantastic documentation][fastapi] of FastAPI itself, some of the best I've ever read, without which it might as well not have all of these amazing features.
6. Easy to host on AWS Lambda using [Mangum].

FastAPI does much, _much_ more and has one of the most amazing open source communities I've ever encountered. So why am I looking to replace it? FastAPI has one fundamental drawback that it will never overcome: Python.

Don't get me wrong, I love Python, it's my second favorite language, but it has some serious limitations that I would love to move beyond.

## Why Rust?

I know, I know, Rust users never shut up about how great the language is, so I'll try to keep this brief and on topic. [Let me know in GitHub][ideas] if you want a blog post going in depth on any of these points:

1. Python's static typing story is a sad one. It might get better, but it's not good enough right now, and will never be as good as Rust's.
2. Rust is way faster than Python which matters when you're billed by execution time (like on AWS Lambda).
3. Rust error handling is _undeniably better_ than exception-based errors (like in Python) when stability matters.
4. Algebraic data types in Rust allow you to encode business **and security** logic in a way that your code **will not compile** if you get it wrong. This is far better than forcing internal server errors when when someone forgets to secure an endpoint like I do in FastAPI.

## Requirements

The end result of my investigation should be a method to produce an API which:

1. MUST be written in Rust.
2. MUST automatically produce an OpenAPI v3 document from the Rust code and comments.
   1. The developer may need to know some OpenAPI concepts for properly documenting things, but should not have to write JSON or YAML to achieve it.
   2. The document MUST be hosted on an endpoint of the API so it's accessible from the internet.
3. MUST be _easily_ deployable on AWS Lambda using some infrastructure as code tool (SAM, Serverless, etc.).
4. MUST perform at least as fast as an equivalent FastAPI application for common CRUD tasks.
5. MUST interact with a relational database (MySQL or Postgres).
6. MUST have a _simple_ way to test endpoints, comparable to pytest with FastAPI. If a lot of work has to go into testing, people just won't test things.
7. MUST have great documentation.
8. SHOULD have automatically hosted documentation which allows direct interaction with the API. If not, this could be achieved by hosting the documentation externally.

## Conclusion

So I'm going on an adventure to replace what I believe to be the best API framework that exists with something else. There will be research, documentation, writing of Rust code, and who knows what else! In the end, I'll either come away with the new best way to produce APIs, or even more evidence of how amazing [FastAPI] is. Sound like fun? Follow along with this series! Have some suggestions of where I should start? Please, _please_ let me know.

---

_Have a question or comment about this post? Leave it in the [discussions] thread on GitHub!_

_This post is part of a series and the [next part] is already available!_

_Want to be notified of future blog posts? Watch releases in [the GitHub repo]._

[ferris the crab]: https://www.rustacean.net
[the rust logo]: https://www.rust-lang.org/policies/media-guide
[the fastapi logo]: https://github.com/tiangolo/fastapi
[discussions]: https://github.com/dbanty/dylananthony.com/discussions/9
[openapi-python-client]: https://github.com/triaxtec/openapi-python-client
[swagger ui]: https://swagger.io/tools/swagger-ui/
[pydantic]: https://pydantic-docs.helpmanual.io
[fastapi]: https://fastapi.tiangolo.com
[mangum]: https://mangum.io
[ideas]: https://github.com/dbanty/dylananthony.com/discussions/categories/ideas
[the github repo]: https://github.com/dbanty/dylananthony.com
[next part]: https://dylananthony.com/posts/fastapi-rust-2-research
