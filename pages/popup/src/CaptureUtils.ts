export const captureContent = async () => {
  console.log('Starting content capture');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) throw new Error('No active tab');

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      text: window.getSelection()?.toString() || '',
      url: window.location.href,
    }),
  });

  const screenshots = await captureScreenshots(tab.id);
  console.log(`Captured ${screenshots.length} screenshots`);

  console.log('Stitching screenshots');
  const fullPageScreenshot = await stitchScreenshots(screenshots);
  console.log('Screenshot stitching complete');

  return {
    text: result.result?.text || '',
    url: result.result?.url || '',
    screenshots,
    fullPageScreenshot,
  };
};

const captureScreenshots = async (tabId: number): Promise<string[]> => {
  const screenshots: string[] = [];
  let reachedBottom = false;

  while (!reachedBottom) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const screenshot = await captureScreenshot(tabId);
    screenshots.push(screenshot);

    reachedBottom = await chrome.scripting
      .executeScript({
        target: { tabId },
        func: async () => {
          const scrollHeight = document.documentElement.scrollHeight;
          const scrollTop = window.pageYOffset;
          const clientHeight = window.innerHeight;
          await new Promise(resolve => setTimeout(resolve, 500));
          if (scrollTop + clientHeight >= scrollHeight) {
            return true;
          }
          window.scrollBy(0, clientHeight);
          return false;
        },
      })
      .then(result => result[0].result ?? false);
  }

  return screenshots;
};

const captureScreenshot = async (tabId: number): Promise<string> => {
  try {
    return await chrome.tabs.captureVisibleTab();
  } catch (err) {
    console.error('Error capturing screenshot:', err);
    return '';
  }
};

const stitchScreenshots = (screenshots: string[]): Promise<string> => {
  return new Promise(resolve => {
    const loadImages = screenshots.map(
      screenshot =>
        new Promise<HTMLImageElement>(resolve => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = screenshot;
        }),
    );

    Promise.all(loadImages)
      .then(images => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = images[0].width;
        canvas.height = images.reduce((height, img) => height + img.height, 0);

        let yOffset = 0;
        images.forEach(img => {
          ctx.drawImage(img, 0, yOffset);
          yOffset += img.height;
        });

        resolve(canvas.toDataURL());
      })
      .catch(() => resolve(''));
  });
};
