import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const pdfBytes = fs.readFileSync('../tfg-backend/assets/dnd2024_a.pdf');
const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
const form = pdfDoc.getForm();

form.getFields().forEach(f => {
  const name = f.getName();
  try {
    if (f.constructor.name === 'PDFTextField') {
      f.setText(name);   // fill with its own name so we can see it
    } else if (f.constructor.name === 'PDFCheckBox') {
      f.check();         // tick all checkboxes
    }
  } catch {}
});

const filled = await pdfDoc.save();
fs.writeFileSync('../tfg-backend/assets/dnd2024_diagnostic.pdf', filled);
console.log('Saved dnd2024_diagnostic.pdf — open it to see where each field is.');
