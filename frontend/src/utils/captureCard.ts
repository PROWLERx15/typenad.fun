import html2canvas from 'html2canvas';

// Capture a DOM element as a PNG Blob. Keeps layout intact.
export async function captureCardImage(el: HTMLElement): Promise<Blob> {
  // Temporarily remove heavy shadows for a cleaner capture
  const originalBoxShadow = el.style.boxShadow;
  el.style.boxShadow = 'none';

  const canvas = await html2canvas(el, {
    backgroundColor: 'transparent',
    scale: 2,
    logging: false,
    useCORS: true,
  });

  // Restore original styles
  el.style.boxShadow = originalBoxShadow;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) return resolve(blob);
      reject(new Error('Failed to create PNG blob from canvas'));
    }, 'image/png');
  });
}
