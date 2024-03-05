---
title: "Projects"
layout: ../layouts/MarkdownPage.astro
---

I work on a variety of side projects, mostly with the goal of improving developer experience. Here are some notable ones:

## `openapi-python-client`

OpenAPI is a way to describe RESTful APIs using YAML or JSON.
[`openapi-python-client`](https://github.com/openapi-generators/openapi-python-client) is a CLI that generates Python
code to consume an OpenAPI-documented API.
It's implemented in Python, the intention being that it's easier for Python devs to contribute to than most generators
(which are usually written in Java).

## Knope

[Knope](https://knope.tech) is a CLI for automating developer tasks. The most popular features focus around automating
releases, things like generating changelogs, updating versions in files, and creating releases on GitHub or Forgejo.
It's implemented in Rust, and is shipped as a single binary so it's easy to install.

### Knope Bot

Knope also has a [GitHub bot](https://github.com/marketplace/knope-bot) to add some extra features and reduce the
amount of CI config needed to perform common tasks. As of writing, it can enforce that changes are documented
(with conventional commits or changesets), and can help document a change by suggesting or creating a change file.
