import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { useState, useEffect } from 'react';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const [content, setContent] = useState({ text: '', url: '', screenshots: [] as string[] });
  const [error, setError] = useState<string | null>(null);

  const captureScreenshot = async (tabId: number) => {
    try {
      const screenshot = await chrome.tabs.captureVisibleTab();
      setContent(prev => ({ ...prev, screenshots: [...prev.screenshots, screenshot] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture screenshot');
    }
  };

  useEffect(() => {
    const captureContent = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) throw new Error('No active tab');

        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => ({
            text: window.getSelection()?.toString() || '',
            url: window.location.href,
          }),
        });

        setContent({
          text: result.result?.text || '',
          url: result.result?.url || '',
          screenshots: [],
        });

        let reachedBottom = false;
        while (!reachedBottom) {
          await captureScreenshot(tab.id);

          // Scroll and check if bottom is reached
          reachedBottom = await chrome.scripting
            .executeScript({
              target: { tabId: tab.id },
              func: () => {
                const scrollHeight = document.documentElement.scrollHeight;
                const scrollTop = window.pageYOffset;
                const clientHeight = window.innerHeight;

                if (scrollTop + clientHeight >= scrollHeight) {
                  return true;
                }

                window.scrollBy(0, clientHeight);
                return false;
              },
            })
            .then(result => result[0].result ?? false);

          // Wait for any dynamic content to load
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    captureContent();
  }, []);

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
          <div className="mt-5">
            <h2 className="text-sm font-bold text-indigo-400 mb-2 uppercase">
              Screenshots ({content.screenshots.length})
            </h2>
            <div className="max-h-96 overflow-y-auto">
              {content.screenshots.map((screenshot, index) => (
                <div key={index} className="mb-4">
                  <img src={screenshot} alt={`Screenshot ${index + 1}`} className="rounded-lg shadow-md w-full" />
                </div>
              ))}
            </div>
          </div>
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
