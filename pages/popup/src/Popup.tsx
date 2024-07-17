import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { useState, useEffect } from 'react';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const [highlightedText, setHighlightedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tabUrl, setTabUrl] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string>('');

  useEffect(() => {
    const captureContent = async () => {
      console.log('Starting captureContent');
      try {
        if (!chrome.tabs || !chrome.scripting) throw new Error('Chrome APIs not available');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) throw new Error('No active tab');
        setTabUrl(tab.url || 'No URL available');
        console.log('Current tab URL:', tab.url);

        // Capture screenshot
        console.log('Capturing screenshot');
        const dataUrl = await chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, {});
        setScreenshot(dataUrl);
        console.log('Screenshot captured:', dataUrl.substring(0, 50) + '...');

        // Get highlighted text
        console.log('Getting highlighted text');
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection()?.toString() ?? '',
        });
        const highlightedText = (results?.[0]?.result as string) || '';
        setHighlightedText(highlightedText);
        console.log('Highlighted text:', highlightedText);
      } catch (err) {
        console.error('Error in captureContent:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    captureContent();
  }, []);

  console.log('Rendering Popup component');
  return (
    <div className={`p-4 w-[640px] ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-900 text-white'}`}>
      <div className="mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Highlighted Text</h1>
        <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
          {error ? `Error: ${error}` : highlightedText || 'No text highlighted'}
        </div>
        <h2 className="text-xl font-semibold">Current Tab URL</h2>
        <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>{tabUrl}</div>
        {screenshot && (
          <img
            src={screenshot}
            alt="Screenshot"
            className="rounded-lg"
            style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
          />
        )}
        <ReShareButton />
      </div>
    </div>
  );
};

const ReShareButton = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  return (
    <button
      className={`w-full py-2 rounded-md transition-colors ${
        theme === 'light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'
      }`}
      onClick={() => {
        console.log('Starting reShare');
        // ReShare logic here
      }}>
      ReShare
    </button>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="p-4">Loading...</div>),
  <div className="p-4 text-red-500">An error occurred</div>,
);
