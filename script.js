import { downloadCustomPDF } from './pdfGenerator.js';

const defaultData = {
  company: {
    name: "Demo Inc.",
    address: "164, Sarojini Nagar, New Delhi",
    city: "Delhi - 110023",
    phone: "+91 9873293692",
    email: "gauravrana.dce@gmail.com",
    gstin: "09AAGCE6536L1Z7"
  },
  billTo: {
    name: "DC Enterprises",
    address: "C 174, Sarojini Nagar, Pharenda, Noida",
    city: "Uttar Pradesh - 273155",
    phone: "+91 9125918398",
    gstin: "09AAGCE6536L1Z7"
  },
  shipTo: {
    name: "DC Enterprises",
    address: "C 174, Sarojini Nagar, Pharenda, Noida",
    city: "Uttar Pradesh - 273155",
    phone: "+91 9125918398",
    gstin: "09AAGCE6536L1Z7"
  },
  invoice: {
    number: "85",
    date: "2025-06-17",
    paymentMethod: "Pay on Delivery",
    dueAmount: "₹826.00"
  },
  items: [
    {
      description: "Halonix Meter Waterproof Rope Light with 120 Led/Metre (Halonix 10 Meter Waterproof Rope Light with 120 Led/Metre)",
      qty: "1",
      price: "₹700.00",
      total: "₹700.00"
    }
  ],
  totals: {
    net: "₹700.00",
    igst: "₹126.00",
    total: "₹826.00",
    inWords: "Eight Hundred Twenty Six Rupees Only"
  },
  notes: "Good sold cant be returned"
};

const itemsContainer = document.getElementById('itemsContainer');
const addItemBtn = document.getElementById('addItemBtn');
const previewBtn = document.getElementById('previewBtn');
const previewArea = document.getElementById('previewArea');
const formArea = document.getElementById('formArea');
const invoiceForm = document.getElementById('invoiceForm');
const invoicePreviewWrapper = document.getElementById('invoicePreviewWrapper');
const editBtn = document.getElementById('editBtn');
Handlebars.registerHelper('add', function(a, b) {
  return a + b;
});

const templateSource = document.getElementById('invoice-template').innerHTML;
const invoiceTpl = Handlebars.compile(templateSource);

window.latestInvoiceData = window.latestInvoiceData || JSON.parse(JSON.stringify(defaultData));
window.latestInvoiceHtml = window.latestInvoiceHtml || invoiceTpl(window.latestInvoiceData);

function createItemRow(item = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'item-row';

  const desc = document.createElement('input');
  desc.placeholder = 'Description';
  desc.value = item.description || '';
  desc.name = 'items[]|description';

  const qty = document.createElement('input');
  qty.placeholder = 'Qty';
  qty.value = item.qty || '1';
  qty.name = 'items[]|qty';

  const price = document.createElement('input');
  price.placeholder = 'Price (₹)';
  price.value = item.price ? item.price.replace('₹','') : '0';
  price.name = 'items[]|price';

  const total = document.createElement('input');
  total.placeholder = 'Total (₹)';
  total.value = item.total ? item.total.replace('₹','') : '0';
  total.name = 'items[]|total';

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'btn remove-item';
  remove.innerText = 'Remove';
  remove.addEventListener('click', () => wrapper.remove());

  wrapper.appendChild(desc);
  wrapper.appendChild(qty);
  wrapper.appendChild(price);
  wrapper.appendChild(total);
  wrapper.appendChild(remove);

  itemsContainer.appendChild(wrapper);
  return wrapper;
}

function populateItemsFromDefault() {
  itemsContainer.innerHTML = '';
  (defaultData.items || []).forEach(it => createItemRow(it));
}
populateItemsFromDefault();

addItemBtn.addEventListener('click', () => createItemRow());

function readItemsFromDOM() {
  const rows = Array.from(itemsContainer.querySelectorAll('.item-row'));
  return rows.map(r => {
    const inputs = r.querySelectorAll('input');
    return {
      description: inputs[0].value || '',
      qty: inputs[1].value || '1',
      price: '₹' + (inputs[2].value || '0'),
      total: '₹' + (inputs[3].value || '0')
    };
  });
}

function fillFormWithDefault() {
  
  invoiceForm.querySelector('[name="company.name"]').value = defaultData.company.name;
  invoiceForm.querySelector('[name="company.address"]').value = defaultData.company.address;
  invoiceForm.querySelector('[name="company.city"]').value = defaultData.company.city;
  invoiceForm.querySelector('[name="company.phone"]').value = defaultData.company.phone;
  invoiceForm.querySelector('[name="company.gstin"]').value = defaultData.company.gstin;
  invoiceForm.querySelector('[name="company.email"]').value = defaultData.company.email;

  invoiceForm.querySelector('[name="billTo.name"]').value = defaultData.billTo.name;
  invoiceForm.querySelector('[name="billTo.address"]').value = defaultData.billTo.address;
  invoiceForm.querySelector('[name="billTo.city"]').value = defaultData.billTo.city;
  invoiceForm.querySelector('[name="billTo.phone"]').value = defaultData.billTo.phone;
  invoiceForm.querySelector('[name="billTo.gstin"]').value = defaultData.billTo.gstin;

  invoiceForm.querySelector('[name="shipTo.name"]').value = defaultData.shipTo.name;
  invoiceForm.querySelector('[name="shipTo.address"]').value = defaultData.shipTo.address;
  invoiceForm.querySelector('[name="shipTo.city"]').value = defaultData.shipTo.city;
  invoiceForm.querySelector('[name="shipTo.phone"]').value = defaultData.shipTo.phone;
  invoiceForm.querySelector('[name="shipTo.gstin"]').value = defaultData.shipTo.gstin;

  invoiceForm.querySelector('[name="invoice.number"]').value = defaultData.invoice.number;
  invoiceForm.querySelector('[name="invoice.date"]').value = defaultData.invoice.date;
  invoiceForm.querySelector('[name="invoice.paymentMethod"]').value = defaultData.invoice.paymentMethod;
  invoiceForm.querySelector('[name="invoice.dueAmount"]').value = defaultData.invoice.dueAmount;

  invoiceForm.querySelector('[name="notes"]').value = defaultData.notes;
}
fillFormWithDefault();

previewBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const data = {
    company: {
      name: invoiceForm.querySelector('[name="company.name"]').value,
      address: invoiceForm.querySelector('[name="company.address"]').value,
      city: invoiceForm.querySelector('[name="company.city"]').value,
      phone: invoiceForm.querySelector('[name="company.phone"]').value,
      email: invoiceForm.querySelector('[name="company.email"]').value,
      gstin: invoiceForm.querySelector('[name="company.gstin"]').value
    },
    billTo: {
      name: invoiceForm.querySelector('[name="billTo.name"]').value,
      address: invoiceForm.querySelector('[name="billTo.address"]').value,
      city: invoiceForm.querySelector('[name="billTo.city"]').value,
      phone: invoiceForm.querySelector('[name="billTo.phone"]').value,
      gstin: invoiceForm.querySelector('[name="billTo.gstin"]').value
    },
    shipTo: {
      name: invoiceForm.querySelector('[name="shipTo.name"]').value,
      address: invoiceForm.querySelector('[name="shipTo.address"]').value,
      city: invoiceForm.querySelector('[name="shipTo.city"]').value,
      phone: invoiceForm.querySelector('[name="shipTo.phone"]').value,
      gstin: invoiceForm.querySelector('[name="shipTo.gstin"]').value
    },
    invoice: {
      number: invoiceForm.querySelector('[name="invoice.number"]').value,
      date: invoiceForm.querySelector('[name="invoice.date"]').value,
      paymentMethod: invoiceForm.querySelector('[name="invoice.paymentMethod"]').value,
      dueAmount: invoiceForm.querySelector('[name="invoice.dueAmount"]').value
    },
    items: readItemsFromDOM(),
    totals: {
      net: '',
      igst: '',
      total: '',
      inWords: ''
    },
    notes: invoiceForm.querySelector('[name="notes"]').value
  };

  let net = 0;
  data.items.forEach(it => {
    const n = Number(String(it.total).replace(/[^\d.-]/g, '')) || 0;
    net += n;
  });
  const igst = Math.round(net * 0.18 * 100) / 100;
  const totalAmt = Math.round((net + igst) * 100) / 100;

  data.totals.net = '₹' + net.toFixed(2);
  data.totals.igst = '₹' + igst.toFixed(2);
  data.totals.total = '₹' + totalAmt.toFixed(2);
  data.totals.inWords = numberToWordsIndian(totalAmt);

  window.latestInvoiceData = data;

  invoicePreviewWrapper.innerHTML = '';

  const singleHtml = invoiceTpl(data);
  invoicePreviewWrapper.innerHTML = singleHtml;

  window.latestInvoiceData = data;
  window.latestInvoiceHtml = singleHtml;

  formArea.classList.add('hidden');
  previewArea.classList.remove('hidden');

  invoicePreviewWrapper.scrollTop = 0;
});

editBtn.addEventListener('click', () => {
  previewArea.classList.add('hidden');
  formArea.classList.remove('hidden');
});


function numberToWordsIndian(amount) {
  if (!amount) return '';
  const num = Math.round(Number(String(amount).replace(/[^\d.-]/g, '')) || 0);
  const words = toWords(num);
  return words + ' Rupees Only';
}

function toWords(num) {
  if (num === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven',
    'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }
  return convert(num);
}

document.getElementById("downloadBtn").addEventListener("click", async () => {
  const activeData = window.latestInvoiceData || defaultData;
  const title =
    (activeData?.invoice?.number && `Invoice-${activeData.invoice.number}`) ||
    'Invoice';

  try {
    const response = await fetch('./pdf.html', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to load pdf.html');
    }
    const htmlTemplate = await response.text();

    const pdfTpl = Handlebars.compile(htmlTemplate);
    const filledHtml = pdfTpl(activeData);

    await downloadCustomPDF(title, filledHtml);
  } catch (err) {
    console.error('Failed to download PDF', err);
    alert('Unable to generate PDF. Please try again.');
  }
});
