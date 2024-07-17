import { useStorageSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';

export const ContentSection = ({ title, content }: { title: string; content: string }) => {
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

export const ScreenshotsSection = ({ screenshots }: { screenshots: string[] }) => (
  <div className="mt-5">
    <h2 className="text-sm font-bold text-indigo-400 mb-2 uppercase">Screenshots ({screenshots.length})</h2>
    <div className="max-h-96 overflow-y-auto">
      {screenshots.map((screenshot, index) => (
        <div key={index} className="mb-4">
          <img src={screenshot} alt={`Screenshot ${index + 1}`} className="rounded-lg shadow-md w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const FullPageScreenshotSection = ({ fullPageScreenshot }: { fullPageScreenshot: string }) =>
  fullPageScreenshot && (
    <div className="mt-5">
      <h2 className="text-sm font-bold text-indigo-400 mb-2 uppercase">Full Page Screenshot</h2>
      <div className="max-h-96 overflow-y-auto">
        <img src={fullPageScreenshot} alt="Full Page Screenshot" className="rounded-lg shadow-md w-full" />
      </div>
    </div>
  );
