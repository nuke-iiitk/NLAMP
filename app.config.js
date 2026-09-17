/**
 * Expo app config — evaluates at BUILD time.
 *
 * The web export is deployed to two hosts with different URL shapes:
 *   • GitHub Pages → https://nuke-iiitk.github.io/sih-farmer-queue/ (sub-path)
 *   • Render       → https://kisan-kraya-web.onrender.com/          (root)
 * Asset/route URLs must be prefixed on Pages but not on Render, so the base
 * path comes from the `EXPO_PUBLIC_BASE_PATH` env var set by whichever
 * pipeline is building (Pages workflow sets /sih-farmer-queue; Render sets
 * nothing). Everything else stays in app.json.
 */
const appJson = require('./app.json');

module.exports = {
  ...appJson.expo,
  experiments: {
    ...appJson.expo.experiments,
    baseUrl: process.env.EXPO_PUBLIC_BASE_PATH ?? '',
  },
};
