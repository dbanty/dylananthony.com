---
title: "Replacing FastAPI with Rust: Part 6 - AWS Lambda"
excerpt: ""
coverImage: "/assets/blog/fastapi-rust-6-aws-lambda/cover.png"
coverImageAlt: "The Rust mascot 'Ferris the Crab' holds the logos for FastAPI and Rust and is smooshing them together."
date: "2021-02-24"
author:
  name: Dylan Anthony
  picture: "/assets/blog/initials.png"
---

> Cover image created by me using [Ferris the Crab], [the Rust logo], and [the FastAPI logo].

_This post is part of a series. If you haven't already, you may want to read the [previous post] before continuing._

---

The [last blog post][previous post] was a bit long, so I figured I'd take a bit of a break and tackle a shorter topic. In this post, we'll take a look at two different methods to deploy our Rocket application to AWS Lambda: the [SAM CLI] and [AWS CDK].

## Prerequisites

If you want to follow any of the instructions below, you'll first need an AWS account to experiment on. I did this on an account where the free tier has already expired and I didn't accumulate any charges so you _should_ be able to do this for free, but I make no guarantees.

Once you have your account set up, you'll need to generate some IAM credentials, install the AWS CLI, and configure it to use your credentials.

## SAM CLI

If you've followed along with previous posts, you'll know that so far I've been using the [SAM CLI] in order to test the application locally. This allows me to run the app in an environment as close to AWS as possible without actually deploying. Eventually though, you have to actually host this API somewhere, so let's see what it takes to convert what we already have to something deployable.

To start off, you'll need to do a `sam build` before each deploy, just like was necessary before doing a `sam local start-api` to run locally. If you've run this before with the same settings I have in [the experiments repo], you'll know that it feels like it takes _forever_ because you get no feedback on the build process. There might be a way to fix this but I haven't found it yet.

After the app is finish building, you'll want to do a `sam deploy --profile <aws_profile_name> --guided` (omit the `--profile` if you've only got one AWS profile configured) and follow the prompts. This will create a `samconfig.toml` file with some additional required information for SAM. In the future, to redeploy, you can omit the `--guided` because you already have this file. Now feels like a good time to note that if you've copied the `template.yml` from my repo previously, you'll want to update it from the one in [the SAM experiments branch] because it was missing a required attribute previously.

The `sam deploy` command is going to deploy, it's that easy! Answer any questions it has and wait for it to be done. Now you've got an API Gateway URL you can hit to talk to your API in the cloud! But wait... what's the URL?

---

_Have a question or comment about this post? Leave it in the [discussions] thread on GitHub!_

_Want to be notified when the next part of this series is released? Watch releases in [the GitHub repo]._

_Have an idea or request for a future blog topic? Drop it in the GitHub discussions under [ideas]._

[ferris the crab]: https://www.rustacean.net
[the rust logo]: https://www.rust-lang.org/policies/media-guide
[the fastapi logo]: https://github.com/tiangolo/fastapi
[discussions]: https://github.com/dbanty/dylananthony.com/discussions/26
[ideas]: https://github.com/dbanty/dylananthony.com/discussions/categories/ideas
[the github repo]: https://github.com/dbanty/dylananthony.com
[previous post]: https://dylananthony.com/posts/fastapi-rust-5-rocket-0.5
[SAM CLI]: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html
[AWS CDK]: https://docs.aws.amazon.com/cdk/latest/guide/home.html
[the experiments repo]: https://github.com/dbanty/rust-fastapi-experiments
[the SAM experiments branch]: https://github.com/dbanty/rust-fastapi-experiments/tree/rocket-0.5-SAM

