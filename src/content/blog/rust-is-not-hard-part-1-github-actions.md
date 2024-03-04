---
title: "Rust is not hard! Part 1: GitHub Actions"
date: "2023-04-20"
image: "./rust-is-not-hard-part-1-github-actions.webp"
imageAlt: "A happy Ferris (a cute orange crab) with their claws in the air and a smile on their face. Above them is the title, 'Rust is not hard!' and below them is the subtitle, 'Part 1: GitHub Actions'"
discussion: 207
tags: ["Rust", "TypeScript"]
---

The most common description of Rust I hear is something like, "it's great for performance but too hard or cumbersome or annoying for most tasks." I don't think this description could be more wrong. Sure, it can be fast, but that's not the main reason to pick Rust. You should pick Rust because it's _easy_ to build with. It empowers you to create incredible software while _enjoying_ the experience.

Sound too good to be true? I'll be honest; although this is my fervent belief, I wasn't sure it would hold up in many situations. Until now...

## TL;DR

- I implemented the same reusable GitHub Action in both TypeScript and Rust

- It took about 3 hours for each implementation, 5 minutes fewer for the TypeScript version

- Rust was significantly less frustrating in debugging the problems I had, _and_ I am more confident in the quality of the result

- I created a [template](https://github.com/dbanty/rust-github-action-template) that should shave around 45 minutes off of the Rust time for future adventurers, meaning Rust should be _even faster_ than TypeScript to implement moderate-to-complex actions from now on 🎉

## The first experiment

I wanted to write a reusable GitHub Action which [runs some quick checks on GraphQL servers](https://github.com/marketplace/actions/check-graphql). I've authored actions before, but they're usually short [Python scripts](https://github.com/openapi-generators/openapitools-generator-action/blob/v1/entrypoint.py) distributable via [composite actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action). This new action is too complex for a simple script.

So, naturally, I decided to check out the [other options for actions](https://docs.github.com/en/actions/creating-actions/about-custom-actions) and found that the best-supported, most popular methods are JavaScript and TypeScript. So I wrote this action in TypeScript (my preference of the two) and had a terrible time doing it 😬. "There must be a better way!" I cried and immediately started over, this time in my favorite language.

That's when the idea for this blog post came about—if I were going to implement this same action in TypeScript and Rust, I might as well compare my experience in each. So, I implemented the action twice more, this time while recording my efforts for science! First, I wrote it in Rust, then in TypeScript (again).

> Side note: I'm not going to release that raw footage because it's incredibly boring (trust me, I had to watch it and take notes to come to my conclusions), but if anyone would be interested in a sped-up, commentated version where I walk through each implementation and all the trouble I had, let me know!

I intend to do something similar for other types of projects and languages. If there's a particular comparison _you'd_ like to see, [please let me know](https://github.com/dbanty/dylananthony.com/discussions/205)!

## Some Rules

I wanted the comparison to be as fair as possible, so I set a few rules for myself:

1. When I encounter a problem I've seen before, I must do my best to solve it as if I don't know the solution. This is especially important because I have more Docker + Rust experience than most developers. I have also written this exact thing in TypeScript before (so I have solved most problems before).

2. Any work which is duplicated between _both_ implementations doesn't count against either. For example, I created a bunch of integration tests that were completely reusable for both implementations—so I cut that out of my analysis.

3. The code should be shippable—but does not need to be perfect. I must be confident enough in the action to push the "publish" button, but I don't need to go down every rabbit hole to make it optimal (for example, I didn't parallelize any of the checks or set up benchmarking). I _do_, however, need to clean up any warnings or errors from the build tooling and linters.

## The Setup

I mostly wrote each implementation in one go—Rust, then TypeScript—because it was more natural. However, I will tell the story by swapping back and forth between the same section for each language. The first task was getting started—setting up a super simple working action to serve as a foundation.

In Rust, this took a fair amount of effort. I spent 58 minutes (about one-third of the total) setting up the action. First, I had to read the [GitHub documentation on Docker actions](https://docs.github.com/en/actions/creating-actions/creating-a-docker-container-action), then find an article about [making a Dockerfile for Rust](https://dev.to/rogertorres/first-steps-with-docker-rust-30oi). Once I had the file, there was some back-and-forth fighting with GitHub Actions—and that was just the beginning. The hardest part was figuring out how to bypass the rebuilding of the image on every run—Rust is notoriously slow to compile, and waiting several minutes for the action to _start_ was out of the question.

This section highlights the worst part of Rust today—it is still a very young programming language, so it's missing a lot of resources available to other languages. After this project, I [made a template](https://github.com/dbanty/rust-github-action-template) and a corresponding [blog post](https://dylananthony.com/blog/how-to-write-a-github-action-in-rust/) so that future developers (probably me) will have a much easier time implementing Rust actions. However, this template wasn't available to me _yet_, so it doesn't count for this experiment.

On the TypeScript side, setup was much easier. There was already a [template from GitHub](https://github.com/actions/typescript-action) that took care of the basics. Most of the time spent here was updating dependencies and getting my editor to play nicely with it—18 minutes, about 10% of the total.

This was the _only_ part of implementing this action that took me _less_ time in TypeScript than in Rust—but it took 40 minutes less, which is enough to bring the total development time in favor of TypeScript.

## Implementation

Writing the business logic of the action took the bulk of the time in both implementations—116 minutes for Rust and 145 minutes in TypeScript. Let's walk through each issue I spent time on in this phase.

### Error Handling

Rust does not have exceptions. This means that every time there _could_ be an error, you're forced to deal with it. I don't allow panics in my production code, so I wasn't going to `.unwrap()` as a shortcut. Instead, I produced meaningful error messages for every possible error condition I encountered and bubbled them up in a type-safe way. This requires more upfront thought and effort than exception-based languages but means you're less likely to show an unfriendly error message (like a stack trace) to an end user.

In TypeScript, there are exceptions. As with _most_ exception-based languages, there are no static tools to help you know where or when they could occur. For production code, displaying an exception's stack trace is unacceptable (just like panicking)—I want to give users actionable advice. In TypeScript, you either have to encounter an error organically (hopefully not in production) or rely on documentation. It's also exceedingly rare for the _type_ of all potential errors to be documented, so usually, I had to run the code through known error conditions and read the output (or set a breakpoint with a debugger) to find out what information was available to me. For example, I want to tell the difference between someone providing a malformed URL and a server being unreachable (so that I can provide users with relevant suggestions). The only way to do that is to know how the errors differ between those two conditions.

Overall, I think I spent more time handling Rust errors (I certainly had more checks), but I was more _frustrated_ dealing with TypeScript errors (because what I was looking for was hard to find). I definitely have more confidence that my end users will have a better experience with the Rust version since I may have missed some possible TypeScript exceptions.

### Learning about GitHub Actions

Even with the setup done, there was much to learn about using GitHub Actions in both environments. The TypeScript template mostly came with examples of functions to call to get inputs, set outputs, etc. For the Rust version, I mostly resorted to reading [bash examples](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions) and translating those to equivalent Rust code. TypeScript is the clear winner, though the total effort for _either_ language was quite low. Again, like the initial setup, this is because TypeScript is older and more popular than Rust.

### Outdated idioms

This is the other side of the "Rust is a young language" coin. When following examples and IDE suggestions, there was only a single instance of copied code being out of date—and the code still ran fine; the linter just told me I should do it the newer way (`format!("{thing}")` instead of `format!("{}", thing)`). There wasn't a single time that an example or suggested code didn't compile and run correctly.

On the Node side, conflicting idioms are documented everywhere, and it's not usually clear whether they are outdated! For example, `axios` is documented using the Promise API and CommonJS `require()` imports, but neither worked for my project. My ESLint setup (inherited from GitHub's template) told me that `async/await` is preferred, which required rewriting _and_ made the error-handling documentation for `axios` all but useless to me. My setup also wanted ESM-style `import` instead of `require()`—but switching broke Jest. Several articles and incorrect fixes later, I realized that I just needed to update Jest. These issues were constant in TypeScript, and the error messages and search results were rarely helpful.

Here we have a clear win for Rust, and I don't expect that to change. The official Rust linter, Clippy, is the best I've seen in any language at suggesting (or automatically fixing) updates to idioms. Rust also has a strong backward-compatibility guarantee and dependency management system that, together, mean your builds won't start failing in the future when new versions of the compiler or your libraries come out.

### Paralyzed by choice

While there is often one idiomatic way to do things in Rust, sometimes the choice is unclear. For example, `if` or `match` could be equally valid in branching your logic—sometimes, you have to try both to know what feels better for a particular case. Likewise, choosing between functional-style iterators and imperative loops is not always clear until you've started down one path. It can be good to have options, but it's also easy to waste time deciding the _best_ method.

> Another example of this is going down the rabbit hole of references and lifetimes. Remember, premature optimization is _never_ a good idea. **Start by cloning if you have borrowing issues, only try to optimize with references if you're sure you need them.**

TypeScript is certainly not immune to this, but I found myself spinning for options much less frequently. Usually, there is one _preferred_ method and several older discouraged methods (which ESLint often catches). I give TypeScript the edge on this issue for less time spent on [bikeshedding](https://en.wiktionary.org/wiki/bikeshedding).

### Debugging remote responses

When your code is talking to a remote data source—you will inevitably have to inspect what's happening at runtime when weird things occur. The two approaches I take are setting a breakpoint with a debugger and logging out the information I need to a console (printing). Using a debugger in Rust is easy (with an IDE like CLion), but the information you get from it is not always useful. For example, if I want to inspect a generic, parsed JSON payload without modifying my code, it's pretty much impossible. Because of this, I often resorted to printing the result, tweaking my code, and repeating until everything worked.

In TypeScript, the dynamically-typed nature of the code leads to a much clearer debugging experience. Actually, my process for figuring out what a remote server is doing is pretty much identical to figuring out how each exception worked. I suppose it makes sense that the debugging experience would be better for a language where less static information is available. TypeScript wins here.

### The tooling

In Rust, you get a standard set of tools that all work very well together. The build tool (`cargo`) manages the compiler (`rustc`), your tests, and your dependencies for you. If you used `rustup` (the recommended installer/version manager for Rust), you also get a formatter (`rustfmt`) and linter (`clippy`) for free, which are guaranteed to work well with the rest of the toolchain. There are many more features (e.g., docs) that I didn't need here, but the picture is generally that everything plays nice and gets out of my way unless it has _useful_ feedback.

In TypeScript, everything is separate. The compiler (`tsc`), formatter (`prettier`), linter (`eslint`), testing framework (`jest`), and runtime (`node`) are all distinct components, usually requiring extra dependencies to integrate them. NPM is generally pretty bad at telling you when you have incompatibilities (e.g., when my version of `@types/node` did not match my version of Node). The tools like fighting each other (e.g., when `eslint` was mad about an import that `tsc` needed for proper typing or when `jest` + `ts-jest` needed a different, special config from `tsc`/`ts-node`). You end up with many more config files and a lot more time spent fiddling with the tools than would be needed in Rust—sometimes to no end (I had to disable type-checking in a couple of places because I couldn't make it happy 😔)! This makes for a _frustrating_ developer experience, especially when compared to the joy of Rust's.

Without question, Rust has better tooling. In fact, Rust has the _best_ tooling of any language I've ever used.

### Documentation

Every library I've used in Rust has docs on [https://docs.rs](https://docs.rs) generated with the standard `cargo doc` tool. You always know what to expect, examples can be tested with `cargo test`, and links to other dependencies are kept up to date. This is also the same format that [the standard library is documented with](https://doc.rust-lang.org/std/). Overall, it's easy to learn how to use a new library.

In TypeScript, every library has its own custom documentation. Often, this is just a README file uploaded to NPM, which is usually insufficient. When you combine this with less descriptive error messages from the compiler (or exceptions from the runtime), it's much harder to learn how to use a library in TypeScript than in Rust.

### Fighting the language

This is a much broader category, but sometimes the code you write doesn't work the way you expected it to. Rust and TypeScript have very different issues—Rust eliminates several categories of bugs that TypeScript is prone to but introduces some other challenges. For this, I'll focus on the one issue that stood out the most in each language when reviewing the footage.

For Rust, it was one of the things folks complain about the most: the dreaded borrow checker 🙀. When going about my business, an error popped up in my IDE that said something like "cannot borrow partially moved value". The easy solution was to add `.clone()`, but whenever the borrow checker indicates that I'm re-using a piece of data, I try consolidating them. As it turns out, I had two `if` statements that were easy to combine and made for nicer code. That diversion took about 2 minutes—though it required understanding ownership, a concept that doesn't have a parallel in most languages.

> Learning about ownership taught me to see my data in a different light. I have caught **several bugs** in other languages because I was thinking like the borrow checker. I don't think learning ownership is an obstacle to overcome, but rather a useful tool that every developer should have.

In TypeScript, my biggest hurdle started with a failing unit test: the array of error messages coming back from the main function _should_ have had a length of 1, but had a length of 0. My first instinct was that there was a bug in the error-checking code, so I set a breakpoint and started debugging. After carefully stepping through, I found that I had used a `concat` method instead of a `push` with a spread operator. With unit tests passing, I pushed up the changes to find that, in CI, the integration tests were failing! After adding some print debugging and pushing back to CI, I found that I had used `concat` in a _second_ location, causing separate errors. Overall this took 20 minutes of messing around to get an answer for something that _should_ have been caught statically—and would have in Rust.

One of the big differences between "fighting the language" in Rust and TypeScript is that Rust puts _almost every problem_ in front of you immediately in the build and lint steps. Instead of failing tests, you get red squigglies in your editor, pointing you immediately to where the problem is. An example of this is `#[must_use]`, which a function like `concat` would have in Rust. Basically, if a function returns a value, and you forget to use it (like, say, with `errors.concat(new_errors)`), it's a compile error.

While it can be annoying to see more of your bugs up front, I definitely prefer that to stepping backwards from a distant effect. Rust wins here.

## Refactoring

After getting to the end of each implementation, I decided to take them a step forward by reworking some logic. Basically, I wanted to automate something that previously required a manual user setting.

First, I rewrote the required code in TypeScript; it took 4 minutes. Then, I did exactly the same thing in Rust—another 4 minutes! So that's a tie... right? Well, not quite. When I changed the Rust code, the compiler pointed out a bug that was easy to fix. After I was done, I returned to the TypeScript code to see if it contained the same bug.

Sure enough, I was consistent enough to write the same bug into both implementations 🤦. The tests I'd written didn't catch it, but the Rust compiler did. After another 8 minutes, I reorganized the TypeScript code to work properly. Without the Rust compiler, I'm unsure how long it would have taken me to catch the TypeScript bug.

One of the greatest strengths of Rust being so explicit and strict is that it can catch many bugs that other languages can't. This is often talked about in terms of memory safety (when compared to something like C), but it goes _way_ beyond this. If you leverage the type system to reflect the expectations you're making as you code, it _will_ catch bugs that would slip through in other languages.

## Conclusion

Is Rust hard? As with most things, I don't think this is a binary yes/no question. However, I find Rust _easier_ to work with than TypeScript (at least in this case—and I don't _believe_ that TypeScript is considered a hard language. Personally, I would rather write production code in Rust than any other language.

Still not convinced? [Let me know](https://github.com/dbanty/dylananthony.com/discussions/205) which language and scenario you'd like to see compared next.

## Footnotes

1. A list of languages I've written production code in and consider the tooling significantly worse than Rust's, in no particular order: Python, Java, Kotlin, Swift, Go, TypeScript, JavaScript, C.

2. Regarding how much professional experience I have writing in programming languages, Python is the first, followed by TypeScript, then Rust. I have certainly spent more time writing Rust than TypeScript, but I've been paid for more hours (and had more peer reviews) with TypeScript. The order of my _confidence_ in writing each language is Rust, then Python, then TypeScript.
