import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

const isFirefox = process.env.__FIREFOX__ === 'true';

const sidePanelConfig = {
  side_panel: {
    default_path: 'side-panel/index.html',
  },
  permissions: !isFirefox ? ['sidePanel'] : [],
};

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  name: '__MSG_extensionName__',
  version: packageJson.version,
  description: '__MSG_extensionDescription__',
  permissions: ['storage', 'activeTab', 'scripting', ...sidePanelConfig.permissions],
  host_permissions: ['<all_urls>'],
  options_page: 'options/index.html',
  background: {
    service_worker: 'background.iife.js',
    type: 'module',
  },
  action: {
    default_popup: 'popup/index.html',
    default_icon: 'icon-34.png',
  },
  chrome_url_overrides: {
    newtab: 'new-tab/index.html',
  },
  icons: {
    128: 'icon-128.png',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['content/index.iife.js'],
    },
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['content-ui/index.iife.js'],
    },
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      css: ['content.css'], // public folder
    },
  ],
  devtools_page: 'devtools/index.html',
  web_accessible_resources: [
    {
      resources: ['*.js', '*.css', '*.svg', 'icon-128.png', 'icon-34.png'],
      matches: ['*://*/*'],
    },
  ],
};

if (!isFirefox) {
  manifest.side_panel = sidePanelConfig.side_panel;
}

export default manifest;
