// Same tab, and with the trailing slash that Cloudflare Pages serves without a 308 redirect.
// react-native-web's Linking.openURL opens a new tab, and React Native's types reject its target argument.
export function openDownloadsPage() {
  window.location.assign('/downloads/');
}
