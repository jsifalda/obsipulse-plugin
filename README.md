# ObsiPulse - Your Writing Activity Visualised

## Overview

ObsiPulse is a plugin for [Obsidian](https://obsidian.md) that allows users to track their daily word count across all notes in their vault. It provides a visual representation of your writing activity, similar to GitHub's contribution graph, and offers a public profile feature for sharing selected notes.
More details available on [Obsipulse.com](https://obsipulse.com).

![Example](./obsipulse.png)

## Features

- Gamify your writing by tracking your daily writing streak.
- Gain valuable insights into your writing habits.
- Share Your Progress with a free public profile URL to share your writing journey with friends or colleagues.
- Never answer the question "What Obsidian plugins do you use?" → it‘s all on your profile.
- Upload selected notes to your public ObsiPulse profile (with support of Dataview rendering).
- Seamlessly manage insights across multiple vaults.

## Usage

- Install the plguin from Obsidian's community plugins (or via BRAT).
- Write notes as you normally would.
- Run command `Open Public Profile` and your ObsiPulse public profile will open in your browser.

> Example of a public profile: [https://www.obsipulse.com/app/profile/0b3417c00370b98c](https://www.obsipulse.com/app/profile/0b3417c00370b98c)

## Configuration

### Settings

- **License Key**: Enter your license key to activate the plugin.
- **Files to be Published**: Specify the list of files to be shared publicly.

### Development Server

Run `yarn run dev` to start the development server

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Contact

- **Author**: Jiri Sifalda
- **X (Twitter)**: [@jsifalda](https://dub.sh/kWUczm4)
- **Bluesky**: [https://bsky.app/profile/jsifalda.bsky.social?ref=obsipulse-github](https://dub.sh/OjV5UtC)
- **Author Web**: [https://craftengineer.com/](https://dub.sh/2aGWsiT)
- **Project Web**: [https://obsipulse.com](https://dub.sh/RSzQwoG)

## FAQ

- **How secure is my data with ObsiPulse?**
  - We take your privacy seriously. No personal data from your vault is shared with us (it stays in your vault), plugin only collects your anonymised behavioural data points - such as the number of words written.
- **Can I use ObsiPulse offline?**
  - Yes, all features work offline, with sync occurring when you‘re back online.
- **What network requests and why this plugin does?**
  - ObsiPulse Plugins makes API calls to store meta data of your writing activity and the list of plugins you use. Nothing else, no third party tracking or analysis. **We don't send your note content anywhere without your permission!**
- **Will ObsiPulse work with multiple Obsidian vaults?**
  - Yes, ObsiPulse supports tracking across multiple vaults seamlessly.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Developed by [@jsifalda](https://dub.sh/I5tFaqk)
- Inspired by lukeleppan's [Better Word Count](https://github.com/lukeleppan/better-word-count).

---

[![wakatime](https://wakatime.com/badge/user/15205825-ea5c-4bdc-94ae-b2f25e876c76/project/072481d6-f1f1-4227-8a81-f30b49713e94.svg)](https://wakatime.com/badge/user/15205825-ea5c-4bdc-94ae-b2f25e876c76/project/072481d6-f1f1-4227-8a81-f30b49713e94)
