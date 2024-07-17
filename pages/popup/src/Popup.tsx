import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { useState, useEffect } from 'react';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const [highlightedText, setHighlightedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getHighlightedText = async () => {
      try {
        if (!chrome.tabs || !chrome.scripting) {
          throw new Error('Chrome APIs not available');
        }

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) throw new Error('No active tab');

        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection()?.toString() ?? '',
        });

        if (results && results[0] && 'result' in results[0]) {
          setHighlightedText(results[0].result as string);
        } else {
          setHighlightedText('');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    getHighlightedText();
  }, []);

  return (
    <div className="App" style={{ backgroundColor: theme === 'light' ? '#eee' : '#222' }}>
      <header className="App-header" style={{ color: theme === 'light' ? '#222' : '#eee' }}>
        <img src={chrome.runtime.getURL('popup/logo.svg')} className="App-logo" alt="logo" />
        <div className="flex flex-col items-center justify-center h-screen pt-10">
          <h1 className="text-2xl font-bold">Highlighted Text</h1>
          <div className="mt-4 p-4 bg-gray-100 rounded">
            {error ? `Error: ${error}` : highlightedText || 'No text highlighted'}
          </div>
          <ToggleButton className="mt-4">Toggle Theme</ToggleButton>
        </div>
      </header>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorageSuspense(exampleThemeStorage);
  return (
    <button
      className={
        props.className +
        ' ' +
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
