+++
title = "Best Supported Serverless Languages"
excerpt = "I took a tally of the supported languages on the serverless platforms that I've heard of."
date = "2021-04-28"
aliases = ["/posts/best-supported-serverless-languages"]

[extra]
featured_image = "cover.png"
featured_image_alt = "The Ferris the Crab, along with the logos for TypeScript, .NET, and Go, sit above the text 'Serverless Languages'."
discussion = 71

[taxonomies]
tags = ["serverless"]
+++

> Cover image created by me using the [Community TypeScript Logo], the [Go logo], the [.NET logo], and [Ferris the Crab].

---

I'm a big fan of serverless functions, but my perspective is usually limited to what will run on AWS Lambda. So I took a tally of the supported languages on the serverless platforms that I've heard of.

## Caveats

1. I didn't go searching for new serverless providers, these are the ones I already knew about.
2. These are only the languages prominently listed with tutorials or examples on the provider's website. You'll notice, for example, that Rust on AWS Lambda is not included here even though I've written several blog posts about it!
3. This is not an endorsement or review of any languages or providers, merely a count of official support. If you have specific questions you want answered (or a slightly different list ranking related things) [let me know][discussion].
4. Some of these entries have their own specific caveats, they are indicated with a number at the end of the entry. Details on that number are at the bottom of the post.
5. I have not used all of these language/provider combos, I'm assuming if they are displayed prominently on the site then they are possible to use effectively.

## Big Takeaways

1. The best supported language is JavaScript, followed closely by TypeScript. No shock there.
2. Python and Go are tied for third place in availability.
3. Cloudflare Workers are _by far_ the most flexible in way of supported / documented languages with 12—though many of those rely on cross-compiling the language to JavaScript.
4. AWS, Azure, and GCP are all tied for second at 8 supported languages. Realistically, these are the most flexible platforms as those 8 languages don't require transpilation (except for TypeScript but... you know...).
5. Rust has an explicit tutorial on the Azure website! 🥰 I'm suddenly more likely to use Azure than AWS in my next big project.

## The List

Here is the list of all the supported languages with the platforms that support them. Reminder, a number in {} after the language means there's a caveat, check the bottom of the post for it!

### JavaScript

1.  Netlify
2.  AWS
3.  GCP
4.  Azure
5.  Vercel
6.  Cloudflare

### TypeScript

1.  Netlify
2.  Azure
3.  Vercel
4.  Cloudflare
5.  AWS {1}
6.  GCP {1}

### Go

1.  Netlify
2.  AWS
3.  GCP
4.  Azure {2}
5.  Vercel

### Python

1.  AWS
2.  GCP
3.  Azure
4.  Vercel
5.  Cloudflare {3}

### Ruby

1.  AWS
2.  GCP
3.  Vercel

### Java

1.  AWS
2.  GCP
3.  Azure

### C#

1.  AWS
2.  GCP
3.  Azure

### PHP

1.  GCP
2.  Cloudflare {3}

### Powershell

1.  AWS
2.  Azure

### Rust

1. Azure {2}
2. Cloudflare {4}

### C and Cobol

1. Cloudflare {4}

### Kotlin, Dart, Scala, Reason / OCaml, Perl, and F#

1. Cloudflare {3}

## Language-Specific Caveats

1. The runtime is for Node.js and there is no TypeScript example, but TypeScript is fairly easy to compile to JavaScript.
2. There is a tutorial for using this language, but not an official runtime.
3. Supported by compiling to JavaScript, some language features / libraries may not work.
4. Supported by compiling to WebAssembly, your mileage may vary.

[community typescript logo]: https://github.com/remojansen/logo.ts
[go logo]: https://blog.golang.org/go-brand
[.net logo]: https://github.com/dotnet/brand
[ferris the crab]: https://www.rustacean.net
