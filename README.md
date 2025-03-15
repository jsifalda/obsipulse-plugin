# YourPulse - Your Writing Activity Visualised

## Overview

YourPulse (formerly <u>ObsiPulse</u>) is a plugin for [Obsidian](https://obsidian.md) that allows users to track their daily word count across all notes in their vault. It provides a visual representation of your writing activity, similar to GitHub's contribution graph, and offers a public profile feature for sharing selected notes.
More details available on [YourPulse.cc](https://yourpulse.cc).

![Example](./yourpulse.png)

## Features

- Gamify your writing by tracking your daily writing streak.
- Gain valuable insights into your writing habits.
- Share Your Progress with a free public profile URL to share your writing journey with friends or colleagues.
- Never answer the question "What Obsidian plugins do you use?" → it‘s all on your profile.
- Upload selected notes to your public YourPulse profile (with support of Dataview rendering).
- Seamlessly manage insights across multiple vaults.

## Usage

- Install the plguin from Obsidian's community plugins (or via BRAT).
- Write notes as you normally would.
- Run command `Open Public Profile` and your YourPulse public profile will open in your browser.

> Example of a public profile: [https://www.yourpulse.cc/app/profile/0b3417c00370b98c](https://www.yourpulse.cc/app/profile/0b3417c00370b98c)

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
- **Bluesky**: [https://bsky.app/profile/jsifalda.bsky.social](https://dub.sh/OjV5UtC)
- **Author Web**: [https://craftengineer.com/](https://dub.sh/2aGWsiT)
- **Project Web**: [https://yourpulse.cc](https://dub.sh/RSzQwoG)

## FAQ

- **How secure is my data with YourPulse?**
  - We take your privacy seriously. No personal data from your vault is shared with us (it stays in your vault), plugin only collects your anonymised behavioural data points - such as the number of words written.
- **Can I use YourPulse offline?**
  - Yes, all features work offline, with sync occurring when you‘re back online.
- **What network requests and why this plugin does?**
  - YourPulse Plugins makes API calls to store meta data of your writing activity and the list of plugins you use. Nothing else, no third party tracking or analysis. **We don't send your note content anywhere without your permission!**
- **Will YourPulse work with multiple Obsidian vaults?**
  - Yes, YourPulse supports tracking across multiple vaults seamlessly.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Developed by [@jsifalda](https://dub.sh/I5tFaqk)
- Inspired by lukeleppan's [Better Word Count](https://github.com/lukeleppan/better-word-count).

## Support the Project

If you find this plugin valuable, consider supporting its development, because it helps me a lot!

<a href="https://jsifalda.link/CYERt3t" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

[![wakatime](https://wakatime.com/badge/user/15205825-ea5c-4bdc-94ae-b2f25e876c76/project/072481d6-f1f1-4227-8a81-f30b49713e94.svg)](https://wakatime.com/badge/user/15205825-ea5c-4bdc-94ae-b2f25e876c76/project/072481d6-f1f1-4227-8a81-f30b49713e94)
