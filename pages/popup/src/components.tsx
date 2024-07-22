import { useStorageSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';

export const ContentSection = ({ title, content }: { title: string; content: string }) => {
  const theme = useStorageSuspense(exampleThemeStorage);
  return (
    <div className="mt-4">
      <h2 className="text-xs font-semibold text-indigo-500 mb-1 uppercase">{title}</h2>
      <p
        className={`p-2 rounded-md font-mono text-xs break-all
                    ${theme === 'light' ? 'bg-blue-50 text-blue-800' : 'bg-slate-700 text-slate-200'}`}>
        {content || 'None'}
      </p>
    </div>
  );
};

export const ScreenshotsSection = ({ screenshots }: { screenshots: string[] }) => (
  <div className="mt-4">
    <h2 className="text-xs font-semibold text-indigo-500 mb-1 uppercase">Screenshots ({screenshots.length})</h2>
    <div className="flex overflow-x-auto pb-4 gap-3">
      {screenshots.map((screenshot, index) => (
        <div key={index} className="flex-shrink-0">
          <div className="w-40 h-56 rounded-lg shadow-md overflow-hidden bg-white p-1">
            <img src={screenshot} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover rounded" />
          </div>
          <p className="mt-1 text-center text-xs text-gray-500">#{index + 1}</p>
        </div>
      ))}
    </div>
  </div>
);

export const FullPageScreenshotSection = ({ fullPageScreenshot }: { fullPageScreenshot: string }) =>
  fullPageScreenshot && (
    <div className="mt-4">
      <h2 className="text-xs font-semibold text-indigo-500 mb-1 uppercase">Full Page Screenshot</h2>
      <div className="max-h-80 overflow-y-auto bg-white p-1 rounded-lg shadow-md">
        <img src={fullPageScreenshot} alt="Full Page Screenshot" className="rounded w-full" />
      </div>
    </div>
  );
