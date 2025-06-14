const PDFDocument = require("pdfkit");
const path = require("path");

const generateInvoiceBuffer = (order, orderItems) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // --- Header Section ---
    // 🔽 Add logo
    const logoPath = path.join(__dirname, "../assets/logo.png");
    // Ensure the logo path is correct relative to where this script is run
    try {
        doc.image(logoPath, 50, 30, { width: 100 });
    } catch (error) {
        console.error("Error loading logo image:", error);
        // Fallback or handle error if logo not found (e.g., place a text placeholder)
        doc.fontSize(10).text("Company Logo", 50, 30);
    }

    // Move below logo to create sufficient space
    doc.moveDown(4); // Adjust this value if your logo is taller/shorter

    // Invoice Title
    doc.fontSize(24).font("Helvetica-Bold").text("Invoice", { align: "center" });
    doc.moveDown(2); // More space after header

    // --- Order Details Section ---
    const detailLeftX = 50;
    doc.fontSize(12).font("Helvetica");

    // Capture the current Y position for alignment
    let currentY = doc.y;
    doc.text(`Order ID:`, detailLeftX, currentY);
    doc.font("Helvetica").text(`${order.id}`, detailLeftX + 80, currentY); // Aligned after "Order ID:" label

    currentY = doc.y;
    doc.font("Helvetica-Bold").text(`Customer:`, detailLeftX, currentY);
    doc.font("Helvetica").text(`${order.firstName} ${order.lastName}`, detailLeftX + 80, currentY);

    currentY = doc.y;
    doc.font("Helvetica-Bold").text(`Email:`, detailLeftX, currentY);
    doc.font("Helvetica").text(`${order.emailAddress}`, detailLeftX + 80, currentY);

    currentY = doc.y;
    doc.font("Helvetica-Bold").text(`Mobile:`, detailLeftX, currentY);
    doc.font("Helvetica").text(`${order.mobileNumber}`, detailLeftX + 80, currentY);

    currentY = doc.y;
    doc.font("Helvetica-Bold").text(`Address:`, detailLeftX, currentY);
    // Use widthOfString for wrapping long addresses without explicit x,y per line
    doc.font("Helvetica").text(
        `${order.fullAddress}, ${order.townOrCity}, ${order.state} - ${order.pinCode}, ${order.country}`,
        detailLeftX + 80, currentY, { width: doc.page.width - detailLeftX - 80 - 50, align: "left" }
    );
    doc.moveDown(2); // More space before the product table

    // --- Product Table ---
    const tableLeftX = 50;
    const tableRightX = doc.page.width - 50; // Right margin for the table

    // Column X positions (right-aligned for Qty and Price)
    const productColWidth = 250;
    const qtyColWidth = 70;
    const priceColWidth = 100;

    const qtyX = tableLeftX + productColWidth + 20; // Start Qty column after product name
    const priceX = qtyX + qtyColWidth + 20; // Start Price column after Qty

    // Calculate effective X for right-alignment within columns
    const getRightAlignedX = (text, columnStartX, columnWidth) => {
        return columnStartX + columnWidth - doc.widthOfString(text);
    };

    // Table Header
    doc.font("Helvetica-Bold");
    currentY = doc.y;
    doc.text("Product", tableLeftX, currentY);
    doc.text("Qty", getRightAlignedX("Qty", qtyX, qtyColWidth), currentY);
    doc.text("Price (INR)", getRightAlignedX("Price (INR)", priceX, priceColWidth), currentY);
    doc.moveDown(0.5); // Space between header and line

    // Draw a line below the header
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(tableLeftX, doc.y)
      .lineTo(tableRightX, doc.y)
      .stroke();
    doc.moveDown(0.5); // Space after the line

    // Table Rows
    doc.font("Helvetica");
    orderItems.forEach((item) => {
      currentY = doc.y;
      doc.text(item.product.name, tableLeftX, currentY, { width: productColWidth }); // Constrain product name width
      doc.text(item.quantity.toString(), getRightAlignedX(item.quantity.toString(), qtyX, qtyColWidth), currentY);
      // Ensure priceAtPurchase is a number before calling toFixed()
      const formattedPrice = `INR ${parseFloat(item.priceAtPurchase).toFixed(2)}`;
      doc.text(formattedPrice, getRightAlignedX(formattedPrice, priceX, priceColWidth), currentY);
      doc.moveDown(0.75); // Space after each item row
    });

    // Draw a line above the total
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(tableLeftX, doc.y)
      .lineTo(tableRightX, doc.y)
      .stroke();
    doc.moveDown(1.5); // More space before the total amount

    // --- Total Section ---
    const totalTextLabel = "Total Paid:";
    // Ensure totalAmount is a number before calling toFixed()
    const totalAmountValue = `INR ${parseFloat(order.totalAmount).toFixed(2)}`;

    doc.font("Helvetica-Bold");
    // Calculate X to right-align the total amount value with the right margin
    const totalAmountX = tableRightX - doc.widthOfString(totalAmountValue);
    const totalLabelX = totalAmountX - doc.widthOfString(totalTextLabel) - 10; // 10px spacing between label and value

    doc.text(totalTextLabel, totalLabelX, doc.y);
    doc.text(totalAmountValue, totalAmountX, doc.y);

    doc.end();
  });
};

module.exports = generateInvoiceBuffer;