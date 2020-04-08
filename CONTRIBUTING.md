# Contributing

Contributions to this project are released to the public under the project's open source license.

Everyone is welcome to contribute to Gnomos_Librery. Contributing doesn’t just mean submitting pull requests—there are many different ways for you to get involved, including answering questions in chat, reporting or triaging issues, and participating in the Gnomos_Librery Evolution process.

No matter how you want to get involved, we ask that you first learn what’s expected of anyone who participates in the project by reading the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code.

We love pull requests. Here's a quick guide:

If you're adding a new feature or changing user-facing APIs, check out the Gnomos_Librery Evolution process.
Check for existing issues for duplicates and confirm that it hasn't been fixed already in the master branch
Fork the repo, and clone it locally
npm link to make your cloned repo available to npm
Follow Getting Started to generate a testbot
npm link Gnomos_Librery in your newly created bot to use your Gnomos_Librery fork
Create a new branch for your contribution
Add tests (run with npm test)
Push to your fork and submit a pull request
At this point you're waiting on us. We like to at least comment on, if not accept, pull requests within a few days. We may suggest some changes or improvements or alternatives.

Some things that will increase the chance that your pull request is accepted:

Make sure the tests pass

Update the documentation: code comments, example code, guides. Basically, update everything affected by your contribution.

Include any information that would be relevant to reproducing bugs, use cases for new features, etc.

Discuss the impact on existing Gnomos_Librery installs, Gnomos_Librery adapters, and Gnomos_Librery scripts (e.g. backwards compatibility)

If the change does break compatibility, how can it be updated to become backwards compatible, while directing users to the new way of doing things?
Your commits are associated with your GitHub user: https://help.github.com/articles/why-are-my-commits-linked-to-the-wrong-user/

Make pull requests against a feature branch,

Follow our commit message conventions:

use imperative, present tense: “change” not “changed” nor “changes”
Commit test files with test: … or test(scope): … prefix.
Commit bug fixes with fix: … or fix(scope): … prefix
Commit features with feat: … or feat(scope): … prefix
Commit breaking changes by adding BREAKING CHANGE: in the commit body. The commit subject does not matter. A commit can have multiple BREAKING CHANGE: sections
Commit changes to package.json, .gitignore and other meta files with chore(filenamewithout.ext): …
Commit changes to README files or comments with docs(README): …
Cody style changes with style: standard
see Angular’s Commit Message Conventions for a full list of recommendations.
Stale issue and pull request policy
Issues and pull requests have a shelf life and sometimes they are no longer relevant. All issues and pull requests that have not had any activity for 90 days will be marked as stale. Simply leave a comment with information about why it may still be relevant to keep it open. If no activity occurs in the next 7 days, it will be automatically closed.

The goal of this process is to keep the list of open issues and pull requests focused on work that is actionable and important for the maintainers and the community.

Pull Request Reviews & releasing
Releasing Gnomos_Librery is fully automated using semantic-release. Once merged into the master branch, semantic-release will automatically release a new version based on the commit messages of the pull request. For it to work correctly, make sure that the correct commit message conventions have been used. The ones relevant are

fix: … will bump the fix version, e.g. 1.2.3 → 1.2.4
feat: … will bump the feature version, e.g. 1.2.3 → 1.3.0
BREAKING CHANGE: … in the commit body will bump the breaking change version, e.g. 1.2.3 → 2.0.0
