+++
title = "Stop Writing DRY Code"
date = "2022-04-05"

[extra]
featured_image = "cover.jpeg"
featured_image_extended = true
featured_image_alt = "A large vanilla cake with whipped vanilla buttercream icing, against a purple background, is cut open and sand is spilling forth creating a vast desert beneath. A lone cactus stands sentinel. The top right reads \"Stop Writing DRY Code.\""
discussion = 199

[taxonomies]
tags = ["software engineering"]
+++

> Cover photo created by [Jazlyn Borkowski](https://www.instagram.com/jazlynborkowski/)

"DRY" is an acronym introduced, seemingly universally, to software engineers early in their education. For example, when I searched "software engineering best practices," 4 of the top 5 results mentioned DRY. It stands for "Don't Repeat Yourself" and is one of the worst things you can teach a fledgling developer.

If you take nothing else away from this post, take this: DRY should **never** be a **goal** when writing code. It is not an indicator of code quality; it is, at best, a tool to be applied in *some* circumstances. Code that does not repeat itself is not inherently better than code that does, so "DRY" should never appear as a recommendation in your code reviews.

## MOIST

Code is a bit like cake. A dry cake is brittle and likely to crumble when you touch it. Likewise, DRY code—code that has no repetition—will resist extension and alteration. By combining two implementations into a single one, you bind them together, making it so you can't change one without changing both.

On the other hand, a wet cake will fall apart, not holding its structure. In software, WET usually means something to the effect of "write every time"—it's the opposite of DRY in that you constantly repeat yourself. If your code is WET, you can change one piece without breaking any others. However, two pieces of information that should be the same can easily fall out of sync.

The best cake, and code, is MOIST—"Maintain One Indisputable Source of Truth." Rather than being a hard and fast rule about writing code, it gives you a reason *why* to refactor code. MOIST gives you the best of both worlds by increasing rigidity to prevent bugs and keeping flexibility wherever possible. As with all things, balance is vital.

Let's look at an example where keeping your code MOIST is essential. We're writing a program that handles semantic versioning for projects. It has two commands: `auto` reads your commit history and generates a new version. The `manual` command takes a rule name from the user and bumps the version according to that rule. A first attempt might look like this:

```rust
fn auto(history: &[Commit]) {
    let mut version = Version::get_current();
    let mut major = false;
    let mut minor = false;
    let mut patch = false;
    
    for commit in history {
        if commit.message.contains("BREAKING CHANGE") {
            major = true;
            version.major += 1;
            version.minor = 0;
            version.patch = 0;
            break;
        } else if commit.message.contains("feat") && !minor {
            minor = true;
            version.minor += 1;
            version.patch = 0;
        } else if commit.message.contains("fix") && !patch && !minor {
            patch = true;
            version.patch += 1;
        }
    }
    write_version(version);
}

fn manual(rule: String) {
    let mut version = Version::get_current();
    if rule == "major" {
        version.major += 1;
        version.minor = 0;
        version.patch = 0;
    } else if rule == "minor" {
        version.minor += 1;
        version.patch = 0;
    } else if rule == "patch" {
        version.patch += 1;
    } else {
        panic!("Unknown rule: {}", rule);
    }
    write_version(version);
}
```

Here we're maintaining two different implementations for applying a semantic rule to a semantic version—two distinct truths about the rules! Unfortunately, this separation could easily lead to disparate behaviors between the two commands, confusing users. So let's maintain only a single source of truth for how to bump that version number!

```rust
fn auto(history: &[Commit]) {
    let mut rule = "patch";
    
    for commit in history {
        if commit.message.contains("BREAKING CHANGE") {
            rule = "major";
            break;
        } else if commit.message.contains("feat") {
            rule = "minor";
        }
    }
    bump_version(rule);
}

fn bump_version(rule: String) {
    let mut version = Version::get_current();
    
    if rule == "major" {
        version.major += 1;
        version.minor = 0;
        version.patch = 0;
    } else if rule == "minor" {
        version.minor += 1;
        version.patch = 0;
    } else if rule == "patch" {
        version.patch += 1;
    }
    write_version(version);
}

fn manual(rule: String) {
    if rule != "major" && rule != "minor" && rule != "patch" {
        panic!("Unknown rule: {}", rule);
    }
    bump_rule(rule);
}
```

There, all good, right? Well, not entirely. Our new `bump_version` function is the arbiter of applying rules to versions—but now we have three different places those rules are defined! If we want to add a "prerelease" rule, we'd have to remember to change every location separately, which could easily cause a bug! So, again, we'll maintain only a single source of truth.

```rust
enum Rule {
    Major,
    Minor,
    Patch,
}

fn auto(history: &[Commit]) {
    let mut rule = Rule::Patch;
    
    for commit in history {
        if commit.message.contains("BREAKING CHANGE") {
            rule = Rule::Major;
            break;
        } else if commit.message.contains("feat") {
            rule = Rule::Minor;
        }
    }
    bump_version(rule);
}

fn bump_version(rule: Rule) {
    let mut version = Version::get_current();
    
    match rule {
        Rule::Major => {
            version.major += 1;
            version.minor = 0;
            version.patch = 0;
        },
        Rule::Minor => {
            version.minor += 1;
            version.patch = 0;
        },
        Rule::Patch => {
            version.patch += 1;
        },
    }
    
    write_version(version);
}

fn manual(rule: String) {
    if rule == "major" {
        bump_version(Rule::Major);
    } else if rule == "minor" {
        bump_version(Rule::Minor);
    } else if rule == "patch" {
        bump_version(Rule::Patch);
    } else {
        panic!("Unknown rule: {}", rule);
    }
}
```

There we go, one source of truth for the rules, how to apply them to a semantic version, how to generate them from commit messages, and how to interpret a user's input.

But I see more repetition! What if we changed to a single `commit.message.contains` statement with a map from the keywords to the rule they represent?

When considering any refactor, it's crucial to think about the goal. In the case of MOIST, we have to ask ourselves, "what is the truth we're trying to protect?" Is it true that "breaking changes" and "features" should always be determined the same way? No! In fact, this implementation is not consistent with Semantic Versioning yet, and the two branches will eventually diverge further! Coupling these two pieces of information would increase rigidity *without* protecting a single source of truth, so we should **not** combine them.

What about the user input? Surely we should factor out the string-to-rule map and only have a single function call location! Let's try the same test—what is the single truth we're trying to protect? Is it "every rule should be determined by only a single string?" That feels more like an implementation detail. In fact, if we add a `prerelease` rule, we'll need some additional info to select a prefix. This change feels like it would be a reduction in repetition without a clear goal—it would bind the separate rules together, making it harder to change just one without an obvious benefit.

MOIST can get subjective and be a bit mushy—as can any coding practice, but it tries to draw a line between *harmful* repetition and benign code. The key to successfully applying any "best practice" is understanding the true goal and always keeping that in mind.

## RAINY

Cake aside, there are a couple more worthwhile goals semi-related to DRY. I'll attempt to shoehorn them into more acronyms semi-antonymic to DRY. "Reusable Abstractions, Ideally Not Yours" is another way of saying "don't build when you can buy." It is far more efficient for one person to solve a problem and share that solution than for hundreds of people to solve it independently. This practice is applicable at many scales but achieves another one of the fundamental goals that DRY tries to stand for.

The best example of this is the open-source community. Rather than re-do work that someone else has done, you can build on top of what exists. Likewise, you can share solutions to problems you've faced so that others don't need to waste future effort—and you multiply the impact of your work. RAINY is like taking "don't repeat yourself" and applying it across our entire community. More like "let's not repeat *ourselves*."

As with everything, there is a balance to be struck. We don't want a MONSOON, where "Maintaining Open source is a Nuisance So Others Often Neglect it." 🤪 Basically, as a consumer, installing dependencies is a pain, and keeping them up to date is even more of a pain (you should be using [Renovate] to mitigate that, though). On the other side, staying on top of issues and pull requests as a maintainer is burdensome and often thankless. This level of effort on both sides can lead to relatively simple bugs never being fixed.

Balancing this is difficult, and I think a conversation about the good and bad of open source can go far beyond this article—so I'm going to leave it there. However, if you'd like a post titled either "Do You Really Need that Dependency?" or "When to Open Source it", [let me know][ideas].

## FRESH

"Functions Read Easier in Short Hunks." Yes—my acronyms are getting more and more unhinged and also straying further from DRY. I'm not sorry.

Often, reviewers use DRY as a code word for "make that into a function." Code readability is vital for maintainability, and an easy way to improve readability is to split large functions into several smaller ones. This way, a reader can get a high-level understanding of what the code is doing just by reading the function names in order—and they should read a bit like prose. 

Of course, there's a tradeoff to be made here; a function call is not *always* easier to read than the statements that make it up, and calling functions can often have performance penalties. Still, as a goal, refactoring to readability is far more valuable than refactoring simply to reduce duplication.

## A Test

Here's a set of questions I suggest you ask yourself next time you're wondering if you should be repeating yourself or not:

1. Are there two separate sources of truth for a single concept? If yes, try to unify them.
2. Is this code solving a general problem or something specific to me / my work? If it can be generalized, consider publishing a reusable module (whether open source or in a private/corporate location).
3. Can I read through this code and understand what it's doing without stopping to inspect it? For this one, ideally, have someone who didn't write the code answer the question in a code review. If it's hard to parse for humans, consider abstracting away details that aren't needed, like with functions.

Hopefully, all of my acronymic nonsense has provided you with enough alternatives to DRY that you never use it again. Remember, not repeating yourself is not a valuable outcome of refactoring. Instead, try keeping a goal in mind like improving correctness, benefitting the community, or making the code easier to read. Now go enjoy some cake; you've earned it.

[Renovate]: https://www.whitesourcesoftware.com/free-developer-tools/renovate/
