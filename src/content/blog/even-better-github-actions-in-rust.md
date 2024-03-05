---
title: "Even better GitHub Actions in Rust"
date: "2023-06-24"
image: "./even-better-github-actions-in-rust.webp"
imageAlt: "The GitHub Octocat logo (a cat with octopus tentacles), followed by a plus symbol, followed by Ferris, the Rust mascot (a happy orange crab)."
discussion: 208
tags: ["Rust", "developer-experience"]
---

In a [recent post](https://dylananthony.com/blog/how-to-write-a-github-action-in-rust/), I introduced a method for creating GitHub Actions (the reusable code that can be run in CI, not to be confused with the name of the CI platform itself) using Rust and Docker. This _was_ the easiest way I knew to create Rust-based actions... until now.

In [the GitHub discussion for that post](https://github.com/dbanty/dylananthony.com/discussions/204), someone brought up a limitation I hadn't realized. Docker-based actions can only pull images from _public_ registries, meaning you couldn't author a closed-source, private action using this method. Additionally, [Docker-based actions can only be run on Linux-based runners](https://docs.github.com/en/actions/creating-actions/about-custom-actions#types-of-actions), limiting utility even further.

With a lot of inspiration from that conversation and trial and error, I created version 2.0 of my Rust-based GitHub Action template. You can try it out today with `cargo generate dbanty/rust-github-action-template`! Before you do that, read on to see what's changed.

## No more Docker

The only way to surpass the abovementioned limitations was to stop using Docker-based actions. This leaves us with only two other options: `javascript` or `composite`. We're writing our actions in Rust, so using JavaScript as an intermediary seems silly—let's go straight to composite.

A composite action in GitHub is basically a reusable workflow with inputs and outputs that can be published on GitHub Marketplace. Generally, this is good for scripting with Bash or PowerShell and not too much else. However, that scripting is more than enough to _run_ a Rust binary (you do that every time you run `cargo test` in CI), we just need to make the correct binary available!

## Distributing binaries

We _could_ copy over the Rust source code for our action and build the binary right there in the reusable action—but consumers would have to then (even if just occasionally, with caching) wait for Rust to compile something, which can take a _very_ long time.

The _other_ option is to produce pre-built binaries somewhere and _download_ them from the composite action, then run them—which is precisely what I did! Luckily, I already have several examples of building Rust binaries and storing them in GitHub releases (that's how my release automation tool [Knope](https://github.com/knope-dev/knope) works), so I just needed to build up scripting logic which:

1. downloads the correct version of the binary for the current platform

2. passes through arguments from the action inputs to the binary

3. sets outputs for the composite action correctly

We get a GitHub Action that does not require Docker at _all_, builds and distributes Rust binaries in a much more standard way, works with private repositories, _and_ works on macOS and Windows runners.

## A new developer experience

The new setup has a few tradeoffs, but I think they're worth it. First, instead of tracking a constantly-evolving `v1` branch, consumers of the action will target a particular GitHub Release where they can download artifacts. That means consumers need to update their workflows to get the latest action logic—but that's easy with a tool like [Renovate](https://www.mend.io/renovate/) and probably leads to more consistent CI/CD anyway.

The trickier part is for you, the maintainer. Instead of your consumers getting a new version of the action every time you merge to the default branch, you'll need to create a new GitHub release with all the required artifacts. That process _today_ looks like this:

1. Run the "Release" workflow by clicking a few buttons in the GitHub Actions interface and putting in your desired, updated version (note that this does _not_ update the version in `Cargo.toml`, it just sets the version in GitHub releases).

2. Wait for the integration tests to pass with the new version to ensure nothing broke.

3. Open the new release and fill in any release notes. Set it as the latest release and publish it to the marketplace.

I think this can get a little bit easier by integrating it with [Knope](https://github.com/knope-dev/knope); for example, the release notes can be set, and the new version can be determined automatically (plus, it'll bump `Cargo.toml`). There doesn't seem to be a way to publish to the GitHub Marketplace via API, though, so there will still be some manual steps 🤔.

## Let me know

So what do you think about this new and improved version? Do you prefer the Docker method? Is there still something missing from the Rust-based-actions developer experience that you're waiting on? Let me know!
