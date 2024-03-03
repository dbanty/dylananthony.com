---
title: "How to Write a GitHub Action in Rust"
date: "2023-02-06"
image: "./how-to-write-a-github-action-in-rust.webp"
imageAlt: "The GitHub Octocat logo (a cat with octopus tentacles), followed by a plus symbol, followed by Ferris, the Rust mascot (a happy orange crab)."
discussion: 204
tags: ["Rust", "developer-experience"]
---

Creating reusable GitHub Actions is an easy way to automate away everyday tasks in CI/CD. However, actions are typically implemented in TypeScript or JavaScript, and getting started in another language is much more challenging. My favorite language is Rust, so naturally, I wanted an easier way to oxidize my actions.

## cargo-generate

Rather than walk through all of the manual steps like I had to, you can use [`cargo-generate`](https://crates.io/crates/cargo-generate) to get started quickly. From the command line, run `cargo-binstall cargo-generate` followed by `cargo generate dbanty/rust-github-action-template`, then follow the prompts to fill in the boilerplate values.

> Not familiar with [`cargo-binstall`](https://crates.io/crates/cargo-binstall) ? You can use it in place of `cargo install` to install supported binaries rather than compiling them from source! You should make *your* next Rust binary cargo binstallable!

Finally, you'll get a fully-functioning GitHub Action implemented in Rust, ready for customization! You can see an example of the output in my [Sample Rust Action](https://github.com/dbanty/sample-rust-action) repo, which is also a GitHub template (in case you want to skip the `cargo-generate` step).

## Next steps

There's a "TODO" section in the generated `README.md` that gives you a high-level set of next steps—so feel free to dive right in if you're a hands-on learner! For completeness, I'll walk through each of the steps here.

First, you'll want to update the `README` to describe what your action does and how to use it. I find it easier to describe the user experience I *want* to create before I try to create it, a sort of "documentation-driven development". As an example, you can check out the docs for my [GraphQL Check Action](https://github.com/dbanty/graphql-check-action).

Now that you've designed your action, you need to define your inputs and outputs in `action.yml`. Each input needs to be defined in two places:

```yaml
inputs:
  error:
    description: 'The error message to display, if any'
    required: false
    default: ''
runs:
  using: 'docker'
  image: 'ghcr.io/<your_username>/<your_repo_name>:v1'
  args:
    - ${{ inputs.error }}
```

The `inputs` section is how you define inputs for the action itself—GitHub will do some validation here, and users might peak at the description to double-check what each input does. Then, in the `runs` section, you pass the input to your Rust binary. The **order here matters**—so it's easiest to add inputs one at a time.

The `outputs` section lets you tell users what they can receive when the action fails. I recommend including, at a minimum, an `error` output for easier testing:

```yaml
outputs:
  error:
    description: 'The description of any error that occurred'
```

With inputs and outputs defined in `action.yml`, you need to consume the inputs and output the outputs! The generated code comes with an example of each:

```rust
//! src/main.rs
use std::env;
use std::fs::write;
use std::process::exit;

fn main() {
    let github_output_path = env::var("GITHUB_OUTPUT").unwrap();

    let args: Vec<String> = env::args().collect();
    let error = &args[1];

    if !error.is_empty() {
        eprintln!("Error: {error}");
        write(github_output_path, format!("error={error}")).unwrap();
        exit(1);
    }
}
```

Here we can see the list of arguments passed in from the `args` section of `action.yml` ends up in our `args` variable. The first entry in this `Vec` is the name of the binary, so **the first argument is at index 1**. The `eprintln!` line is to write a message to standard error—this will appear in the GitHub logs so that users know what happened. The usage of `write()` is an example of setting an output—you have to write to a file path which is set to the environment variable `GITHUB_OUTPUT` using the format `<output_name>=<output_value>`. Then, `exit(1)` will make the action fail the workflow (putting that little red x on a status check and preventing PRs from merging).

> For more ways you can interact with GitHub Actions (like setting warning messages), I recommend reading [https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions).

The last step is to [change your default branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch) to be named `v1`. This is because the template assumes you will use semantic versioning and that users will always want the latest compatible release (v1). You can use whatever branching and tagging strategy you want, though you'll have to alter more of the generated code.

That's it! If you can handle inputs and outputs and set actions to failed, you're ready to start implementing basic actions! Just write Rust code like normal—you can even install any dependencies you want!

## Testing branches and pull requests

The generated code comes with an included `.github/workflows/integration_tests.yml` file for testing the action. If we take a peak inside, we'll see that it consumes our GitHub action using the `uses: ./` syntax:

```yaml
jobs:
  test_success:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./
```

This works just fine on the `v1` branch, but if we look back at our action definition, we can see a problem:

```yaml
runs:
  using: 'docker'
  image: 'ghcr.io/<your_username>/<your_repo_name>:v1'
  args:
    - ${{ inputs.error }}
```

The action uses the `v1` tag of a Docker image built from this repo. That `v1` tag corresponds to the `v1` Git branch—meaning that if you run these tests on any other branch, you'll still be testing the `v1` branch! The easiest way to override this (e.g., for testing a pull request) is to change that to `image: 'Dockerfile'` . This will test the code of whatever branch you are on, but **be careful not to commit this change back to** `v1` **or it will cause terrible performance for action consumers.**

## How it all works

Now that you know how to implement and test your actions, you're ready to go! But if you're still curious about how everything works, stick around for a deeper dive.

First, we use the [Docker container action](https://docs.github.com/en/actions/creating-actions/creating-a-docker-container-action) method—one of three ways to create GitHub Actions. This enables us to build whatever kind of binary we want, using whatever dependencies we want, without needing JavaScript or complex, dynamic install scripts. There are some limitations, though. Notably, these actions can *only run on runners with a Linux operating system*, making them less flexible or portable than JavaScript actions. Second, some capabilities may not be possible from your actions (like setting environment variables).

Another limitation of Docker actions is the one I mentioned in the testing section above. You either need to publish a Docker image and pin your action to a specific tag or rebuild the Docker image every time that action runs. Rust can take a long time to compile, especially when waiting for Cargo to download dependencies—so building the image every time makes for a poor experience for the action's consumers. However, pinning to a tag makes it harder to test multiple branches, a tradeoff we have to accept for now.

So, to get from your Rust code to a consumable action—we have to build a Docker image and publish it to a registry so that the action can pull it before running your code. Let's take a deeper look at each of these steps.

The template generates a workflow in `.github/workflows/docker-publish.yml` that builds a new image with every push to the `v1` branch. It's a rather complicated workflow, so we'll take a look at a couple of snippets:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    steps:
      # other steps omitted
      - name: Build and push Docker image
        id: build-and-push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

Here we see that we're publishing to the `ghcr.io` registry with an image named the same as our repository—that enables us to push to GitHub Packages with no additional authentication, all of your artifacts live with your repository! We use the `cache-from` and `cache-to` inputs to enable Docker layer caching—crucial given how slow Rust-based images can be to build. We're also passing the input `context: .`, which means it should build from a file called `Dockerfile`—let's look at that next!

```dockerfile
FROM rust:1.67 as build

# create a new empty shell project
RUN USER=root cargo new --bin sample-rust-action
WORKDIR /sample-rust-action

# copy over your manifests
COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml

# this build step will cache your dependencies
RUN cargo build --release
RUN rm src/*.rs

# copy your source tree
COPY ./src ./src

# build for release
RUN rm ./target/release/deps/sample_rust_action*
RUN cargo build --release

# our final base
FROM gcr.io/distroless/cc AS runtime

# copy the build artifact from the build stage
COPY --from=build /sample-rust-action/target/release/sample-rust-action .

# set the startup command to run your binary
ENTRYPOINT ["/sample-rust-action"]
```

Going through this line by line, we:

1. Start with the official `rust` image for building—some slimmer images probably work, but this gives us maximum flexibility for template users.

2. We create an empty Rust binary with `cargo new`, this is a simple way to get Docker layer caching to work. For a more robust solution, you may want to check out [cargo-chef](https://github.com/LukeMathWalker/cargo-chef).

3. The next few steps build just enough of our code to get dependencies to cache. Note that modifying `Cargo.lock` or `Cargo.toml` will bust the cache; this is partially why `cargo-chef` may be a better option.

4. The next couple of steps (starting with `COPY ./src ./src` and going through `RUN cargo build --release`) will build our finished binary

5. Now, we switch over to a smaller base image. You *can* make this even smaller by switching to `gcr.io/distroless/static` but it makes building harder (you have to use some musl toolchain stuff), and I found that it doesn't make the action any faster.

6. We pop our binary over into the fresh `cc` image, and set up the entry point (note that `CMD` doesn't work here; you have to use `ENTRYPOINT`). That's the whole image!


Once we've built and published the image, we immediately test it to catch any last-minute problems. Let's look back at the `.github/workflows/integration_tests.yml` file from earlier:

```yaml
name: Test consuming this action
on:
  pull_request:
    branches: [v1]
  workflow_run:
    workflows: ["Docker Publish"]
    branches: [v1]
    types:
      - completed

jobs:
  test_success:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./

  test_error:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - id: test
        continue-on-error: true
        uses: ./
        with:
          error: "This is an error"
      - name: Verify failure
        if: steps.test.outputs.error != ''
        run: echo "Failed as expected"
      - name: Unexpected success
        if: steps.test.outputs.error == ''
        run: echo "Succeeded unexpectedly" && exit 1
```

The `workflow_run` section tells this action to run after we publish to Docker—this ensures we're testing the version we *just* published and not an earlier variant. Then, the workflow comes with two tests as examples—you'll want to replace these with ones that exercise the actual inputs and outputs. The second job, `test_error`, is much more interesting—this is how you can test *failure* conditions (and why we set the error output). It's just as important to test expected failures as expected successes, maybe even more important!

## Conclusion

My little `cargo-generate` template will hopefully make it easier than ever to write Rust-based GitHub actions. If you try it out and have any suggestions or questions, please [open an issue on the repository](https://github.com/dbanty/rust-github-action-template/issues). If you want to hear more about the motivation for this template—why I'm writing actions in Rust instead of TypeScript, follow me for that upcoming post!