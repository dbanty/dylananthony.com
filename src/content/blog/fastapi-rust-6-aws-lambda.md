---
title: "Replacing FastAPI with Rust: Part 6 - AWS Lambda"
date: "2021-03-03"
image: "fastapi-rust-6-aws-lambda.png"
imageAlt: "The Rust mascot 'Ferris the Crab' holds the logos for FastAPI and Rust and is smooshing them together."
discussion: 29
tags: ["Rust", "FastAPI", "OpenAPI", "serverless"]
---

> Cover image created by me using [Ferris the Crab], [the Rust logo], and [the FastAPI logo].

_This post is part of a series. If you haven't already, you may want to read the [previous post] before continuing._

---

The [last blog post][previous post] was a bit long, so I figured I'd take a bit of a break and tackle a shorter topic. In this post, we'll take a look at two different methods to deploy our Rocket application to AWS Lambda: the [SAM CLI] and [AWS CDK].

## Prerequisites

If you want to follow any of the instructions below, you'll first need an AWS account to experiment on. I did this on an account where the free tier has already expired and I didn't accumulate any charges so you _should_ be able to do this for free, but I make no guarantees.

Once you have your account set up, you'll need to generate some IAM credentials, install the AWS CLI, and configure it to use your credentials.

## SAM CLI

If you've followed along with previous posts, you'll know that I've been using the [SAM CLI] in order to test the application locally. This allows me to emulate the AWS environment for testing, which is invaluable, but it's not the only purpose of the tool. It can also be used to build and deploy the application to AWS.

To start off, you'll need to do a `sam build` before each deploy, just like was necessary before doing a `sam local start-api` to run locally. If you've run this before with the same settings I have in [the experiments repo], you'll know that it feels like it takes _forever_ because you get no feedback on the build process. There might be a way to fix this, but I haven't found it yet.

After the app is finish building, you'll want to do a `sam deploy --profile <aws_profile_name> --guided` (omit the `--profile` if you've only got one AWS profile configured) and follow the prompts. This will create a `samconfig.toml` file with some additional required information for SAM. In the future, to redeploy, you can omit the `--guided` because you already have this file. Now feels like a good time to note that if you've copied the `template.yml` from my repo previously, you'll want to update it from the one in [the SAM experiments branch] because it was missing a required attribute previously.

The `sam deploy` command is going to deploy, it's that easy! Answer any questions it has and wait for it to be done. Now you've got an API Gateway URL you can hit to talk to your API in the cloud! But wait... where's the URL?

I had to do quite a lot of digging to figure out where to call my freshly hosted API. Eventually I found [these docs][aws api gateway docs] which informed me the url should be something like `https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/`. The `{restapi_id}` is replaced with an ID I found in the API Gateway console, `{region}` is what I configured with `sam deploy --guided`, and `{stage_name}` appears to be `Prod` by default.

With that URL, I was able to test out my API and verify that everything was working. Now it was time to tear down that test infrastructure, so it didn't sit there in my account now that it was unneeded. Unfortunately there doesn't seem to be a `sam` command for that, so I had to go into the CloudFormation console and tell it to delete everything for me. There was one slight snag with that as I had to find the S3 bucket it created and empty it myself before it would delete.

Overall the `sam` experience was _fairly_ painless. I'd say the toughest part was figuring out which URL to call once everything was deployed.

## AWS CDK

AWS CDK is a tool that allows you to define your AWS infrastructure in a programming language instead of using CloudFormation syntax (e.g. in `template.yml` for `sam`). The languages available listed in the docs are TypeScript, JavaScript, Java, Python, and C#. The CLI tool also seems to indicate that F# is an option, so that might be worth looking into if it interests you. I went with TypeScript for this project because:

1. It's a language I know.
2. It's strongly, statically typed.
3. The CDK CLI requires `node` anyway.

Before I walk through how I got to a working solution (as it was fairly difficult to piece together all the answers), feel free to take a look at [the CDK branch of the experiments repo][the cdk branch] to see the result for yourself. The relevant bits are:

1. The `Makefile` which contains rules for building and deploying via CDK
2. The various `.json` files which configure the Node/TypeScript things
3. The `cdk` directory which contains the actual infrastructure code

Here's the high level process I followed to get there:

1. Follow [these instructions](https://docs.aws.amazon.com/cdk/latest/guide/home.html) to install CDK.
2. Create a directory to keep your infrastructure code in and initialize it with cdk. I did `mkdir cdk && cd cdk && cdk init app --language typescript`.
3. Delete the TypeScript handler code since we won't be needing that.
4. Follow [these instructions](https://docs.aws.amazon.com/cdk/latest/guide/serverless_example.html) to add the necessary components for Lambda and API Gateway.
5. Take some inspiration from [this blog post](https://dev.to/aws-builders/building-an-aws-lambda-extension-with-rust-3p81) for setting up Rust builds with CDK.
6. Find and use `apigateway.LambdaRestApi` in CDK to make the infrastructure setup way simpler.

With the CDK code all set up correctly, the steps to deploy are:

1. `cdk bootstrap --profile <aws_profile>` to set up some basic infrastructure (you only have to do this once).
2. Run `make deploy` which builds the binary, copies it into a new folder and names it "bootstrap", then runs `cdk deploy`. CDK has been configured to upload this folder to Lambda to use as a runtime.

The solution is very nice once you put all the pieces together. I strongly recommend copying most of what I have if you're going with a straight proxy (all requests from API Gateway go to one lambda handler). The clear benefits over SAM are:

1. Using a typed language instead of YAML means you get autocompletion and don't have to fumble around as much through documentation to find what you're looking for.
2. Using normal `cargo build` then copying over the binary means you get normal cargo outputs instead of a blank screen while building.
3. CDK comes with a nice `cdk destroy` command which will tear down _most_ of what it created (just not the bootstrap stuff).
4. It's easy to break up your code into reusable components. You can even create normal packages with whatever language you selected and share those to other projects, so you don't have to copy/paste infrastructure. I'll _definitely_ be doing this in the future.

The only question left to answer was how to run the function locally. Luckily AWS provides official and easy instructions for running a CDK function using SAM, and it works super easily! In my repo, I can do `make local` which basically builds the app, runs `cdk synth > template.yaml`, then runs the same `sam local start-api` I was already doing.

There is another option for running locally which you can try, but I had very little success with it. There is a project called LocalStack for emulating AWS services via Docker containers. I've used it in the past for doing integration tests with SQS, however their API Gateway support is pretty atrocious. You have to dig around in their docs for a while to find the long, custom URL you need to call which requires copying and pasting the API ID every time. All the effort didn't seem worth it to me, but if you want to try it out yourself I found [this GitHub repo](https://github.com/codetalkio/patterns-serverless-rust-minimal) which should get you started in the right direction.

## Conclusion

AWS CDK definitely seems like a great option for deploying functions, as well as managing any other infrastructure you need (like maybe an RDS database?). The only real downside is that you have to add yet another tool on top of SAM and a bunch of dependencies for whatever language you choose to write in. Too bad there's no Rust CDK option... yet.


[ferris the crab]: https://www.rustacean.net
[the rust logo]: https://www.rust-lang.org/policies/media-guide
[the fastapi logo]: https://github.com/tiangolo/fastapi
[the github repo]: https://github.com/dbanty/dylananthony.com
[previous post]: https://dylananthony.com/posts/fastapi-rust-5-rocket-0.5
[sam cli]: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html
[aws cdk]: https://docs.aws.amazon.com/cdk/latest/guide/home.html
[the experiments repo]: https://github.com/dbanty/rust-fastapi-experiments
[the sam experiments branch]: https://github.com/dbanty/rust-fastapi-experiments/tree/rocket-0.5-SAM
[the cdk branch]: https://github.com/dbanty/rust-fastapi-experiments/tree/rocket-0.5-CDK
[aws api gateway docs]: https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-call-api.html
