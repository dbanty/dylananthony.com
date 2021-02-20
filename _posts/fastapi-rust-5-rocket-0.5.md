---
title: "Replacing FastAPI with Rust: Part 5 - Rocket 0.5"
excerpt: "I walk through my experience updating rocket_lamb to support the latest development version of Rocket"
coverImage: "/assets/blog/fastapi-rust-5-rocket-0.5/cover.png"
coverImageAlt: "The Rust mascot 'Ferris the Crab' holds the logos for FastAPI and Rust and is smooshing them together."
date: "2021-02-19"
author:
  name: Dylan Anthony
  picture: "/assets/blog/initials.png"
---

> Cover image created by me using [Ferris the Crab], [the Rust logo], and [the FastAPI logo].

_This post is part of a series. If you haven't already, you may want to read the [previous post] before continuing._

---

In the [previous post], I decided that Rocket is the best candidate to replace FastAPI with two big caveats:

1. It requires nightly Rust, which means compiling your project could break unexpectedly. If you don't know, nightly is the proving ground for potential future Rust features. If something requires nightly, that means it's using features that are inherently unstable.
2. It is not async, and therefore not compatible with my favorite option for handling SQL: [SQLx].

Both of these issues are fixed on the `master` branch of the Rocket repository, which will become Rocket 0.5 once released. However, hosting a Rocket application on AWS Lambda requires a crate called `rocket_lamb` which will need to be updated for Rocket 0.5 before it will work.

In this post, I walk through my experience updating `rocket_lamb` to support the latest development version of Rocket in an effort to prepare it for the inevitable 0.5 Rocket release.

## Step 1: Just Try It!

One of the nicest things about Rust's strict compiler is that you can generally refactor by following the errors. If you also have good test coverage in your project, you can be even more confident! So far in my Rust journey, I’ve been able to follow this process in every significant refactor:

1. Just do the thing you’re trying to achieve.
2. Run `cargo check`, fix errors, rinse, and repeat.
3. Run `cargo test`, fix failures, rinse, and repeat.
4. It just works!

So in this case, step 1 is to replace Rocket 0.4 with the current development version using a Git dependency and replace all the `lambda_` crates with the equivalent `lamedh_` crates. This all happened [in this commit](https://github.com/dbanty/rocket-lamb/commit/2d4fe5102dcc23898941f9c8bb2374e831f6d5eb) if you’d like to follow along. Here’s a summary:

### Step 1.0: Replace the Dependencies

In addition to the changes mentioned above, I had to change out the `http` version based on some `cargo check` complaints. I also needed to add `aws_lambda_events`, `tokio`, and `parking_lot` for some code changes that come later. All in all, here are the changes:

#### Before

```toml
rocket = { version = "0.4.0", default-features = false }
lambda_runtime = "0.2.1"
lambda_http = "0.1.1"
http = "0.1"
failure = "0.1.5"
```

#### After

```toml
rocket = { git = "https://github.com/SergioBenitez/Rocket" }
lamedh_runtime = "0.3.0"
lamedh_http = "0.3.0"
http = "0.2.3"
failure = "0.1.5"
aws_lambda_events = "0.4.0"
tokio = { version = "1", features = ["full"] }
parking_lot = "0.11.1"
```

Cargo (or maybe it’s `rustc` under the hood?) can provide pretty helpful error messages in this process, though sometimes you have to know what to look for. I always recommend reading the _entire_ output of Rust compiler errors. In other languages (notably Python) I’m used to looking at stack traces where I’ve gotten good at ignoring most of the content since it’s not relevant to the problem I’m solving. A ton of care is taken in designing Rust compiler messages, so all of the information is likely to be relevant. In the case of `http` being on the wrong version, the error was something like `expected struct http::Method, found struct lamedh_http::http::Method` however there is a note which says “perhaps two different versions of crate `http` are being used?” informing you of exactly the problem!

### Step 1.1: Update the Imports

If you’re replacing one package with another, the next step after updating your `Cargo.toml` is to update all the `use` statements. Going from `lambda_` to `lamedh_` was _mostly_ straight forward, just replace one crate with the equivalent. There were a couple notable exceptions though:

1. Instead of using a `lambda!` macro to start things up, you want to use the `lamedh_runtime::run` function, which takes the result of the `lamedh_http::handler` function. I prefer explicit function invocations anyway over macros when it doesn’t make a huge difference to readability (that’s foreshadowing).
2. `lambda_http` was re-exporting `aws_lambda_events::encodings::Body` but `lamedh_http` does not, so that had to be imported separately.

### Step 1.2: Update the Code

There were some API differences both in the new `rocket` version and in the `lamedh_` conversion that had to be handled here:

1. `rocket::local` was split into `rocket::local::blocking` and `rocket::local::asynchronous` so you can choose how you handle things. I picked `blocking` for now just to minimize the up front changes. I go back and update it to `asynchronous` later.
2. The `Handler` trait from `lamedh` switches the `run` function for one called `call` and requires an associated `Fut` type.
3. The `RequestContext` from `lamedh` has been completely reorganized and supports the newer API Gateway v2 requests. At this point, being new to the code base, I wasn’t entirely sure what the `base_path` method of `RequestExt` was doing, so I just commented out most of the logic.

## Step 2: Check and Check and Check

I’ve now entered the stage where I’m repeatedly running `cargo check` and fixing the errors I’ve found. I quickly came to a similar issue to the one I faced when implementing my own `Handler` for `actix-web`. Passing data to the `Future` doing the actual handling requires some hoop-jumping. The code changes for Step 2 can be found [in this commit](https://github.com/dbanty/rocket-lamb/commit/6a995b1b977675736fa32d96e1094ba3fcc05098).

### Step 2.1: Solving Async References

The `Fut` associated type on `Handler` requires that any lifetimes be `’static`, presumably so the `Future` can live longer than the `Handler` that spawned it (though I’m not sure why you’d want this). In any event, the `Handler` code I inherited from the existing `rocket_lamb` crate was passing `&mut self` to the now-asynchronous code which left me a bunch of errors saying something about needing `’static` lifetimes.

At this point I was thoroughly lost, if I needed to pass data to something, and some trait outside of my control was requiring it to be `'static`, then I couldn’t pass references right? I didn’t want to clone all the data for every request, as doing so would be very inefficient. Even if I wanted to do that, some of the data I needed to pass was not `Clone`. I decided to go out on a limb and ask for help. Asking questions in open source projects is always nerve-wracking, as some of the responders can be quite hostile. However, one of the contributors to the `lamedh_` crates quickly dispelled my fears by coming through with a friendly answer!

I had heard of, though never used, `std::sync::Arc` before. I’m not really qualified to explain how this works, but I’ll do my best to convey _my_ understanding. `std::rc::Rc` effectively lets you have shared, read-only ownership of an object. If you do something like this:

```rust
use std::rc::Rc;

let original = String::from("blah");
let first = Rc::new(original);
let second = Rc::clone(&first);
```

Then you effectively end up with two different owned values `first` and `second` which can be dereferenced to read data as if it were `original` (note that creating `first` took ownership of `original` so you can’t access that one anymore). Because the values are owned, you’re not passing references, and therefore don’t have to worry about lifetimes!

This isn’t magic, `Rc` stands for “reference counting” which is a common way of handling memory in more dynamic languages (e.g. Python). Behind the scenes, Rust is keeping track of how many times `Rc::clone` has been used for a given piece of data and once they’re _all_ dropped, it will free the memory. So even if `Handler` goes out of scope and gets dropped with a `Future` still on the loose, the data it was given is still perfectly valid!

“Wait a second, you said you were using `Arc` though?!” Yep! `Arc` is just the version of `Rc` that is `Send`, meaning it is safe in threaded contexts. Because we’re using Tokio and Tokio can use threads to execute `Future`s, everything has to be `Send` and therefore we use `Arc`! And thus the problem of sharing data in Tokio futures is solved!

### Step 2.1: Being Less Selfish

In order to aid me with `Arc`ing the codebase, I pulled out most of the methods on `RocketHandler` into functions which took just the data they needed rather than the whole `self`. This made it _way_ easier to reason about the code and make faster, more confident modifications. I prefer this style anyway because it makes it clear when you _call_ something exactly what that something is taking. An object-oriented “method” style hides whether something is just reading data, or mutating it, or outright consuming it until you jump to definition. Why not take full advantage of how explicit Rust is? Here's an example to illustrate my point:

```rust
// Method style
handler.ensure_client_ready(&request)

// Function style
ensure_client_ready(&mut handler.client, &handler.config, &request)
```

It's more verbose, but now I can clearly see that I need to `Arc` the handler's config attribute to share it in this manner and that the `handler.client` needs to be mutable, so I need some way to deal with that. Also, I'm not sure how I would go about `Arc`ing the entire `RocketHandler` anyway to pass it through to methods in a thread-safe manner, so I had to pick functional style whether I wanted to or not.

### Step 2.2: Disabling a Feature

That `ensure_client_ready` function from before required mutability and was fairly dense code related to what I disabled in step 1.2.3. So for now, I just removed this feature as well, figuring I’d come back to it once I understood the code better.

And with that, `cargo check` passed! Next it was on to `cargo test` , which of course couldn’t even complete the compilation step to start with.

## Step 3: Testing

Automated tests in your project are primarily important for two reasons:

1. If some hooligan comes along trying to refactor your entire project to work with different libraries, they can have some confidence of knowing they didn’t break anything once they’re done.
2. Tests serve as documentation that is often far more specific than is worth putting in comments. If you properly cover all the behavior of your code and do so with relatively readable tests, then a contributor can read the tests to discover what the code is supposed to be doing.

### Step 3.1: Async Tests

Now that most of the code required async, the tests had to know how to handle async as well! Tokio provides a convenient `#[tokio::test]` macro to replace the normal `#[test]` with in order to allow your test functions to be `async`. This, along with replacing some imports, was done by another contributor who’d been following my progress and wanted to help out! Isn’t the open source community amazing when people work together? You can see their work [here](https://github.com/dbanty/rocket-lamb/commit/6a995b1b977675736fa32d96e1094ba3fcc05098).

Building on top of what they had, I did a bit more work to finish getting the tests to compile which mostly involved switching to the `asynchronous` Rocket client and to stable Rust (!!!). You can see those changes [in this commit](https://github.com/dbanty/rocket-lamb/commit/3f5ece7a610921f834323cc0e1461406eaa18f91). I also had to make the doctests work with async which basically just involved wrapping any async code in the doc comments with `tokio_test::block_on()` [like this](https://github.com/dbanty/rocket-lamb/blob/92d3049fd9fdc9ec66866655b310cf51cac1fe05/src/builder.rs#L46).

### Step 3.2: Making Tests Less DRY

DRY is an acronym for a mantra that is often preached in software development: “Don’t Repeat Yourself”. This advice _can_ be beneficial, but only when not taken at face value. Personally I prefer my code like I prefer my food: MOIST. That is, “Maintain One Indisputable Source (of) Truth” (yes that is a [backcronym](https://en.wikipedia.org/wiki/Backronym), no I’m not sorry). The main reason to not repeat code is that it’s easy for multiple sources to get out of sync and thereby cause bugs. One should not remove duplicated code simply because it’s duplicated, but rather to keep the implementation in sync.

DRY becomes particularly painful when applied to tests. If tests are to serve as documentation for your code, someone must be able to easily understand what a test is doing. Using a macro to effectively [parametrize](https://docs.pytest.org/en/stable/parametrize.html#parametrizing-fixtures-and-test-functions) a test means that:

1. It’s not immediately clear where a test is defined when it fails to run or compile using `cargo test`.
2. You have to read macro code to figure out what the test is doing, which is always more difficult than reading Rust code directly.
3. Failures/panics can be particularly hard to debug when they come from inside generated code.
4. Most tooling just doesn’t work as well. For example, using CLion, I cannot easily click to run a single test which is generated in a macro like I can with normal functions. I also can’t jump to definition of code defined within the macro.

All of that was to say that `rocket_lamb` had a file full of test cases, each of which was defined with a macro (presumably to reduce duplication) which were failing and hard to debug. Rather than continue to guess as to the problem, I rewrote the tests using standard Rust code instead of a macro, keeping some shared setup in a separate function so that if we change the way the `RocketHandler` is built, for instance, there is a single location which defines that.

Refactoring into standard Rust code also made it completely obvious what the features I had removed were trying to do.

### Step 3.3: Mutation and Arcs

As I had mentioned earlier, there were two related pieces of code that I had removed to skip while implementing the basic async conversion. The first piece was pulling information out of the raw lambda request. The second piece was mutating some shared data in order to modify the rocket `Client` before using it. Reading the failing tests gave me the last bit of context I needed to reimplement these features.

API Gateway is the service often used to route requests to Lambda functions, and it allows you to modify the paths of these requests either to add a fixed base path (e.g. /v2/) or a stage (e.g. /QA/). The application will likely not be aware of these changes, since they’re probably specific to the deployment. There are a few approaches I see to solve this problem:

1. Have a feature flag or something and compile the full path into the application at build time. This has the huge downside of not being able to promote a /canary/ instance to prod, for example, without rebuilding.
2. Erase any base path or stage before giving the request to the application. So a request with the path `/canary/v2/hello` might just surface as `/hello` to Rocket. This will work, but it means any response headers from Rocket won’t include the same path that the client attempted to reach, which could cause problems.
3. Update the Rocket application to use the full paths at runtime. Specifically, delay building the `Client` which does request handling until after you receive the first request. From that request you can determine any base path and stage and rewrite the Rocket routes on the fly before generating a client. _This_ is what that feature was doing.

So if we want to maintain this feature (which seems like a good idea because presumably people are using it), we have to be able to mutate some shared state in an asynchronous context. You’ll remember, however, that our shared data is now behind an `Arc` and that `Arc` only provides read access to consumers. So how do we mutate it? Well there are a few solutions provided in the standard library, but I went with `Mutex` from a crate called `parking_lot` which is just a bit easier to use than the one in `std`.

I went back to a similar pattern that `rocket_lamb` had originally. It was using an enum that looked like this:

```rust
enum LazyClient {
    Placeholder,
    Uninitialized(Rocket),
    Ready(Client),
}
```

The `LazyClient` was shared directly with the handler code (safe because it wasn’t async). It was set to `Uninitialized` with the original Rocket instance at startup. Upon receiving the first request, the handling code would use `mem::replace` to get the owned Rocket and leave a `Placeholder` in its place (again, safe because the code was blocking, so nothing will reach this same code once it became `Placeholder`). Finally, it updated all the routes in the `Rocket` instance with any base path or stage before transforming that `Rocket` into a `Client` and setting the state to `Ready`. Future requests would simply see that it’s already `Ready` and use the `Client`.

Because anything which is threaded is naturally harder to deal with safely, I had to make a bunch of changes here. This is my first real foray into dealing with these sorts of problems, so if you have suggestions for improvements let me know! My enum looks like this:

```rust
enum LazyClient {
    Uninitialized(Option<Rocket>),
    Ready(Arc<Client>),
}
```

And I passed it to the handling `Future` as an `Arc<Mutex<LazyClient>>`. This way it’s safe to pass into the future without lifetime issues (because of the `Arc` thing mentioned before) and safe to mutate because of the `Mutex`. The only other difference is that I use an `Option<Rocket>` so I can `.take()` the owned `Rocket` instead of using `mem::replace` with another enum type (mostly because I had a lot of trouble getting this to work with the `Mutex`).

The obvious problem I see with my new code is it will have significantly more overhead than the old version due to all the indirection and the hard lock. Hopefully it’s not slow enough to matter much, and hopefully someone with more experience can tune it up a bit. All of the changes required to get this feature working again (including test refactors) can be found [here](https://github.com/dbanty/rocket-lamb/commit/47671b79b102402ebcf82c715dcd866079a741f4).

## Conclusion

That’s it! [My fork of rocket_lamb](https://github.com/dbanty/rocket-lamb/tree/rocket-0.5) now works with the development version of `rocket` and the latest `tokio`. I was even able to get [my rocket experiment](https://github.com/dbanty/rust-fastapi-experiments/tree/rocket-0.5) working with the latest `rocket` by combining my fork with [a fork of okapi which has been updated](https://github.com/ThouCheese/okapi/tree/async) (though it doesn’t work on stable Rust yet). So what’s next? Well now that everything has been updated, in theory my endpoints can be async, which means I should finally be able to use [SQLx] with this project!

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
[previous post]: https://dylananthony.com/posts/fastapi-rust-4-a-solution
[sqlx]: https://crates.io/crates/sqlx
