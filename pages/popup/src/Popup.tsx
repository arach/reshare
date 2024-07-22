import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { useState, useEffect } from 'react';
import { captureContent } from './CaptureUtils';
import { ContentSection, ScreenshotsSection, FullPageScreenshotSection } from './components';

import { ApiService, ContentData } from '@chrome-extension-boilerplate/shared';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const [content, setContent] = useState({ text: '', url: '', screenshots: [] as string[], fullPageScreenshot: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performCapture = async () => {
      try {
        for await (const update of captureContent()) {
          setContent(prevContent => ({ ...prevContent, ...update }));
        }
      } catch (err) {
        console.error('Error in captureContent:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    performCapture();
  }, []);

  const bgColor = theme === 'light' ? 'bg-gray-50' : 'bg-slate-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-slate-200';

  return (
    <div className={`p-4 w-[800px] h-[600px] ${bgColor} ${textColor} text-sm`}>
      <h1 className="text-xl font-semibold mb-4 text-indigo-6000">Content Capture</h1>
      {error ? (
        <p className="text-red-500 font-mono text-xs">{error}</p>
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
  withSuspense(Popup, <div className="p-4 text-indigo-600 text-sm font-semibold">Loading...</div>),
  <div className="p-4 text-red-500 font-mono text-xs font-semibold">An error occurred</div>,
);

async function handleShare() {
  const apiService = ApiService.getInstance();

  const url = window.location.href;
  const highlightedText = window.getSelection()?.toString() || '';

  // Assuming you have image files from screenshots
  const imageFiles: File[] = [
    /* ... */
  ]; // Your screenshot files

  // Convert images to base64
  const thumbnails = await Promise.all(imageFiles.map(file => apiService.imageToBase64(file)));

  const contentData: ContentData = {
    url,
    highlightedText,
    thumbnails,
  };

  try {
    const result = await apiService.sendContentToApi(contentData);
    if (result.success) {
      console.log('Content shared successfully!', result.id);
    } else {
      console.error('Failed to share content:', result.message);
    }
  } catch (error) {
    console.error('Error sharing content:', error);
  }
}
