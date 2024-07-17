import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { useState, useEffect, useCallback } from 'react';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const [content, setContent] = useState({ text: '', url: '', screenshot: '' });
  const [error, setError] = useState<string | null>(null);

  const captureContent = useCallback(async () => {
    try {
      if (!chrome.tabs || !chrome.scripting) throw new Error('Chrome APIs not available');
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab');

      const [textResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || '',
      });

      const screenshot = await chrome.tabs.captureVisibleTab();

      setContent({
        text: textResult.result as string,
        url: tab.url || '',
        screenshot,
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, []);

  useEffect(() => {
    captureContent();
  }, [captureContent]);

  const reShare = async () => {
    // ReShare logic here
    console.log('Sharing content:', content);
  };

  const bgColor = theme === 'light' ? 'bg-slate-100' : 'bg-slate-800';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-slate-200';

  return (
    <div className={`p-6 w-[640px] ${bgColor} ${textColor} text-sm`}>
      <h1 className="text-2xl font-extrabold mb-5 text-indigo-600 uppercase">Content Capture</h1>
      {error ? (
        <p className="text-red-500 font-mono text-sm">{error}</p>
      ) : (
        <>
          <ContentSection title="Selected Text" content={content.text} />
          <ContentSection title="URL" content={content.url} />
          {content.screenshot && (
            <div className="mt-5">
              <h2 className="text-sm font-bold text-indigo-400 mb-2 uppercase">Screenshot</h2>
              <img src={content.screenshot} alt="Screenshot" className="rounded-lg shadow-md w-full" />
            </div>
          )}
          <button
            className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-base font-medium uppercase"
            onClick={reShare}>
            ReShare
          </button>
        </>
      )}
    </div>
  );
};

const ContentSection = ({ title, content }: { title: string; content: string }) => {
  const theme = useStorageSuspense(exampleThemeStorage);
  return (
    <div className="mt-5">
      <h2 className="text-sm font-bold text-indigo-400 mb-2 uppercase">{title}</h2>
      <p
        className={`p-3 rounded-md font-mono text-sm break-all
                    ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-slate-700'}`}>
        {content || 'None'}
      </p>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="p-6 text-indigo-600 text-base font-bold uppercase">Loading...</div>),
  <div className="p-6 text-red-500 font-mono text-sm font-bold uppercase">An error occurred</div>,
);
