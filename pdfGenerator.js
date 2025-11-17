const DEFAULT_SCALE = 2;

function assertString(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} must be a non-empty string.`);
  }
}

function getPdfLib() {
  const globalJsPdf = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : window.jsPDF;
  if (!globalJsPdf) {
    throw new Error('jsPDF is not available on window. Please include it before calling downloadCustomPDF.');
  }
  return globalJsPdf;
}

function getHtml2Canvas() {
  if (typeof window.html2canvas !== 'function') {
    throw new Error('html2canvas is not available on window. Please include it before calling downloadCustomPDF.');
  }
  return window.html2canvas;
}

function createHiddenContainer(htmlContent) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.style.background = '#ffffff';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.width = 'fit-content';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);
  return container;
}

export async function downloadCustomPDF(title, htmlContent) {
  assertString(title, 'title');
  assertString(htmlContent, 'htmlContent');

  const html2canvas = getHtml2Canvas();
  const JsPDF = getPdfLib();

  const container = createHiddenContainer(htmlContent);

  try {
    const wrappers = container.querySelectorAll('.invoice-wrapper');

    // If we don't find individual invoice wrappers, fall back to rendering whole container
    const targets = wrappers.length ? Array.from(wrappers) : [container];

    const pdf = new JsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let isFirstPage = true;

    for (const target of targets) {
      const canvas = await html2canvas(target, {
        scale: DEFAULT_SCALE,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      const y = 0;
      pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
    }

    pdf.save(`${title}.pdf`);
  } finally {
    container.remove();
  }
}

