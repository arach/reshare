import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { useState, useEffect } from 'react';
import { captureContent } from './CaptureUtils';
import { ContentSection, ScreenshotsSection, FullPageScreenshotSection } from './components';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const [content, setContent] = useState({ text: '', url: '', screenshots: [] as string[], fullPageScreenshot: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performCapture = async () => {
      try {
        const capturedContent = await captureContent();
        setContent(capturedContent);
      } catch (err) {
        console.error('Error in captureContent:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    performCapture();
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
          <ScreenshotsSection screenshots={content.screenshots} />
          <FullPageScreenshotSection fullPageScreenshot={content.fullPageScreenshot} />
        </>
      )}
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="p-6 text-indigo-600 text-base font-bold uppercase">Loading...</div>),
  <div className="p-6 text-red-500 font-mono text-sm font-bold uppercase">An error occurred</div>,
);
